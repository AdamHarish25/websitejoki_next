import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

console.log("🧪 Loading sample ORDER/Payments seed script...\n");

// ==============================================
// LOAD ENV FILE OTOMATIS (.env.local ATAU .env)
// ==============================================
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const possibleEnvPaths = [
  resolve(PROJECT_ROOT, ".env.local"),
  resolve(PROJECT_ROOT, ".env")
];

let loadedEnvPath = null;
for (const envPath of possibleEnvPaths) {
  if (existsSync(envPath)) {
    try {
      const raw = readFileSync(envPath, "utf8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        let key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) {
          process.env[key] = val;
        }
      }
      loadedEnvPath = envPath;
      console.log(`✅ Loaded config from: ${envPath.replace(PROJECT_ROOT + "/", "")}`);
      break;
    } catch (err) {
      console.warn(`⚠️  Gagal baca ${envPath}: ${err.message}`);
    }
  }
}

if (!loadedEnvPath) {
  console.error("❌ [ERROR] Tidak menemukan file .env.local atau .env di root project!");
  console.log("\n👉 Jalankan dulu script seedCollections.mjs (yang ada .env.local.example) dan isi confignya!");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v || v.startsWith("isi_dengan_"))
  .map(([k]) => k);
if (missingKeys.length > 0) {
  console.error(`\n❌ [ERROR] Ada ${missingKeys.length} Firebase config yang belum diisi: ${missingKeys.join(", ")}`);
  console.log(`\n👉 Buka file ${loadedEnvPath.replace(PROJECT_ROOT + "/", "")} dan pastikan SEMUA value terisi.`);
  process.exit(1);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// ==============================================
// FIREBASE AUTH LOGIN (DIPERLUKAN JIKA FIRESTORE RULES TIDAK OPEN)
// ==============================================
const adminEmail = process.env.SEED_ADMIN_EMAIL || "";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "";

async function ensureAuthenticated() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`✅ Sudah login sebagai: ${user.email} (UID: ${user.uid})`);
        unsubscribe();
        resolve(user);
      } else {
        unsubscribe();
        resolve(null);
      }
    });
  });
}

async function attemptLogin() {
  if (!adminEmail || !adminPassword) {
    console.log("ℹ️  Auth credentials tidak ada di env.");
    console.log("   Jika seeding gagal (PERMISSION_DENIED):");
    console.log("   🟢 CEPAT: Set Firestore Rules open sementara (allow read, write: if true;). Lihat CHECKOUT_PLANNING.md");
    console.log("   🔵 AMAN: Tambah SEED_ADMIN_EMAIL & SEED_ADMIN_PASSWORD ke .env.local (user admin yang dibuat di Auth Console)\n");
    return null;
  }
  console.log(`🔐 Login sebagai admin: ${adminEmail}...`);
  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log(`✅ Login sukses! UID: ${cred.user.uid}`);
    return cred.user;
  } catch (err) {
    console.error(`❌ Login GAGAL [${err.code}]: ${err.message}`);
    console.log("   Atau set rules open sementara (opsi cepat).");
    process.exit(1);
  }
}

