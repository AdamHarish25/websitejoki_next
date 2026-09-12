'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateSubtotal,
  calculateAddonsTotal,
  calculatePromoDiscount,
  calculateGrandTotal,
  getPackagePrice,
  validateStep,
  validatePromoCode as validatePromoUtil,
  generateOrderId
} from '@/lib/checkout-utils';

const CheckoutContext = createContext(null);

const STORAGE_KEY = 'websitejoki_checkout_state_v1';

const STEP_LABELS = {
  1: { id: 'service', title: 'Pilih Layanan', titleEn: 'Choose Service', desc: 'Pilih kategori & paket harga', descEn: 'Choose category & pricing package' },
  2: { id: 'requirements', title: 'Template / Kebutuhan', titleEn: 'Template / Requirements', desc: 'Pilih template atau isi scope kerja', descEn: 'Pick a template or fill project scope' },
  3: { id: 'customer', title: 'Data Diri', titleEn: 'Customer Data', desc: 'Isi data untuk aktivasi & invoice', descEn: 'Fill data for activation & invoice' },
  4: { id: 'payment', title: 'Konfirmasi & Bayar', titleEn: 'Confirm & Pay', desc: 'Ringkasan order & selesaikan pembayaran', descEn: 'Order summary & complete payment' }
};

const CATEGORY_META = {
  web:   { label: 'Web Design',         labelEn: 'Web Design',          orderType: 'template',       requiresTemplate: true },
  seo:   { label: 'SEO Services',       labelEn: 'SEO Services',        orderType: 'custom_scope',   requiresTemplate: false },
  ads:   { label: 'Google Ads',         labelEn: 'Google Ads',          orderType: 'custom_scope',   requiresTemplate: false },
  app:   { label: 'Aplikasi Mobile',    labelEn: 'Mobile App Dev',      orderType: 'custom_scope',   requiresTemplate: false },
  dash:  { label: 'Dashboard Custom',   labelEn: 'Custom Dashboard',    orderType: 'custom_scope',   requiresTemplate: false },
  brand: { label: 'Branding & HakMerk', labelEn: 'Branding & Trademark',orderType: 'custom_scope',   requiresTemplate: false }
};

function getInitialState() {
  return {
    version: 1,
    // --- STEP NAVIGATION ---
    currentStep: 1,
    completedSteps: [],

    // --- STEP 1: LAYANAN & PAKET ---
    serviceCategory: null,   // e.g. "web" / "seo"
    packageId: null,         // firestore docId of packages/
    packageSnapshot: null,   // full snapshot of package

    // --- STEP 2: TEMPLATE / CUSTOM SCOPE ---
    orderType: null,         // "template" | "custom_scope"
    templateId: null,
    templateSnapshot: null,
    scopeData: {             // diisi jika custom_scope (SEO/Ads/App/dash/brand)
      targetKeywords: [],
      targetLocation: '',
      numberOfCampaigns: 1,
      projectBrief: '',
      websiteUrl: '',
      extras: {}
    },

    // --- STEP 3: DATA CUSTOMER ---
    customerData: {
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      domainName: '',
      specialNotes: ''
    },
    customerId: null,        // firestore auth uid / uuid for guest

    // --- STEP 4: PEMBAYARAN ---
    selectedAddons: [],      // [{addonId, name, price, snapshot}]
    promoCode: '',           // kode promo yang diterapkan
    promoSnapshot: null,     // { code, discountType, discountValue, maxDiscount, ... }
    promoDiscountAmount: 0,  // dalam rupiah
    paymentMethod: null,     // "transfer_bca" | "transfer_bni" | ...
    paymentProofUrl: null,   // download URL dari Firebase Storage

    // --- META ---
    createdAt: null,
    expiresAt: null
  };
}

// ============================================================
// HELPER: Load / Save state ke localStorage (PERSIST)
// ============================================================
function loadPersistedState() {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) {
      localStorage.removeItem(STORAGE_KEY);
      return getInitialState();
    }
    return { ...getInitialState(), ...parsed };
  } catch (err) {
    console.warn('Failed to parse persisted checkout state:', err);
    return getInitialState();
  }
}

