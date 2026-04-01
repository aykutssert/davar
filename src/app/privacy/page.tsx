import Link from "next/link";

export const metadata = {
  title: "Gizlilik Politikası ve Kullanım Koşulları",
  description: "Davar uygulaması gizlilik politikası, kullanım koşulları ve veri işleme süreçleri.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Ana Sayfa
        </Link>

        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Gizlilik Politikası ve Kullanım Koşulları
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Son güncelleme: Nisan 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              1. Projenin Amacı
            </h2>
            <p>
              Davar, kaldırım ve engelli yolu ihlallerine karşı toplumsal farkındalık yaratmayı
              amaçlayan anonim bir platformdur. Amacımız ceza kestirmek veya kişileri ifşa etmek
              <strong> değildir</strong>; yalnızca sorunun boyutunu görünür kılmaktır.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              2. Toplanan Veriler
            </h2>
            <ul className="list-inside list-disc space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Fotoğraf:</strong> Yüklediğiniz ihlal fotoğrafı. Plaka, yüz ve tabela bilgileri
                moderatör tarafından yayın öncesinde gizlenir (pikselleştirme).
              </li>
              <li>
                <strong>İl ve İlçe (zorunlu):</strong> Bildirimin yapıldığı şehir ve ilçe bilgisi.
                Tam GPS konumu alınmaz; yalnızca kullanıcının seçtiği il/ilçe kaydedilir.
              </li>
              <li>
                <strong>Açıklama (isteğe bağlı):</strong> Kullanıcının girdiği kısa metin (max 280 karakter).
              </li>
              <li>
                <strong>Kategori:</strong> Seçilen ihlal türü.
              </li>
              <li>
                <strong>IP adresi:</strong> Yalnızca kötüye kullanımı önlemek amacıyla anlık
                hız sınırlama (rate limiting) için kullanılır; kalıcı olarak saklanmaz.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              3. Kullanım Koşulları ve Telif Hakkı
            </h2>
            <p className="mb-2">
              Fotoğraf göndererek aşağıdaki koşulları kabul etmiş olursunuz:
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <li>
                Yüklediğiniz fotoğraf <strong>bizzat sizin çektiğiniz</strong>, orijinal bir fotoğraftır.
                İnternetten veya başka kaynaklardan alınmış görsellerin yüklenmesi yasaktır.
              </li>
              <li>
                Fotoğrafın yalnızca kamu alanındaki park ihlalini belgelemek amacıyla çekilmiş olması gerekir.
              </li>
              <li>
                Platformu kişisel husumet, taciz veya hedef gösterme amacıyla kullanmak yasaktır.
              </li>
              <li>
                Fotoğraflar moderasyon sonrası blurlanmış haliyle kamuya açık olarak yayınlanır.
                Yükleyerek bu yayına onay vermiş olursunuz.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              4. Anonim Kullanım
            </h2>
            <p>
              Davar herhangi bir kayıt, giriş veya kişisel bilgi talep etmez. Kullanıcı hesabı
              oluşturulmaz. Yüklenen içerik tamamen anonimdir; gönderenin kimliği platformda
              saklanmaz.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              5. Verilerin Saklanması ve 7 Gün Politikası
            </h2>
            <p>
              Davar, &quot;Haftalık Döngü&quot; prensibiyle çalışır. Onaylanan bildirimler yalnızca
              <strong> 7 gün boyunca</strong> yayında kalır. 7 günü dolan fotoğraflar hem
              veritabanından hem depolama alanından otomatik olarak silinir.
            </p>
            <p className="mt-2">
              Fotoğraflar silinse bile anonim istatistiksel veriler (toplam bildirim sayısı gibi)
              saklanmaya devam eder. Orijinal (blursuz) fotoğraflar hiçbir zaman saklanmaz;
              yalnızca moderatör tarafından gizlenmiş versiyonlar yayınlanır.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              6. Plaka, Yüz ve Tabela Gizleme
            </h2>
            <p>
              KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) kapsamında, yüklenen
              fotoğraflardaki araç plakaları, kişilerin yüzleri ve dükkan tabelaları moderatör
              tarafından yayınlanmadan önce gizlenir. Gizlenmemiş hiçbir fotoğraf kamuya açık
              feed&apos;de gösterilmez.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              7. Çerezler ve İzleme
            </h2>
            <p>
              Davar üçüncü taraf çerez veya izleme aracı kullanmaz. Herhangi bir reklam ağı
              veya analitik hizmeti entegre değildir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              8. Verilerin Silinmesi
            </h2>
            <p>
              Tüm bildirimler 7 gün sonra otomatik olarak silinir. Acil kaldırma talebi için{" "}
              <a
                href="mailto:aykutssert@gmail.com"
                className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                aykutssert@gmail.com
              </a>{" "}
              adresine e-posta gönderebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              9. İletişim
            </h2>
            <p>
              Gizlilik politikası ve kullanım koşullarıyla ilgili sorularınız için{" "}
              <a
                href="mailto:aykutssert@gmail.com"
                className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                aykutssert@gmail.com
              </a>{" "}
              adresiyle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
