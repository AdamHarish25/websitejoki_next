# WebsiteJoki.ID — Multi-Step Checkout System

> Website bisnis jasa pembuatan website/aplikasi dengan sistem checkout 4 langkah lengkap.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Styling | Tailwind CSS 4 |
| Backend | Firebase (Firestore, Auth, Storage) |
| State | React Context + localStorage persist |
| Animation | GSAP |
| Editor | TipTap (rich text) |
| Language | JavaScript (jsconfig) |

## Struktur Project

```
websitejoki_next/
├── app/
│   ├── (public)/                # Halaman publik (Navbar + Footer)
│   │   ├── page.js              # Homepage
│   │   ├── layout.js            # Public layout (Navbar, Footer, CTA)
│   │   ├── blog/                # Blog + [slug]
│   │   ├── layanan/             # Layanan + [slug]
│   │   ├── kalkulator-seo/      # Kalkulator SEO
│   │   └── order/               # 🔥 CHECKOUT SYSTEM
│   │       ├── layout.js        # Checkout layout (2 kolom + providers)
│   │       ├── page.js          # Redirect ke step-1
│   │       ├── step-1-service/  # Pilih kategori + paket
│   │       ├── step-2-requirements/ # Template / scope form
│   │       ├── step-3-customer/ # Data diri + domain checker
│   │       └── step-4-payment/  # Addons + promo + bayar + success
│   ├── (admin)/                 # Admin panel (protected)
│   │   ├── login/page.js
│   │   └── admin/               # CRUD artikel, layanan, paket
│   └── api/                     # API routes (revalidate, translate)
├── components/
│   ├── checkout/                # 🔥 KOMPONEN CHECKOUT
│   │   ├── CheckoutProgress.jsx # Sidebar stepper 01-04
│   │   ├── OrderSummaryCard.jsx # Ringkasan pesanan realtime
│   │   ├── TemplateGallery.jsx  # Grid template web design
│   │   ├── ScopeRequirementsForm.jsx # Form scope SEO/Ads/App/dll
│   │   ├── CustomerForm.jsx     # Form data diri + domain checker
│   │   ├── AddonSelector.jsx    # Pilih layanan tambahan
│   │   ├── PromoCodeInput.jsx   # Input kode promo
│   │   ├── PriceBreakdown.jsx   # Detail harga
│   │   ├── PaymentMethodSelector.jsx # Pilih metode bayar
│   │   └── PaymentProofUploader.jsx  # Upload bukti transfer
│   ├── sections/                # Section homepage
│   ├── shared/                  # Navbar, Footer, dll
│   ├── admin/                   # Komponen admin
│   ├── blog/                    # Komponen blog
│   ├── cards/                   # ServiceCard
│   └── ui/                      # Button, Input
├── context/
│   ├── CheckoutContext.js       # 🔥 STATE GLOBAL CHECKOUT
│   └── LanguageContext.js       # Multi-language (ID/EN)
├── lib/
│   ├── firebaseConfig.js        # Firebase setup
│   ├── checkout-utils.js        # 🔥 UTILITIES CHECKOUT
│   ├── translations.js          # Translation data
│   └── analytics.js             # Analytics helpers
├── scripts/
│   ├── seedCollections.mjs      # Seed templates, addons, promo
│   └── seedSampleOrders.mjs     # Seed sample orders
└── public/                      # Static assets
```

---

## 🔥 Checkout System — Flow 4 Langkah

