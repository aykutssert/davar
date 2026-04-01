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
  engelli_yolu: "Engelli yolu",
  kaldirim: "Kaldırım",
  bisiklet_yolu: "Bisiklet yolu",
  okul_onu: "Okul önü",
  diger: "Diğer",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export default function ReportCard({ report }: { report: Report }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={report.image_url}
          alt={report.comment || "İhlal fotoğrafı"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {report.category && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        )}
      </div>

      <div className="p-4">
        {report.comment && (
          <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {report.comment}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <time dateTime={report.created_at}>{timeAgo(report.created_at)}</time>
          </div>
          {report.city && (
            <div className="flex items-center gap-1 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{report.district ? `${report.district}, ${report.city}` : report.city}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
