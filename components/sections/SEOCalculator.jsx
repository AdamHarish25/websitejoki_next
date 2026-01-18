'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function SeoCalculator() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // --- STATE FOR INPUTS ---
  const [budget, setBudget] = useState(3000000); // Monthly budget
  const [customerValue, setCustomerValue] = useState(500000); // LTV
  const [conversionRate, setConversionRate] = useState(2); // Conversion rate %

  // --- MODEL ---
  // Assumption: Every 1M IDR budget brings ~50 targeted visitors
  const visitorsPerMillion = 50;

  // --- CALCULATION LOGIC ---
  const results = useMemo(() => {
    const estimatedVisitors = (budget / 1000000) * visitorsPerMillion;
    const estimatedLeads = estimatedVisitors * (conversionRate / 100);

    // Assumption: 1 in 4 leads becomes a customer (25% close rate)
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

  // Currency Formatter
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-6 pb-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Left Column: Input Form */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="space-y-10">
            {/* Input Budget */}
            <div>
              <label className="block text-lg font-bold font-serif text-gray-800 dark:text-gray-100 mb-2">
                {isEn ? 'Monthly SEO Budget' : 'Anggaran SEO Bulanan Anda'}
              </label>
              <input
                type="range"
                min="500000"
                max="20000000"
                step="500000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
              />
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-3 tracking-tight">
                {formatCurrency(budget)}
              </div>
            </div>

            {/* Input Customer Value */}
            <div>
              <label className="block text-lg font-bold font-serif text-gray-800 dark:text-gray-100 mb-2">
                {isEn ? 'Average Customer Value (LTV)' : 'Rata-rata Nilai per Pelanggan'}
              </label>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={customerValue}
                onChange={(e) => setCustomerValue(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
              />
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-3 tracking-tight">
                {formatCurrency(customerValue)}
              </div>
            </div>

            {/* Input Conversion Rate */}
            <div>
              <label className="block text-lg font-bold font-serif text-gray-800 dark:text-gray-100 mb-2">
                {isEn ? 'Estimated Website Conversion Rate (%)' : 'Perkiraan Tingkat Konversi Website (%)'}
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
              />
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-3 tracking-tight">
                {conversionRate}%
              </div>
              <p className="text-sm text-gray-500 font-serif italic mt-2">
                {isEn ? 'Out of 100 visitors, how many contact you?' : 'Dari 100 pengunjung, berapa yang menghubungi Anda?'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Projection Results */}
        <div className="bg-gray-900 text-white p-10 rounded-xl shadow-xl flex flex-col justify-center relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

          <h3 className="text-2xl font-bold mb-8 text-center font-serif relative z-10">
            {isEn ? 'Monthly Estimation Results' : 'Estimasi Hasil Bulanan'}
          </h3>

          <div className="space-y-6 text-lg relative z-10">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="font-serif text-gray-300">{isEn ? 'Target New Visitors:' : 'Target Pengunjung Baru:'}</span>
              <span className="font-bold text-2xl">{results.visitors}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="font-serif text-gray-300">{isEn ? 'Est. New Leads:' : 'Estimasi Leads Baru:'}</span>
              <span className="font-bold text-2xl">{results.leads}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="font-serif text-gray-300">{isEn ? 'Est. New Customers:' : 'Estimasi Pelanggan Baru:'}</span>
              <span className="font-bold text-2xl">{results.customers}</span>
            </div>
            <div className="flex flex-col gap-2 pt-6 mt-2 border-t border-gray-700">
              <span className="text-base text-gray-400 uppercase tracking-widest text-center">{isEn ? 'Potential Revenue' : 'Potensi Pendapatan'}</span>
              <span className="font-black text-4xl lg:text-5xl text-green-400 text-center tracking-tighter">{formatCurrency(results.revenue)}</span>
            </div>
            <div className="text-center pt-8">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">{isEn ? 'Estimated ROI' : 'Estimasi ROI'}</p>
              <p className={`font-black text-6xl ${results.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>{results.roi}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}