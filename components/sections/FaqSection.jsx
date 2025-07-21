import FaqItem from '../FaqItem';

export default function FaqSection() {
  const faqs = [
    { 
      q: "Bagaimana alur kerja atau proses kolaborasi dengan tim Anda?", 
      a: (
        // Di sini kita tambahkan class Tailwind secara manual
        <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
          <li><strong className="font-medium text-gray-900 dark:text-white">Konsultasi & Analisis:</strong> Kami mendiskusikan tujuan dan kebutuhan bisnis Anda secara gratis.</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">Perencanaan & Strategi:</strong> Kami menyusun rencana proyek, timeline, dan rincian fitur.</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">Desain & Pengembangan:</strong> Tim kami mulai mengerjakan desain visual dan pengembangan teknis.</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">Umpan Balik & Revisi:</strong> Kami mempresentasikan hasil kerja dan membuka sesi revisi sesuai kesepakatan.</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">Peluncuran & Pelatihan:</strong> Setelah final, kami meluncurkan proyek Anda dan memberikan panduan singkat untuk mengelolanya.</li>
        </ol>
      )
    },
    { q: "Berapa biaya untuk layanan yang Anda tawarkan?", a: <p className="text-gray-700 dark:text-gray-300">Biaya setiap proyek bersifat unik dan sangat bergantung pada tingkat kompleksitas, jumlah fitur, dan kebutuhan spesifik Anda. Kami tidak memiliki daftar harga tetap karena kami percaya setiap solusi harus disesuaikan. Cara terbaik adalah menjadwalkan konsultasi gratis dengan kami untuk mendapatkan penawaran harga yang akurat dan transparan sesuai kebutuhan Anda.</p> },

    { q: "Berapa lama waktu pengerjaan untuk satu proyek?", a: <p className="text-gray-700 dark:text-gray-300">Durasi pengerjaan bervariasi tergantung skala proyek. Sebagai gambaran, sebuah website company profile standar biasanya memakan waktu antara 2 hingga 4 minggu. Untuk proyek yang lebih kompleks seperti aplikasi mobile atau sistem kustom, durasinya akan lebih panjang. Kami akan selalu memberikan estimasi timeline yang jelas di awal proyek.</p>},

    { q: "Apakah ada garansi atau support setelah proyek selesai?", a: <p className="text-gray-700 dark:text-gray-300">Tentu saja. Kami ingin memastikan solusi yang kami berikan berjalan dengan baik. Kami memberikan garansi teknis gratis selama 30 hari setelah peluncuran untuk memperbaiki jika ada bug atau eror dari sisi kami. Kami juga menyediakan paket maintenance (perawatan) bulanan jika Anda membutuhkan dukungan jangka panjang.</p> },

    { q: "Apakah Anda menyediakan layanan SEO atau digital marketing?", a: <p className="text-gray-700 dark:text-gray-300">Ya, kami memiliki tim khusus yang fokus pada SEO dan digital marketing. Kami dapat membantu mengoptimalkan website Anda agar lebih mudah ditemukan di mesin pencari, serta merancang strategi pemasaran digital yang efektif untuk meningkatkan visibilitas dan konversi.</p> },



    // ... Tambahkan FAQ lainnya
  ];

  return (
    <section id='faq' className="py-20">
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