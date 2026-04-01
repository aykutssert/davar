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
          src="/davar.svg"
          alt="Davar"
          width={72}
          height={72}
          className="mb-6 rounded-2xl shadow-lg"
          style={{ width: "72px", height: "72px" }}
          priority
        />
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Kural ihlallerini fotoğrafla.
          <br />
          <span className="text-red-600">Farkındalık yarat.</span>
        </h2>
        <p className="mt-4 max-w-lg text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Kaldırım, engelli yolu ve bisiklet yollarındaki usulsüz parkları kayıt altına al. Anonim, hızlı, etkili.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-red-700/30 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Hemen Bildir
          </button>
          <button
            onClick={handleScrollToFeed}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Bildirimlere göz at
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
