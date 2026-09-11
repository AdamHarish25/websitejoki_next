# 🏗️ Planning Lengkap Multi-Step Checkout - WebsiteJoki.ID

> Tanggal Dibuat: 11 September 2026
> Tech Stack: Next.js 16 + React 19 + Tailwind CSS 4 + Firebase (Firestore, Auth, Storage)
> Referensi Desain: webekspor.com/order (4-step checkout)

---

## ⚡ **QUICK START: Jalankan Script Seed Firestore (10 detik jadi!)**

Sudah ada script JavaScript buat otomatis bikin collection `templates`, `addons`, `promo_codes` BESERTA sample data-nya. **Gak perlu input manual satu per satu ke Firebase Console.**

### 📜 **3 Script yang Tersedia:**

| File | Fungsi | Kapan Dipakai |
|------|--------|---------------|
| `scripts/seedCollections.mjs` | Buat `templates` (8 sample) + `addons` (8 sample) + `promo_codes` (4 kode) | **JALANKAN PERTAMA KALI** sebelum coding checkout |
| `scripts/seedSampleOrders.mjs` | Buat `orders` (5 sample order realistis) + `payments` log | **Sebelum testing Admin Panel** (biar list order gak kosong) |

---

### 🚀 **Cara Menjalankan Script Seed (Auto-load .env.local, NO DEPENDENCIES!):**

Script sudah built-in handle baca file `.env.local` SENDIRI — **tidak perlu install `dotenv`**, tidak perlu parameter CLI ribet. Cukup jalankan dengan `node` biasa!

#### 1. Copy template `.env.local.example` jadi `.env.local`:
```bash
cp .env.local.example .env.local
```

#### 2. **ISI VALUE DI DALAM `.env.local`** dengan Firebase config kamu:
Buka file `.env.local` (ada di root project), lalu copy-paste value dari:
👉 **Firebase Console → ⚙️ Project Settings → Your Apps → Pilih Web Appmu → SDK setup → Config (icon `</>`)**

> Pastikan kamu ganti SEMUA baris yang ada tulisan `isi_dengan_...`. Biarkan format `NAMA_VAR=value` (tanpa spasi, tanpa quote juga gapapa).

Contoh yang BENAR:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD9kxyz_iniContohSaja1234567890abcdef
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=websitejoki-next.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=websitejoki-next
...
```

#### 3. Jalankan Script Utama (Templates + Addons + Promo Codes):
```bash
# CUKUP INI SAJA — gak perlu install apapun lagi!
node scripts/seedCollections.mjs
```

✅ Output sukses kira-kira:
```
🔥 Loading seed script...

✅ Loaded config from: .env.local

🚀 [START] Seed Checkout Collections ke Firestore...
Project ID: websitejoki-next
====================================================

📝 Seeding 8 templates...
  ✅ Template added: [landing-page] "Startup Agency - Landing Page Jasa" -> ID: abc123
  ...

📝 Seeding 8 addons...
  ✅ Addon added: "Setup Google Analytics 4 + GTM" Rp 250.000 -> ID: xyz789
  ...

📝 Seeding 4 promo codes...
  ✅ Promo added: "JOKI100" -> Rp 100.000 (usage: 0/100)
  ...

====================================================
🎉 [SELESAI] Semua collections berhasil dibuat!
   📋 Templates    : 8 docs
   🎁 Addons       : 8 docs
   🎟️  Promo Codes  : 4 codes: JOKI100, GRANDOPENING10, LAUNCHAPP200, BRANDING50
