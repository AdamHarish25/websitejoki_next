'use client';

import { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { CreditCard, Copy, CheckCircle2 } from 'lucide-react';

/**
 * PaymentMethodSelector = Pilihan metode pembayaran
 * FASE 1: Manual Transfer (BCA, BNI, Mandiri)
 * - Klik method → show detail rekening (Nama Bank, No. Rek, Atas Nama)
 * - Copy rekening button
 */

const PAYMENT_METHODS = [
  {
    id: 'transfer_gopay',
    bank: 'GOPAY',
    accountNumber: '085179808325',
    accountName: 'Adam Haris Abdur',
    logo: '🏦',
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'transfer_jago',
    bank: 'JAGO',
    accountNumber: '0987654321',
    accountName: 'Adam Haris Abdur',
    logo: '🏦',
    color: 'from-orange-500 to-orange-700'
  }
];

export default function PaymentMethodSelector() {
  const { state, setPaymentMethod } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isEn ? 'Payment Method' : 'Metode Pembayaran'}
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {isEn
          ? 'Transfer manually to one of the accounts below. After transferring, upload your proof of payment.'
          : 'Transfer manual ke salah satu rekening di bawah. Setelah transfer, upload bukti pembayaran Anda.'}
      </p>

      <div className="space-y-2">
        {PAYMENT_METHODS.map(method => {
          const isSelected = state.paymentMethod === method.id;
          return (
            <div key={method.id}>
              {/* Method Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50/60 ring-2 ring-green-100 dark:border-green-500 dark:bg-green-950/20 dark:ring-green-900/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                }`}
              >
                {/* Radio indicator */}
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Bank icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md text-sm font-black ${method.color}`}>
                  {method.bank.slice(0, 2)}
                </div>

                {/* Bank info */}
                <div className="flex-1">
                  <div className={`text-sm font-bold ${isSelected ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                    {isEn ? 'Transfer' : 'Transfer'} {method.bank}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {method.accountName}
                  </div>
                </div>
              </button>

              {/* Expanded Account Details */}
              {isSelected && (
                <div className="mt-2 rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
                    {isEn ? 'Transfer to this account' : 'Transfer ke rekening ini'}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Bank' : 'Bank'}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{method.bank}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Account Number' : 'Nomor Rekening'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-wider text-gray-800 dark:text-gray-100">{method.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(method.accountNumber, method.id)}
                          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700 dark:hover:text-green-400"
                          title={isEn ? 'Copy' : 'Salin'}
                        >
                          {copiedId === method.id
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            : <Copy className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Account Name' : 'Atas Nama'}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{method.accountName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