function saveStateToStorage(state) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = { ...state };
    // Jangan simpan sensitive (jika ada) atau terlalu besar
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Failed to persist checkout state:', err);
  }
}

// ============================================================
// PROVIDER COMPONENT
// ============================================================
export function CheckoutProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState(() => getInitialState());

  // --- LOAD DARI LOCALSTORAGE SETELAH HYDRATE (avoid hydration mismatch) ---
  useEffect(() => {
    setState(loadPersistedState());
    setHydrated(true);
  }, []);

  // --- PERSIST KE LOCALSTORAGE SETIAP STATE BERUBAH ---
  useEffect(() => {
    if (hydrated) {
      saveStateToStorage(state);
    }
  }, [state, hydrated]);

  // --- SET CATEGORY LANGKAH 1 ---
  const setServiceCategory = useCallback((category) => {
    setState(s => ({
      ...s,
      serviceCategory: category,
      packageId: null,
      packageSnapshot: null,
      orderType: CATEGORY_META[category]?.orderType || null,
      // reset downstream
      templateId: null,
      templateSnapshot: null,
      selectedAddons: s.selectedAddons.filter(a => {
        // Keep only addons applicable for new category
        if (!a.applicableCategories || a.applicableCategories.length === 0) return true;
        return a.applicableCategories.includes(category);
      }),
      promoCode: '',
      promoSnapshot: null,
      promoDiscountAmount: 0
    }));
  }, []);

  // --- SET PAKET LANGKAH 1 ---
  const setPackage = useCallback((packageDoc) => {
    setState(s => ({
      ...s,
      packageId: packageDoc?.id || null,
      packageSnapshot: packageDoc ? { id: packageDoc.id, ...packageDoc } : null
    }));
  }, []);

  // --- SET TEMPLATE (LANGKAH 2 - WEBSITE) ---
  const setTemplate = useCallback((templateDoc) => {
    setState(s => ({
      ...s,
      templateId: templateDoc?.id || null,
      templateSnapshot: templateDoc ? { id: templateDoc.id, ...templateDoc } : null
    }));
  }, []);

  // --- SET SCOPE DATA (LANGKAH 2 - CUSTOM) ---
  const setScopeData = useCallback((partialOrFull) => {
    setState(s => ({
      ...s,
      scopeData: {
        ...s.scopeData,
        ...(typeof partialOrFull === 'function' ? partialOrFull(s.scopeData) : partialOrFull)
      }
    }));
  }, []);

  // --- SET CUSTOMER DATA (LANGKAH 3) ---
  const setCustomerData = useCallback((partialOrFull) => {
    setState(s => ({
      ...s,
      customerData: {
        ...s.customerData,
        ...(typeof partialOrFull === 'function' ? partialOrFull(s.customerData) : partialOrFull)
      },
      customerId: s.customerId || uuidv4() // assign saat pertama kali data diisi (guest order ID)
    }));
  }, []);

  // --- ADDON TOGGLE (LANGKAH 4) ---
  const toggleAddon = useCallback((addonDoc) => {
    setState(s => {
      const exists = s.selectedAddons.find(a => a.addonId === addonDoc.id);
      if (exists) {
        return { ...s, selectedAddons: s.selectedAddons.filter(a => a.addonId !== addonDoc.id) };
      }
      return {
        ...s,
        selectedAddons: [
          ...s.selectedAddons,
          {
            addonId: addonDoc.id,
            name: addonDoc.name,
            nameEn: addonDoc.nameEn || addonDoc.name,
            price: addonDoc.price,
            applicableCategories: addonDoc.applicableCategories || [],
            snapshot: { id: addonDoc.id, ...addonDoc }
          }
        ]
      };
    });
  }, []);

  // --- APPLY PROMO CODE (LANGKAH 4) ---
  const applyPromoCode = useCallback(async (code, allPromos) => {
    const subtotal = calculateSubtotal(state);
    const result = await validatePromoUtil(code, allPromos, subtotal, state.serviceCategory);
    if (result.valid) {
      const discountAmount = calculatePromoDiscount(
        subtotal,
        result.promo.discountType,
        result.promo.discountValue,
        result.promo.maxDiscount
      );
      setState(s => ({
        ...s,
        promoCode: code,
        promoSnapshot: { code, ...result.promo },
        promoDiscountAmount: discountAmount
      }));
      return { valid: true, discountAmount, message: result.message };
    }
    // Jika tidak valid → hapus promo
    setState(s => ({ ...s, promoCode: '', promoSnapshot: null, promoDiscountAmount: 0 }));
    return { valid: false, message: result.message };
  }, [state]);

  const clearPromo = useCallback(() => {
    setState(s => ({ ...s, promoCode: '', promoSnapshot: null, promoDiscountAmount: 0 }));
  }, []);

  // --- SET PAYMENT METHOD ---
  const setPaymentMethod = useCallback((method) => {
    setState(s => ({ ...s, paymentMethod: method }));
  }, []);

  const setPaymentProofUrl = useCallback((url) => {
    setState(s => ({ ...s, paymentProofUrl: url }));
  }, []);

  // --- PRICE CALCULATIONS (MEMOIZED REALTIME) ---
  const computed = useMemo(() => {
    const packagePrice = getPackagePrice(state.packageSnapshot);
    const addonsTotal = calculateAddonsTotal(state.selectedAddons);
    const subtotal = packagePrice + addonsTotal;
    const promoAmt = state.promoDiscountAmount || 0;
    const grandTotal = subtotal - promoAmt;
    return {
      packagePrice,
      addonsTotal,
      subtotal,
      promoDiscount: promoAmt,
      grandTotal
    };
  }, [state.packageSnapshot, state.selectedAddons, state.promoDiscountAmount]);

  // --- VALIDASI PER STEP ---
  const getValidationErrors = useCallback((step) => {
    return validateStep(step, state);
  }, [state]);

  const canProceed = useCallback((step) => {
    const errors = validateStep(step, state);
    return Object.keys(errors).length === 0;
  }, [state]);

  // --- STEP NAVIGATION ---
  const goToStep = useCallback((step) => {
    const stepInt = Number(step);
    if (stepInt < 1 || stepInt > 4) return;

    // Step valid: hanya bisa pergi ke step 1, atau step yang sudah completed, atau next step
    const maxReachable = Math.max(1, Math.max(...(state.completedSteps.length ? state.completedSteps : [1]), state.currentStep));
    if (stepInt > maxReachable + 1) {
      // Not allowed (skip steps). Bisa di-log.
      return;
    }
    setState(s => ({ ...s, currentStep: stepInt }));
  }, [state.currentStep, state.completedSteps]);

  const nextStep = useCallback(() => {
    const errors = validateStep(state.currentStep, state);
    if (Object.keys(errors).length > 0) return { success: false, errors };

    const next = state.currentStep + 1;
    setState(s => ({
      ...s,
      completedSteps: Array.from(new Set([...(s.completedSteps || []), s.currentStep])),
      currentStep: Math.min(next, 4)
    }));
    // Scroll ke atas saat pindah step
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return { success: true };
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const prev = state.currentStep - 1;
    if (prev < 1) return;
    setState(s => ({ ...s, currentStep: prev }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.currentStep]);

  // --- COMPUTED META ---
  const categoryMeta = state.serviceCategory ? CATEGORY_META[state.serviceCategory] || null : null;
  const stepMeta = STEP_LABELS[state.currentStep];

  // --- RESET / ABANDON ORDER ---
  const resetCheckout = useCallback(() => {
    const initial = getInitialState();
    setState(initial);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const generateNewOrderId = useCallback(() => generateOrderId(), []);

  const value = {
    state,
    computed,
    stepMeta,
    categoryMeta,
    STEP_LABELS,
    CATEGORY_META,
    // Actions
    setServiceCategory,
    setPackage,
    setTemplate,
    setScopeData,
    setCustomerData,
    toggleAddon,
    applyPromoCode,
    clearPromo,
    setPaymentMethod,
    setPaymentProofUrl,
    goToStep,
    nextStep,
    prevStep,
    getValidationErrors,
    canProceed,
    resetCheckout,
    generateNewOrderId,
    STORAGE_KEY
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error('useCheckout() hook harus dipakai di dalam <CheckoutProvider />. Pastikan CheckoutProvider membungkus komponen ini (lihat app/(public)/order/layout.js).');
  }
  return ctx;
}
