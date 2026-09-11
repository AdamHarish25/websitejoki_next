'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR } from '@/lib/checkout-utils';
import { Tag, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * PromoCodeInput = Input kode promo + tombol Apply + error handling
 * - Fetch all promos dari Firestore
 * - Validate via applyPromoCode()
 * - Show success/error message
 */
export default function PromoCodeInput() {
  const { state, applyPromoCode, clearPromo } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [inputCode, setInputCode] = useState(state.promoCode || '');
  const [allPromos, setAllPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  const hasPromo = !!state.promoCode;

  // Fetch promo codes on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchPromos() {
      try {
        const snap = await getDocs(collection(db, 'promo_codes'));
        if (cancelled) return;
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllPromos(list);
      } catch (err) {
        console.error('Failed to fetch promos:', err);
      }
    }
    fetchPromos();
    return () => { cancelled = true; };
  }, []);

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setChecking(true);
    setMessage(null);
    try {
      const result = await applyPromoCode(inputCode.trim(), allPromos);
      if (result.valid) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: isEn ? 'Failed to verify promo code.' : 'Gagal memverifikasi kode promo.' });
    } finally {
      setChecking(false);
    }
  };

  const handleClear = () => {
    clearPromo();
    setInputCode('');
    setMessage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isEn ? 'Promo Code' : 'Kode Promo'}
        </h3>
      </div>

      {hasPromo ? (
        // Active promo display
        <div className="flex items-center justify-between rounded-xl border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {state.promoCode}
              </span>
              {state.promoSnapshot && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                  {state.promoSnapshot.discountType === 'percentage'
                    ? `${state.promoSnapshot.discountValue}% OFF`
                    : `-${formatIDR(state.promoSnapshot.discountValue)}`}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // Input field
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              setMessage(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isEn ? 'Enter promo code...' : 'Masukkan kode promo...'}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-800 placeholder-gray-400 placeholder:normal-case placeholder:font-normal transition-colors focus:border-green-500 focus:bg-white  focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:text-black dark:focus:border-green-500 dark:focus:ring-green-500/20"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={checking || !inputCode.trim()}
            className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-bold transition-all ${
              checking || !inputCode.trim()
                ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/20'
            }`}
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
            {isEn ? 'Apply' : 'Gunakan'}
          </button>
        </div>
      )}

      {/* Message */}
      {message && !hasPromo && (
        <div className={`mt-2 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
        }`}>
          {message.type === 'success'
            ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          }
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
