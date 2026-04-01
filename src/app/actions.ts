"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_COMMENT_LENGTH = 280;
const MAX_ADDRESS_LENGTH = 200;
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
  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const address = ((formData.get("address") as string) || "").trim();

  // Validasyon
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

  if (comment.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: `Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.` };
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return { success: false, error: "Geçersiz kategori." };
  }

  if (address.length > MAX_ADDRESS_LENGTH) {
    return { success: false, error: "Adres çok uzun." };
  }

  // Koordinat parse + doğrulama
  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  if (latitude !== null && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    return { success: false, error: "Geçersiz koordinat." };
  }
  if (longitude !== null && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    return { success: false, error: "Geçersiz koordinat." };
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

  // 1. Orijinali private bucket'a yükle (blursuz, admin erişimli)
  const origPath = `reports/${baseName}-original.${ext}`;
  let originalImageUrl: string | null = null;

  const { error: origUploadError } = await supabase.storage
    .from("violation-originals")
    .upload(origPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (origUploadError) {
    console.error("Original upload error (non-fatal):", origUploadError);
  } else {
    originalImageUrl = origPath;
  }

  // 2. Aynı fotoğrafı public bucket'a da yükle (admin blurladıktan sonra güncelleyecek)
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
    original_image_url: originalImageUrl,
    comment: comment ? sanitize(comment) : null,
    category: category || null,
    latitude,
    longitude,
    address: address ? sanitize(address) : null,
    status: "pending",
  });

  if (dbError) {
    console.error("DB error:", dbError);
    return { success: false, error: "Rapor kaydedilirken bir hata oluştu." };
  }

  revalidatePath("/");
  return { success: true };
}
