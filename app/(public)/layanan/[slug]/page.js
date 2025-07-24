import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';

// Impor komponen-komponen yang akan kita gunakan untuk membangun halaman
import FeaturesGrid from '@/components/sections/FeatureGrid';
import PricingSection from '@/components/sections/PricingSections';
import FaqSection from '@/components/sections/FaqSection';
import CtaSection from '@/components/sections/CTASection';
import Image from 'next/image';
import SeoCalculator from '@/components/sections/SEOCalculator';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';

// --- FUNGSI PENGAMBILAN DATA ---
// Fungsi ini berjalan di server untuk mengambil data satu layanan berdasarkan slug-nya
async function getService(slug) {
  const q = query(collection(db, "services"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  // Jika artikel dengan slug tersebut tidak ada, tampilkan halaman 404
  if (querySnapshot.empty) {
    notFound();
  }

  const serviceData = querySnapshot.docs[0].data();

  // Validasi tambahan: jika layanan ada tapi tidak dipublish, anggap tidak ditemukan
  if (serviceData.published !== true) {
    notFound();
  }

  // Format tanggal agar mudah dibaca (opsional, jika Anda punya field tanggal)
  return {
    ...serviceData,
    createdAt: serviceData.createdAt?.toDate().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }),
  };
}

// --- FUNGSI UNTUK SEO & METADATA ---
// Fungsi ini akan membuat meta title & description unik untuk setiap layanan
export async function generateMetadata({ params }) {
  const service = await getService(params.slug);

  if (!service) {
    return {
      title: "Layanan Tidak Ditemukan",
      description: "Halaman layanan yang Anda cari tidak ada.",
    };
  }

  return {
    title: `${service.title} | WebsiteJoki.ID`,
    description: service.shortDescription, // Menggunakan deskripsi singkat untuk meta
    openGraph: {
      title: service.title,
      description: service.shortDescription,
    },
  };
}


// --- FUNGSI UNTUK STATIC SITE GENERATION (SSG) ---
// Fungsi ini akan dijalankan saat proses build untuk memberitahu Next.js
// halaman statis mana saja yang perlu dibuat. Ini sangat bagus untuk kecepatan & SEO.
export async function generateStaticParams() {
  const servicesCol = collection(db, 'services');
  const q = query(servicesCol, where("published", "==", true));
  const serviceSnapshot = await getDocs(q);

  const paths = serviceSnapshot.docs.map(doc => ({
    slug: doc.data().slug || '',
  })).filter(path => path.slug);

  return paths;
}

// Aktifkan Incremental Static Regeneration (ISR)
// Halaman akan di-generate ulang di background setiap 60 detik jika ada data baru
export const revalidate = 60;


// --- KOMPONEN UTAMA HALAMAN ---
export default async function ServiceDetailPage({ params }) {
  // 1. Ambil data layanan utama dari Firestore berdasarkan slug di URL
  const service = await getService(params.slug);

  return (
    <>
      {/* Bagian 1: Hero Banner untuk halaman layanan */}
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white">
        {/* Gambar sebagai background */}
        {service.heroImageUrl && (
          <img
            src={service.heroImageUrl}
            alt={`Gambar utama untuk ${service.title}`}
            className="object-cover w-full h-full absolute inset-0 opacity-50"
          />
        )}
        {/* Overlay gelap agar teks terbaca */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Konten Teks di atas overlay */}
        <div className="relative z-10 container mx-auto px-6 text-start md:text-center">
          <h1 className="text-2xl md:text-6xl font-extrabold">{service.title}</h1>
          <p className=" md:text-xl mt-4 max-w-3xl mx-auto">{service.shortDescription}</p>
        </div>
      </section>

      {/* Bagian 3: Tampilkan Paket Harga yang relevan jika kategorinya ada */}
      {service.pricingCategory && (
        <PricingSection category={service.pricingCategory} />
      )}

      {/* Bagian 2: Tampilkan Grid Fitur jika datanya ada */}
      {service.featuresList && service.featuresList.length > 0 && (
        <FeaturesGrid features={service.featuresList} title={`Apa Saja yang Termasuk Dalam Layanan ${service.title}?`} />
      )}

       {/* 2. Cek apakah kategori layanan adalah "seo" */}
      {service.pricingCategory === 'seo' && (
        <div>
          <div className="container mx-auto px-6 pt-16 text-start md:text-center">
              <h2 className="text-4xl font-extrabold mb-4">Hitung Potensi ROI SEO Anda</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Gunakan kalkulator interaktif kami untuk mendapatkan estimasi potensi keuntungan dari investasi SEO Anda.
              </p>
          </div>
          <SeoCalculator />
        </div>
      )}

      
      <FloatingWhatsApp/>

      {/* Bagian 4 & 5: Tampilkan seksi lain untuk melengkapi halaman */}
      <FaqSection />
      <CtaSection />
    </>
  );
}