"use client";

import Image from "next/image";

export default function HeroSection() {
  const handleOpenModal = () => {
    window.dispatchEvent(new Event("open-upload-modal"));
  };

  const handleScrollToFeed = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("bildirimler")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-red-50 to-white dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      <div id="hero-sentinel" className="absolute top-0 h-1 w-full" />
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <Image
          src="/duba-no-text.svg"
          alt="Duba"
          width={72}
          height={72}
          className="mb-6 object-contain"
          style={{ width: "72px", height: "72px" }}
          priority
        />
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Kaldırım İhlalleri
          <br />
          <span className="text-red-600">Çek, paylaş, fark yarat.</span>
        </h2>
        <p className="mt-4 max-w-lg text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Kaldırıma park eden mi gördün? Engelli yolunu kapatan mı var? Fotoğrafla, ilini seç, gerisini bize bırak. Anonim, hızlı, etkili.
        </p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>Yüklenen fotoğraflardaki plakalar ve yüzler şimdilik yasal sorun teşkil etmemesi açısından blurlanır.</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-red-700/30 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Dubala
          </button>
          <button
            onClick={handleScrollToFeed}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Haftanın karnesine bak
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