👉 Silakan cek di Firebase Console -> Firestore Database.
👉 Kalau ada data yang salah, tinggal edit langsung di console / script lalu run ulang.
```

#### 4. Jalankan Script Sample Orders (OPSIONAL - untuk ngetes Admin Panel):
```bash
# Jalankan setelah step 3 selesai
node scripts/seedSampleOrders.mjs
```

⚠️ **WARNING:** Script `seedSampleOrders` akan membuat data order PALSU. Jangan dijalankan di FIREBASE PROJECT PRODUKSI jika kamu tidak mau data asli bercampur! Buat project Firebase terpisah untuk mode `dev` / testing.

---

### ✏️ **Cara Edit / Tambah Data Sample (Sangat Mudah)**

Buka file `scripts/seedCollections.mjs` dengan code editor, cari section:
- `const TEMPLATES = [...]` → hapus / tambah object template sesuai kebutuhan
- `const ADDONS = [...]` → edit nama add-ons, harga, applicable categories
- `const PROMO_CODES = { ... }` → tambah / edit kode promo

Save file, lalu **run ulang command di atas**. Data lama tidak dihapus script (hanya di-append). Kalau mau reset bersih: hapus semua doc di Firestore Console dulu sebelum run ulang.

---


## 📋 **Alur Checkout 4 Langkah (Disesuaikan untuk WebsiteJoki)**

| Langkah | Judul | Isi |
|---------|-------|-----|
| **01** | **Pilih Layanan** | Pilih kategori layanan (Web Design / SEO / Google Ads / App Dev / Dashboard / Branding) + pilih paket harga (Starter/Bisnis/Enterprise dll) |
| **02** | **Pilih Template / Kebutuhan** | Kalau Web Design: pilih template portfolio. Kalau SEO/Ads: pilih scope kerja (keyword target, jumlah campaign, dll) |
| **03** | **Data Diri** | Nama lengkap, Email, No. HP, Nama Perusahaan, Catatan Khusus |
| **04** | **Konfirmasi & Bayar** | Ringkasan order, Add-ons opsional, Kode promo, Pilih metode pembayaran (Transfer Bank/VA/EWallet/QRIS) |

---

## 🔥 **1. Firebase Firestore Collections**

Project sudah menggunakan `firebase` v11 + `react-firebase-hooks` (lihat `lib/firebaseConfig.js`). Berikut adalah collection yang perlu dibuat / sudah ada:

### Sudah ADA ✅
- `services/` - Daftar layanan
- `packages/` - Daftar paket harga per kategori
- `articles/` - Blog (dari admin panel)

### Perlu DIBUAT (BARU)

```
├── templates/          (Template Web Design)
│   ├── id: auto
│   ├── name: "Global Company"
│   ├── nameEn: "Global Company (EN)" (opsional, bilingual)
│   ├── category: "web" / "landing-page" / "company-profile" / "ecommerce"
│   ├── thumbnailUrl: "/templates/global-company.jpg"
│   ├── previewUrl: "https://preview.websitejoki.my.id/global"
│   ├── features: ["Responsive Design", "SEO Optimized", "Admin Panel", ...]
│   ├── featuresEn: ["..."]
│   ├── isPremium: true/false (untuk bedakan template basic vs premium)
│   ├── order: 1 (urutan tampil)
│   └── createdAt: Timestamp
│
├── addons/             (Layanan Tambahan / Add-ons Opsional)
│   ├── id: auto
│   ├── name: "Jasa Setup Google Analytics 4"
│   ├── nameEn: "Google Analytics 4 Setup Service"
│   ├── price: 250000 (harga dalam rupiah, integer)
│   ├── applicableCategories: ["web", "seo"]  (kategori layanan mana saja bisa pilih addon ini)
│   ├── description: "Setup GA4, Google Tag Manager, dan konfigurasi event tracking"
│   ├── descriptionEn: "..."
│   └── isActive: true
│
├── promo_codes/        (Kode Promo)
│   ├── id: auto (doc ID = kodenya, e.g. "JOKI100" atau "GRANDOPENING10")
│   ├── discountType: "percentage" / "fixed"
│   ├── discountValue: 10 / 100000  (jika percentage: 10 artinya 10%, jika fixed: 100000 artinya Rp 100rb)
│   ├── maxUsage: 100  (maksimal berapa kali dipakai)
│   ├── usedCount: 25  (berapa kali sudah dipakai - auto increment)
│   ├── validFrom: Timestamp
│   ├── validUntil: Timestamp
│   ├── minimumOrder: 500000 (minimal order untuk bisa pakai promo ini, opsional)
│   ├── applicableCategories: ["web", "seo"] (kategori mana saja bisa pakai, kosongin = semua)
│   └── isActive: true
│
├── orders/             (UTAMA - Simpan Semua Orderan Customer)
│   ├── id: auto (bisa pakai format custom: ORDER-YYYYMMDD-XXXX)
│   ├── createdAt: Timestamp
│   ├── updatedAt: Timestamp
│   ├── status: "pending" / "awaiting_payment" / "paid" / "in_progress" / "revision" / "completed" / "cancelled" / "refunded"
│   │
│   ├── // --- DATA LANGKAH 1: LAYANAN & PAKET ---
│   ├── serviceCategory: "web" / "seo" / "ads" / "app" / "dash" / "brand"
│   ├── packageId: "abc123xyz"  (document ID reference ke collection packages/)
│   ├── packageSnapshot: {
│   │   name: "Paket Bisnis",
│   │   price: 900000,
│   │   features: [...],
│   │   ... (simpan SEMUA field paket saat order dibuat - SNAPSHOT, bukan reference)
│   │ }
│   │
│   ├── // --- DATA LANGKAH 2: TEMPLATE / SCOPE KERJA ---
│   ├── orderType: "template" / "custom_scope"  (template = untuk web design, custom_scope = SEO/Ads/dll)
│   ├── templateId: "xyz789" (jika orderType = template)
│   ├── templateSnapshot: {
│   │   name: "Global Company",
│   │   thumbnailUrl: "...",
│   │   ...
│   │ }
│   ├── scopeData: {  (jika orderType = custom_scope - untuk SEO/Ads/App/dll)
│   │   targetKeywords: ["jasa seo jakarta", "website company profile"],
│   │   targetLocation: "Indonesia",
│   │   numberOfCampaigns: 3,
│   │   projectBrief: "Saya ingin..." (textarea brief project dari customer)
│   │ }
│   │
│   ├── // --- DATA LANGKAH 3: DATA DIRI CUSTOMER ---
│   ├── customerData: {
│   │   fullName: "Budi Santoso",
│   │   email: "budi.santoso@email.com",
│   │   phone: "6281234567890",  (format: kode negara tanpa +)
│   │   companyName: "PT Budi Jaya Abadi",
│   │   companyWebsite: "https://budijaya.com" (opsional),
│   │   specialNotes: "Ingin tema warna biru langit dengan aksen hijau. Deadline 2 minggu."
│   │ }
│   │
│   ├── // --- DATA LANGKAH 4: PEMBAYARAN ---
│   ├── selectedAddons: [
│   │   { addonId: "a1b2c3", name: "Setup GA4", price: 250000 },
│   │   { addonId: "d4e5f6", name: "Extra 3 Halaman", price: 300000 }
│   │ ]
│   ├── promoCode: "JOKI100" (null / string kosong jika tidak pakai)
│   ├── promoDiscount: 100000 (jumlah potongan dalam rupiah, setelah dihitung)
│   ├── subtotal: 1450000 (paket + addons, sebelum promo)
│   ├── totalAmount: 1350000 (subtotal - promo)
│   ├── paymentMethod: "transfer_bca" / "transfer_bni" / "transfer_mandiri" / "va_bni" / "ewallet_gopay" / "ewallet_ovo" / "qris" / "midtrans"
│   ├── paymentProofUrl: "/orders/{orderId}/bukti-transfer.jpg" (upload ke Firebase Storage)
│   ├── paymentProofUploadedAt: Timestamp
│   ├── paymentExpiryAt: Timestamp (24 jam dari waktu order dibuat - untuk batas upload bukti transfer)
│   ├── paymentGatewayRef: "midtrans-order-id-xxx" (jika pakai payment gateway otomatis)
│   │
│   └── // --- ADMIN / INTERNAL ---
│   ├── assignedTo: "adminUidAtauNama" (admin / tim yang menangani order ini)
│   ├── adminNotes: "Sudah follow up via WA tanggal 12 Sep. Customer mau tambah WhatsApp popup."
│   ├── adminTags: ["priority_high", "repeat_customer"] (opsional, untuk filtering admin)
│   ├── projectDeadline: Timestamp
│   ├── deliverablesUrls: [
│   │   { name: "Design Preview", url: "https://figma.com/..." },
│   │   { name: "Staging Website", url: "https://staging.websitejoki.my.id/..." }
│   │ ]
│
└── payments/           (Log Pembayaran - untuk tracking semua transaksi)
    ├── id: auto
    ├── orderId: "ORDER-20260911-0001" (reference ke orders/)
    ├── amount: 1350000
    ├── method: "transfer_bca"
    ├── status: "pending" / "success" / "failed" / "expired" / "refunded"
    ├── transactionRef: "BCA-TRF-20260911-12345" (dari payment gateway atau nomor rekening admin)
    ├── verifiedBy: "adminUid" (jika manual transfer - admin yang verifikasi)
    ├── verifiedAt: Timestamp
    ├── notes: "Customer transfer via BCA Mobile, bukti sesuai"
    └── createdAt: Timestamp
