import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

console.log("🔥 Loading seed script...\n");

// ==============================================
// LOAD ENV FILE OTOMATIS (.env.local ATAU .env)
// ==============================================
// Script ini sendirian yang handle baca file .env.local,
// jadi TIDAK PERLU install package dotenv / param CLI tambahan.
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
  console.log("");
  console.log("👉 LAKUKAN LANGKAH INI DULU:");
  console.log("   1. Copy file '.env.local.example' jadi '.env.local'");
  console.log("   2. Buka '.env.local' dengan text editor");
  console.log("   3. Isi semua value NEXT_PUBLIC_FIREBASE_* sesuai Firebase Console-mu");
  console.log("      (Firebase Console -> ⚙️ Project Settings -> Your Apps -> SDK Setup -> Config)");
  console.log("   4. Simpan file, lalu run ulang script ini.");
  console.log("");
  process.exit(1);
}

// ==============================================
// CONFIG FIREBASE (COPY DARI lib/firebaseConfig.js)
// ==============================================
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
  console.log(`\n👉 Buka file ${loadedEnvPath.replace(PROJECT_ROOT + "/", "")} dan pastikan SEMUA value terisi dengan benar.`);
  console.log("   Tips: Value yang benar bentuknya random panjang, BUKAN kalimat 'isi_dengan_...'.");
  process.exit(1);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// ==============================================
// FIREBASE AUTH LOGIN (DIPERLUKAN JIKA FIRESTORE RULES TIDAK OPEN)
// ==============================================
// Baca credential admin dari env:
//   SEED_ADMIN_EMAIL=admin@websitejoki.my.id
//   SEED_ADMIN_PASSWORD=passwordSuperAnda123
//
// Jika tidak ada di env, script kasih peringatan & panduan cara pakai quick fix rules
// ==============================================
const adminEmail = process.env.SEED_ADMIN_EMAIL || "";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "";

async function ensureAuthenticated() {
  return new Promise((resolve, reject) => {
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
    console.log("ℹ️  Auth credentials TIDAK ADA di env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).");
    console.log("   Jika seeding masih gagal karena PERMISSION_DENIED, kamu punya 2 OPSI:");
    console.log("");
    console.log("   🟢 OPSI 1 (CEPAT - DISARANKAN UNTUK SEED SEKALI INI):");
    console.log("      1. Buka Firebase Console → Firestore Database → Rules");
    console.log("      2. Ganti isinya dengan rules dibawah ini, lalu PUBLISH:");
    console.log("");
    console.log("         rules_version = '2';");
    console.log("         service cloud.firestore {");
    console.log("           match /databases/{database}/documents {");
    console.log("             match /{document=**} {");
    console.log("               allow read, write: if true;");
    console.log("             }");
    console.log("           }");
    console.log("         }");
    console.log("");
    console.log("      ⚠️  PENTING: Setelah SEEDING BERHASIL, KEMBALIKAN RULES KE VERSI AMAN!");
    console.log("         (Ada template rules production aman di CHECKOUT_PLANNING.md)");
    console.log("");
    console.log("   🔵 OPSI 2 (LEBIH AMAN - UNTUK PEMAKAIAN BERULANG):");
    console.log("      1. Buka Firebase Console → Authentication → Sign-in method → Enable 'Email/Password'");
    console.log("      2. Klik tab 'Users' → Add user → Buat user admin:");
    console.log("         Email: admin@websitejoki.my.id");
    console.log("         Password: Buat password yang kuat (min 6 char)");
    console.log("      3. Tambahkan 2 line INI KE FILE .env.local:");
    console.log("         SEED_ADMIN_EMAIL=admin@websitejoki.my.id");
    console.log("         SEED_ADMIN_PASSWORD=passwordKamuYangDibuatTadi");
    console.log("      4. Simpan .env.local → run ulang script ini.");
    console.log("");
    console.log("   Melanjutkan tanpa login... (jika rules masih default, akan error PERMISSION_DENIED)\n");
    return null;
  }

  console.log(`🔐 Login sebagai admin: ${adminEmail}...`);
  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log(`✅ Login sukses! UID: ${cred.user.uid}`);
    return cred.user;
  } catch (err) {
    const msg =
      err.code === "auth/user-not-found"
        ? "User admin TIDAK DITEMUKAN. Buat dulu user di Firebase Console → Authentication → Users → Add User, lalu pastikan email/password sama dengan env SEED_ADMIN_EMAIL/PASSWORD."
        : err.code === "auth/wrong-password"
        ? "PASSWORD SALAH. Cek ulang SEED_ADMIN_PASSWORD di .env.local."
        : err.code === "auth/invalid-email"
        ? "Format email tidak valid."
        : `${err.code}: ${err.message}`;
    console.error(`❌ Login GAGAL: ${msg}`);
    console.log("   Atau gunakan OPSI 1 (set rules open sementara) di atas untuk seeding cepat.");
    process.exit(1);
  }
}

