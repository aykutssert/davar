"use server";

import { supabase } from "@/lib/supabase";
import { CITY_NAMES, getDistricts } from "@/lib/turkey-cities";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_COMMENT_LENGTH = 280;
const VALID_CATEGORIES = [
  "engelli_yolu",
  "kaldirim",
  "bisiklet_yolu",
  "okul_onu",
  "diger",
];

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createReport(formData: FormData): Promise<ActionResult> {
  const file = formData.get("image") as File | null;
  const comment = (formData.get("comment") as string)?.trim() || "";
  const category = (formData.get("category") as string) || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const district = (formData.get("district") as string)?.trim() || "";

  // Validasyon — resim, kategori, il, ilçe zorunlu
  if (!file || file.size === 0) {
    return { success: false, error: "Lütfen bir fotoğraf seçin." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Sadece JPEG, PNG, WebP veya HEIC formatları kabul edilir.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Dosya boyutu en fazla 10MB olabilir." };
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return { success: false, error: "Lütfen bir ihlal türü seçin." };
  }

  if (!city || !CITY_NAMES.includes(city)) {
    return { success: false, error: "Lütfen bir il seçin." };
  }

  const validDistricts = getDistricts(city);
  if (!district || !validDistricts.includes(district)) {
    return { success: false, error: "Lütfen bir ilçe seçin." };
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: `Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.` };
  }

  // Benzersiz dosya adı — MIME type'tan uzantı çıkar (compression sonrası dosya adı güvenilmez)
  const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  const ext = MIME_TO_EXT[file.type] || (file.name.split(".").pop() || "").toLowerCase();

  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    return { success: false, error: "Geçersiz dosya formatı." };
  }
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${baseName}.${ext}`;

  // Fotoğrafı public bucket'a yükle (admin blurladıktan sonra güncelleyecek)
  const filePath = `reports/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("violation-images")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: "Fotoğraf yüklenirken bir hata oluştu." };
  }

  // Public URL al
  const {
    data: { publicUrl },
  } = supabase.storage.from("violation-images").getPublicUrl(filePath);

  // Veritabanına kaydet
  const { error: dbError } = await supabase.from("reports").insert({
    image_url: publicUrl,
    comment: comment ? sanitize(comment) : null,
    category: category,
    city: sanitize(city),
    district: sanitize(district),
    status: "pending",
  });

  if (dbError) {
    console.error("DB error:", dbError);
    return { success: false, error: "Rapor kaydedilirken bir hata oluştu." };
  }

  // Toplam sayacı artır (fotoğraf silinse bile istatistik kalır)
  await supabase.rpc("increment_total_reports");

  revalidatePath("/");
  return { success: true };
}