### Alur Checkout

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌─────────┐
│  STEP 1     │───▶│  STEP 2          │───▶│  STEP 3         │───▶│  STEP 4          │───▶│ SUCCESS │
│  Pilih      │    │  Template /      │    │  Data Diri      │    │  Konfirmasi &    │    │  Order  │
│  Layanan    │    │  Scope Kerja     │    │  + Domain       │    │  Bayar           │    │  Selesai│
└─────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘    └─────────┘
```

### Step 1: Pilih Layanan & Paket (`/order/step-1-service`)

- **Pilih kategori**: Web Design, SEO, Google Ads, App, Dashboard, Branding
- **Pilih paket**: Starter, Bisnis, Enterprise (dari Firestore `packages/`)
- Support query param: `/order/step-1-service?category=seo` → auto-select kategori
- Fetch data dari Firestore, realtime validation

### Step 2: Template / Scope Kerja (`/order/step-2-requirements`)

**Kategori Web Design → TemplateGallery:**
- Grid card template dari Firestore `templates/`
- Search + filter by sub-category (landing-page, company-profile, ecommerce)
- Badge Premium/Tier, preview button, pilih template

**Kategori Lainnya → ScopeRequirementsForm:**
- **SEO**: Target keywords (tag input), lokasi, URL website, jumlah keyword, brief
- **Google Ads**: Keywords, lokasi, jumlah campaign, brief campaign
- **App**: Platform (Android/iOS/Web/Cross), brief aplikasi
- **Dashboard**: Tipe dashboard (Sales/Marketing/Finance/HR/Ops/Custom), brief
- **Branding**: Tipe branding (Logo/Guideline/HAKI/Stationery/Social), brief

### Step 3: Data Diri (`/order/step-3-customer`)

- **Nama Lengkap** (required)
- **Email** (required + validasi format)
- **Nomor WhatsApp** (required + auto-format 08→628)
- **Nama Perusahaan** (opsional)
- **Domain yang Diinginkan** (opsional) — auto domain availability checker via DNS-over-HTTPS
- **Catatan Khusus** (textarea, max 500 karakter)
- Realtime validation, auto-format phone, character counter

### Step 4: Konfirmasi & Bayar (`/order/step-4-payment`)

1. **AddonSelector** — Layanan tambahan (filter by kategori order)
2. **PromoCodeInput** — Validasi kode promo dari Firestore
3. **PriceBreakdown** — Detail: Paket + Addons − Promo = Total
4. **PaymentMethodSelector** — Transfer BCA/BNI/Mandiri + copy rekening
5. **PaymentProofUploader** — Upload bukti ke Firebase Storage
6. **Submit** — Simpan ke Firestore `orders/` + `payments/`

### Success Page (`/order/success?orderId=ORDER-YYYYMMDD-XXXX`)

- Order ID + Copy button
- Status: Menunggu Pembayaran
- Total bayar
- Instruksi pembayaran
- Link WhatsApp CS
- Reset checkout state

---

## 🗂️ Firebase Firestore Collections

### Sudah Ada

| Collection | Fungsi |
|------------|--------|
| `services/` | Daftar layanan |
| `packages/` | Paket harga per kategori |
| `articles/` | Blog articles |

### Baru (Checkout)

| Collection | Fungsi |
|------------|--------|
| `templates/` | Template web design |
| `addons/` | Layanan tambahan |
| `promo_codes/` | Kode promo (doc ID = kode) |
| `orders/` | Semua orderan customer |
| `payments/` | Log pembayaran |

### Schema `orders/`

```javascript
{
  orderId: "ORDER-20260912-0001",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: "awaiting_payment", // pending → awaiting_payment → paid → in_progress → completed

  // Step 1
  serviceCategory: "web",        // web/seo/ads/app/dash/brand
  packageId: "abc123",
  packageSnapshot: { name, price, features, ... },

  // Step 2
  orderType: "template",         // template | custom_scope
  templateId: "xyz789",          // jika web
  templateSnapshot: { name, thumbnailUrl, ... },
  scopeData: { targetKeywords, targetLocation, projectBrief, ... }, // jika non-web

  // Step 3
  customerData: {
    fullName, email, phone, companyName, domainName, specialNotes
  },

  // Step 4
  selectedAddons: [{ addonId, name, price }],
  promoCode: "JOKI100",
  promoDiscountAmount: 100000,
  subtotal: 1450000,
  totalAmount: 1350000,
  paymentMethod: "transfer_bca",
  paymentProofUrl: "https://...",
  paymentExpiryAt: "2026-09-13T..."
}
```

---

## 🔧 State Management

### CheckoutContext (`context/CheckoutContext.js`)

```javascript
// Menggunakan React Context + localStorage persist
const { state, computed, nextStep, prevStep, setPackage, ... } = useCheckout();
```

**State yang disimpan:**
- `currentStep` (1-4)
- `completedSteps` (array)
- `serviceCategory`, `packageId`, `packageSnapshot`
- `orderType`, `templateId`, `templateSnapshot`, `scopeData`
- `customerData` (fullName, email, phone, companyName, domainName, specialNotes)
- `selectedAddons`, `promoCode`, `promoDiscountAmount`
- `paymentMethod`, `paymentProofUrl`

**Persist:** Otomatis ke localStorage (`websitejoki_checkout_state_v1`) setiap state berubah. Data tidak hilang saat refresh.

### Utilities (`lib/checkout-utils.js`)

| Fungsi | Fungsi |
|--------|--------|
| `generateOrderId()` | Generate `ORDER-YYYYMMDD-XXXX` |
| `formatIDR(amount)` | Format `Rp 1.500.000` |
| `normalizePhoneID(phone)` | `081234` → `6281234` |
| `isValidEmail(email)` | Validasi format email |
| `getPackagePrice(pkg)` | Parse harga dari string/number |
| `calculateSubtotal(state)` | Paket + addons |
| `calculatePromoDiscount(...)` | Hitung potongan promo |
| `validateStep(step, state)` | Validasi per step |

---

## 🚀 Setup & Jalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

```bash
cp .env.local.example .env.local
# Isi semua value Firebase dari Console
```

### 3. Seed Data

```bash
# Templates + Addons + Promo Codes
node scripts/seedCollections.mjs