// ==============================================
// SAMPLE DATA - SILAHKAN SESUAIKAN SEPERTI KEBUTUHANMU
// ==============================================

// ------------------------------------------------
// 1. TEMPLATES (Template Web Design - bisa WP gratis, dll)
// ------------------------------------------------
const TEMPLATES = [
  {
    name: "Startup Agency - Landing Page Jasa",
    nameEn: "Startup Agency - Service Landing Page",
    category: "landing-page",
    thumbnailUrl: "/templates/startup-agency.jpg",
    previewUrl: "https://demo.websitejoki.my.id/startup-agency",
    features: [
      "Hero dengan CTA utama & testimoni",
      "Section layanan + paket harga",
      "Portofolio 6 project showcase",
      "Form kontak terintegrasi WhatsApp",
      "Responsive Desktop + Mobile + SEO Ready"
    ],
    featuresEn: [
      "Hero with main CTA & testimonials",
      "Service section + pricing packages",
      "6 Project portfolio showcase",
      "Contact form integrated with WhatsApp",
      "Responsive + Mobile + SEO Ready"
    ],
    isPremium: false,
    tier: "basic",
    order: 1
  },
  {
    name: "Global Company - Company Profile",
    nameEn: "Global Company Profile",
    category: "company-profile",
    thumbnailUrl: "/templates/global-company.jpg",
    previewUrl: "https://demo.websitejoki.my.id/global-company",
    features: [
      "Tentang perusahaan + visi misi",
      "Direksi / tim management profile",
      "Portofolio klien & logo partner",
      "Karir / lowongan kerja (opsional)",
      "Google Maps + 3 cabang kantor"
    ],
    featuresEn: [
      "About company + vision & mission",
      "Board of directors / team profile",
      "Client portfolio & partner logos",
      "Career / job vacancies (optional)",
      "Google Maps + 3 office branches"
    ],
    isPremium: false,
    tier: "basic",
    order: 2
  },
  {
    name: "UMKM Resto & Cafe",
    nameEn: "Restaurant & Cafe UMKM",
    category: "web",
    thumbnailUrl: "/templates/resto-cafe.jpg",
    previewUrl: "https://demo.websitejoki.my.id/resto-cafe",
    features: [
      "Menu makanan & minuman (bisa update sendiri)",
      "Gallery interior & suasana resto",
      "Jam operasional + lokasi Google Maps",
      "Tombol pesan via WhatsApp otomatis",
      "Promo & testimoni pelanggan"
    ],
    featuresEn: [
      "Food & beverage menu (self-updateable)",
      "Interior gallery & ambience",
      "Opening hours + Google Maps location",
      "Order via WhatsApp auto message",
      "Promos & customer testimonials"
    ],
    isPremium: false,
    tier: "basic",
    order: 3
  },
  {
    name: "Klinik & Praktik Dokter",
    nameEn: "Clinic & Doctor Practice",
    category: "web",
    thumbnailUrl: "/templates/klinik.jpg",
    previewUrl: "https://demo.websitejoki.my.id/klinik",
    features: [
      "Profil dokter & jadwal praktik",
      "Layanan & poli yang tersedia",
      "Booking janji temu via WhatsApp",
      "Artikel kesehatan (blog)",
      "Testimoni pasien"
    ],
    featuresEn: [
      "Doctor profiles & practice schedule",
      "Services & available polyclinics",
      "Appointment booking via WhatsApp",
      "Health articles (blog)",
      "Patient testimonials"
    ],
    isPremium: true,
    tier: "pro",
    order: 4
  },
  {
    name: "Toko Online WooCommerce",
    nameEn: "WooCommerce Online Store",
    category: "ecommerce",
    thumbnailUrl: "/templates/toko-online.jpg",
    previewUrl: "https://demo.websitejoki.my.id/toko-online",
    features: [
      "Unlimited produk + kategori",
      "Keranjang belanja + checkout",
      "Pembayaran Midtrans/BCA/BNI/Gopay",
      "Stok management & invoice",
      "Ongkir otomatis RajaOngkir"
    ],
    featuresEn: [
      "Unlimited products + categories",
      "Shopping cart + checkout",
      "Midtrans/BCA/BNI/Gopay payments",
      "Stock management & invoices",
      "Auto shipping (RajaOngkir)"
    ],
    isPremium: true,
    tier: "pro",
    order: 5
  },
  {
    name: "Sekolah & Akademi",
    nameEn: "School & Academy",
    category: "web",
    thumbnailUrl: "/templates/sekolah.jpg",
    previewUrl: "https://demo.websitejoki.my.id/sekolah",
    features: [
      "Profil sekolah & fasilitas",
      "Program studi / jurusan",
      "Info PPDB / pendaftaran online",
      "Galeri kegiatan sekolah",
      "Berita & pengumuman"
    ],
    featuresEn: [
      "School profile & facilities",
      "Programs / majors",
      "PPDB / online registration info",
      "School activity gallery",
      "News & announcements"
    ],
    isPremium: false,
    tier: "basic",
    order: 6
  },
  {
    name: "Portfolio Freelancer & Creator",
    nameEn: "Freelancer & Creator Portfolio",
    category: "landing-page",
    thumbnailUrl: "/templates/portfolio-creator.jpg",
    previewUrl: "https://demo.websitejoki.my.id/portfolio-creator",
    features: [
      "About / bio personal brand",
      "Showcase project + case study",
      "Skill & stack teknologi",
      "Testimoni klien",
      "Contact & booking meeting via Calendly"
    ],
    featuresEn: [
      "About / personal brand bio",
      "Project showcase + case studies",
      "Skills & tech stack",
      "Client testimonials",
      "Contact & meeting booking via Calendly"
    ],
    isPremium: false,
    tier: "basic",
    order: 7
  },
  {
    name: "Premium Custom Agency (From Scratch)",
    nameEn: "Premium Custom Agency (From Scratch)",
    category: "web",
    thumbnailUrl: "/templates/premium-custom.jpg",
    previewUrl: "https://demo.websitejoki.my.id/custom-premium",
    features: [
      "Desain custom Figma dari nol (bukan template)",
      "Revision unlimited sampai client puas",
      "Animasi GSAP & micro-interaction",
      "Fitur custom sesuai request klien",
      "1 bulan maintenance & optimasi GRATIS"
    ],
    featuresEn: [
      "Custom Figma design from scratch (not a template)",
      "Unlimited revisions until client approval",
      "GSAP animations & micro-interactions",
      "Custom features per client request",
      "1 month FREE maintenance & optimization"
    ],
    isPremium: true,
    tier: "custom",
    order: 8
  }
];

