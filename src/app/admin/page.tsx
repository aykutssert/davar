"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Report {
  id: string;
  created_at: string;
  image_url: string;
  comment: string | null;
  category: string | null;
  city: string | null;
  district: string | null;
  status: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  engelli_yolu: "Engelli yolu",
  kaldirim: "Kaldırım",
  bisiklet_yolu: "Bisiklet yolu",
  okul_onu: "Okul önü",
  diger: "Diğer",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Blur editor state
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [blurRadius, setBlurRadius] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [saving, setSaving] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?filter=${filter}`, {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filter, password]);

  useEffect(() => {
    if (authenticated) fetchReports();
  }, [authenticated, filter, fetchReports]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length > 0) {
      setAuthenticated(true);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id, status }),
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("İşlem başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Bu bildirimi silmek istediğine emin misin?")) return;
    setActionLoading(id);
    try {
      await fetch("/api/admin/reports", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id }),
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Silme başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Blur Editor ---
  const openBlurEditor = (report: Report) => {
    setEditingReport(report);
  };

  useEffect(() => {
    if (!editingReport || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = editingReport.image_url;
  }, [editingReport]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const applyBlurStroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const r = blurRadius;
    const sx = Math.max(0, Math.round(x - r));
    const sy = Math.max(0, Math.round(y - r));
    const sw = Math.min(r * 2, canvas.width - sx);
    const sh = Math.min(r * 2, canvas.height - sy);
    if (sw <= 0 || sh <= 0) return;
    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const blockSize = 10;
    for (let by = 0; by < imgData.height; by += blockSize) {
      for (let bx = 0; bx < imgData.width; bx += blockSize) {
        let rr = 0, gg = 0, bb = 0, count = 0;
        for (let dy = 0; dy < blockSize && by + dy < imgData.height; dy++) {
          for (let dx = 0; dx < blockSize && bx + dx < imgData.width; dx++) {
            const i = ((by + dy) * imgData.width + (bx + dx)) * 4;
            rr += imgData.data[i]; gg += imgData.data[i + 1]; bb += imgData.data[i + 2]; count++;
          }
        }
        rr = Math.round(rr / count); gg = Math.round(gg / count); bb = Math.round(bb / count);
        for (let dy = 0; dy < blockSize && by + dy < imgData.height; dy++) {
          for (let dx = 0; dx < blockSize && bx + dx < imgData.width; dx++) {
            const i = ((by + dy) * imgData.width + (bx + dx)) * 4;
            imgData.data[i] = rr; imgData.data[i + 1] = gg; imgData.data[i + 2] = bb;
          }
        }
      }
    }
    ctx.putImageData(imgData, sx, sy);
  };

  const handleCanvasStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCanvasPos(e);
    applyBlurStroke(x, y);
  };
  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const { x, y } = getCanvasPos(e);
    applyBlurStroke(x, y);
  };
  const handleCanvasEnd = () => { isDrawing.current = false; };

  const reloadCanvas = () => {
    if (!editingReport || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = editingReport.image_url;
  };

  const saveBlurAndApprove = async () => {
    if (!canvasRef.current || !editingReport) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/jpeg", 0.9)
      );
      if (!blob) throw new Error("Canvas export failed");

      const formData = new FormData();
      formData.append("image", blob, "blurred.jpg");
      formData.append("id", editingReport.id);

      const res = await fetch("/api/admin/blur", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });

      if (!res.ok) throw new Error("Blur upload failed");

      setReports((prev) => prev.filter((r) => r.id !== editingReport.id));
      setEditingReport(null);
    } catch (err) {
      alert("Kaydetme başarısız: " + (err instanceof Error ? err.message : "Bilinmeyen hata"));
    } finally {
      setSaving(false);
    }
  };

  // --- Login Screen ---
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900"
        >
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Admin Paneli
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Devam etmek için şifreyi gir.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin şifresi"
            className="mb-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
          >
            Giriş
          </button>
        </form>
      </div>
    );
  }

  // --- Blur Editor Modal ---
  if (editingReport) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Plaka / Yüz Gizle
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Fotoğraf üzerinde gizlenmesi gereken alanları parmağınla/mouse ile kapat.
              </p>
            </div>
            <button
              onClick={() => setEditingReport(null)}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Geri
            </button>
          </div>

          {editingReport.comment && (
            <p className="mb-4 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {editingReport.comment}
            </p>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {editingReport.category && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {CATEGORY_LABELS[editingReport.category] || editingReport.category}
              </span>
            )}
            <span>{new Date(editingReport.created_at).toLocaleString("tr-TR")}</span>
            {editingReport.city && (
              <span>📍 {editingReport.district ? `${editingReport.district}, ${editingReport.city}` : editingReport.city}</span>
            )}
          </div>

          <canvas
            ref={canvasRef}
            className="mb-4 w-full cursor-crosshair rounded-xl border-2 border-zinc-300 dark:border-zinc-700"
            onMouseDown={handleCanvasStart}
            onMouseMove={handleCanvasMove}
            onMouseUp={handleCanvasEnd}
            onMouseLeave={handleCanvasEnd}
            onTouchStart={handleCanvasStart}
            onTouchMove={handleCanvasMove}
            onTouchEnd={handleCanvasEnd}
          />

          <div className="mb-6 flex items-center gap-4">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Fırça:</label>
            <input
              type="range"
              min="10"
              max="60"
              value={blurRadius}
              onChange={(e) => setBlurRadius(Number(e.target.value))}
              className="flex-1 accent-red-600"
            />
            <span className="text-xs text-zinc-400">{blurRadius}px</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-3">
              <button
                onClick={reloadCanvas}
                className="flex-1 rounded-xl bg-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 sm:flex-none"
              >
                Sıfırla
              </button>
              <button
                onClick={() => {
                  updateStatus(editingReport.id, "rejected");
                  setEditingReport(null);
                }}
                className="flex-1 rounded-xl bg-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 sm:flex-none"
              >
                Reddet
              </button>
            </div>
            <button
              onClick={saveBlurAndApprove}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:flex-1"
            >
              {saving ? "Kaydediliyor..." : "Blurla ve Onayla"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Report List ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Moderasyon Paneli
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Bildirimleri incele, plaka/yüz gizle, onayla veya reddet.
            </p>
          </div>
          <button
            onClick={() => {
              setAuthenticated(false);
              setPassword("");
            }}
            className="w-fit rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Çıkış
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-red-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {f === "pending" ? "Bekleyen" : f === "approved" ? "Onaylı" : "Tümü"}
            </button>
          ))}
          <button
            onClick={fetchReports}
            className="ml-auto rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Yenile
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-red-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              {filter === "pending" ? "Bekleyen bildirim yok" : "Bildirim bulunamadı"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={report.image_url}
                    alt="Bildirim"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        report.status === "approved"
                          ? "bg-emerald-500/90 text-white"
                          : report.status === "pending"
                          ? "bg-amber-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {report.status === "approved" ? "Onaylı" : report.status === "pending" ? "Bekliyor" : "Reddedildi"}
                    </span>
                  </div>
                  {report.category && (
                    <span className="absolute left-2 top-2 rounded-full bg-zinc-900/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {report.comment && (
                    <p className="mb-2 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {report.comment}
                    </p>
                  )}
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{new Date(report.created_at).toLocaleString("tr-TR")}</span>
                    {report.city && (
                      <span>
                        📍 {report.district ? `${report.district}, ${report.city}` : report.city}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {report.status === "pending" && (
                      <button
                        onClick={() => openBlurEditor(report)}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        İncele ve Onayla
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(report.id)}
                      disabled={actionLoading === report.id}
                      className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
