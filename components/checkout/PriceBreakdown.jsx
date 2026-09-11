'use client';

import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR } from '@/lib/checkout-utils';
import { Package, Puzzle, Minus, CreditCard } from 'lucide-react';

/**
 * PriceBreakdown = Detail perhitungan: Paket, Add-ons, Subtotal, Promo, TOTAL
 */
export default function PriceBreakdown() {
  const { state, computed } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { packagePrice, addonsTotal, subtotal, promoDiscount, grandTotal } = computed;

  return (
    <div className="space-y-3">
      {/* Paket */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Package className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          {isEn ? 'Package' : 'Paket'}
          {state.packageSnapshot && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              ({isEn ? state.packageSnapshot.nameEn || state.packageSnapshot.name : state.packageSnapshot.name})
            </span>
          )}
        </span>
        <span className="font-bold text-gray-800 dark:text-gray-100">{formatIDR(packagePrice)}</span>
      </div>

      {/* Add-ons */}
      {state.selectedAddons.length > 0 && (
        <div className="space-y-1.5">
          {state.selectedAddons.map(a => (
            <div key={a.addonId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Puzzle className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                <span className="text-[11px]">{isEn ? a.nameEn || a.name : a.name}</span>
              </span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">+{formatIDR(a.price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          {isEn ? 'Subtotal' : 'Subtotal'}
          {state.selectedAddons.length > 0 && (
            <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
              ({isEn ? 'package + add-ons' : 'paket + tambahan'})
            </span>
          )}
        </span>
        <span className="font-bold text-gray-800 dark:text-gray-100">{formatIDR(subtotal)}</span>
      </div>

      {/* Promo Discount */}
      {promoDiscount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          <span className="flex items-center gap-1.5">
            <Minus className="h-3.5 w-3.5" />
            <span className="font-semibold">
              {isEn ? 'Promo' : 'Promo'}
              {state.promoCode && (
                <span className="ml-1 rounded bg-green-700/10 px-1.5 py-0.5 text-[10px] font-black uppercase dark:bg-green-900/40">
                  {state.promoCode}
                </span>
              )}
            </span>
          </span>
          <span className="font-black">- {formatIDR(promoDiscount)}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* TOTAL */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-lg dark:from-green-950 dark:to-emerald-950 dark:border dark:border-green-800/50">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-300 dark:text-green-200" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-300 dark:text-green-200">
              {isEn ? 'Total Payment' : 'Total Pembayaran'}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-green-300/80">
              {isEn ? 'includes all taxes' : 'sudah termasuk pajak'}
            </div>
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight">
          {formatIDR(grandTotal)}
        </div>
      </div>
    </div>
  );
}
