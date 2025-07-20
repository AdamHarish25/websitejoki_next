import FaqItem from '../FaqItem';

export default function FaqSection() {
  const faqs = [
    { q: "Bagaimana alur kerja atau proses kolaborasi dengan tim Anda?", a: `Proses kami sangat transparan dan berfokus pada kolaborasi. Secara umum, alurnya adalah:

    Konsultasi & Analisis: Kami mendiskusikan tujuan dan kebutuhan bisnis Anda secara gratis.

    Perencanaan & Strategi: Kami menyusun rencana proyek, timeline, dan rincian fitur.

    Desain & Pengembangan: Tim kami mulai mengerjakan desain visual dan pengembangan teknis.

    Umpan Balik & Revisi: Kami mempresentasikan hasil kerja dan membuka sesi revisi sesuai kesepakatan.

    Peluncuran & Pelatihan: Setelah final, kami meluncurkan proyek Anda dan memberikan panduan singkat untuk mengelolanya.` },
    { q: "Berapa biaya untuk layanan yang Anda tawarkan?", a: "Biaya setiap proyek bersifat unik dan sangat bergantung pada tingkat kompleksitas, jumlah fitur, dan kebutuhan spesifik Anda. Kami tidak memiliki daftar harga tetap karena kami percaya setiap solusi harus disesuaikan. Cara terbaik adalah menjadwalkan konsultasi gratis dengan kami untuk mendapatkan penawaran harga yang akurat dan transparan sesuai kebutuhan Anda." },

    { q: "Berapa lama waktu pengerjaan untuk satu proyek?", a: "Durasi pengerjaan bervariasi tergantung skala proyek. Sebagai gambaran, sebuah website company profile standar biasanya memakan waktu antara 2 hingga 4 minggu. Untuk proyek yang lebih kompleks seperti aplikasi mobile atau sistem kustom, durasinya akan lebih panjang. Kami akan selalu memberikan estimasi timeline yang jelas di awal proyek." },

    { q: "Apakah ada garansi atau support setelah proyek selesai?", a: "Tentu saja. Kami ingin memastikan solusi yang kami berikan berjalan dengan baik. Kami memberikan garansi teknis gratis selama 30 hari setelah peluncuran untuk memperbaiki jika ada bug atau eror dari sisi kami. Kami juga menyediakan paket maintenance (perawatan) bulanan jika Anda membutuhkan dukungan jangka panjang." },

    { q: "Apakah Anda menyediakan layanan SEO atau digital marketing?", a: "Ya, kami memiliki tim khusus yang fokus pada SEO dan digital marketing. Kami dapat membantu mengoptimalkan website Anda agar lebih mudah ditemukan di mesin pencari, serta merancang strategi pemasaran digital yang efektif untuk meningkatkan visibilitas dan konversi." },



    // ... Tambahkan FAQ lainnya
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions (FAQ)</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}