```

---

## 📁 **2. Struktur File yang Perlu Dibuat**

```
websitejoki_next/
├── app/
│   └── (public)/
│       └── order/                      🆕 FOLDER ROUTE CHECKOUT
│           ├── layout.js               (Wrap semua step checkout dengan CheckoutContextProvider + layout sidebar stepper)
│           ├── page.js                 (Redirect ke /order/step-1-service kalau akses /order langsung)
│           │
│           ├── step-1-service/
│           │   └── page.js             🆕 Langkah 1: Pilih Kategori Layanan + Paket Harga
│           │
│           ├── step-2-requirements/
│           │   └── page.js             🆕 Langkah 2: Conditional (Template Gallery ATAU Scope Form)
│           │
│           ├── step-3-customer/
│           │   └── page.js             🆕 Langkah 3: Form Data Diri Customer
│           │
│           └── step-4-payment/
│               └── page.js             🆕 Langkah 4: Ringkasan + Add-ons + Promo + Pembayaran
│               └── success/
│                   └── page.js         🆕 Halaman "Order Berhasil" setelah submit
│
├── components/
│   └── checkout/                       🆕 SEMUA KOMPONEN KHUSUS CHECKOUT
│       ├── CheckoutProgress.jsx        (Sidebar stepper 01-02-03-04 + Ringkasan Pesanan)
│       ├── OrderSummaryCard.jsx        (Card ringkasan pesanan kanan atas - update realtime tiap step)
│       ├── ServiceSelector.jsx         (Grid kategori layanan + pilih paket)
│       ├── TemplateGallery.jsx         (Grid card template dengan tombol Lihat / Pilih)
│       ├── ScopeRequirementsForm.jsx   (Form scope untuk SEO/Ads/App dll - target keyword, jumlah campaign, brief)
│       ├── CustomerForm.jsx            (Form data diri: nama, email, WA, perusahaan, catatan)
│       ├── AddonSelector.jsx           (List add-ons yang bisa dipilih per kategori - bisa toggle tambah/hapus)
│       ├── PromoCodeInput.jsx          (Input kode promo + tombol Apply + error handling)
│       ├── PaymentMethodSelector.jsx   (Pilihan metode transfer/VA/EWallet/QRIS dengan logo bank)
│       ├── PaymentProofUploader.jsx    (Upload bukti transfer ke Firebase Storage)
│       └── PriceBreakdown.jsx          (Detail perhitungan: Subtotal, Add-ons, Promo, Total)
│
├── context/
│   └── CheckoutContext.js              🆕 STATE GLOBAL CHECKOUT (PENTING!)
│                                     - Simpan semua data antar step (step aktif, service, package, template, scope, customer, addons, promo)
│                                     - Persist ke localStorage biar kalau refresh gak hilang
│                                     - Actions: nextStep(), prevStep(), setService(), addAddon(), applyPromo(), dll
│
├── hooks/
│   └── use-checkout.js                 🆕 Custom Hook shortcut untuk akses CheckoutContext (e.g. const { state, nextStep } = useCheckout())
│
├── lib/
│   └── checkout-utils.js               🆕 Fungsi-fungsi utility:
│                                     - calculateSubtotal(state)
│                                     - calculateTotal(state)
│                                     - applyPromoCode(code, subtotal)
│                                     - generateOrderId() → "ORDER-YYYYMMDD-XXXX"
│                                     - validateStep(stepNumber, state) → return { valid: bool, errors: [] }
│                                     - formatPhoneNumber(phone) → format ke 628xxxx
│                                     - sendWhatsAppNotification(orderData) → (untuk Fase 2 nanti)
│
├── app/(admin)/admin/
│   ├── manage-templates/
│   │   └── page.js                     🆕 CRUD Template Web Design (copy pola dari manage-packages)
│   ├── manage-addons/
│   │   └── page.js                     🆕 CRUD Add-ons (copy pola dari manage-packages)
│   ├── manage-promo/
│   │   └── page.js                     🆕 CRUD Kode Promo
│   └── orders/
│       ├── page.js                     🆕 LIST semua orderan - filter by status, search by nama/email/orderId
│       └── [orderId]/
│           └── page.js                 🆕 DETAIL order - update status, lihat bukti pembayaran, tambah catatan admin, upload deliverables
│
└── public/
    └── icons/
        └── payments/                   🆕 (Kamu yang upload - logo bank & ewallet)
            ├── bca.png
            ├── bni.png
            ├── mandiri.png
            ├── gopay.png
            ├── ovo.png
            ├── qris.png
            └── shopeepay.png
