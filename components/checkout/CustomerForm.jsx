'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { isValidEmail, isValidPhoneID, normalizePhoneID } from '@/lib/checkout-utils';
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle
} from 'lucide-react';

const INPUT_BASE = 'w-full rounded-lg border px-4 py-3 pr-10 text-sm transition-colors focus:outline-none focus:ring-2';
const INPUT_LIGHT = 'border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-green-500/20';
const INPUT_DARK = 'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:text-black dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20';

const INPUT_ERR = 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-500/20';
const INPUT_OK = 'border-green-400 focus:border-green-500 focus:ring-green-500/20 dark:border-green-600 dark:focus:border-green-500 dark:focus:ring-green-500/20';
const INPUT_IDLE = 'border-gray-200 focus:border-green-500 focus:ring-green-500/20 dark:border-gray-600 dark:focus:border-green-500 dark:focus:ring-green-500/20';

const TEXTAREA_BASE = 'w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2';

function getInputClass(status) {
  const border = status === 'error' ? INPUT_ERR : status === 'valid' ? INPUT_OK : INPUT_IDLE;
  return `${INPUT_BASE} ${INPUT_LIGHT} ${INPUT_DARK} ${border}`;
}

function getTextareaClass() {
  return `${TEXTAREA_BASE} ${INPUT_LIGHT} ${INPUT_DARK} border-gray-200 focus:border-green-500 focus:ring-green-500/20 dark:border-gray-600 dark:focus:border-green-500 dark:focus:ring-green-500/20`;
}