function generateOrderId(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ORDER-${y}${m}${d}-${rand}`;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date();

// ==============================================
// SAMPLE ORDERS - UNTUK TESTING ADMIN PANEL
// ==============================================
const SAMPLE_ORDERS = [
  // ============ 1. STATUS: COMPLETED (SUKSES) ============
  {
    status: "completed",
    serviceCategory: "web",
    packageSnapshot: {
      id: "pkg_web_bisnis",
      name: "Paket Website Bisnis",
      nameEn: "Business Website Package",
      price: 1500000,
      category: "web",
      features: [
        "5 Halaman Profesional",
        "Responsive Desktop + Mobile",
        "SEO Onpage Dasar",
        "Admin Panel Edit Konten",
        "Free Domain 1 Tahun",
        "Free Hosting 1 Tahun"
      ]
    },
    orderType: "template",
    templateSnapshot: {
      id: "tpl_global",
      name: "Global Company - Company Profile",
      category: "company-profile",
      thumbnailUrl: "https://res.cloudinary.com/dxpuz7mha/image/upload/templates/global-company.jpg",
      previewUrl: "https://demo.websitejoki.my.id/global-company",
      tier: "basic"
    },
    customerData: {
      fullName: "Dewi Lestari",
      email: "dewi.lestari@tokosembakosumbermakmur.com",
      phone: "6281312345678",
      companyName: "Toko Sembako Sumber Makmur",
      companyWebsite: "https://tokosembakosumbermakmur.com",
      specialNotes:
        "Tolong warnanya hijau tosca, sama seperti logo toko. Halaman produk diisi 10 barang unggulan saya. Deadline 10 hari ya, mau dipakai untuk promosi bulan Ramadhan."
    },
    selectedAddons: [
      {
        addonId: "addon_ga4",
        name: "Setup Google Analytics 4 + GTM",
        price: 250000
      },
      {
        addonId: "addon_wa_float",
        name: "WhatsApp Floating + Popup Widget",
        price: 150000
      }
    ],
    promoCode: "GRANDOPENING10",
    promoDiscount: 190000,
    subtotal: 1900000,
    totalAmount: 1710000,
    paymentMethod: "transfer_bca",
    paymentProofUrl:
      "https://firebasestorage.googleapis.com/v0/b/demo-sample.appspot.com/o/orders%2Fbukti-dewi.png?alt=media",
    createdAtOffsetMs: -45 * DAY,
    statusHistory: [
      { status: "pending", at: -45 * DAY },
      { status: "awaiting_payment", at: -45 * DAY + 2 * HOUR },
      { status: "paid", at: -44 * DAY },
      { status: "in_progress", at: -43 * DAY },
      { status: "completed", at: -35 * DAY }
    ],
    assignedTo: "Admin Adam",
    adminNotes:
      "Client sangat puas. Request minor update konten bulan depan. Potensial repeat order untuk usaha kulinernya yang lain.",
    projectDeadlineOffsetMs: -38 * DAY,
    deliverablesUrls: [
      { name: "Website Live", url: "https://tokosembakosumbermakmur.com" },
      { name: "Akses Admin Panel", url: "https://tokosembakosumbermakmur.com/admin" },
      { name: "Laporan SEO Bulan 1", url: "#" }
    ],
    customerId: uuidv4()
  },

  // ============ 2. STATUS: IN_PROGRESS (SEDANG DIKERJAKAN) ============
  {
    status: "in_progress",
    serviceCategory: "seo",
    packageSnapshot: {
      id: "pkg_seo_enterprise",
      name: "Paket SEO Enterprise",
      nameEn: "Enterprise SEO Package",
      price: 3500000,
      category: "seo",
      pricePeriod: "per bulan",
      features: [
        "50 Keyword Target (nasional)",
        "Onpage + Offpage SEO Full",
        "Content Writing 8 artikel/bulan",
        "Backlink Authority 50+ DA",
        "Laporan bulanan + meeting rutin",
        "Google Business Profile Optimization"
      ]
    },
    orderType: "custom_scope",
    scopeData: {
      targetKeywords: [
        "jasa bangun rumah bandung",
        "kontraktor gedung bandung",
        "interior design bandung",
        "renovasi rumah bandung",
        "harga bangun rumah per meter 2026"
      ],
      targetLocation: "Bandung, Jawa Barat (nasional untuk project besar)",
      numberOfCampaigns: 4,
      projectBrief:
        "Client adalah PT Konstruksi Bandung Jaya. Sudah punya website tapi tidak pernah muncul di Google. Target minimal 10 keyword masuk page 1 Google dalam 3 bulan. Perusahaan bergerak di konstruksi, renovasi, dan interior."
    },
    customerData: {
      fullName: "Rizky Pratama",
      email: "rizky@konstruksibandungjaya.com",
      phone: "6282298765432",
      companyName: "PT Konstruksi Bandung Jaya",
      companyWebsite: "https://konstruksibandungjaya.com",
      specialNotes:
        "Mohon fokus untuk keyword jasa konstruksi dan renovasi rumah dulu. Jangan lupa optimasi Google Maps supaya muncul di Google Business Profile."
    },
    selectedAddons: [
      {
        addonId: "addon_content",
        name: "Content Writing 10 Artikel SEO",
        price: 750000
      }
    ],
    promoCode: "",
    promoDiscount: 0,
    subtotal: 4250000,
    totalAmount: 4250000,
    paymentMethod: "transfer_mandiri",
    paymentProofUrl:
      "https://firebasestorage.googleapis.com/v0/b/demo-sample.appspot.com/o/orders%2Fbukti-rizky.png?alt=media",
    createdAtOffsetMs: -10 * DAY,
    statusHistory: [
      { status: "pending", at: -10 * DAY },
      { status: "awaiting_payment", at: -10 * DAY + 1 * HOUR },
      { status: "paid", at: -9 * DAY - 4 * HOUR },
      { status: "in_progress", at: -8 * DAY }
    ],
    assignedTo: "SEO Specialist Ari",
    adminNotes:
      "Riset keyword selesai. Minggu ini fokus onpage optimasi. Sudah request akses GA4 dan Search Console ke client (menunggu balasan WA).",
    projectDeadlineOffsetMs: 80 * DAY,
    deliverablesUrls: [
      { name: "Riset Keyword Report", url: "#" },
      { name: "Onpage Checklist Progress", url: "#" }
    ],
    customerId: uuidv4()
  },

  // ============ 3. STATUS: AWAITING_PAYMENT (MENUNGGU TRANSFER) ============
  {
    status: "awaiting_payment",
    serviceCategory: "ads",
    packageSnapshot: {
      id: "pkg_ads_starter",
      name: "Paket Google Ads Starter",
      nameEn: "Google Ads Starter Package",
      price: 1500000,
      category: "ads",
      pricePeriod: "belum termasuk budget iklan",
      features: [
        "2 Campaign Google Search Ads",
        "Riset keyword + negative keywords",
        "A/B Testing ad copy + extension",
        "Laporan harian via dashboard",
        "Optimasi harian",
        "Budget iklan mulai 1jt/bulan (ke Google)"
      ]
    },
    orderType: "custom_scope",
    scopeData: {
      targetKeywords: [
        "jual solar panel surabaya",
        "jual inverter surabaya",
        "paket plts rumah 1000 watt"
      ],
      targetLocation: "Surabaya & Jawa Timur",
      numberOfCampaigns: 2,
      projectBrief:
        "Toko Jual Panel Surya di Surabaya. Budget iklan Rp 1.500.000 / bulan. Target 50 leads per bulan (call/WA). Ada landing page, tinggal optimasi."
    },
    customerData: {
      fullName: "Hendra Wijaya",
      email: "hendra@energimatahari.co.id",
      phone: "6285101010202",
      companyName: "CV Energi Matahari Indonesia",
      companyWebsite: "https://energimatahari.co.id",
      specialNotes:
        "Budget iklan sudah ready. Tolong mulai secepatnya ya, banyak kompetitor di Jawa Timur."
    },
    selectedAddons: [
      {
        addonId: "addon_extra_ads_campaign",
        name: "Extra Google Ads Campaign +2",
        price: 400000
      }
    ],
    promoCode: "JOKI100",
    promoDiscount: 100000,
    subtotal: 1900000,
    totalAmount: 1800000,
    paymentMethod: "qris",
    paymentProofUrl: null,
    createdAtOffsetMs: -5 * HOUR,
    statusHistory: [{ status: "awaiting_payment", at: -5 * HOUR }],
    assignedTo: null,
    adminNotes: "Menunggu bukti transfer QRIS. Follow up WA 1x/hari sampai bayar.",
    projectDeadlineOffsetMs: 50 * DAY,
    deliverablesUrls: [],
    customerId: uuidv4()
  },

  // ============ 4. STATUS: PAID (BARU BAYAR, BELUM DIPROSES) ============
  {
    status: "paid",
    serviceCategory: "app",
    packageSnapshot: {
      id: "pkg_app_bisnis",
      name: "Paket Aplikasi Android Bisnis",
      nameEn: "Android Business App Package",
      price: 8500000,
      category: "app",
      features: [
        "Aplikasi Android Native (Kotlin)",
        "5 Fitur Core (Login, Home, List Produk, Cart, Checkout)",
        "Backend Admin Panel (PHP Laravel)",
        "Database MySQL + API",
        "Integrasi Midtrans Payment",
        "Upload ke Play Store (client punya akun)",
        "3x Revisi",
        "Support bug fix 1 bulan"
      ]
    },
    orderType: "custom_scope",
    scopeData: {
      targetKeywords: ["aplikasi toko kelontong", "kasir android"],
      targetLocation: "Seluruh Indonesia",
      numberOfCampaigns: 1,
      projectBrief:
        "Aplikasi kasir sederhana untuk toko kelontong. Fitur: Scan barcode produk, catat penjualan, laporan harian/mingguan/bulanan, cetak struk via Bluetooth printer. Target user pemilik toko kelontong di Jabodetabek."
    },
    customerData: {
      fullName: "Farhan Maulana",
      email: "farhan@mabarkoding.id",
      phone: "6281700009999",
      companyName: "CV Mabar Koding",
      companyWebsite: "",
      specialNotes:
        "Untuk desain UI mau yang simple dan mirip aplikasi Bukalapak. Warna biru navy + orange. Pengguna pertama adalah toko-toko yang sudah jadi client saya. Deadline 2 bulan ya."
    },
    selectedAddons: [],
    promoCode: "LAUNCHAPP200",
    promoDiscount: 200000,
    subtotal: 8500000,
    totalAmount: 8300000,
    paymentMethod: "transfer_bni",
    paymentProofUrl:
      "https://firebasestorage.googleapis.com/v0/b/demo-sample.appspot.com/o/orders%2Fbukti-farhan.jpg?alt=media",
    createdAtOffsetMs: -1 * DAY,
    statusHistory: [
      { status: "pending", at: -1 * DAY },
      { status: "paid", at: -20 * HOUR }
    ],
    assignedTo: "Lead Dev Gilang",
    adminNotes:
      "Pembayaran diverifikasi. Jadwalkan kickoff meeting via Zoom besok Senin pagi untuk bahas wireframe + timeline detail. Minta UI/UX designer buat mockup 3 hari.",
    projectDeadlineOffsetMs: 60 * DAY,
    deliverablesUrls: [],
    customerId: uuidv4()
  },

  // ============ 5. STATUS: CANCELLED (DIBATALKAN) ============
  {
    status: "cancelled",
    serviceCategory: "brand",
    packageSnapshot: {
      id: "pkg_brand_standard",
      name: "Paket Branding Standard",
      nameEn: "Standard Branding Package",
      price: 1800000,
      category: "brand",
      features: [
        "3 Konsep Logo Design (revisi 3x)",
        "Brand Guideline (warna, tipografi, do/dont)",
        "File master (AI, EPS, SVG, PNG transparent)",
        "Mockup 10 Item (kartu nama, kop surat, amplop, map, stiker, nota, polo shirt, mug, ID card, signage)",
        "Hak Cipta Logo (Proses DJKI)"
      ]
    },
    orderType: "custom_scope",
    scopeData: {
      targetKeywords: [],
      targetLocation: "Jakarta Selatan",
      numberOfCampaigns: 0,
      projectBrief:
        "Branding untuk startup minuman sehat (cold pressed juice). Nama brand: 'SehatPress'. Vibe segar, muda, eco-friendly. Target usia 20-35 tahun, kelas menengah ke atas di Jakarta."
    },
    customerData: {
      fullName: "Andini Putri",
      email: "andini.putri@sehatpress.com",
      phone: "6281211112233",
      companyName: "SehatPress Indonesia",
      companyWebsite: "",
      specialNotes:
        "Mau warnanya didominasi hijau muda + kuning lemon. Logo tidak terlalu formal."
    },
    selectedAddons: [
      {
        addonId: "addon_logo",
        name: "Desain Logo Profesional",
        price: 450000
      }
    ],
    promoCode: "BRANDING50",
    promoDiscount: 337500,
    subtotal: 2250000,
    totalAmount: 1912500,
    paymentMethod: "ewallet_gopay",
    paymentProofUrl: null,
    createdAtOffsetMs: -3 * DAY,
    statusHistory: [
      { status: "awaiting_payment", at: -3 * DAY },
      { status: "cancelled", at: -6 * HOUR }
    ],
    assignedTo: null,
    adminNotes:
      "Cancel karena menunda modal usaha. Follow up 1 bulan lagi. Potensial balik Q4 tahun ini.",
    projectDeadlineOffsetMs: 40 * DAY,
    deliverablesUrls: [],
    customerId: uuidv4()
  }
];

async function seedSampleOrders() {
  console.log(`\n🧪 Seeding ${SAMPLE_ORDERS.length} SAMPLE ORDERS...`);
  const refs = [];

  for (const sample of SAMPLE_ORDERS) {
    const createdAt = new Date(now.getTime() + (sample.createdAtOffsetMs || 0));
    const orderId = generateOrderId(createdAt);
    const expiry = new Date(createdAt.getTime() + 24 * HOUR);
    const projectDeadline = sample.projectDeadlineOffsetMs
      ? new Date(now.getTime() + sample.projectDeadlineOffsetMs)
      : null;

    const statusHistory = (sample.statusHistory || []).map(sh => ({
      status: sh.status,
      at: new Date(now.getTime() + sh.at)
    }));

    const orderData = {
      orderId,
      createdAt,
      updatedAt: new Date(),
      status: sample.status,
      serviceCategory: sample.serviceCategory,
      packageId: sample.packageSnapshot?.id || "",
      packageSnapshot: sample.packageSnapshot,
      orderType: sample.orderType,
      templateId: sample.templateSnapshot?.id || "",
      templateSnapshot: sample.templateSnapshot || null,
      scopeData: sample.scopeData || null,
      customerData: sample.customerData,
      selectedAddons: sample.selectedAddons || [],
      promoCode: sample.promoCode || "",
      promoDiscount: sample.promoDiscount || 0,
      subtotal: sample.subtotal,
      totalAmount: sample.totalAmount,
      paymentMethod: sample.paymentMethod,
      paymentProofUrl: sample.paymentProofUrl,
      paymentProofUploadedAt: sample.paymentProofUrl ? new Date(createdAt.getTime() + 3 * HOUR) : null,
      paymentExpiryAt: expiry,
      paymentGatewayRef: null,
      assignedTo: sample.assignedTo,
      adminNotes: sample.adminNotes || "",
      adminTags: [],
      projectDeadline,
      deliverablesUrls: sample.deliverablesUrls || [],
      statusHistory,
      customerId: sample.customerId
    };

    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: createdAt,
      updatedAt: new Date(),
      paymentExpiryAt: expiry,
      projectDeadline: projectDeadline || null
    });
    refs.push(docRef.id);

    // Simulasikan entry payment log
    await addDoc(collection(db, "payments"), {
      orderId: docRef.id,
      orderHumanId: orderId,
      amount: sample.totalAmount,
      method: sample.paymentMethod,
      status:
        sample.status === "paid" || sample.status === "in_progress" || sample.status === "completed"
          ? "success"
          : sample.status === "cancelled"
          ? "cancelled"
          : "pending",
      transactionRef:
        sample.status === "paid" || sample.status === "in_progress" || sample.status === "completed"
          ? `MANUAL-VERIFIED-${docRef.id.substring(0, 8).toUpperCase()}`
          : null,
      verifiedBy:
        sample.status === "paid" || sample.status === "in_progress" || sample.status === "completed"
          ? "Admin Adam"
          : null,
      verifiedAt:
        sample.status === "paid" || sample.status === "in_progress" || sample.status === "completed"
          ? new Date(createdAt.getTime() + 6 * HOUR)
          : null,
      notes: sample.status === "cancelled" ? "Order dibatalkan - customer menunda pembayaran." : "Sample data seeder",
      createdAt: new Date(createdAt.getTime() + 2 * HOUR)
    });

    const line = [
      `  ✅ Order: ${orderId}`,
      `[${sample.status.toUpperCase().padEnd(16, " ")}]`,
      `Rp ${sample.totalAmount.toLocaleString("id-ID").padStart(10, " ")}`,
      `- ${sample.customerData.fullName}`,
      `(${sample.serviceCategory.toUpperCase()})`
    ].join(" ");
    console.log(line);
  }

  return refs;
}

async function main() {
  console.log("\n🚀 [START] Seed SAMPLE ORDERS (untuk testing Admin Panel)...\n");
  console.log(`Project ID: ${firebaseConfig.projectId}`);
  console.log("⚠️  WARNING: Ini akan menambah ORDER PALSU ke database PRODUKSI jika configmu sudah prod. Pastikan pakai Firebase project DEV!");
  console.log("====================================================\n");

  await ensureAuthenticated();
  await attemptLogin();

  try {
    const orderIds = await seedSampleOrders();
    console.log("\n====================================================");
    console.log("🎉 [SELESAI] Sample orders berhasil dibuat!");
    console.log("   🧾 Total Orders  :", orderIds.length, "order");
    console.log("\n👉 Buka Admin Panel -> Orders untuk melihat listnya.");
    console.log("👉 Kalau mau reset: Hapus semua doc di collection 'orders' dan 'payments' lalu run script ulang.");
    try { await signOut(auth); } catch (_) { /* ignore */ }
    process.exit(0);
  } catch (err) {
    if (err?.code === "permission-denied") {
      console.error("\n❌ [PERMISSION_DENIED] Firestore Security Rules menolak akses.");
      console.log("   SOLUSI: Set rules open sementara atau login admin (lihat panduan di atas).");
    } else {
      console.error("\n❌ [ERROR] Seeding gagal:", err);
    }
    try { await signOut(auth); } catch (_) { /* ignore */ }
    process.exit(1);
  }
}

main();