```

---

## ⚙️ **3. Implementation Roadmap (Step-by-Step)**

### FASE A - SETUP DASAR (Foundation)

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| A1 | Buat `CheckoutContext.js` + Provider + persist localStorage | Dev Lead | 1-2 jam | Core state management. Simpan step, service, package, template, scope, customerData, addons, promo, paymentMethod. Bisa reference pola dari `context/LanguageContext.js` yang sudah ada |
| A2 | Buat custom hook `hooks/use-checkout.js` | Dev Lead | 15 menit | Shortcut untuk consume context: `const { state, nextStep, setPackage } = useCheckout()` |
| A3 | Buat `lib/checkout-utils.js` (fungsi calculate, validate, generateOrderId) | Dev Lead | 1 jam | Test manual per fungsi |
| A4 | Buat komponen `CheckoutProgress.jsx` (Sidebar stepper UI 01-04) | Dev Lead | 2 jam | Tampilkan step aktif, step completed (dengan ceklis), step disabled. Mobile: jadi top horizontal stepper |
| A5 | Buat komponen `OrderSummaryCard.jsx` | Dev Lead | 1.5 jam | Card kanan atas: Nama paket + harga, Add-ons (jika ada), Potongan Promo, Total. Terima state, update realtime |
| A6 | Buat route wrapper `app/(public)/order/layout.js` | Dev Lead | 1 jam | Pakai layout 2 kolom: Kiri = CheckoutProgress, Kanan = Content (children) + OrderSummaryCard |
| A7 | Buat `app/(public)/order/page.js` (redirect) | Dev Lead | 15 menit | Kalau user masuk /order, redirect ke /order/step-1-service. Juga validasi: kalau step 1 belum selesai tapi akses step 3, redirect balik |

### FASE B - STEP 1: PILIH LAYANAN & PAKET

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| B1 | Buat komponen `ServiceSelector.jsx` | Dev Lead | 2 jam | 1) Pilih category dulu (6 kartu: Web, SEO, Ads, App, Dashboard, Branding) 2) Setelah category terpilih, show list packages untuk category itu (ambil dari Firestore `packages` yang sudah ADA) |
| B2 | Buat `step-1-service/page.js` | Dev Lead | 1 jam | Integrasi ServiceSelector, validasi harus pilih paket dulu sebelum nextStep() |
| B3 | UPDATE TOMBOL EXISTING di PricingSections.jsx line 97 | Dev Lead | 15 menit | Ganti dari Link ke WA, jadi: `Link href={/order/step-1-service?category=${pkg.category}}` — biar user klik "Pilih Paket" langsung masuk checkout dengan category terpilih |
| B4 | Handle query params `?category=seo` di step-1-service | Dev Lead | 30 menit | Kalau ada query param, auto select category itu dan scroll ke section paket |

### FASE C - STEP 2: TEMPLATE / SCOPE KERJA

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| C1 | ⚡ **KAMU:** Input data template awal ke Firestore `templates/` | **KAMU** | Sebelum coding | Minimal 5-10 template: nama, category, thumbnail (bisa upload ke /public/templates/ dulu), previewUrl (ke portfolio yang sudah ada), isPremium |
| C2 | Buat komponen `TemplateGallery.jsx` | Dev Lead | 2.5 jam | Grid card template: thumbnail, nama, label "Premium" jika premium, tombol "Lihat Preview" (open new tab) + tombol "Pilih" (border berubah warna hijau kalau terpilih). Support search + filter. Pagination jika template > 12 |
| C3 | Buat komponen `ScopeRequirementsForm.jsx` | Dev Lead | 2 jam | Untuk kategori selain Web. Input: Target Keywords (tag input), Target Lokasi (select), Jumlah Campaign (number), Brief Project (textarea). Placeholder yang helpful per kategori. |
| C4 | Buat `step-2-requirements/page.js` | Dev Lead | 1 jam | Conditional render: JIKA category = "web" → render TemplateGallery. ELSE → render ScopeRequirementsForm. Validasi harus pilih / isi dulu sebelum nextStep() |

### FASE D - STEP 3: DATA DIRI CUSTOMER

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| D1 | Buat komponen `CustomerForm.jsx` | Dev Lead | 2.5 jam | Fields: Nama Lengkap (required), Email (required + format), No. HP / WA (required + format 628 + cek digit), Nama Perusahaan (opsional), Website Perusahaan (opsional), Catatan Khusus (textarea, max 500 char). Error messages per field, realtime validation |
| D2 | Buat `step-3-customer/page.js` | Dev Lead | 1 jam | Integrasi CustomerForm. Validasi semua required field baru bisa nextStep() |

### FASE E - STEP 4: KONFIRMASI & PEMBAYARAN

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| E1 | ⚡ **KAMU:** Input data add-ons ke Firestore `addons/` + promo_codes | **KAMU** | Sebelum coding | Contoh Add-ons: Setup GA4 (250rb), Extra 3 Halaman (300rb), Logo Design (350rb), Content Writing 10 Artikel (500rb), Setup WhatsApp Popup (150rb). Promo: JOKINEW100 (potong 100rb new user), GRANDOPENING10 (10% off maks 200rb) |
| E2 | Buat komponen `AddonSelector.jsx` | Dev Lead | 2 jam | List add-ons yang `applicableCategories` cocok dengan category order. Toggle checkbox / tombol tambah. Update state.selectedAddons, update total realtime |
| E3 | Buat komponen `PromoCodeInput.jsx` + logic `applyPromoCode()` | Dev Lead | 2 jam | Input text + tombol "Gunakan Promo". Logic: cek ke Firestore promo_codes → validasi isActive, usedCount < maxUsage, tanggal valid, minOrder, categories → jika valid: hitung potongan, update state.promoDiscount. Error message: "Kode promo tidak valid / sudah kadaluarsa / sudah habis" |
| E4 | Buat komponen `PriceBreakdown.jsx` | Dev Lead | 1 jam | Detail perhitungan: Paket (Rp X), Add-ons (list per addon Rp Y), Subtotal, Potongan Promo (- Rp Z), TOTAL (bold, warna hijau, font besar) |
| E5 | Buat komponen `PaymentMethodSelector.jsx` | Dev Lead | 2 jam | FASE 1: Manual Transfer saja (BCA, BNI, Mandiri). Setiap klik show detail rekening (Nama Bank, Nomor Rekening, Atas Nama). FASE 2: Tambah Midtrans/VA/QRIS. Tombol radio style dengan logo bank |
| E6 | Buat komponen `PaymentProofUploader.jsx` | Dev Lead | 2 jam | Drag & drop / pilih file → upload ke Firebase Storage di path `/payments/{orderId}/bukti-transfer.{ext}` → simpan downloadURL ke state.paymentProofUrl. Preview gambar setelah upload. Accept: jpg, jpeg, png, pdf (maks 5MB) |
| E7 | Buat `step-4-payment/page.js` | Dev Lead | 2.5 jam | Gabung SEMUA komponen step 4 + tombol "Buat Pesanan". Ketika submit: 1) Validate semua data, 2) Generate orderId, 3) Hitung final subtotal & total, 4) Simpan ke Firestore `orders/` + `payments/`, 5) Jika paymentProofUrl ada, update order, 6) Redirect ke /order/success?orderId=xxx, 7) (Opsional Fase 2) Kirim WA notif |
| E8 | Buat `step-4-payment/success/page.js` | Dev Lead | 1.5 jam | Halaman "Berhasil! 🎉" dengan: Order ID, Total Bayar, Status (Menunggu Pembayaran / Menunggu Verifikasi), Detail rekening (jika transfer manual), Tombol "Copy Order ID", Tombol "Kembali ke Beranda", Tombol "Cek Status Order" (nanti, untuk dashboard customer) |

### FASE F - ADMIN PANEL (MANAJEMEN ORDER)

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| F1 | Buat `admin/manage-templates/page.js` | Dev Lead | 2 jam | **Copy pola persis** dari `admin/manage-packages/page.js` yang SUDAH ADA! (CRUD + Auto Translate EN). Fields: name, nameEn, category (select), thumbnailUrl, previewUrl, features, featuresEn, isPremium, order |
| F2 | Buat `admin/manage-addons/page.js` | Dev Lead | 1.5 jam | Copy pola manage-packages. Fields: name, nameEn, price (number), applicableCategories (multiple select), description, descriptionEn, isActive |
| F3 | Buat `admin/manage-promo/page.js` | Dev Lead | 2 jam | Copy pola manage-packages. Fields: kodePromo (sebagai doc ID), discountType (radio % / fixed), discountValue, maxUsage, usedCount (readonly), validFrom, validUntil (date picker), minimumOrder, applicableCategories, isActive |
| F4 | Buat `admin/orders/page.js` (LIST ORDER) | Dev Lead | 3 jam | Table semua order: Order ID, Tanggal, Customer Name, WA, Category + Paket, Total Amount, Status (badge warna: pending=abu, paid=hijau, in_progress=biru, completed=hijau tua, cancelled=merah). Filter by status, search (nama/email/orderId), sort by tanggal. Pagination. Klik row → buka detail |
| F5 | Buat `admin/orders/[orderId]/page.js` (DETAIL ORDER) | Dev Lead | 4 jam | 3 Kolom: 1) Detail Customer + Kontak WA button, 2) Detail Order (paket, template/scope, addons, breakdown harga, bukti transfer dengan preview image, metode bayar, dll), 3) Panel Admin (Update Status select, Assign ke, Deadline date picker, Admin Notes textarea, Upload Deliverables (multi file ke Storage), Tombol "Verifikasi Pembayaran" + log history status perubahan). Require Admin Auth. |
| F6 | ⚡ **KAMU:** Setup WA API (Fonnte / Whacenter) + Email SMTP | **KAMU** | Bisa paralel | Daftar akun Fonnte (Rp ~50rb / bulan untuk 1000 WA). Dapatkan API key + nomor WA device. Untuk email: bisa pakai Resend / SendGrid |
| F7 | Logic kirim notifikasi otomatis via WA + Email | Dev Lead | 3 jam | Trigger: a) Order dibuat → kirim ke customer + admin WA "Terima kasih order Anda (Order ID: X). Silakan transfer sebesar Rp Y ke...". b) Bukti transfer diupload → notif admin. c) Status berubah (Paid/In Progress/Completed) → notif customer. Pakai API route `/api/send-notification` (aman, server side) |

### FASE G - POLISH & QUALITY ASSURANCE

| ID | Task | Pelaksana | Estimasi | Catatan |
|----|------|-----------|----------|---------|
| G1 | Animasi & Transisi Step | Dev Lead | 2 jam | Halusin perpindahan step (fade in/out), progress bar, tombol loading state saat submit |
| G2 | Mobile Responsive Full | Dev Lead | 2 jam | Sidebar stepper → Top horizontal stepper. OrderSummaryCard di HP jadi sticky bottom sheet / accordion. Semua form field full width. Grid template 2 kolom di HP |
| G3 | Loading & Skeleton + Error Handling | Dev Lead | 2 jam | Semua data fetch dari Firestore pakai skeleton. Jika offline / gagal simpan order: retry button + tampilkan error jelas. Jangan biar user submit dua kali (disable tombol saat loading) |
| G4 | Bilingual Support (ID / EN) | Dev Lead | 2 jam | Integrasi semua text checkout dengan `useLanguage()` + `lib/translations.js`. Semua field form, placeholder, button, error message harus bilingual. Follow pola yang sudah ada di PricingSections. |
| G5 | Security: Firestore Rules ⚠️ PENTING | Dev Lead + Kamu | 1-2 jam | Setup Firestore Security Rules di Firebase Console: `orders` → user hanya boleh CREATE + READ miliknya sendiri (cek email / order ID dicocokkan), ADMIN role boleh READ/WRITE semua. `promo_codes` → user hanya boleh READ (untuk validasi promo), tidak boleh WRITE. `templates`, `addons` → READ only untuk public, WRITE hanya ADMIN. **JANGAN SKIP YANG INI!** |
| G6 | Testing End-to-End (Manual) | BERDUA | 3 jam | Test 5-6 scenario: A) Web Design - Template Premium + 2 Addons + Promo, B) SEO Paket Bisnis + Scope Form, C) App Dev + Tanpa Promo, D) Step skip validation (paksa buka URL step 3 tanpa step 1 → harus redirect), E) Input kode promo salah, F) Upload bukti transfer 10MB (harus ditolak). Buat sheet test case jika perlu |

---

## 💳 **4. Opsi Payment Gateway**

### 🟢 FASE 1 (DISARANKAN - CEPAT & GRATIS): **MANUAL TRANSFER DULU**
- Customer pilih bank → Lihat nomor rekeningmu → Upload bukti transfer → Order masuk status `awaiting_verification`
- Kamu cek mutasi rekening → Klik "Verifikasi Pembayaran" di Admin Panel → Status jadi `paid`
- **KEUNTUNGAN:** Tanpa biaya langganan, tanpa setup payment gateway, bisa langsung GO-LIVE
- **KERUGIAN:** Kamu harus cek mutasi manual tiap ada order. Untuk solusi interim: bisa pakai layanan mutasi otomatis seperti Flip for Business / BCA API untuk notif WA otomatis ketika ada transfer masuk

### 🟡 FASE 2 (SAAT ORDERAN SUDAH RAMAI): **PAYMENT GATEWAY OTOMATIS**
| Provider | Biaya Transaksi | Kelebihan |
|----------|-----------------|-----------|
| **Midtrans** | VA 2,99% + Rp 2.000, E-Wallet 2,99%, QRIS 0,7% | Paling umum, dokumentasi lengkap, support sandbox testing |
| **Xendit** | VA flat Rp 4.000, E-Wallet 2,9%, QRIS 0,7% | Fee VA flat cocok untuk transaksi besar |
| **Duitku** | VA flat Rp 3.500, E-Wallet start 1,8% | Lebih murah untuk nominal kecil |
| **Tripay** | Flat Rp 1.500 - Rp 5.000 per transaksi (VA) | Cocok jika target market banyak pakai VA |

> Implementation note: Struktur kode kita sudah disiapkan modular. Nanti tinggal tambah option baru di `PaymentMethodSelector` + logic call API Midtrans di API Route `/api/create-payment`. Data structure `orders.paymentGatewayRef` sudah disiapkan untuk menampung order id dari gateway.

---

## 🤝 **5. Yang Bisa KAMU Kerjakan SEKARANG (Paralel tanpa nunggu coding)**

### ✅ **TUGAS KAMU #1: INPUT DATA FIRESTORE**
Buka Firebase Console → Firestore Database, buat collection dan isi data berikut:

#### 📂 `templates/` (minimal 5 template)
| Field | Contoh Isi |
|-------|------------|
| name | "Global Company Profile" |
| category | "web" (pilihan: web / landing-page / company-profile / ecommerce) |
| thumbnailUrl | "/portfolio/global-company.png" (upload ke /public/portfolio dulu atau pakai URL portfolio yang sudah ada) |
| previewUrl | "https://websitejoki.my.id/portfolio/global-company" |
| features | ["Responsive Desktop + Mobile", "SEO Meta Tags", "Tombol WhatsApp Float", "Google Maps Integration", "4 Halaman: Home, Tentang, Layanan, Kontak"] |
| isPremium | true / false |
| order | 1 (urutkan sesuai urutan mau ditampilkan) |

#### 📂 `addons/` (minimal 5 add-ons)
| Field | Contoh Isi |
|-------|------------|
| name | "Setup Google Analytics 4 + GTM" |
| price | 250000 (ANGKA SAJA, TANPA TITIK / RP) |
| applicableCategories | ["web", "seo", "dash"] (ARRAY. Bisa semua isi ["web","seo","ads","app","dash","brand"] jika addon bisa untuk semua) |
| description | "Konfigurasi GA4, Google Tag Manager, Event Tracking (WA Click, Form Submit, Page View), dan Dashboard Reporting" |
| isActive | true |

#### 📂 `promo_codes/` (minimal 2 kode)
Gunakan **KODE PROMO sebagai DOCUMENT ID** (misal bikin doc dengan ID `JOKI100`)
| Field | Contoh Isi |
|-------|------------|
| discountType | "fixed" (atau "percentage") |
| discountValue | 100000 (jika fixed) / 10 (jika percentage, berarti 10%) |
| maxUsage | 50 |
| usedCount | 0 |
| validFrom | 11 September 2026 00:00 |
| validUntil | 31 Desember 2026 23:59 |
| minimumOrder | 0 (atau 500000 jika ingin minimal order) |
| applicableCategories | [] (ARRAY KOSONG = semua kategori bisa. Atau isi ["web", "seo"] untuk kategori tertentu) |
| isActive | true |

---

### ✅ **TUGAS KAMU #2: SIAPKAN ASSET GAMBAR**
1. Upload logo bank / payment ke `/public/icons/payments/`
   - Ukuran rekomendasi: 200x120px, format PNG transparan
   - File yang dibutuhkan: `bca.png`, `bni.png`, `mandiri.png`, `gopay.png`, `ovo.png`, `qris.png`, `shopeepay.png` (opsional)
2. Siapkan thumbnail template portfolio beresolusi baik (minimal 800x600px, dikompres)

---

### ✅ **TUGAS KAMU #3: REKAP DATA PENTING**
Catat di notes / file terpisah:
1. 📋 Daftar rekening untuk pembayaran (Bank, No. Rek, Atas Nama)
   - Contoh: BCA 1234567890 a.n. PT WEBSITEJOKI INDONESIA
2. 🔑 Informasi kontak yang mau tampil di invoice / email notif
   - No. WA CS, Email CS, Jam operasional
3. 📝 Skema durasi pengerjaan per paket (untuk ditampilkan di checkout step 3 / invoice)
   - Contoh: Paket Starter = 3-5 hari kerja, Paket Bisnis = 7-10 hari kerja
4. 🎯 **Pertanyaan di Step 2 untuk setiap kategori (SEO, Ads, App, Dashboard, Branding)** — ini PENTING!
   - Contoh untuk SEO: "Target keyword utama apa saja? (pisahkan koma)", "Target lokasi geografis?", "Website URL yang akan dioptimasi?", "Pernah pakai jasa SEO sebelumnya?"
   - Buat pertanyaan spesifik per kategori supaya `ScopeRequirementsForm.jsx` akurat

---

### ✅ **TUGAS KAMU #4: SETUP WA NOTIF (OPSIONAL TAPI BAGUS)**
1. Daftar [Fonnte](https://fonnte.com/) atau [Whacenter](https://whacenter.com/)
   - Fonnte: Mulai Rp 50rb / 1000 kredits WA. Device HP sendiri yang jadi pengirim.
2. Test kirim WA ke nomormu sendiri via dashboard mereka
3. Catat **API Key** dan **Device ID** (nanti kasih ke Dev untuk dimasukkan ke env variable / API Route)

---

## 🧪 **6. Test Case Scenario (Untuk QA Akhir)**

Salin ini ke sheet / dokumen test manual nanti:

| # | Scenario Test | Expected Result | Status |
|---|--------------|-----------------|--------|
| 1 | Buka `/order` tanpa parameter | Redirect ke `/order/step-1-service` | ⬜ |
| 2 | Buka `/order/step-1-service?category=seo` | Category SEO auto terpilih, list paket SEO muncul | ⬜ |
| 3 | Klik tombol "Pilih Paket" di homepage Pricing Section | Langsung masuk step-1 dengan category terpilih, paket terlihat | ⬜ |
| 4 | Step 1 belum pilih paket → klik "Selanjutnya" | Muncul error toast / alert "Pilih paket terlebih dahulu", tidak pindah step | ⬜ |
| 5 | Step 2 (category = Web) belum pilih template → Selanjutnya | Error "Pilih template terlebih dahulu" | ⬜ |
| 6 | Step 2 (category = SEO) isi scope → Selanjutnya | Berhasil pindah ke step 3 | ⬜ |
| 7 | Step 3 input email salah (tanpa @) | Realtime error "Format email tidak valid" | ⬜ |
| 8 | Step 3 input no HP "08123456789" | Auto format jadi "628123456789" | ⬜ |
| 9 | Step 4 Pilih 2 Add-ons | Subtotal bertambah, Total bertambah sesuai harga addons | ⬜ |
| 10 | Step 4 Input promo `JOKI100` (valid) | Total berkurang Rp 100.000, label "Promo JOKI100" muncul | ⬜ |
| 11 | Step 4 Input promo `SALAHKODE` | Error "Kode promo tidak valid atau sudah kadaluarsa" | ⬜ |
| 12 | Step 4 Pilih "Transfer BCA" → Upload bukti transfer → Submit | ✅ Order tersimpan di Firestore `orders/`, ✅ Bukti ada di Storage, ✅ Redirect ke success page, ✅ (Jika WA API) Notif WA terkirim | ⬜ |
| 13 | Buka Admin Panel → Orders | Order yang baru dibuat muncul di list dengan status `awaiting_verification` | ⬜ |
| 14 | Admin klik "Verifikasi Pembayaran" di detail order | Status order jadi `paid`, Notif WA ke customer "Pembayaran Anda sudah diverifikasi!" | ⬜ |
| 15 | Refresh browser di tengah checkout (misal step 3) | Data step 1, 2, 3 TIDAK HILANG (karena persist ke localStorage) | ⬜ |
| 16 | Test di HP (Mobile View) | Semua step responsive, tombol gak kepotong, stepper muncul di atas | ⬜ |
| 17 | Switch bahasa dari ID → EN di tengah checkout | Semua text tombol, label, placeholder berubah ke Inggris | ⬜ |
| 18 | (Firestore Rules test) Coba edit doc `orders` dari browser Dev Tools tanpa login | Permission Denied (403) — Penting untuk security | ⬜ |

---

## 🚀 **NEXT STEP: MULAI CODING DARI FASE A + B**

Kalau semua yang di atas sudah clear, kita bisa mulai:
1. **KAMU** sambil kerjakan **TUGAS KAMU #1 (Input Firestore data) + #3 (Rekap pertanyaan scope per kategori)**
2. **DEV (GW)** mulai kerjakan **Fase A (Setup Dasar)** dan **Fase B (Step 1)** — ini sekitar 1 hari kerja

---

### ⚡ **PERTANYAAN UNTUK KAMU SEBELUM GW MULAI CODING:**
Silakan jawab 3 pertanyaan ini dulu supaya langsung jalan:
1. **Step 2 Pertanyaan Scope per Kategori:** Bisa daftarin pertanyaan apa saja untuk tiap kategori? (SEO, Google Ads, App Dev, Dashboard, Branding — selain Web Design yang pakai template)
   - Contoh: SEO = Target keywords, Target lokasi, URL website, Brief
2. **Metode Pembayaran Awal:** Pilih **MANUAL TRANSFER DULU** ya (FASE 1 - cepat go-live)? Atau kamu sudah ada akun Midtrans/Xendit dan mau langsung integrasi otomatis?
3. **No. Rekening:** Bisa kasih daftar Bank + No. Rek + Atas Nama untuk ditampilkan di step 4 nanti? (Bisa kirim terpisah via WA kalau mau privasi — nanti tinggal gw masukin ke `.env.local` doang)

Jawab yang 3 ini dulu ya, abis itu gw langsung mulai code Fase A! 🔥

---

## 🛡️ **APPENDIX A: Firestore Security Rules (WAJIB SETELAH SEEDING SELESAI!)**

JANGAN biarkan rules `allow read, write: if true;` lebih dari beberapa jam. Itu artinya **SEMUA ORANG di internet bisa baca, edit, hapus SEMUA data di database kamu** (termasuk order, paket, customer data). Bahkan bot scraping bisa langsung hapus semua datamu dalam 1 detik.

---

### 🟡 **MODE DEVELOPMENT / SEEDING SEMENTARA (GUNAKAN HANYA SAAT TESTING)**

Copy paste ke Firebase Console → Firestore Database → Rules → Publish. HANYA untuk mode development. JANGAN di-production!

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ⚠️ DEVELOPMENT ONLY - HAPUS BAGIAN INI SEBELUM GO-LIVE
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

### 🔴 **MODE PRODUCTION AMAN REKOMENDASI (GUNAKAN INI SEBELUM ADA USER NYATA)**

Ini rules production mengikuti best practice security by design. Penjelasan per bagian ada di bawah:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================================
    // HELPER FUNCTIONS (reusable logic)
    // ============================================================

    // True jika user SUDAH LOGIN (pakai Firebase Auth)
    function isSignedIn() {
      return request.auth != null;
    }

    // True jika user yang login TERCATAT di collection "admins"
    // (Kita buat collection admins nanti, atau cek hardcoded UID adminmu di bawah)
    function isAdmin() {
      return isSignedIn() && request.auth.uid in [
        // MASUKKAN UID ADMIN KAMU DI SINI.
        // Cara dapatkan UID: Firebase Console → Authentication → Users → Copy UID kolom UID
        // Contoh: "uidAdminAdam123abc",
        //          "uidAdminKeduaXYZ789"
      ];
    }

    // True jika email request.auth.email sudah terverifikasi
    function emailVerified() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    // Get current server timestamp (pembandingan waktu)
    function now() {
      return request.time;
    }

    // ============================================================
    // 1. PUBLIC COLLECTIONS (BISA DIBACA SIAPAPUN, TIDAK BISA DI EDIT)
    //    Ini untuk data yang ditampilkan di landing page / halaman publik
    // ============================================================
    match /services/{document=**} {
      allow read: if true;               // Siapapun bisa baca
      allow write: if isAdmin();         // Hanya admin yang bisa create/update/delete
    }

    match /packages/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /articles/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /templates/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /addons/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /promo_codes/{code} {
      // READ: boleh user terdaftar atau admin (untuk validasi kode promo)
      allow read: if isSignedIn() || isAdmin();
      // WRITE: Hanya admin yang bisa create/update/delete kode promo
      allow create, update, delete: if isAdmin();
      // VALIDASI: Saat user apply promo, hanya boleh INCREMENT usedCount +1
      // (ini optional jika kita increment via Admin SDK / trusted env saja)
      allow update: if isAdmin() || (
        isSignedIn() &&
        request.resource.data.usedCount is int &&
        request.resource.data.usedCount == resource.data.usedCount + 1 &&
        // user tidak boleh ganti field lain selain usedCount
        request.resource.data.keys().difference(resource.data.keys()).size() == 0
      );
    }

    // ============================================================
    // 2. ORDERS (SANGAT SENSITIF - DATA CUSTOMER DAN PEMBAYARAN)
    // ============================================================
    match /orders/{orderId} {
      // CREATE: Boleh siapapun (bahkan guest). Nanti kita validate via code juga
      // Tapi idealnya: isSignedIn() ATAU email + no HP diisi
      allow create: if true;   // Atau jika mau strict: isSignedIn() || request.resource.data.customerData.email is string;

      // READ: Hanya PEMILIK ORDER ATAU ADMIN yang boleh baca
      // Kita cocokkan UID jika user login, atau cocokkan email
      allow read: if isAdmin() || (
        isSignedIn() && request.auth.uid == resource.data.customerId
      ) || (
        // Fallback untuk guest order: cocokkan email di request dengan email di order
        request.resource.data.customerData.email is string &&
        resource.data.customerData.email == request.resource.data.customerData.email
      );

      // UPDATE (Kecuali status): Hanya owner atau admin
      allow update: if isAdmin() || (
        isSignedIn() && request.auth.uid == resource.data.customerId &&
        // Customer HANYA BOLEH update paymentProofUrl / upload bukti bayar, TIDAK BOLEH UBAH HARGA / STATUS
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(["paymentProofUrl", "paymentProofUploadedAt"])
      );

      // DELETE: Hanya admin
      allow delete: if isAdmin();
    }

    // ============================================================
    // 3. PAYMENTS (LOG PEMBAYARAN - IMMUTABLE KECUALI ADMIN)
    // ============================================================
    match /payments/{paymentId} {
      allow read: if isAdmin() || (
        isSignedIn() && exists(/databases/$(database)/documents/orders/$(resource.data.orderId)) &&
        get(/databases/$(database)/documents/orders/$(resource.data.orderId)).data.customerId == request.auth.uid
      );
      allow create: if isAdmin() || isSignedIn(); // Create boleh saat checkout
      allow update, delete: if isAdmin(); // Cuma admin yang bisa edit status pembayaran
    }

    // ============================================================
    // 4. STORAGE SECURITY RULES (TAMBAHAN DI FIREBASE CONSOLE → STORAGE → RULES)
    //    (saya cantumkan di sini biar kumpul semua)
    // ============================================================
    // rules_version = '2';
    // service firebase.storage {
    //   match /b/{bucket}/o {
    //     match /payments/{orderId}/{allPaths=**} {
    //       allow read: if isAdmin() || request.auth.uid == orderId; // cuma contoh, sesuaikan
    //       allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024 &&
    //                      request.resource.contentType.matches('image/.*|application/pdf');
    //     }
    //     match /public/{allPaths=**} {
    //       allow read: if true;
    //       allow write: if isAdmin();
    //     }
    //   }
    // }

    // ============================================================
    // 5. ADMINS COLLECTION (UNTUK ROLE ADMIN - opsional)
    // ============================================================
    match /admins/{adminDoc} {
      allow read, write: if isAdmin();
    }

    // ============================================================
    // 6. CATCH-ALL: DENY EVERYTHING ELSE (DEFAULT: TIDAK ADA AKSES!)
    //    Inilah yang membuat rules KETAT. Tidak ada akses tanpa explicit allow.
    // ============================================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 📋 **Cara Implementasi Rules dengan Aman (Step by Step):**

1. **Pertama:** Pakai MODE DEVELOPMENT dulu → Jalankan `seedCollections.mjs` + `seedSampleOrders.mjs` → SELESAI.
2. **Kedua:** Buat user admin di Firebase Console → Authentication → Users → Add User.
3. **Ketiga:** Copy UID admin yang baru dibuat (di kolom **User UID** di Authentication → Users).
4. **Keempat:** Paste UID admin ke dalam rules function `isAdmin()` di atas (ganti komentar `// MASUKKAN UID ADMIN KAMU DI SINI`).
   - Kalau kamu punya 2 admin, masukkan keduanya dalam array (pisahkan koma).
