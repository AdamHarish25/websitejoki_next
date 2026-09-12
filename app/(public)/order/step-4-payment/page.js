'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR, generateOrderId } from '@/lib/checkout-utils';
import AddonSelector from '@/components/checkout/AddonSelector';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';
import PriceBreakdown from '@/components/checkout/PriceBreakdown';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import PaymentProofUploader from '@/components/checkout/PaymentProofUploader';
import {
  ArrowLeft,
  Loader2,
  Send,
  ShieldCheck
} from 'lucide-react';

/**
 * STEP 4: KONFIRMASI & PEMBAYARAN
 *
 * Gabung SEMUA komponen step 4:
 * - AddonSelector
 * - PromoCodeInput
 * - PriceBreakdown
 * - PaymentMethodSelector
 * - PaymentProofUploader
 * - Tombol "Buat Pesanan"
 *
 * Submit: validate → generate orderId → save to Firestore orders/ + payments/ → redirect success
 */
export default function Step4PaymentPage() {
  const router = useRouter();
  const {
    state,
    computed,
    categoryMeta,
    nextStep,
    prevStep,
    canProceed,
    getValidationErrors,
    generateNewOrderId,
    resetCheckout
  } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Redirect jika step sebelumnya belum lengkap
  useEffect(() => {
    if (!state.serviceCategory || !state.packageId) {
      router.replace('/order/step-1-service');
      return;
    }
    if (!state.customerData?.fullName || !state.customerData?.email || !state.customerData?.phone) {
      router.replace('/order/step-3-customer');
      return;
    }
  }, [state.serviceCategory, state.packageId, state.customerData?.fullName, state.customerData?.email, state.customerData?.phone, router]);

  const handleSubmit = async () => {
    const stepErrors = getValidationErrors(4);
    setErrors(stepErrors || {});
    if (Object.keys(stepErrors || {}).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderId = generateOrderId();
      const now = new Date();

      // Build order document
      const orderData = {
        orderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'awaiting_payment',

        // Step 1: Service
        serviceCategory: state.serviceCategory,
        packageId: state.packageId,
        packageSnapshot: state.packageSnapshot,

        // Step 2: Template / Scope
        orderType: state.orderType,
        templateId: state.templateId || null,
        templateSnapshot: state.templateSnapshot || null,
        scopeData: state.orderType === 'custom_scope' ? state.scopeData : null,

        // Step 3: Customer
        customerData: state.customerData,
        customerId: state.customerId,

        // Step 4: Payment
        selectedAddons: state.selectedAddons,
        promoCode: state.promoCode || null,
        promoDiscountAmount: state.promoDiscountAmount || 0,
        subtotal: computed.subtotal,
        totalAmount: computed.grandTotal,
        paymentMethod: state.paymentMethod,
        paymentProofUrl: state.paymentProofUrl || null,
        paymentProofUploadedAt: state.paymentProofUrl ? serverTimestamp() : null,
        paymentExpiryAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),

        // Meta
        assignedTo: null,
        adminNotes: '',
        adminTags: []
      };

      // Save to Firestore
      await setDoc(doc(db, 'orders', orderId), orderData);

      // If payment proof uploaded, also create payment log
      if (state.paymentProofUrl) {
        await setDoc(doc(db, 'payments', orderId), {
          orderId,
          amount: computed.grandTotal,
          method: state.paymentMethod,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }

      // Redirect to success page
      router.push(`/order/step-4-payment/success?orderId=${orderId}`);
    } catch (err) {
      console.error('Submit order error:', err);
      setSubmitError(
        isEn
          ? 'Failed to submit order. Please try again.'
          : 'Gagal mengirim pesanan. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.push('/order/step-3-customer');
  };

  // Jangan render jika belum lengkap
  if (!state.serviceCategory || !state.packageId || !state.customerData?.fullName) {
    return null;
  }

  return (
    <div className="p-5 md:p-8">
      {/* STEP HEADER */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
          {isEn ? 'Step 4 of 4' : 'Langkah 4 dari 4'}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 font-serif dark:text-white md:text-3xl">
          {isEn ? 'Confirm & Pay' : 'Konfirmasi & Bayar'}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 md:text-base">
          {isEn
            ? 'Review your order, add extras, apply promo, and complete payment.'
            : 'Tinjau pesanan Anda, tambahkan extras, gunakan promo, dan selesaikan pembayaran.'}
        </p>
      </div>

      {/* ERROR BANNER */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-5 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <strong>{isEn ? 'Please fix these errors:' : 'Perbaiki kesalahan berikut:'}</strong>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUBMIT ERROR */}
      {submitError && (
        <div className="mb-5 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {submitError}
        </div>
      )}

      {/* ORDER SUMMARY QUICK VIEW */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-900/60">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {categoryMeta && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
              {isEn ? categoryMeta.labelEn : categoryMeta.label}
            </span>
          )}
          {state.packageSnapshot && (
            <span className="truncate text-gray-600 dark:text-gray-300">
              {isEn ? state.packageSnapshot.nameEn || state.packageSnapshot.name : state.packageSnapshot.name}
            </span>
          )}
          <span className="text-gray-400">|</span>
          <span className="font-bold text-gray-800 dark:text-gray-100">{formatIDR(computed.grandTotal)}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="space-y-8">
        {/* Add-ons */}
        <section>
          <AddonSelector />
        </section>

        {/* Promo Code */}
        <section>
          <PromoCodeInput />
        </section>

        {/* Price Breakdown */}
        <section>
          <PriceBreakdown />
        </section>

        {/* Payment Method */}
        <section>
          <PaymentMethodSelector />
        </section>

        {/* Payment Proof */}
        {state.paymentMethod && String(state.paymentMethod).startsWith('transfer_') && (
          <section>
            <PaymentProofUploader />
          </section>
        )}
      </div>

      {/* TRUST BADGES */}
      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-50/50 p-3 text-xs text-green-700 dark:bg-green-950/20 dark:text-green-300">
        <ShieldCheck className="h-4 w-4" />
        <span className="font-medium">
          {isEn
            ? 'Your data is encrypted and secure via Firebase.'
            : 'Data Anda terenkripsi dan aman melalui Firebase.'}
        </span>
      </div>

      {/* NAV BUTTONS */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
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
          onClick={handleSubmit}
          disabled={isSubmitting || !canProceed(4)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white transition-all shadow-lg ${
            canProceed(4) && !isSubmitting
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30'
              : 'cursor-not-allowed bg-gray-300 shadow-none dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isEn ? 'Place Order' : 'Buat Pesanan'}
        </button>
      </div>
    </div>
  );
}
