'use client';

import { useState, useMemo } from 'react';

export default function SeoCalculator() {
  // --- STATE UNTUK INPUT ---
  const [budget, setBudget] = useState(3000000); // Anggaran bulanan, misal Rp 3jt
  const [customerValue, setCustomerValue] = useState(500000); // Nilai per pelanggan, misal Rp 500rb
  const [conversionRate, setConversionRate] = useState(2); // Tingkat konversi 2%

  // --- MODEL PROYEKSI SEDERHANA ---
  // Ini adalah asumsi. Anda bisa sesuaikan.
  // Misal: Setiap Rp 1jt budget mendatangkan 50 pengunjung tertarget baru per bulan
  const visitorsPerMillion = 50; 

  // --- LOGIKA KALKULASI (menggunakan useMemo agar efisien) ---
  const results = useMemo(() => {
    const estimatedVisitors = (budget / 1000000) * visitorsPerMillion;
    const estimatedLeads = estimatedVisitors * (conversionRate / 100);
    
    // Asumsi 1 dari 4 leads menjadi pelanggan (25% close rate)
    const leadToCustomerRate = 0.25;
    const estimatedCustomers = estimatedLeads * leadToCustomerRate;

    const estimatedRevenue = estimatedCustomers * customerValue;
    const roi = budget > 0 ? ((estimatedRevenue - budget) / budget) * 100 : 0;

    return {
      visitors: Math.round(estimatedVisitors),
      leads: Math.round(estimatedLeads),
      customers: Math.round(estimatedCustomers),
      revenue: estimatedRevenue,
      roi: Math.round(roi),
    };
  }, [budget, customerValue, conversionRate]);

  // Fungsi untuk format angka ke Rupiah
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Kolom Kiri: Input Form */}
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="space-y-8">
            {/* Input Budget */}
            <div>
              <label className="block text-lg font-semibold mb-2">Anggaran SEO Bulanan Anda</label>
              <input type="range" min="500000" max="20000000" step="500000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
              <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(budget)}</div>
            </div>
            {/* Input Nilai Pelanggan */}
            <div>
              <label className="block text-lg font-semibold mb-2">Rata-rata Nilai per Pelanggan</label>
              <input type="range" min="50000" max="10000000" step="50000" value={customerValue} onChange={(e) => setCustomerValue(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
              <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(customerValue)}</div>
            </div>
            {/* Input Tingkat Konversi */}
            <div>
              <label className="block text-lg font-semibold mb-2">Perkiraan Tingkat Konversi Website (%)</label>
              <input type="range" min="0.5" max="10" step="0.5" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
              <div className="text-2xl font-bold text-green-600 mt-2">{conversionRate}%</div>
              <p className="text-sm text-gray-500 mt-1">Dari 100 pengunjung, berapa yang menghubungi Anda?</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Hasil Proyeksi */}
        <div className="bg-green-600 text-white p-8 rounded-xl shadow-lg flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6 text-center">Estimasi Hasil Bulanan</h3>
            <div className="space-y-5 text-lg">
                <div className="flex justify-between items-center">
                    <span>Target Pengunjung Baru:</span>
                    <span className="font-bold text-xl lg:text-2xl">{results.visitors}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Estimasi Leads Baru (Kontak Masuk):</span>
                    <span className="font-bold text-xl lg:text-2xl">{results.leads}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span>Estimasi Pelanggan Baru:</span>
                    <span className="font-bold text-xl lg:text-2xl">{results.customers}</span>
                </div>
                 <div className="flex justify-between items-center border-t border-green-500 pt-4 mt-4">
                    <span className="text-base lg:text-xl">Potensi Pendapatan Tambahan:</span>
                    <span className="font-bold text-2xl lg:text-3xl text-yellow-300">{formatCurrency(results.revenue)}</span>
                </div>
                <div className="text-center pt-6">
                    <p className="text-xl">Estimasi ROI</p>
                    <p className={`font-extrabold text-6xl ${results.roi > 0 ? 'text-yellow-300' : 'text-red-300'}`}>{results.roi}%</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}