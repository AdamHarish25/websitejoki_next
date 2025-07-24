export default function CalculatorExplanation() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 lg:p-8 rounded-xl shadow-lg space-y-6">
        
        <h2 className="text-2xl font-bold text-start lg:text-center">Bagaimana Kalkulator Ini Bekerja?</h2>
        
        <p className="text-start lg:text-center text-gray-600 dark:text-gray-300">
          Penting untuk diingat bahwa alat ini adalah <b>alat estimasi</b> untuk memvisualisasikan <b>potensi</b>. Hasil sebenarnya dapat bervariasi tergantung pada banyak faktor, termasuk industri, kompetisi, dan kualitas website Anda. Tujuannya adalah untuk menjadi titik awal diskusi strategi kita.
        </p>

        <div className="border-t dark:border-gray-700 pt-6 space-y-4">
          <h3 className="text-xl font-semibold">Definisi Input</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Anggaran SEO Bulanan:</strong> Biaya yang Anda investasikan setiap bulan untuk layanan SEO guna mendatangkan trafik tertarget.
            </li>
            <li>
              <strong>Rata-rata Nilai per Pelanggan:</strong> Ini adalah <b>keuntungan bersih (profit)</b> rata-rata yang Anda dapatkan dari satu pelanggan baru. Ini membantu kita memahami nilai sebenarnya dari setiap akuisisi pelanggan.
            </li>
            <li>
              <strong>Tingkat Konversi Website (%):</strong> Dari 100 pengunjung, berapa persen yang akhirnya menghubungi Anda, mengisi form, atau menjadi <i>lead</i>.
            </li>
          </ul>
        </div>

        <div className="border-t dark:border-gray-700 pt-6 space-y-4">
          <h3 className="text-xl font-semibold">Logika Perhitungan</h3>
           <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Target Pengunjung Baru:</strong> Dihitung berdasarkan asumsi konservatif dari performa rata-rata kampanye SEO pada industri Anda.
            </li>
            <li>
              <strong>Estimasi Leads & Pelanggan:</strong> Dihitung dari jumlah pengunjung dikalikan dengan tingkat konversi website Anda, lalu dikalikan lagi dengan asumsi standar industri untuk tingkat penutupan penjualan (<i>sales closing rate</i>).
            </li>
            <li>
              <strong>ROI (Return on Investment):</strong> <br/>Dihitung dengan rumus standar: <b>((Total Pendapatan - Total Biaya) / Total Biaya) x 100%</b>. <br/> Angka ini menunjukkan seberapa efisien investasi Anda.
            </li>
          </ul>
        </div>
        
        <p className="text-start lg:text-center text-gray-800 dark:text-gray-100 pt-4 font-semibold">
            Angka-angka ini adalah titik awal yang baik untuk diskusi. Mari kita bicara tentang bagaimana kami bisa membantu meningkatkan setiap metrik ini untuk bisnis Anda.
        </p>
      </div>
    </div>
  );
}