// ------------------------------------------------
// 2. ADDONS (Layanan Tambahan)
// ------------------------------------------------
const ADDONS = [
  {
    name: "Setup Google Analytics 4 + GTM",
    nameEn: "Google Analytics 4 + GTM Setup",
    price: 250000,
    applicableCategories: ["web", "seo", "dash"],
    description:
      "Setup GA4, Google Tag Manager, Event Tracking (Klik WA, Submit Form, View Produk), dan dashboard reporting.",
    descriptionEn:
      "GA4 setup, Google Tag Manager, Event Tracking (WA Click, Form Submit, Product View), and reporting dashboard.",
    isActive: true
  },
  {
    name: "Extra 3 Halaman Tambahan",
    nameEn: "Extra 3 Additional Pages",
    price: 300000,
    applicableCategories: ["web", "brand"],
    description:
      "Penambahan 3 halaman baru di luar paket standar (misal: Halaman FAQ, Blog, Tim, Promosi, dll).",
    descriptionEn:
      "Add 3 new pages outside standard package (e.g. FAQ, Blog, Team, Promo pages, etc.).",
    isActive: true
  },
  {
    name: "Desain Logo Profesional",
    nameEn: "Professional Logo Design",
    price: 450000,
    applicableCategories: ["brand", "web"],
    description:
      "3 konsep desain logo, revisi 2x, file master (AI, PSD), + mockup stationery (kartu nama, kop surat).",
    descriptionEn:
      "3 logo design concepts, 2x revisions, master files (AI, PSD), + stationery mockup (business card, letterhead).",
    isActive: true
  },
  {
    name: "Content Writing 10 Artikel SEO",
    nameEn: "SEO Content Writing 10 Articles",
    price: 750000,
    applicableCategories: ["seo", "web"],
    description:
      "Penulisan 10 artikel berbahasa Indonesia, 500-800 kata, riset keyword, SEO friendly, anti-plagiarisme.",
    descriptionEn:
      "10 Indonesian articles, 500-800 words, keyword research, SEO optimized, anti-plagiarism.",
    isActive: true
  },
  {
    name: "WhatsApp Floating + Popup Widget",
    nameEn: "WhatsApp Floating + Popup Widget",
    price: 150000,
    applicableCategories: ["web", "landing-page", "ecommerce"],
    description:
      "Tombol WA float dengan multi-agent, popup selamat datang, auto message berdasarkan halaman yang dikunjungi.",
    descriptionEn:
      "Floating WA button with multi-agent, welcome popup, auto message based on visited page.",
    isActive: true
  },
  {
    name: "Maintenance 1 Bulan Full Support",
    nameEn: "1 Month Full Support Maintenance",
    price: 350000,
    applicableCategories: ["web", "seo", "ads", "app", "dash"],
    description:
      "Update konten, ganti gambar, minor perubahan desain, support pertanyaan, monitoring uptime website.",
    descriptionEn:
      "Content updates, image replacement, minor design tweaks, question support, website uptime monitoring.",
    isActive: true
  },
  {
    name: "Setup Email Bisnis (G Suite / Zoho)",
    nameEn: "Business Email Setup (G Suite / Zoho)",
    price: 200000,
    applicableCategories: ["web", "brand"],
    description:
      "Konfigurasi DNS, MX Record, SPF/DKIM untuk email domain sendiri (e.g. info@namabisnis.com) via Zoho Gratis / Google Workspace.",
    descriptionEn:
      "DNS configuration, MX Record, SPF/DKIM for custom domain email (e.g. info@yourbusiness.com) via Free Zoho / Google Workspace.",
    isActive: true
  },
  {
    name: "Extra Google Ads Campaign +2",
    nameEn: "Additional Google Ads Campaign +2",
    price: 400000,
    applicableCategories: ["ads"],
    description:
      "Penambahan 2 campaign baru di luar paket + riset keyword negatif + audience targeting ekstra.",
    descriptionEn:
      "Add 2 new campaigns outside the package + negative keyword research + extra audience targeting.",
    isActive: true
  }
];

