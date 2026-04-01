"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { createReport, type ActionResult } from "@/app/actions";
import { CITY_NAMES, getDistricts } from "@/lib/turkey-cities";

const CATEGORIES = [
  { value: "", label: "Kategori seç..." },
  { value: "engelli_yolu", label: "Engelli yoluna park" },
  { value: "kaldirim", label: "Kaldırıma park" },
  { value: "bisiklet_yolu", label: "Bisiklet yoluna park" },
  { value: "okul_onu", label: "Okul önüne park" },
  { value: "diger", label: "Diğer" },
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const districts = city ? getDistricts(city) : [];

  const resetForm = useCallback(() => {
    setPreview(null);
    setFile(null);
    setComment("");
    setCategory("");
    setCity("");
    setDistrict("");
    setResult(null);
    setDragOver(false);
    setLoading(false);
    setCompressing(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleFile = useCallback(async (f: File) => {
    setResult(null);

    // Fotoğrafı sıkıştır
    setCompressing(true);
    try {
      const compressed = await imageCompression(f, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      setFile(compressed);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } finally {
      setCompressing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !city || !district) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("comment", comment);
    formData.append("category", category);
    formData.append("city", city);
    formData.append("district", district);

    const res = await createReport(formData);
    setResult(res);
    setLoading(false);

    if (res.success) {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  // ESC ile kapat + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl dark:bg-zinc-900">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <h2 className="mb-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Davar Savar 📸
        </h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          Gördüğünü çek, ilini seç, gerisini bize bırak.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone / Preview */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all ${
              dragOver
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : preview
                ? "border-zinc-300 dark:border-zinc-700"
                : "border-zinc-300 bg-zinc-50 hover:border-red-400 hover:bg-red-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-red-600 dark:hover:bg-red-950/10"
            }`}
          >
            {compressing ? (
              <div className="flex flex-col items-center gap-3 p-6">
                <svg className="h-8 w-8 animate-spin text-red-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Fotoğraf sıkıştırılıyor...</p>
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="Önizleme"
                className="h-full max-h-[300px] w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Fotoğrafı yükle
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    veya tıklayarak seç &middot; JPEG, PNG, WebP, HEIC &middot; Max 10MB
                  </p>
                </div>
              </div>
            )}
            <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          </div>

          {/* Photo change button */}
          {preview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
                setResult(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Fotoğrafı değiştir
            </button>
          )}

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              İhlal Türü
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="comment"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Açıklama
              </label>
              <span
                className={`text-xs ${
                  comment.length > 280
                    ? "text-red-500"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {comment.length}/280
              </span>
            </div>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={280}
              rows={2}
              placeholder="Kısa bir açıklama ekle..."
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-red-500"
            />
          </div>

          {/* City / District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                İl <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => { setCity(e.target.value); setDistrict(""); }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">İl seç...</option>
                {CITY_NAMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="district" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                İlçe <span className="text-red-500">*</span>
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!city}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">İlçe seç...</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info notice */}
          <div className="space-y-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            <p>Plaka ve yüz bilgileri moderatör tarafından gizlendikten sonra yayınlanır.</p>
            <p>Göndererek, fotoğrafın bizzat sizin çektiğiniz bir fotoğraf olduğunu ve <a href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">kullanım koşullarını</a> kabul ettiğinizi onaylarsınız.</p>
          </div>

          {/* Result message */}
          {result && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                result.success
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {result.success
                ? "Bildirim gönderildi! Moderatör onayından sonra yayınlanacak."
                : result.error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!file || !category || !city || !district || loading || (result?.success ?? false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gönderiliyor...
              </>
            ) : result?.success ? (
              "Gönderildi!"
            ) : (
              "Gönder"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
