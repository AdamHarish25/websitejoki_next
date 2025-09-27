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
import AnimatedSection from '@/components/shared/AnimatedSection';

// --- FUNGSI PENGAMBILAN DATA ---
// Fungsi ini berjalan di server untuk mengambil data satu layanan berdasarkan slug-nya
// Komponen Display untuk Blok (bisa diletakkan di file terpisah jika mau)
function RichTextBlockDisplay({ content }) {
  return (
    <section className="relative container mx-auto py-12 px-6 w-full bg-[#2ECC71] text-white shadow-lg rounded-tr-xl rounded-bl-xl my-10">
      <div
        className="prose lg:prose-xl prose-ul:text-white prose-strong:text-white max-w-none dark:prose-invert text-white prose-headings:text-white prose-a:text-white prose-p:text-white"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <Image
        src="/quote.png"
        width={70}
        height={90}
        alt="Ilustrasi kutipan"
        className="absolute top-0 right-0 w-16 h-16"
        sizes="(max-width: 768px) 100vw, 50vw"
      // Catatan: Anda bisa menggunakan 'fill' untuk mengisi parent container
      />
    </section>
  );
}

function ImageTextSplitBlockDisplay({ imageUrl, text, imagePosition }) {
  const imageOrderClass = imagePosition === 'right' ? 'md:order-last' : '';
  return (
    <section className="container mx-auto py-12 px-6">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div className={`relative w-full aspect-square rounded-lg overflow-hidden shadow-lg ${imageOrderClass}`}>
          {/* 3. 'fill' akan mengisi parent, 'object-cover' menjaga rasio */}
          <Image
            src={imageUrl}
            alt="Gambar pendukung untuk layanan"
            fill
            className="object-cover"
            // 4. 'sizes' membantu Next.js mengoptimalkan gambar
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div
          className="prose lg:prose-xl dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </section>
  );
}


async function getService(slug) {
  const q = query(collection(db, "services"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    notFound();
  }
  const serviceData = querySnapshot.docs[0].data();
  if (serviceData.published !== true) {
    notFound();
  }
  return { ...serviceData, createdAt: serviceData.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) };
}

// --- FUNGSI UNTUK SEO & METADATA ---
// Fungsi ini akan membuat meta title & description unik untuk setiap layanan
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getService(slug);

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
  const { slug } = await params;
  const service = await getService(slug);

  return (
    <>
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white dark:text-gray-100 dark:bg-gray-900">
        {service.heroImageUrl && (
          <Image fill src={service.heroImageUrl} alt={`Gambar utama untuk ${service.title}`} className="object-cover w-full h-full absolute top-0 right-0" priority/>
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold">{service.title}</h1>
          <p className="md:text-xl mt-4 max-w-3xl mx-auto">{service.shortDescription}</p>
        </div>
      </section>

      {service.pageContent && service.pageContent.map((block, index) => {
        switch (block.type) {
          case 'richText':
            return <AnimatedSection key={index} ><RichTextBlockDisplay content={block.content} /></AnimatedSection>;
          case 'imageLeftTextRight':
            return <AnimatedSection key={index}><ImageTextSplitBlockDisplay imageUrl={block.content.imageUrl} text={block.content.text} imagePosition={block.content.imagePosition} /></AnimatedSection>;
          default:
            return null;
        }
      })}

      {service.featuresList && service.featuresList.length > 0 && (
        <AnimatedSection><FeaturesGrid features={service.featuresList} title={`Apa Saja yang Termasuk Dalam ${service.pricingCategory == "web" ? "Layanan Website" : service.title}?`} /></AnimatedSection>
      )}
      {service.pricingCategory === 'seo' && (
        <AnimatedSection>
          <div>
            <div className="container mx-auto px-6 pt-16 text-center">
              <h2 className="text-4xl font-extrabold mb-4">Hitung Potensi ROI SEO Anda</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Gunakan kalkulator interaktif kami untuk mendapatkan estimasi potensi keuntungan dari investasi SEO Anda.</p>
            </div>
            <SeoCalculator />
          </div>
        </AnimatedSection>
      )}
      {service.pricingCategory && (
        <AnimatedSection>
          <PricingSection category={service.pricingCategory} />
        </AnimatedSection>
      )}

      <FloatingWhatsApp />
      <AnimatedSection>
        <FaqSection />
      </AnimatedSection>
    </>
  );
}