'use client';

import Link from 'next/link';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Circle, Clock, ArrowLeft, Package } from 'lucide-react';

/**
 * Komponen CheckoutProgress = Sidebar / Top Stepper
 * - Menampilkan 4 langkah checkout
 * - Step aktif = highlight warna hijau
 * - Step completed = ceklis hijau
 * - Step disabled = abu (tidak bisa diklik kecuali kalau sudah completed)
 * - Mobile: horizontal stepper, Desktop: vertical sidebar
 */
export default function CheckoutProgress() {
  const { state, goToStep, STEP_LABELS } = useCheckout();
  const { language, t: _t } = useLanguage();
  const isEn = language === 'en';
  const current = state.currentStep;
  const completed = state.completedSteps || [];

  const steps = Object.entries(STEP_LABELS).map(([num, meta]) => ({
    num: Number(num),
    title: isEn ? meta.titleEn : meta.title,
    desc: isEn ? meta.descEn : meta.desc,
    isActive: Number(num) === current,
    isCompleted: completed.includes(Number(num)),
    isPast: Number(num) < current
  }));

  const maxReachable = Math.max(1, current, (completed.length ? Math.max(...completed) : 0));

  return (
    <aside
      aria-label="Checkout Progress"
      className="w-full lg:h-full"
    >
      {/* Back to Home (mobile + desktop) */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isEn ? 'Back to Home' : 'Kembali ke Beranda'}
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
          <Package className="w-3 h-3 text-green-600 dark:text-green-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            {isEn ? 'Checkout' : 'Pemesanan'}
          </span>
        </div>
      </div>

      {/* Header Text */}
      <div className="mb-6 hidden lg:block">
        <h2 className="text-lg font-extrabold text-gray-900 font-serif dark:text-white">
          {isEn ? 'Order Steps' : 'Langkah Pemesanan'}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {isEn
            ? 'Complete the 4 easy steps below. Your progress is auto-saved!'
            : 'Lengkapi 4 langkah mudah di bawah ini. Progressmu tersimpan otomatis!'}
        </p>
      </div>

      {/* STEPS - VERTICAL (DESKTOP) */}
      <ol className="relative hidden lg:flex lg:flex-col lg:gap-5 before:absolute before:left-[19px] before:top-[10px] before:bottom-[10px] before:w-[2px] before:bg-gray-200 before:content-[''] dark:before:bg-gray-700">
        {steps.map((step) => {
          const status = step.isActive ? 'active' : step.isCompleted ? 'done' : 'pending';
          const canClick = step.num <= maxReachable;
          return (
            <li key={step.num} className="relative z-10">
              <button
                type="button"
                onClick={() => canClick && goToStep(step.num)}
                disabled={!canClick}
                className={`group flex w-full items-start gap-3 text-left ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                {/* Circle Indicator */}
                <span
                  className={`relative z-20 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    status === 'active'
                      ? 'border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/30 ring-4 ring-green-100 dark:ring-green-900/40'
                      : status === 'done'
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-black">{String(step.num).padStart(2, '0')}</span>
                  )}
                </span>

                {/* Step Text */}
                <div className="min-w-0 flex-1 pt-1">
                  <div
                    className={`truncate text-sm font-bold ${
                      status === 'active'
                        ? 'text-green-700 dark:text-green-400'
                        : status === 'done'
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className={`mt-0.5 truncate text-xs ${status === 'active' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {step.desc}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* STEPS - HORIZONTAL (MOBILE) */}
      <ol className="relative flex w-full justify-between gap-1 lg:hidden">
        {steps.map((step, i) => {
          const status = step.isActive ? 'active' : step.isCompleted ? 'done' : 'pending';
          const canClick = step.num <= maxReachable;
          return (
            <li key={step.num} className="relative z-10 flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => canClick && goToStep(step.num)}
                disabled={!canClick}
                className={`flex flex-col items-center ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                    status === 'active'
                      ? 'border-green-600 bg-green-600 text-white shadow-md ring-2 ring-green-200 dark:ring-green-900/30'
                      : status === 'done'
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-black">{String(step.num).padStart(2, '0')}</span>
                  )}
                </span>
                <span className="mt-1.5 text-[9px] font-bold leading-tight text-center text-gray-600 dark:text-gray-400 line-clamp-2 max-w-[72px]">
                  {step.title.split(' ')[0]}
                </span>
              </button>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded ${
                    step.isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Estimasi waktu (desktop only) */}
      <div className="mt-8 hidden rounded-xl border border-amber-200 bg-amber-50/70 p-4 lg:block dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {isEn ? 'Est. Completion Time' : 'Estimasi Waktu'}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-amber-800 dark:text-amber-300">
              {isEn
                ? 'This checkout takes ~3 minutes. We will contact you via WhatsApp within 1x24 hours after payment is verified.'
                : 'Checkout ini memakan waktu ~3 menit. Kami akan menghubungimu via WhatsApp dalam 1x24 jam setelah pembayaran diverifikasi.'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
