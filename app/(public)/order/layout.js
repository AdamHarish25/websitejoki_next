'use client';

import { CheckoutProvider } from '@/context/CheckoutContext';
import { LanguageProvider } from '@/context/LanguageContext';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import OrderSummaryCard from '@/components/checkout/OrderSummaryCard';

/**
 * Layout utama untuk SEMUA halaman checkout:
 * /order/*
 *
 * Strukturnya (Desktop):
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  Progress (kiri)  │  Content Step X (tengah/kanan)  │  Summary (kanan) │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * (Mobile):
 * ┌────────────────────────┐
 * │  STEPPER HORIZONTAL    │
 * ├────────────────────────┤
 * │  Content Step X        │
 * ├────────────────────────┤
 * │  STICKY SUMMARY BOTTOM │
 * └────────────────────────┘
 */
export default function CheckoutLayout({ children }) {
  return (
    <LanguageProvider>
      <CheckoutProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-green-50/30 font-sans text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100">
          {/* Top Banner Promo - Sama seperti webekspor (opsional, bisa toggle hide) */}
          <div className="hidden w-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-4 py-2 text-center text-xs font-bold text-white md:block">
            🎉 PROMO GRAND OPENING: Pakai kode{' '}
            <span className="mx-1 rounded-full bg-white/20 px-2 py-0.5 font-black tracking-wide backdrop-blur">
              GRANDOPENING10
            </span>{' '}
            untuk DAPATKAN POTONGAN 10% SAMPAI 200RB!
          </div>

          {/* MAIN LAYOUT */}
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-5 md:px-6 md:py-8 lg:py-10 xl:py-12">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* KOLOM KIRI: Checkout Progress (Stepper) */}
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-5">
                    <CheckoutProgress />
                  </div>
                </div>
              </div>

              {/* KOLOM TENGAH: Content Step (children = step-1/2/3/4 page.js) */}
              <div className="lg:col-span-6">
                <main
                  id="checkout-content"
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {children}
                </main>
              </div>

              {/* KOLOM KANAN: Order Summary (Desktop) */}
              <div className="hidden lg:col-span-3 lg:block">
                <div className="lg:sticky lg:top-6">
                  <OrderSummaryCard />

                  {/* Footer Help Links (desktop only) */}
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                      Butuh Bantuan?
                    </div>
                    <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-1.5">
                        <span className="text-green-600 dark:text-green-400">💬</span>
                        <span>
                          <a
                            href="https://wa.me/6285179808325?text=Halo%20saya%20mau%20tanya%20tentang%20orderan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline font-semibold text-green-600 dark:text-green-400"
                          >
                            Chat WhatsApp CS
                          </a>
                        </span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-blue-500">✉️</span>
                        <span>
                          Email:{' '}
                          <a
                            href="mailto:support@websitejoki.my.id"
                            className="hover:underline font-semibold"
                          >
                            support@websitejoki.my.id
                          </a>
                        </span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-500">⏰</span>
                        <span>Operasional: Senin - Jumat (09.00 - 17.00 WIB)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Order Summary (MOBILE - sticky bottom nanti via CSS, tampilkan setelah step content) */}
              <div className="lg:hidden">
                <OrderSummaryCard className="order-last" />
              </div>
            </div>
          </div>

        </div>
      </CheckoutProvider>
    </LanguageProvider>
  );
}
