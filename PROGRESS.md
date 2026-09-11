# 📋 Changelog — Checkout System Progress

> Terakhir diperbarui: 12 September 2026

---

## ✅ Fase A — Setup Dasar (Selesai sebelum sesi ini)

| File | Status | Keterangan |
|------|--------|------------|
| `context/CheckoutContext.js` | ✅ | State global + localStorage persist |
| `lib/checkout-utils.js` | ✅ | Utilities (format, validate, generate) |
| `components/checkout/CheckoutProgress.jsx` | ✅ | Sidebar stepper 01-04 |
| `components/checkout/OrderSummaryCard.jsx` | ✅ | Ringkasan pesanan realtime |
| `app/(public)/order/layout.js` | ✅ | Checkout layout 2 kolom + providers |
| `app/(public)/order/page.js` | ✅ | Redirect ke step-1 |
| `app/(public)/order/step-1-service/page.js` | ✅ | Pilih kategori + paket |

---

## ✅ Fase B — Step 1: Pilih Layanan (Selesai sebelum sesi ini)

| File | Status | Keterangan |
|------|--------|------------|
| `app/(public)/order/step-1-service/page.js` | ✅ | Grid kategori 6 + grid paket dari Firestore, query param `?category=` |

---

## ✅ Fase C — Step 2: Template / Scope Kerja (Sesi ini)

### File Baru

| File | Baris | Keterangan |
|------|-------|------------|
| `components/checkout/TemplateGallery.jsx` | 285 | Grid template web design, search + filter, badge premium, preview |
| `components/checkout/ScopeRequirementsForm.jsx` | 504 | Form scope per kategori (SEO, Ads, App, Dashboard, Branding) |
| `app/(public)/order/step-2-requirements/page.js` | 171 | Conditional render: web → TemplateGallery, lainnya → ScopeForm |

---

## ✅ Fase D — Step 3: Data Diri (Sesi ini)

### File Baru

| File | Baris | Keterangan |
|------|-------|------------|
| `components/checkout/CustomerForm.jsx` | 430 | Form nama, email, WA, perusahaan, **domain checker**, catatan |
| `app/(public)/order/step-3-customer/page.js` | 170 | Halaman Step 3 + redirect guard |

### Fitur Domain Checker
- Auto-check via Google DNS-over-HTTPS (`dns.google/resolve`)
- Debounce 800ms
- Status: "Tersedia" (hijau) / "Sudah Dipakai" (merah)
- Quick TLD suggestions: `.com`, `.co.id`, `.id`, `.net`, `.org`, `.io`
- Auto-add `.com` jika user tidak input TLD

---

## ✅ Fase E — Step 4: Konfirmasi & Bayar (Sesi ini)

### File Baru

| File | Baris | Keterangan |
|------|-------|------------|
| `components/checkout/AddonSelector.jsx` | 135 | Fetch addons dari Firestore, filter by kategori, toggle pilih |
| `components/checkout/PromoCodeInput.jsx` | 160 | Input promo + validasi + success/error message |
| `components/checkout/PriceBreakdown.jsx` | 105 | Detail: Paket + Addons − Promo = Total |
| `components/checkout/PaymentMethodSelector.jsx` | 163 | Transfer BCA/BNI/Mandiri + copy rekening |
| `components/checkout/PaymentProofUploader.jsx` | 220 | Upload bukti ke Firebase Storage + progress bar |
| `app/(public)/order/step-4-payment/page.js` | 281 | Gabung semua komponen + submit ke Firestore |
| `app/(public)/order/step-4-payment/success/page.js` | 223 | Halaman sukses: Order ID, status, instruksi bayar |

### Submit Order
- Generate `ORDER-YYYYMMDD-XXXX`
- Simpan ke Firestore `orders/{orderId}` + `payments/{orderId}`
- Redirect ke `/order/success?orderId=...`
- Reset checkout state

---

## 🔧 Bug Fix (Sesi ini)

### Fix Harga Sidebar Tidak Update

| File | Masalah | Solusi |
|------|---------|--------|
| `context/CheckoutContext.js:253` | `Number("Rp 900.000")` → `NaN` | Ganti pakai `getPackagePrice()` yang handle string format |

### Fix Dark Mode Form Inputs

| File | Masalah | Solusi |
|------|---------|--------|
| `CustomerForm.jsx` | Input bg putih, text putih di dark mode | Tambah `dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-green-500/20` di semua conditional branches |
| `ScopeRequirementsForm.jsx` | `dark:bg-gray-900` terlalu gelap | Ganti ke `dark:bg-gray-800` + tambah `dark:focus:ring` |
| `PromoCodeInput.jsx` | Sama | Sama |
| `TemplateGallery.jsx` | Sama | Sama |

### Fix Text Overflow / Overlap

| File | Lokasi | Fix |
|------|--------|-----|
| `TemplateGallery.jsx` | Nama template | Tambah `line-clamp-2` |
| `TemplateGallery.jsx` | Features list | Tambah `min-w-0 break-words` |
| `CheckoutProgress.jsx` | Step title & desc | Tambah `truncate` + `min-w-0` |
| `OrderSummaryCard.jsx` | Nama addon | Tambah `truncate` |
| `step-1-service/page.js` | Nama paket | Tambah `line-clamp-2` + `min-w-0` |
| `step-1-service/page.js` | Subtitle paket | Tambah `truncate` |
| `step-1-service/page.js` | Description paket | Tambah `line-clamp-2` |
| `step-1-service/page.js` | Features list | Tambah `min-w-0 break-words` |
| `step-1-service/page.js` | Category label | Tambah `truncate` |
| `step-4-payment/page.js` | Package name summary | Tambah `truncate` |

### Update Schema

| File | Perubahan |
|------|-----------|
| `context/CheckoutContext.js` | Hapus `companyWebsite`, tambah `domainName` di `customerData` |

---

## 📊 Total Progress

| Fase | Status | File |
|------|--------|------|
| A — Setup Dasar | ✅ Selesai | 7 file |
| B — Step 1 | ✅ Selesai | 1 file |
| C — Step 2 | ✅ Selesai | 3 file baru |
| D — Step 3 | ✅ Selesai | 2 file baru |
| E — Step 4 | ✅ Selesai | 7 file baru |
| F — Admin Panel | ❌ Belum | manage-templates, manage-addons, manage-promo, orders |
| G — Polish & QA | ❌ Belum | Animasi, responsive full, bilingual, security rules, testing |

### Jumlah File Checkout

- **19 file** checkout
- **~4.500 baris** kode
- **7 komponen** reusable
- **4 halaman** step
- **1 halaman** success

---

## 🎯 Selanjutnya (Fase F + G)

### Fase F — Admin Panel
- `admin/manage-templates/page.js` — CRUD template
- `admin/manage-addons/page.js` — CRUD addons
- `admin/manage-promo/page.js` — CRUD promo codes
- `admin/orders/page.js` — List semua order
- `admin/orders/[orderId]/page.js` — Detail order + update status

### Fase G — Polish & QA
- Animasi & transisi step
- Mobile responsive full
- Loading skeleton + error handling
- Bilingual support (ID/EN)
- Firestore security rules
- Testing end-to-end