# Sample Orders (untuk testing admin panel)
node scripts/seedSampleOrders.mjs
```

### 4. Jalankan Development

```bash
npm run dev
```

Buka [http://localhost:3000/order](http://localhost:3000/order)

---

## 🎨 Tema & Design System

### Warna

| Element | Light | Dark |
|---------|-------|------|
| Primary (aktif/CTA) | `green-600` → `emerald-500` | `green-700` → `emerald-600` |
| Background | `white` | `gray-900` |
| Card | `white` + `border-gray-200` | `gray-800` + `border-gray-700` |
| Text utama | `gray-900` | `gray-100` |
| Text sekunder | `gray-500/600` | `gray-400` |
| Input bg | `gray-50` | `gray-800` |
| Input text | `gray-800` | `gray-100` |
| Error | `red-500/600` | `red-400/500` |
| Success | `green-500/600` | `green-400/500` |

### Font

- **Body**: Inter (`--font-inter`) via `font-sans`
- **Heading**: Merriweather (`--font-merriweather`) via `font-serif`

### Pattern

- Card: `rounded-2xl border-2 shadow-sm`
- Button CTA: `bg-gradient-to-r from-green-600 to-emerald-500`
- Badge: `rounded-full bg-green-100 text-green-700`
- Input: `rounded-lg border bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-green-500/20`

---

## 📱 Responsive

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 1024px) | Stepper horizontal di atas, konten full width, summary sticky bottom |
| Desktop (≥ 1024px) | 3 kolom: Stepper (kiri) + Konten (tengah) + Summary (kanan) |

---

## 🌐 Bilingual (ID/EN)

Semua teks checkout mendukung Indonesia & English via `useLanguage()` hook.

```javascript
const { language } = useLanguage();
const isEn = language === 'en';
// Gunakan: {isEn ? 'English text' : 'Teks Indonesia'}
```

---

## 🔐 Security

- Admin panel dilindungi Firebase Auth + `useAuthState`
- Firestore rules: public read untuk `services`, `packages`, `templates`, `addons`; write hanya admin
- Orders: create publik, read hanya owner atau admin
- `.env.local` tidak di-commit ke Git

---

## 📋 File Checkout yang Dibuat

| File | Lines | Fungsi |
|------|-------|--------|
| `context/CheckoutContext.js` | 375 | State global + persist |
| `lib/checkout-utils.js` | 326 | Utilities |
| `components/checkout/CheckoutProgress.jsx` | 184 | Sidebar stepper |
| `components/checkout/OrderSummaryCard.jsx` | 230 | Ringkasan pesanan |
| `components/checkout/TemplateGallery.jsx` | 285 | Grid template |
| `components/checkout/ScopeRequirementsForm.jsx` | 504 | Form scope kerja |
| `components/checkout/CustomerForm.jsx` | 430 | Form data diri + domain |
| `components/checkout/AddonSelector.jsx` | 135 | Pilih addons |
| `components/checkout/PromoCodeInput.jsx` | 160 | Input promo |
| `components/checkout/PriceBreakdown.jsx` | 105 | Detail harga |
| `components/checkout/PaymentMethodSelector.jsx` | 163 | Pilih metode bayar |
| `components/checkout/PaymentProofUploader.jsx` | 220 | Upload bukti |
| `app/(public)/order/layout.js` | 122 | Checkout layout |
| `app/(public)/order/page.js` | 9 | Redirect |
| `app/(public)/order/step-1-service/page.js` | 416 | Step 1 |
| `app/(public)/order/step-2-requirements/page.js` | 171 | Step 2 |
| `app/(public)/order/step-3-customer/page.js` | 170 | Step 3 |
| `app/(public)/order/step-4-payment/page.js` | 281 | Step 4 |
| `app/(public)/order/step-4-payment/success/page.js` | 223 | Success |

**Total: ~4.500 baris kode checkout**
