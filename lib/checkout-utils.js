// ============================================================
// CHECKOUT UTILITY FUNCTIONS
// ============================================================
// Pure functions yang reusable di mana saja (client component, API route, bahkan script seed jika perlu)
// Tidak ada side effect. Input => Output deterministik.
// ============================================================

/**
 * Generate Order ID format: ORDER-YYYYMMDD-XXXX
 * @param {Date} date
 * @returns {string}
 */
export function generateOrderId(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ORDER-${y}${m}${d}-${rand}`;
}

// ============================================================
// FORMATTERS
// ============================================================

/**
 * Format Rupiah
 * @param {number} amount
 * @returns {string} "Rp 1.500.000"
 */
export function formatIDR(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'Rp 0';
  const num = Math.max(0, Math.round(Number(amount)));
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format nomor HP jadi format 628xxxx
 * @param {string} phone
 * @returns {string}
 */
export function normalizePhoneID(phone) {
  if (!phone) return '';
  let cleaned = String(phone).trim().replace(/[\s\-_.()+]/g, '');
  if (cleaned.startsWith('08')) cleaned = '628' + cleaned.slice(2);
  if (cleaned.startsWith('+62')) cleaned = '62' + cleaned.slice(3);
  if (cleaned.startsWith('8')) cleaned = '628' + cleaned.slice(1);
  if (!/^62\d{9,15}$/.test(cleaned)) return ''; // invalid
  return cleaned;
}

/**
 * Validasi format email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false;
  // Standar RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

/**
 * Validasi nomor HP Indonesia
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhoneID(phone) {
  const normalized = normalizePhoneID(phone);
  return !!normalized;
}

// ============================================================
// PRICE CALCULATIONS
// ============================================================

/**
 * Get numeric package price
 * @param {object} packageSnapshot
 * @returns {number}
 */
export function getPackagePrice(packageSnapshot) {
  if (!packageSnapshot?.price) return 0;
  // Support untuk harga yang disimpan sebagai string dengan format Rp.1.500.000 (karena di admin manage-packages ada field text)
  const raw = packageSnapshot.price;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    // Bersihkan semua non-digit
    const cleaned = raw.replace(/[^\d]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }
  return 0;
}

/**
 * Hitung total HARIAN harga addons yang dipilih
 * @param {Array} selectedAddons [{price: number}, ...]
 * @returns {number}
 */
export function calculateAddonsTotal(selectedAddons = []) {
  return selectedAddons.reduce((sum, a) => sum + (Number(a?.price) || 0), 0);
}

/**
 * Hitung subtotal (paket + addons) sebelum promo
 * @param {object} state - checkout state dari CheckoutContext
 * @returns {number}
 */
export function calculateSubtotal(state) {
  if (!state) return 0;
  const pkgPrice = getPackagePrice(state.packageSnapshot);
  const addons = calculateAddonsTotal(state.selectedAddons || []);
  return pkgPrice + addons;
}

/**
 * Hitung potongan promo dalam rupiah
 * @param {number} subtotal
 * @param {"fixed"|"percentage"} discountType
 * @param {number} discountValue (Rp untuk fixed, % (1-100) untuk percentage)
 * @param {number} [maxDiscount] (opsional - maks potongan untuk percentage)
 * @returns {number}
 */
export function calculatePromoDiscount(subtotal, discountType, discountValue, maxDiscount = null) {
  if (!subtotal || subtotal <= 0 || !discountValue) return 0;
  let discount = 0;
  if (discountType === 'fixed') {
    discount = Number(discountValue) || 0;
  } else if (discountType === 'percentage') {
    const pct = Math.max(0, Math.min(100, Number(discountValue) || 0));
    discount = Math.round(subtotal * (pct / 100));
    if (maxDiscount && Number(maxDiscount) > 0 && discount > Number(maxDiscount)) {
      discount = Number(maxDiscount);
    }
  }
  // Promo tidak boleh membuat total jadi negatif
  return Math.min(discount, subtotal);
}

/**
 * Hitung TOTAL AKHIR (grand total = subtotal - promo)
 * @param {object} state
 * @returns {number}
 */
export function calculateGrandTotal(state) {
  if (!state) return 0;
  const subtotal = calculateSubtotal(state);
  const promo = state?.promoDiscountAmount || 0;
  return Math.max(0, subtotal - promo);
}

// ============================================================
// PROMO CODE VALIDATION
// ============================================================

/**
 * Validasi kode promo
 * @param {string} codeInput - kode promo yang diinput user
 * @param {Array|object} allPromos - collection promo codes (array dari Firestore)
 * @param {number} subtotal - subtotal order
 * @param {string} [serviceCategory] - kategori layanan order
 * @returns {{valid:boolean, promo?:object, message:string}}
 */
export async function validatePromoCode(codeInput, allPromos, subtotal, serviceCategory = null) {
  const code = String(codeInput || '').trim().toUpperCase();
  if (!code) return { valid: false, message: 'Kode promo belum diisi.' };

  // Cari promo. Support: Array of docs (dengan field code) ATAU array of {id: "JOKI100", ...} (id = code)
  const promo = Array.isArray(allPromos)
    ? allPromos.find(p => {
        const pCode = String(p?.code || p?.id || '').toUpperCase();
        return pCode === code;
      })
    : null;

  if (!promo) {
    return { valid: false, message: 'Kode promo tidak ditemukan. Periksa kembali ejaan Anda.' };
  }

  // 1. Cek isActive
  if (promo.isActive === false) {
    return { valid: false, message: 'Kode promo ini sudah tidak aktif.' };
  }

  // 2. Cek quota / maxUsage
  const used = Number(promo.usedCount) || 0;
  const max = Number(promo.maxUsage) || 0;
  if (max > 0 && used >= max) {
    return { valid: false, message: 'Kode promo ini sudah mencapai batas pemakaian maksimal.' };
  }

  // 3. Cek tanggal valid (jika ada)
  const now = new Date();
  const validFrom = _toDate(promo.validFrom);
  const validUntil = _toDate(promo.validUntil);
  if (validFrom && now < validFrom) {
    return { valid: false, message: `Kode promo ini baru bisa digunakan mulai tanggal: ${_fmt(validFrom)}.` };
  }
  if (validUntil && now > validUntil) {
    return { valid: false, message: 'Kode promo ini sudah KADALUARSA (berlaku sampai ' + _fmt(validUntil) + ').' };
  }

  // 4. Cek minimum order
  const minOrder = Number(promo.minimumOrder) || 0;
  if (minOrder > 0 && Number(subtotal) < minOrder) {
    return {
      valid: false,
      message: `Minimum order untuk promo ini adalah ${formatIDR(minOrder)}. Total order Anda saat ini: ${formatIDR(subtotal)}.`
    };
  }

  // 5. Cek applicable categories (jika kosong = semua kategori)
  const cats = promo.applicableCategories;
  if (serviceCategory && Array.isArray(cats) && cats.length > 0) {
    if (!cats.includes(serviceCategory)) {
      return { valid: false, message: `Kode promo ini hanya berlaku untuk kategori layanan: ${cats.join(', ').toUpperCase()}.` };
    }
  }

  // 6. Hitung potongan untuk preview message
  const previewAmt = calculatePromoDiscount(
    Number(subtotal) || 0,
    promo.discountType,
    promo.discountValue,
    promo.maxDiscount
  );

  const typeLabel =
    promo.discountType === 'percentage'
      ? `${promo.discountValue}% OFF${promo.maxDiscount ? ` (maks. ${formatIDR(promo.maxDiscount)})` : ''}`
      : `Potongan ${formatIDR(promo.discountValue)}`;

  return {
    valid: true,
    promo,
    discountPreview: previewAmt,
    message: `Promo BERLAKU! ${typeLabel}. Anda hemat ${formatIDR(previewAmt)}.`
  };
}

// ============================================================
// VALIDASI PER STEP (untuk cek apakah user boleh NEXT)
// ============================================================

/**
 * Validasi checkout per step
 * @param {number} step (1-4)
 * @param {object} state checkout state
 * @returns {object} errors - empty object = valid. {field: "pesan error"} = invalid
 */
export function validateStep(step, state) {
  const errors = {};
  const s = state || {};

  if (step === 1) {
    // ----------- STEP 1: LAYANAN & PAKET -----------
    if (!s.serviceCategory) errors.serviceCategory = 'Pilih kategori layanan terlebih dahulu.';
    if (!s.packageId || !s.packageSnapshot) errors.package = 'Pilih salah satu paket harga sebelum lanjut.';
  } else if (step === 2) {
    // ----------- STEP 2: TEMPLATE / SCOPE -----------
    const category = s.serviceCategory;
    const needsTemplate = ['web'].includes(category); // category yang butuh pilih template
    if (needsTemplate) {
      if (!s.templateId || !s.templateSnapshot) {
        errors.template = 'Pilih salah satu template sebelum lanjut.';
      }
    } else {
      // Untuk SEO/Ads/App/dash/brand, validasi scope
      const scope = s.scopeData || {};
      // Project Brief harus diisi minimal 10 karakter untuk semua custom scope
      const brief = String(scope.projectBrief || '').trim();
      if (brief.length < 15) errors.projectBrief = 'Jelaskan kebutuhan Anda secara singkat (minimal 15 karakter).';
      // Kategori spesifik validasi
      if (['seo'].includes(category)) {
        const url = String(scope.websiteUrl || '').trim();
        if (url && !/^https?:\/\/.+\..+/.test(url)) errors.websiteUrl = 'Format URL website tidak valid. Gunakan https://...';
        const kws = scope.targetKeywords || [];
        if (kws.length < 1) errors.targetKeywords = 'Masukkan setidaknya 1 target keyword utama.';
        if (!String(scope.targetLocation || '').trim()) errors.targetLocation = 'Masukkan target lokasi (misal: Indonesia / Jabodetabek / Jakarta).';
      }
      if (['ads'].includes(category)) {
        const n = Number(scope.numberOfCampaigns) || 0;
        if (n < 1) errors.numberOfCampaigns = 'Minimal 1 kampanye iklan.';
      }
    }
  } else if (step === 3) {
    // ----------- STEP 3: DATA DIRI -----------
    const c = s.customerData || {};
    if (!String(c.fullName || '').trim()) errors.fullName = 'Nama lengkap harus diisi.';
    else if (String(c.fullName).trim().length < 2) errors.fullName = 'Nama terlalu pendek.';

    if (!String(c.email || '').trim()) errors.email = 'Email harus diisi.';
    else if (!isValidEmail(c.email)) errors.email = 'Format email tidak valid (contoh: nama@mail.com).';

    if (!String(c.phone || '').trim()) errors.phone = 'Nomor WhatsApp / HP harus diisi.';
    else if (!isValidPhoneID(c.phone)) errors.phone = 'Format nomor HP / WA Indonesia tidak valid (contoh: 081234567890).';
  } else if (step === 4) {
    // ----------- STEP 4: PEMBAYARAN -----------
    if (!s.paymentMethod) errors.paymentMethod = 'Pilih salah satu metode pembayaran.';
    // Note: bukti transfer tidak wajib disini, bisa di-upload nanti di halaman status order
    // Namun jika method adalah transfer, user sebaiknya upload bukti dulu
    if (String(s.paymentMethod || '').startsWith('transfer_') && !s.paymentProofUrl) {
      errors.paymentProof = 'Upload bukti transfer terlebih dahulu, atau upload nanti setelah selesai.';
    }
  }

  return errors;
}

// ============================================================
// INTERNAL HELPERS
// ============================================================
function _toDate(val) {
  if (!val) return null;
  // Firestore Timestamp punya .toDate()
  if (typeof val.toDate === 'function') {
    try { return val.toDate(); } catch (_) { /* ignore */ }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function _fmt(date) {
  if (!(date instanceof Date)) return '';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
