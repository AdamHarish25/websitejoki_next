import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

async function getServices() {
  const q = query(collection(db, 'services'), where("published", "==", true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const metadata = {
  title: 'Layanan Kami | WebsiteJoki.ID',
  description: 'Jelajahi layanan digital profesional kami, mulai dari Jasa SEO, Google Ads, hingga pembuatan Website dan Aplikasi Kustom untuk bisnis Anda.',
};

const dataBanner = [
  {
    category: 'app',
    banner: './services/AppMob.svg',
  },
  {
    category: 'web',
    banner: './services/Web.svg',
  },
  {
    category: 'dash',
    banner: './services/Dashboard.svg',
  },
  {
    category: 'ads',
    banner: './services/Ads.svg',
  },
  {
    category: 'seo',
    banner: './services/SEO.svg',
  },
  { category: 'brand', banner: './services/HakMerk.svg' }
]

export default async function ServicesPage() {
  const servicesFromDb = await getServices();

  const services = servicesFromDb.map(service => {
    // Cari banner yang cocok berdasarkan 'pricingCategory' dari service
    const bannerData = dataBanner.find(banner => banner.category === service.pricingCategory);
    return {
      ...service,
      // Tambahkan properti 'banner' ke setiap service.
      // Jika tidak ketemu, beri gambar placeholder.
      banner: bannerData ? bannerData.banner : '/placeholder.jpg' 
    };
  });
  return (
    <div className='w-full h-fit rounded-xl'>


      <div className="container h-full mx-auto px-6 py-16 rounded-xl">
        <h1 className="text-4xl font-bold text-center mb-12">Layanan Digital Kami</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full gap-8">
          {services.map((service) => (
            <Link key={service.id} href={`/layanan/${service.slug}`} className="block group">
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-fit flex flex-col">
                {/* Bagian Gambar/Banner */}
                <div className="relative w-full h-fit bg-[#2ECC71]/10 dark:bg-gray-800 flex items-center justify-center p-3">
                  <Image
                    // Gunakan properti 'banner' yang baru kita tambahkan
                    src={service.banner}
                    alt={`Ikon untuk layanan ${service.title}`}
                    className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
                    width={500}
                    height={300}
                    priority
                  />
                </div>
                {/* Bagian Teks */}
                {/* <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-3 text-green-600 group-hover:underline">{service.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                    {service.shortDescription}
                  </p>
                </div> */}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}