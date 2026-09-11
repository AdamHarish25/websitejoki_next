'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useLanguage } from '@/context/LanguageContext';
import { formatIDR } from '@/lib/checkout-utils';
import { useCheckout } from '@/context/CheckoutContext';
import {
  CheckCircle2,
  Copy,
  Home,
  MessageCircle,
  Clock,
  CreditCard,
  FileText
} from 'lucide-react';

/**
 * SUCCESS PAGE: Order Berhasil Dibuat
 * - Tampilkan Order ID, Total Bayar, Status
 * - Detail rekening (jika transfer manual)
 * - Tombol Copy Order ID
 * - Tombol Kembali ke Beranda
 * - Tombol Chat WhatsApp
 */
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { resetCheckout } = useCheckout();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    // Reset checkout state setelah order berhasil
    resetCheckout();

    async function fetchOrder() {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, resetCheckout]);

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = orderId || '';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Payment method labels
  const paymentLabels = {
    transfer_bca: 'Transfer BCA',
    transfer_bni: 'Transfer BNI',
    transfer_mandiri: 'Transfer Mandiri'
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn ? 'Loading order details...' : 'Memuat detail pesanan...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8">
      {/* SUCCESS ICON */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl shadow-green-500/30">
          <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 font-serif dark:text-white md:text-3xl">
          {isEn ? 'Order Placed Successfully!' : 'Pesanan Berhasil Dibuat!'}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 md:text-base">
          {isEn
            ? 'Thank you for your order. We will contact you via WhatsApp within 1x24 hours.'
            : 'Terima kasih atas pesanan Anda. Kami akan menghubungi Anda via WhatsApp dalam 1x24 jam.'}
        </p>
      </div>

      {/* ORDER CARD */}
      <div className="mx-auto max-w-lg space-y-4">
        {/* Order ID */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {isEn ? 'Order ID' : 'ID Pesanan'}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xl font-black tracking-wider text-gray-900 dark:text-white">
              {orderId}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700 dark:hover:text-green-400"
              title={isEn ? 'Copy Order ID' : 'Salin ID Pesanan'}
            >
              {copied
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : <Copy className="h-4 w-4" />
              }
            </button>
          </div>
          {copied && (
            <p className="mt-1 text-[11px] text-green-600 dark:text-green-400">
              {isEn ? 'Copied!' : 'Tersalin!'}
            </p>
          )}
        </div>

        {/* Status & Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Clock className="mx-auto mb-1 h-5 w-5 text-amber-500" />
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {isEn ? 'Status' : 'Status'}
            </div>
            <div className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
              {isEn ? 'Awaiting Payment' : 'Menunggu Pembayaran'}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CreditCard className="mx-auto mb-1 h-5 w-5 text-green-500" />
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {isEn ? 'Total' : 'Total'}
            </div>
            <div className="mt-1 text-sm font-black text-gray-900 dark:text-white">
              {order ? formatIDR(order.totalAmount) : '-'}
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {order?.paymentMethod && String(order.paymentMethod).startsWith('transfer_') && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
              <FileText className="h-4 w-4" />
              {isEn ? 'Payment Instructions' : 'Instruksi Pembayaran'}
            </div>
            <div className="space-y-2 text-xs text-amber-800 dark:text-amber-300">
              <p>
                {isEn ? 'Please transfer to:' : 'Silakan transfer ke:'}{' '}
                <span className="font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </p>
              <p>
                {isEn ? 'Amount:' : 'Jumlah:'}{' '}
                <span className="font-black">{formatIDR(order.totalAmount)}</span>
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                {isEn
                  ? 'After transferring, please upload your proof of payment or send it via WhatsApp.'
                  : 'Setelah transfer, silakan upload bukti pembayaran atau kirim via WhatsApp.'}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-green-600/20 transition-all hover:from-green-700 hover:to-emerald-600 hover:shadow-xl"
          >
            <Home className="h-4 w-4" />
            {isEn ? 'Back to Homepage' : 'Kembali ke Beranda'}
          </Link>
          <a
            href={`https://wa.me/6285179808325?text=${encodeURIComponent(`Halo, saya sudah melakukan order dengan ID: ${orderId}. Mohon konfirmasi.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-white px-6 py-3.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-300 dark:hover:bg-green-950/30"
          >
            <MessageCircle className="h-4 w-4" />
            {isEn ? 'Chat via WhatsApp' : 'Chat via WhatsApp'}
          </a>
        </div>

        {/* Note */}
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
          {isEn
            ? 'Save your Order ID for reference. We will contact you shortly.'
            : 'Simpan ID Pesanan Anda sebagai referensi. Kami akan segera menghubungi Anda.'}
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
