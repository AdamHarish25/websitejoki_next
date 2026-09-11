'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR, getPackagePrice } from '@/lib/checkout-utils';
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Search,
  Megaphone,
  Smartphone,
  LayoutDashboard,
  Award,
  ChevronRight
} from 'lucide-react';

/**
 * STEP 1: PILIH KATEGORI LAYANAN + PAKET HARGA
 *
 * - User pilih dulu kategori (Web, SEO, Ads, App, Dashboard, Branding)
 * - Setelah kategori terpilih, list paket untuk kategori itu muncul
 * - User pilih salah satu paket -> tombol selanjutnya aktif
 * - Klik Selanjutnya -> context.setPackage + nextStep() -> pindah ke step 2
 */

function Step1ServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectCategory = searchParams.get('category') || null;

  const { setServiceCategory, setPackage, nextStep, state, canProceed, getValidationErrors, computed } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [packagesAll, setPackagesAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isNextLoading, setIsNextLoading] = useState(false);

  // Fetch semua packages dari Firestore
  useEffect(() => {
    let cancelled = false;
    async function fetchPackages() {
      try {
        const q = query(collection(db, 'packages'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        if (cancelled) return;
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPackagesAll(list);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPackages();
    return () => { cancelled = true; };
  }, []);

  // Pre-select kategori dari query params ?category=seo
  useEffect(() => {
    if (preselectCategory) {
      setServiceCategory(preselectCategory);
    }
  }, [preselectCategory, setServiceCategory]);

  // Kategori yang tersedia (sesuai CATEGORY_META di CheckoutContext.js)
  const categories = useMemo(() => [
    {
      id: 'web',
      label: isEn ? 'Web Design' : 'Desain Website',
      labelShort: isEn ? 'Website' : 'Website',
      desc: isEn ? 'Company profile, landing page, online store' : 'Company profile, landing page, toko online',
      icon: <Globe className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'seo',
      label: isEn ? 'SEO Services' : 'Jasa SEO',
      labelShort: 'SEO',
      desc: isEn ? 'Rank page 1 Google with proven strategies' : 'Naik ranking Google strategi terbukti',
      icon: <Search className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'ads',
      label: isEn ? 'Google Ads' : 'Google Ads',
      labelShort: 'Ads',
      desc: isEn ? 'Targeted ads, faster leads & sales' : 'Iklan tertarget, datangkan leads cepat',
      icon: <Megaphone className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'app',
      label: isEn ? 'Mobile App Dev' : 'Aplikasi Mobile',
      labelShort: isEn ? 'App' : 'App',
      desc: isEn ? 'Android & iOS custom application' : 'Aplikasi Android & iOS kustom',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'dash',
      label: isEn ? 'Custom Dashboard' : 'Dashboard',
      labelShort: isEn ? 'Dashboard' : 'Dashboard',
      desc: isEn ? 'Data visualization & business reporting' : 'Visualisasi data & laporan bisnis',
      icon: <LayoutDashboard className="h-6 w-6" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'brand',
      label: isEn ? 'Branding & Trademark' : 'Branding & HakMerk',
      labelShort: isEn ? 'Branding' : 'Branding',
      desc: isEn ? 'Logo, brand identity, trademark (HAKI)' : 'Logo, identitas brand, daftar HAKI',
      icon: <Award className="h-6 w-6" />,
      color: 'from-amber-500 to-orange-600'
    }
  ], [isEn]);

  // Filter packages by kategori terpilih
  const filteredPackages = useMemo(() => {
    if (!state.serviceCategory) return [];
    return packagesAll.filter(p => String(p.category || '').toLowerCase() === String(state.serviceCategory).toLowerCase());
  }, [packagesAll, state.serviceCategory]);

  const selectedPackageId = state.packageId;
  const currentCategoryMeta = categories.find(c => c.id === state.serviceCategory);

  // --- HANDLERS ---
  const handlePickCategory = (catId) => {
    setServiceCategory(catId);
  };

  const handlePickPackage = (pkg) => {
    setPackage(pkg);
  };

  const handleNext = async () => {
    // Validasi
    const stepErrors = getValidationErrors(1);
    setErrors(stepErrors || {});
    if (Object.keys(stepErrors || {}).length > 0) {
      // Scroll ke error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsNextLoading(true);
    try {
      const result = nextStep();
      if (result?.success === false) {
        setErrors(result.errors || {});
        return;
      }
      router.push('/order/step-2-requirements');
    } finally {
      setIsNextLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="p-5 md:p-8">
      {/* STEP HEADER */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
          {isEn ? 'Step 1 of 4' : 'Langkah 1 dari 4'}
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-gray-900 font-serif dark:text-white">
          {isEn ? 'Choose the right service for you' : 'Pilih layanan yang tepat untuk bisnismu'}
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
          {isEn
            ? 'Select a category below that fits your needs, then pick a pricing package to get started.'
            : 'Pilih kategori layanan di bawah yang sesuai kebutuhanmu, lalu pilih paket harga untuk memulai.'}
        </p>
      </div>

      {/* ERROR BANNER (jika ada validasi error) */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-5 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <strong>{isEn ? 'Please fix these errors before continuing:' : 'Perbaiki kesalahan berikut sebelum lanjut:'}</strong>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1: KATEGORI LAYANAN */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {isEn ? '1. Service Category' : '1. Kategori Layanan'}
        </h2>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
          {categories.map(cat => {
            const selected = state.serviceCategory === cat.id;
            const count = packagesAll.filter(p => String(p.category || '').toLowerCase() === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handlePickCategory(cat.id)}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 md:p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  selected
                    ? 'border-green-500 bg-green-50/80 ring-4 ring-green-100 shadow-md dark:border-green-500 dark:bg-green-950/30 dark:ring-green-900/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                }`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm md:text-base font-bold ${selected ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                    {cat.label}
                    {selected && (
                      <CheckCircle2 className="ml-1 inline h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {cat.desc}
                  </div>
                  <div className="mt-1.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {count} {isEn ? 'package(s)' : 'paket tersedia'}
                  </div>
                </div>
                <ChevronRight className={`absolute right-2 top-2 h-4 w-4 transition-all ${selected ? 'translate-x-0 text-green-600 opacity-100 dark:text-green-400' : 'translate-x-2 text-gray-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 dark:text-gray-600'}`} />
              </button>
            );
          })}
        </div>
        {errors.serviceCategory && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">⚠️ {errors.serviceCategory}</p>
        )}
      </div>

      {/* SECTION 2: PAKET HARGA (hanya tampil jika kategori sudah dipilih) */}
      {state.serviceCategory && (
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">
              2. {isEn ? 'Select a Package for' : 'Pilih Paket untuk'}{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {currentCategoryMeta?.label}
              </span>
            </h2>
            <div className="text-[11px] text-gray-400 dark:text-gray-500">
              {filteredPackages.length} {isEn ? 'packages found' : 'paket ditemukan'}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {isEn ? 'No packages for this category yet' : 'Belum ada paket untuk kategori ini'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {isEn
                  ? 'Packages for this category will be added soon by our admin. Please contact WhatsApp for custom quote.'
                  : 'Paket untuk kategori ini segera ditambahkan admin. Hubungi WhatsApp untuk penawaran khusus.'}
              </p>
              <Link
                href="https://wa.me/6285179808325"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
              >
                Hubungi WA
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredPackages.map(pkg => {
                const isSelected = selectedPackageId === pkg.id;
                const priceNum = getPackagePrice(pkg);
                const name = isEn && pkg.nameEn ? pkg.nameEn : pkg.name;
                const subtitle = isEn && pkg.subtitleEn ? pkg.subtitleEn : (pkg.subtitle || '');
                const description = isEn && pkg.descriptionEn ? pkg.descriptionEn : (pkg.description || '');
                const features = isEn && pkg.featuresEn && pkg.featuresEn.length > 0 ? pkg.featuresEn : (pkg.features || []);
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePickPackage(pkg)}
                    className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
                      isSelected
                        ? 'border-green-500 bg-green-50/60 shadow-xl ring-4 ring-green-100 dark:border-green-500 dark:bg-green-950/20 dark:ring-green-900/30'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ' + (pkg.isPopular ? 'border-amber-400 ring-2 ring-amber-200 dark:ring-amber-900/40' : '')
                    }`}
                  >
                    {/* Badge Popular */}
                    {(pkg.isPopular || isSelected) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-md ${
                          isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                        }`}>
                          {isSelected ? (
                            <><CheckCircle2 className="h-3 w-3" /> Selected</>
                          ) : (
                            <><span>⭐</span> {isEn ? 'POPULAR' : 'TERPOPULER'}</>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="mb-3 min-w-0 pt-1">
                      <h3 className="line-clamp-2 text-lg font-black text-gray-900 dark:text-white">{name}</h3>
                      {subtitle && <p className="mt-0.5 truncate text-xs font-semibold text-green-600 dark:text-green-400">{subtitle}</p>}
                      {description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>}
                    </div>

                    {/* Price */}
                    <div className="mb-4 flex items-end gap-1">
                      <span className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        {priceNum ? formatIDR(priceNum) : (pkg.price || 'Custom')}
                      </span>
                      {pkg.pricePeriod && (
                        <span className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">/ {pkg.pricePeriod}</span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mb-5 space-y-2 flex-grow">
                      {features.slice(0, 6).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" strokeWidth={3} />
                          <span className="min-w-0 flex-1 break-words leading-snug">{String(f).trim()}</span>
                        </li>
                      ))}
                      {features.length > 6 && (
                        <li className="text-[11px] text-gray-400 dark:text-gray-500 pl-5.5">
                          +{features.length - 6} more {isEn ? 'benefits' : 'keuntungan lainnya'}
                        </li>
                      )}
                    </ul>

                    {/* CTA */}
                    <div
                      className={`mt-auto rounded-lg text-center py-2.5 text-sm font-black transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> {isEn ? 'PACKAGE SELECTED' : 'PAKET DIPILIH'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          {isEn ? 'Choose This' : 'Pilih Paket Ini'} <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {errors.package && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">⚠️ {errors.package}</p>
          )}
        </div>
      )}

      {/* NAV BUTTONS */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 md:flex-row md:items-center md:justify-between dark:border-gray-700">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to Home' : 'Kembali ke Beranda'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextLoading || !canProceed(1)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white transition-all shadow-lg ${
            canProceed(1) && !isNextLoading
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30'
              : 'cursor-not-allowed bg-gray-300 shadow-none dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {isNextLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEn ? 'Continue to Next Step' : 'Lanjut ke Langkah Berikutnya'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Step1ServicePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    }>
      <Step1ServiceContent />
    </Suspense>
  );
}