// ------------------------------------------------
// 3. PROMO CODES (Kode Promo)
// doc ID = nama kodenya
// ------------------------------------------------
const PROMO_CODES = {
  JOKI100: {
    discountType: "fixed",
    discountValue: 100000,
    maxUsage: 100,
    usedCount: 0,
    minimumOrder: 500000,
    applicableCategories: [],
    validFrom: new Date("2026-09-01T00:00:00"),
    validUntil: new Date("2026-12-31T23:59:59"),
    description: "Promo Spesial Pelanggan Baru - Potongan Rp 100.000 untuk semua layanan!",
    isActive: true
  },
  GRANDOPENING10: {
    discountType: "percentage",
    discountValue: 10,
    maxUsage: 50,
    usedCount: 0,
    minimumOrder: 0,
    maxDiscount: 200000,
    applicableCategories: ["web", "seo", "ads"],
    validFrom: new Date("2026-09-01T00:00:00"),
    validUntil: new Date("2026-10-31T23:59:59"),
    description: "Grand Opening 10% OFF (maksimal potongan Rp 200.000) untuk Web, SEO, Ads!",
    isActive: true
  },
  LAUNCHAPP200: {
    discountType: "fixed",
    discountValue: 200000,
    maxUsage: 25,
    usedCount: 0,
    minimumOrder: 2000000,
    applicableCategories: ["app"],
    validFrom: new Date("2026-09-01T00:00:00"),
    validUntil: new Date("2027-03-31T23:59:59"),
    description: "Promo Aplikasi Mobile - Potongan Rp 200.000 khusus Pembuatan App!",
    isActive: true
  },
  BRANDING50: {
    discountType: "percentage",
    discountValue: 15,
    maxUsage: 30,
    usedCount: 0,
    minimumOrder: 800000,
    applicableCategories: ["brand"],
    validFrom: new Date("2026-09-01T00:00:00"),
    validUntil: new Date("2026-12-31T23:59:59"),
    description: "Paket Branding Hemat 15% OFF (Logo + Hak Cipta + Brand Guideline)!",
    isActive: true
  }
};