5. **Kelima:** Copy seluruh MODE PRODUCTION AMAN → paste ke Rules → Publish.
6. **Keenam (TEST):**
   - Buka website di mode Incognito (tidak login) → Tes baca list layanan & paket → **HARUS BISA** ✅
   - Tes upload bukti transfer di checkout → **HARUS BISA** ✅
   - Tes create order manual dari console client tanpa login → **Cek field readonly**
   - Tes login dengan user biasa (bukan admin) → Tes buka URL `/admin/manage-packages` → **HARUS DI BLOCK / redirect** ✅
   - Tes login dengan user admin → **BISA akses semua fitur admin** ✅

---

### 💡 **Catatan Keamanan Tambahan:**

1. **Jangan pernah hardcode Admin UID di FRONTEND / client code.**
   - Check isAdmin LEBIH BAIK via backend / Firestore rules. Client-side flag `isAdmin` di localStorage bisa di-edit user via DevTools.
2. **Untuk Admin Panel Authentication:**
   - Pastikan halaman `/admin/*` hanya bisa diakses jika `auth.currentUser` ada dan UID-nya ada di daftar UID Admin.
   - Di setiap `page.js` / route admin, cek di server-side atau wrap dengan component `ProtectedAdminRoute`.
3. **Environment variables:**
   - Jangan commit `.env.local` ke Git. File ini sudah di-ignore via `.gitignore:34` (.env*).
   - Untuk production (Vercel), masukkan env variables via Vercel Dashboard → Project Settings → Environment Variables.
4. **Rate limiting:**
   - Nanti jika ada abuse (script spam buat order 1000x), pakai Firebase App Check (integrasi bawaan, free) untuk validate request beneran dari app kamu, bukan bot/cURL.

---
