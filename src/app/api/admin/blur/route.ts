import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  // Şifre kontrolü
  const pw = request.headers.get("x-admin-password") || "";
  try {
    const a = Buffer.from(pw);
    const b = Buffer.from(ADMIN_PASSWORD);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const reportId = formData.get("id") as string | null;

  if (!image || !reportId || !UUID_REGEX.test(reportId)) {
    return NextResponse.json({ error: "Eksik veya geçersiz parametre" }, { status: 400 });
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Dosya çok büyük" }, { status: 400 });
  }

  // Mevcut raporu bul
  const { data: report, error: fetchError } = await supabaseAdmin
    .from("reports")
    .select("image_url")
    .eq("id", reportId)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
  }

  // Public bucket'taki eski dosyayı image_url'den çıkar
  // URL format: https://xxx.supabase.co/storage/v1/object/public/violation-images/reports/filename.jpg
  const oldUrl = report.image_url as string;
  const bucketPath = oldUrl.split("/violation-images/")[1];

  if (bucketPath) {
    // Eski dosyayı sil
    await supabaseAdmin.storage.from("violation-images").remove([bucketPath]);
  }

  // Blurlanmış fotoğrafı aynı path'e yükle
  const fileName = `reports/${Date.now()}-blurred.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("violation-images")
    .upload(fileName, image, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Blur upload error:", uploadError);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }

  // Yeni public URL al
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("violation-images").getPublicUrl(fileName);

  // Raporu güncelle: blurlu URL + approved status
  const { error: updateError } = await supabaseAdmin
    .from("reports")
    .update({
      image_url: publicUrl,
      status: "approved",
    })
    .eq("id", reportId);

  if (updateError) {
    console.error("DB update error:", updateError);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }

  return NextResponse.json({ success: true, image_url: publicUrl });
}