// ==============================================
// FUNCTION SEEDING
// ==============================================

async function seedTemplates() {
  console.log(`\n📝 Seeding ${TEMPLATES.length} templates...`);
  const refs = [];
  for (const data of TEMPLATES) {
    const docRef = await addDoc(collection(db, "templates"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✅ Template added: [${data.category}] "${data.name}" -> ID: ${docRef.id}`);
    refs.push(docRef.id);
  }
  return refs;
}

async function seedAddons() {
  console.log(`\n📝 Seeding ${ADDONS.length} addons...`);
  const refs = [];
  for (const data of ADDONS) {
    const docRef = await addDoc(collection(db, "addons"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✅ Addon added: "${data.name}" Rp ${data.price.toLocaleString("id-ID")} -> ID: ${docRef.id}`);
    refs.push(docRef.id);
  }
  return refs;
}

async function seedPromoCodes() {
  console.log(`\n📝 Seeding ${Object.keys(PROMO_CODES).length} promo codes...`);
  const refs = [];
  for (const [code, data] of Object.entries(PROMO_CODES)) {
    // Promo code uses DOC ID = kode promo (untuk lookup cepat)
    const docRef = doc(db, "promo_codes", code);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const typeLabel = data.discountType === "fixed" ? `Rp ${data.discountValue.toLocaleString("id-ID")}` : `${data.discountValue}%`;
    console.log(`  ✅ Promo added: "${code}" -> ${typeLabel} (usage: ${data.usedCount}/${data.maxUsage})`);
    refs.push(code);
  }
  return refs;
}

// ==============================================
// MAIN EXECUTION
// ==============================================
async function main() {
  console.log("\n🚀 [START] Seed Checkout Collections ke Firestore...\n");
  console.log(`Project ID: ${firebaseConfig.projectId}`);
  console.log("====================================================\n");

  // 1. Pastikan auth state ready + coba login (jika ada credentials)
  await ensureAuthenticated();
  await attemptLogin();

  try {
    const [templateIds, addonIds, promoCodes] = await Promise.all([
      seedTemplates(),
      seedAddons(),
      seedPromoCodes()
    ]);

    console.log("\n====================================================");
    console.log("🎉 [SELESAI] Semua collections berhasil dibuat!");
    console.log("   📋 Templates    :", templateIds.length, "docs");
    console.log("   🎁 Addons       :", addonIds.length, "docs");
    console.log("   🎟️  Promo Codes  :", promoCodes.length, "codes:", promoCodes.join(", "));
    console.log("\n👉 Silakan cek di Firebase Console -> Firestore Database.");
    console.log("👉 Kalau ada data yang salah, tinggal edit langsung di console atau di script ini lalu run ulang.");
    try { await signOut(auth); } catch (_) { /* ignore */ }
    process.exit(0);
  } catch (err) {
    if (err?.code === "permission-denied") {
      console.error("\n❌ [PERMISSION_DENIED] Firestore Security Rules masih menolak akses.");
      console.log("   SOLUSI: Gunakan OPSI 1 (set rules open sementara) di panduan di atas, ATAU setup OPSI 2 (login admin).");
      console.log("   Setelah OPSI 1 diterapkan di Firebase Console, TUNGGU 1-2 menit lalu RUN ULANG script ini.");
    } else {
      console.error("\n❌ [ERROR] Seeding gagal:", err);
    }
    try { await signOut(auth); } catch (_) { /* ignore */ }
    process.exit(1);
  }
}

main();
