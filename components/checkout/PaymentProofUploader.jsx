'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebaseConfig';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { Upload, Image, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

/**
 * PaymentProofUploader = Upload bukti transfer ke Firebase Storage
 * - Drag & drop / click to upload
 * - Upload ke /payments/{orderId}/bukti-transfer.{ext}
 * - Save downloadURL ke state.paymentProofUrl
 * - Preview gambar setelah upload
 */
export default function PaymentProofUploader() {
  const { state, setPaymentProofUrl, generateNewOrderId } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(state.paymentProofUrl || null);
  const fileInputRef = useRef(null);

  const hasUpload = !!state.paymentProofUrl;

  const validateFile = (file) => {
    if (!file) return isEn ? 'No file selected.' : 'Tidak ada file dipilih.';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return isEn ? `File too large. Max ${MAX_SIZE_MB}MB.` : `File terlalu besar. Maks ${MAX_SIZE_MB}MB.`;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return isEn ? 'Invalid file type. Use JPG, PNG, or PDF.' : 'Format file tidak valid. Gunakan JPG, PNG, atau PDF.';
    }
    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Generate order ID for storage path
      const orderId = state.customerId || generateNewOrderId();
      const ext = file.name.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `payments/${orderId}/bukti-transfer.${ext}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (err) => {
          console.error('Upload error:', err);
          setError(isEn ? 'Upload failed. Please try again.' : 'Upload gagal. Silakan coba lagi.');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setPaymentProofUrl(downloadURL);
          setPreview(downloadURL);
          setUploading(false);
          setProgress(100);
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError(isEn ? 'Upload failed. Please try again.' : 'Upload gagal. Silakan coba lagi.');
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleRemove = () => {
    setPaymentProofUrl(null);
    setPreview(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isEn ? 'Proof of Payment' : 'Bukti Pembayaran'}
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {isEn
          ? 'Upload your transfer receipt/proof. Accepted: JPG, PNG, PDF (max 5MB).'
          : 'Upload bukti transfer Anda. Format: JPG, PNG, PDF (maks 5MB).'}
      </p>

      {hasUpload || preview ? (
        // Preview uploaded file
        <div className="relative overflow-hidden rounded-xl border-2 border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            {preview && !preview.includes('.pdf') ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Bukti" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-800">
                <Image className="h-8 w-8 text-green-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4" />
                {isEn ? 'Uploaded Successfully' : 'Berhasil Diunggah'}
              </div>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {isEn ? 'Bukti transfer Anda sudah tersimpan.' : 'Bukti transfer Anda sudah tersimpan.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? 'border-green-500 bg-green-50/80 dark:bg-green-950/30'
              : 'border-gray-300 bg-gray-50/50 hover:border-green-400 hover:bg-green-50/30 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-green-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {isEn ? 'Uploading...' : 'Mengunggah...'} {progress}%
              </div>
              {/* Progress bar */}
              <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {isEn ? 'Click or drag file here' : 'Klik atau seret file ke sini'}
              </p>
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                JPG, PNG, PDF {isEn ? 'up to' : 'maks.'} {MAX_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
