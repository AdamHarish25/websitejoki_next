'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR } from '@/lib/checkout-utils';
import { Loader2, Plus, Minus, Puzzle } from 'lucide-react';

/**
 * AddonSelector = List add-ons yang bisa dipilih per kategori
 * - Fetch dari Firestore `addons/`, filter by applicableCategories
 * - Toggle checkbox/tombol tambah
 * - Update state.selectedAddons + total realtime
 */
export default function AddonSelector() {
  const { state, toggleAddon } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedIds = (state.selectedAddons || []).map(a => a.addonId);

  // Fetch addons, filter by current category
  useEffect(() => {
    let cancelled = false;
    async function fetchAddons() {
      try {
        const q = query(collection(db, 'addons'), where('isActive', '==', true));
        const snap = await getDocs(q);
        if (cancelled) return;
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Filter: addon applicable for current category OR applies to all (empty array)
        const cat = state.serviceCategory;
        const filtered = all.filter(a => {
          const cats = a.applicableCategories || [];
          if (cats.length === 0) return true; // applies to all
          return cat && cats.includes(cat);
        });
        setAddons(filtered);
      } catch (err) {
        console.error('Failed to fetch addons:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAddons();
    return () => { cancelled = true; };
  }, [state.serviceCategory]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
      </div>
    );
  }

  if (addons.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Puzzle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isEn ? 'Add-ons (Optional)' : 'Layanan Tambahan (Opsional)'}
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {isEn
          ? 'Enhance your order with these additional services.'
          : 'Lengkapi pesanan Anda dengan layanan tambahan berikut.'}
      </p>

      <div className="space-y-2">
        {addons.map(addon => {
          const isSelected = selectedIds.includes(addon.id);
          const name = isEn && addon.nameEn ? addon.nameEn : addon.name;
          const desc = isEn && addon.descriptionEn ? addon.descriptionEn : addon.description;

          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => toggleAddon(addon)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50/60 ring-2 ring-green-100 dark:border-green-500 dark:bg-green-950/20 dark:ring-green-900/30'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              }`}
            >
              {/* Toggle Icon */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                isSelected
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }`}>
                {isSelected ? (
                  <Minus className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={3} />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${isSelected ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                  {name}
                </div>
                {desc && (
                  <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                    {desc}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <div className={`text-sm font-black ${isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                  +{formatIDR(addon.price)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
