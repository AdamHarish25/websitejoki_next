'use client';

import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR } from '@/lib/checkout-utils';
import {
  Package,
  Palette,
  Tag,
  CreditCard,
  Minus,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';

/**
 * Komponen OrderSummaryCard = Card ringkasan pesanan di sidebar kanan (atau sticky bottom di HP)
 * - Update realtime tiap user pilih paket, addon, promo
 * - Menampilkan: paket, template, addons, subtotal, promo, TOTAL
 */
export default function OrderSummaryCard({ className = '' }) {
  const { state, computed, categoryMeta, stepMeta } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { packagePrice, addonsTotal, subtotal, promoDiscount, grandTotal } = computed;
  const hasSelection = !!state.serviceCategory;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3.5 dark:border-gray-700 dark:from-green-700 dark:to-emerald-600">
        <div className="flex items-center gap-2 text-white">
          <ClipboardCheck className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {isEn ? 'Order Summary' : 'Ringkasan Pesanan'}
            </div>
            {stepMeta && (
              <div className="text-[11px] opacity-90">
                {isEn ? 'Step' : 'Langkah'} {state.currentStep}/4: {isEn ? stepMeta.titleEn : stepMeta.title}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {!hasSelection ? (
          <EmptyState isEn={isEn} />
        ) : (
          <>
            {/* Kategori Layanan */}
            <div className="rounded-lg bg-gray-50/60 p-3 dark:bg-gray-900/60">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
                  <Package className="h-3.5 w-3.5" />
                  {isEn ? 'Service Category' : 'Kategori Layanan'}
                </span>
                {categoryMeta && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    {isEn ? categoryMeta.labelEn : categoryMeta.label}
                  </span>
                )}
              </div>
            </div>

            {/* Paket */}
            {state.packageSnapshot && (
              <SummaryRow
                icon={<Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                label={isEn ? 'Package' : 'Paket'}
                title={isEn ? state.packageSnapshot.nameEn || state.packageSnapshot.name : state.packageSnapshot.name}
                subtitle={state.packageSnapshot.subtitle || (isEn ? state.packageSnapshot.subtitleEn : null) || ''}
                price={packagePrice}
                isEn={isEn}
              />
            )}

            {/* Template (jika Web Design) */}
            {state.templateSnapshot && (
              <SummaryRow
                icon={<Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                label={isEn ? 'Template' : 'Template'}
                title={isEn ? state.templateSnapshot.nameEn || state.templateSnapshot.name : state.templateSnapshot.name}
                subtitle={
                  state.templateSnapshot.tier
                    ? (isEn ? `Tier: ${state.templateSnapshot.tier.toUpperCase()}` : `Tingkat: ${state.templateSnapshot.tier.toUpperCase()}`)
                    : ''
                }
                price={0}
                isIncluded
                isEn={isEn}
              />
            )}

            {/* Addons */}
            {state.selectedAddons.length > 0 && (
              <div className="space-y-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <Tag className="h-3.5 w-3.5" />
                  {isEn ? 'Add-ons' : 'Tambahan'} ({state.selectedAddons.length})
                </div>
                <div className="space-y-1.5 pl-0.5">
                  {state.selectedAddons.map(a => (
                    <div key={a.addonId} className="flex items-start justify-between gap-2 py-1">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                            {isEn ? a.nameEn || a.name : a.name}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 whitespace-nowrap dark:text-gray-200">
                        {formatIDR(a.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRICE BREAKDOWN */}
            <div className="mt-2 space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span className="font-medium">
                  {isEn ? 'Subtotal' : 'Subtotal'}
                  {state.selectedAddons.length > 0 && (
                    <span className="ml-1 text-[11px] font-normal text-gray-400 dark:text-gray-500">
                      ({isEn ? 'package + add-ons' : 'paket + tambahan'})
                    </span>
                  )}
                </span>
                <span className="font-bold">{formatIDR(subtotal)}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-1.5 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Minus className="h-3.5 w-3.5" />
                    <span className="font-semibold">
                      {isEn ? 'Discount' : 'Potongan'}
                      {state.promoCode && <span className="ml-1 rounded bg-green-700/10 px-1.5 py-0.5 text-[10px] font-black uppercase dark:bg-green-900/40">{state.promoCode}</span>}
                    </span>
                  </span>
                  <span className="font-black">- {formatIDR(promoDiscount)}</span>
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="mt-1 flex items-end justify-between rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-lg dark:from-green-950 dark:to-emerald-950 dark:border dark:border-green-800/50">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-300 dark:text-green-200">
                  {isEn ? 'Total Payment' : 'Total Pembayaran'}
                </div>
                <div className="text-xs text-gray-400 dark:text-green-300/80">
                  {isEn ? 'includes all taxes' : 'sudah termasuk pajak'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-tight">
                  {formatIDR(grandTotal)}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-1 border-t border-gray-100 pt-3 text-[10px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
              <CreditCard className="h-3 w-3" />
              <span>{isEn ? 'Secure checkout · Verified via Firebase' : 'Checkout aman · Terverifikasi via Firebase'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- SUB-COMPONENTS ---------------- */

function SummaryRow({ icon, label, title, subtitle, price, isIncluded = false, isEn }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="mt-0.5 shrink-0 rounded-md bg-gray-100 p-1.5 dark:bg-gray-700">{icon}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
          {subtitle && (
            <div className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 pl-2">
        {isIncluded ? (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {isEn ? 'Included' : 'Termasuk'}
          </span>
        ) : price > 0 ? (
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
            {formatIDR(price)}
          </span>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  );
}

function EmptyState({ isEn }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <div className="mb-3 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
        <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
        {isEn ? 'No selections yet' : 'Belum ada pilihan'}
      </h4>
      <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
        {isEn
          ? 'Start by selecting a service category and package. Your order summary will automatically appear here.'
          : 'Mulai dengan pilih kategori layanan dan paket. Ringkasan pesananmu akan muncul otomatis di sini.'}
      </p>
    </div>
  );
}