async function checkDomainAvailability(domain) {
  const clean = String(domain || '').trim().toLowerCase();
  if (!clean || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(clean)) {
    return { available: null, checked: false };
  }
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(clean)}&type=A`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const hasAnswers = data?.Status === 0 && data?.Answer?.length > 0;
    return { available: !hasAnswers, checked: true };
  } catch {
    return { available: null, checked: false };
  }
}

const COMMON_TLD = ['.com', '.co.id', '.id', '.net', '.org', '.io'];

export default function CustomerForm() {
  const { state, setCustomerData } = useCheckout();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const data = state.customerData || {};

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [domainStatus, setDomainStatus] = useState({ available: null, checked: false, checking: false });
  const domainTimerRef = useRef(null);

  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'fullName':
        if (!String(value || '').trim()) return isEn ? 'Full name is required.' : 'Nama lengkap harus diisi.';
        if (String(value).trim().length < 2) return isEn ? 'Name is too short.' : 'Nama terlalu pendek.';
        return '';
      case 'email':
        if (!String(value || '').trim()) return isEn ? 'Email is required.' : 'Email harus diisi.';
        if (!isValidEmail(value)) return isEn ? 'Invalid email format.' : 'Format email tidak valid.';
        return '';
      case 'phone':
        if (!String(value || '').trim()) return isEn ? 'WhatsApp number is required.' : 'Nomor WhatsApp harus diisi.';
        if (!isValidPhoneID(value)) return isEn ? 'Invalid Indonesian phone number.' : 'Format nomor HP Indonesia tidak valid.';
        return '';
      default:
        return '';
    }
  }, [isEn]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    ['fullName', 'email', 'phone'].forEach(f => {
      const err = validateField(f, data[f]);
      if (err) newErrors[f] = err;
    });
    return newErrors;
  }, [data, validateField]);

  useEffect(() => {
    setErrors(validateAll());
  }, [data, validateAll]);

  const handleChange = useCallback((field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  }, [setCustomerData]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handlePhoneBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
    const normalized = normalizePhoneID(data.phone);
    if (normalized && normalized !== data.phone) {
      handleChange('phone', normalized);
    }
  }, [data.phone, handleChange]);

  const handleDomainChange = useCallback((raw) => {
    handleChange('domainName', raw);
    setDomainStatus({ available: null, checked: false, checking: false });
    if (domainTimerRef.current) clearTimeout(domainTimerRef.current);
    const clean = raw.trim().toLowerCase();
    if (!clean || clean.length < 3) return;
    let domainToCheck = clean.includes('.') ? clean : clean + '.com';
    domainTimerRef.current = setTimeout(async () => {
      setDomainStatus(prev => ({ ...prev, checking: true }));
      const result = await checkDomainAvailability(domainToCheck);
      setDomainStatus({ ...result, checking: false });
    }, 800);
  }, [handleChange]);

  const handleDomainBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, domainName: true }));
    const clean = (data.domainName || '').trim().toLowerCase();
    if (!clean) return;
    if (!clean.includes('.')) {
      const withTld = clean + '.com';
      handleChange('domainName', withTld);
      if (domainTimerRef.current) clearTimeout(domainTimerRef.current);
      setDomainStatus(prev => ({ ...prev, checking: true }));
      checkDomainAvailability(withTld).then(result => {
        setDomainStatus({ ...result, checking: false });
      });
    }
  }, [data.domainName, handleChange]);

  useEffect(() => {
    return () => { if (domainTimerRef.current) clearTimeout(domainTimerRef.current); };
  }, []);

  const basicFields = [
    { key: 'fullName', label: isEn ? 'Full Name' : 'Nama Lengkap', placeholder: isEn ? 'e.g. Budi Santoso' : 'contoh: Budi Santoso', icon: <User className="h-4 w-4" />, required: true, type: 'text' },
    { key: 'email', label: isEn ? 'Email Address' : 'Alamat Email', placeholder: isEn ? 'e.g. budi@email.com' : 'contoh: budi@email.com', icon: <Mail className="h-4 w-4" />, required: true, type: 'email' },
    { key: 'phone', label: isEn ? 'WhatsApp Number' : 'Nomor WhatsApp', placeholder: isEn ? 'e.g. 081234567890' : 'contoh: 081234567890', icon: <Phone className="h-4 w-4" />, required: true, type: 'tel', note: isEn ? 'We will contact you via WhatsApp.' : 'Kami akan menghubungi Anda via WhatsApp.' },
    { key: 'companyName', label: isEn ? 'Company Name' : 'Nama Perusahaan', placeholder: isEn ? 'e.g. PT Maju Jaya (optional)' : 'contoh: PT Maju Jaya (opsional)', icon: <Building2 className="h-4 w-4" />, required: false, type: 'text' }
  ];

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 p-4 dark:from-gray-800 dark:to-green-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {isEn ? 'Customer Information' : 'Informasi Pelanggan'}
            </div>
            <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">
              {isEn ? 'Fill in your details for activation & invoice.' : 'Isi data Anda untuk aktivasi & invoice.'}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Fields */}
      {basicFields.map(f => {
        const errorMsg = touched[f.key] ? errors[f.key] : '';
        const hasError = !!errorMsg;
        const isValid = touched[f.key] && !errorMsg && String(data[f.key] || '').trim();
        const status = hasError ? 'error' : isValid ? 'valid' : 'idle';

        return (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
              <span className="mr-1.5 inline-flex align-middle text-gray-400 dark:text-gray-500">{f.icon}</span>
              {f.label}
              {f.required && <span className="ml-0.5 text-red-500">*</span>}
            </label>

            <div className="relative">
              <input
                type={f.type}
                value={data[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                onBlur={() => f.key === 'phone' ? handlePhoneBlur() : handleBlur(f.key)}
                placeholder={f.placeholder}
                className={getInputClass(status)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                {isValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </div>

            {f.note && <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{f.note}</p>}
            {hasError && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>
        );
      })}

      {/* DOMAIN NAME CHECKER */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
          <span className="mr-1.5 inline-flex align-middle text-gray-400 dark:text-gray-500"><Globe className="h-4 w-4" /></span>
          {isEn ? 'Desired Domain Name' : 'Domain yang Diinginkan'}
          <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">({isEn ? 'optional' : 'opsional'})</span>
        </label>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {isEn ? 'Want a new domain? Check availability here.' : 'Mau domain baru? Cek ketersediaan di sini.'}
        </p>

        <div className="relative group">
          <input
            type="text"
            value={data.domainName || ''}
            onChange={(e) => handleDomainChange(e.target.value)}
            onBlur={handleDomainBlur}
            placeholder={isEn ? 'e.g. mybusiness.com' : 'contoh: mybusiness.com'}
            className={`w-full dark:focus:text-black rounded-lg border px-4 py-3 pr-24 text-sm transition-colors focus:outline-none focus:ring-2 ${
              domainStatus.checked && domainStatus.available === true
                ? 'border-green-400 bg-gray-50 text-gray-800 focus:bg-white focus:border-green-500 focus:ring-green-500/20 dark:border-green-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-500/20'
                : domainStatus.checked && domainStatus.available === false
                ? 'border-red-400 bg-gray-50 text-gray-800 focus:bg-white focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-red-500 dark:focus:ring-red-500/20'
                : 'border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500/20'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {domainStatus.checking && <Loader2 className="h-4 w-4 animate-spin text-green-500" />}
            {!domainStatus.checking && domainStatus.checked && domainStatus.available === true && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 group-hover:bg-black dark:bg-green-900/80 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3" /> {isEn ? 'Available' : 'Tersedia'}
              </span>
            )}
            {!domainStatus.checking && domainStatus.checked && domainStatus.available === false && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <XCircle className="h-3 w-3" /> {isEn ? 'Taken' : 'Dipakai'}
              </span>
            )}
          </div>
        </div>

        {domainStatus.checked && !domainStatus.checking && (
          <div className={`mt-2 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
            domainStatus.available === true
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
          }`}>
            {domainStatus.available === true
              ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            }
            <span className="min-w-0 break-words">
              {domainStatus.available === true
                ? (isEn ? 'This domain appears available! We will help register it during processing.' : 'Domain ini sepertinya tersedia! Kami akan bantu daftarkan saat proses.')
                : (isEn ? 'Already registered. Try a different name or extension.' : 'Sudah terdaftar. Coba nama atau ekstensi lain.')}
            </span>
          </div>
        )}

        {data.domainName && !data.domainName.includes('.') && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{isEn ? 'Try:' : 'Coba:'}</span>
            {COMMON_TLD.map(tld => (
              <button
                key={tld}
                type="button"
                onClick={() => {
                  const base = data.domainName.split('.')[0];
                  const full = base + tld;
                  handleChange('domainName', full);
                  handleDomainChange(full);
                }}
                className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 transition-colors hover:border-green-300 hover:text-green-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-green-600 dark:hover:text-green-400"
              >
                {data.domainName.split('.')[0]}{tld}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Special Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-800 dark:text-gray-100">
          <span className="mr-1.5 inline-flex align-middle text-gray-400 dark:text-gray-500"><MessageSquare className="h-4 w-4" /></span>
          {isEn ? 'Special Notes' : 'Catatan Khusus'}
          <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">({isEn ? 'optional' : 'opsional'})</span>
        </label>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {isEn ? 'Specific requests, color preferences, deadlines, etc.' : 'Permintaan khusus, preferensi warna, deadline, dll.'}
        </p>
        <textarea
          value={data.specialNotes || ''}
          onChange={(e) => { if (e.target.value.length <= 500) handleChange('specialNotes', e.target.value); }}
          onBlur={() => handleBlur('specialNotes')}
          rows={3}
          placeholder={isEn ? 'Any special requests? Write them here...' : 'Ada permintaan khusus? Tulis di sini...'}
          className={getTextareaClass()}
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{isEn ? 'Max 500 characters' : 'Maks 500 karakter'}</p>
          <span className={`text-[10px] font-medium ${(data.specialNotes || '').length > 450 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {(data.specialNotes || '').length}/500
          </span>
        </div>
      </div>
    </div>
  );
}
