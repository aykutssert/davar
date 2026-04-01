"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Report {
  id: string;
  created_at: string;
  image_url: string;
  comment: string | null;
  category: string | null;
  city: string | null;
  district: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  engelli_yolu: "Engelli yoluna park",
  kaldirim: "Kaldırıma park",
  bisiklet_yolu: "Bisiklet yoluna park",
  okul_onu: "Okul önüne park",
  diger: "Diğer",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  report: Report;
  onClose: () => void;
}

export default function ReportDetailModal({ report, onClose }: Props) {
  // ESC ile kapat + body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-zinc-900">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative aspect-video w-full bg-zinc-100 sm:aspect-[4/3] dark:bg-zinc-800">
          <Image
            src={report.image_url}
            alt={report.comment || "İhlal fotoğrafı"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        {/* Details */}
        <div className="p-4 sm:p-6">
          {/* Category badge + date inline */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {report.category && (
              <span className="rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                {CATEGORY_LABELS[report.category] || report.category}
              </span>
            )}
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {formatDate(report.created_at)}
            </span>
          </div>

          {report.comment && (
            <p className="mb-4 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              {report.comment}
            </p>
          )}

          {/* Location */}
          {report.city && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{report.district ? `${report.district}, ${report.city}` : report.city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
