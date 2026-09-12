'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import CustomerForm from '@/components/checkout/CustomerForm';
import {
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

/**
 * STEP 3: DATA DIRI CUSTOMER
 *
 * Form input: nama, email, WA, perusahaan (opsional), catatan
 * Validasi: semua required field harus valid sebelum next
 */
export default function Step3CustomerPage() {
  const router = useRouter();
  const {
    state,
    categoryMeta,
    nextStep,
    prevStep,
    canProceed,
    getValidationErrors
  } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [errors, setErrors] = useState({});
  const [isNextLoading, setIsNextLoading] = useState(false);

  // Redirect jika step sebelumnya belum lengkap
  useEffect(() => {
    if (!state.serviceCategory || !state.packageId) {
      router.replace('/order/step-1-service');
      return;
    }
    // Cek step 2: web harus pilih template, lainnya harus isi brief
    if (state.serviceCategory === 'web' && !state.templateId) {
      router.replace('/order/step-2-requirements');
      return;
    }
    if (state.serviceCategory !== 'web') {
      const brief = String(state.scopeData?.projectBrief || '').trim();
      if (brief.length < 15) {
        router.replace('/order/step-2-requirements');
        return;
      }
    }
  }, [state.serviceCategory, state.packageId, state.templateId, state.scopeData?.projectBrief, router]);

  const handleNext = async () => {
    const stepErrors = getValidationErrors(3);
    setErrors(stepErrors || {});
    if (Object.keys(stepErrors || {}).length > 0) {
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
      router.push('/order/step-4-payment');
    } finally {
      setIsNextLoading(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.push('/order/step-2-requirements');
  };

  // Jangan render jika belum lengkap (sedang redirect)
  if (!state.serviceCategory || !state.packageId) {
    return null;
  }

  return (
    <div className="p-5 md:p-8">
      {/* STEP HEADER */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
          {isEn ? 'Step 3 of 4' : 'Langkah 3 dari 4'}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 font-serif dark:text-white md:text-3xl">
          {isEn ? 'Your Information' : 'Data Diri Anda'}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 md:text-base">
          {isEn
            ? 'Fill in your details so we can activate your order and send the invoice.'
            : 'Isi data Anda agar kami bisa mengaktivasi pesanan dan mengirim invoice.'}
        </p>
      </div>

      {/* ERROR BANNER */}
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

      {/* CATEGORY + PACKAGE SUMMARY */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {categoryMeta && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
            {isEn ? categoryMeta.labelEn : categoryMeta.label}
          </span>
        )}
        {state.packageSnapshot && (
          <>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isEn ? 'Package:' : 'Paket:'}{' '}
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {isEn ? state.packageSnapshot.nameEn || state.packageSnapshot.name : state.packageSnapshot.name}
              </span>
            </span>
          </>
        )}
      </div>

      {/* CUSTOMER FORM */}
      <div className="mb-8">
        <CustomerForm />
      </div>

      {/* NAV BUTTONS */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back' : 'Kembali'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextLoading || !canProceed(3)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white transition-all shadow-lg ${
            canProceed(3) && !isNextLoading
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30'
              : 'cursor-not-allowed bg-gray-300 shadow-none dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {isNextLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEn ? 'Continue to Payment' : 'Lanjut ke Pembayaran'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
