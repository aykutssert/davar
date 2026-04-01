"use client";

import { useState, useMemo } from "react";
import ReportCard from "./ReportCard";
import ReportDetailModal from "./ReportDetailModal";

interface Report {
  id: string;
  created_at: string;
  image_url: string;
  comment: string | null;
  category: string | null;
  city: string | null;
  district: string | null;
}

export default function FeedClient({ reports }: { reports: Report[] }) {
  const [selected, setSelected] = useState<Report | null>(null);
  const [filterCity, setFilterCity] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  // Filtreleme için mevcut il/ilçe listesini raporlardan çıkar
  const cities = useMemo(() => {
    const set = new Set(reports.map((r) => r.city).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [reports]);

  const districts = useMemo(() => {
    if (!filterCity) return [];
    const set = new Set(
      reports.filter((r) => r.city === filterCity).map((r) => r.district).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [reports, filterCity]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filterCity && r.city !== filterCity) return false;
      if (filterDistrict && r.district !== filterDistrict) return false;
      return true;
    });
  }, [reports, filterCity, filterDistrict]);

  return (
    <>
      {/* Filter bar */}
      {cities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={filterCity}
            onChange={(e) => { setFilterCity(e.target.value); setFilterDistrict(""); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">Tüm İller</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {filterCity && districts.length > 0 && (
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value="">Tüm İlçeler</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
          {(filterCity || filterDistrict) && (
            <button
              onClick={() => { setFilterCity(""); setFilterDistrict(""); }}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Temizle
            </button>
          )}
          <span className="flex items-center text-xs text-zinc-400 dark:text-zinc-500">
            {filtered.length} bildirim
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bu filtreye uygun bildirim bulunamadı.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="mb-4 cursor-pointer break-inside-avoid"
              onClick={() => setSelected(report)}
            >
              <ReportCard report={report} />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ReportDetailModal report={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
