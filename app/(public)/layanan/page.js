import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import ServicesClientPage from './ServicesClientPage';

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
    banner: {
      id: '/services/AppMob.svg',
      en: '/services/AppMob.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  },
  {
    category: 'web',
    banner: {
      id: '/services/Web.svg',
      en: '/services/Web.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  },
  {
    category: 'dash',
    banner: {
      id: '/services/Dashboard.svg',
      en: '/services/Dashboard.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  },
  {
    category: 'ads',
    banner: {
      id: '/services/Ads.svg',
      en: '/services/Ads.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  },
  {
    category: 'seo',
    banner: {
      id: '/services/SEO.svg',
      en: '/services/SEO.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  },
  {
    category: 'brand',
    banner: {
      id: '/services/HakMerk.svg',
      en: '/services/HakMerk.svg' // Ganti path ini jika sudah ada poster versi EN
    }
  }
]

export default async function ServicesPage() {
  const servicesFromDb = await getServices();

  const services = servicesFromDb.map(service => {
    // Cari banner yang cocok berdasarkan 'pricingCategory' dari service
    const bannerData = dataBanner.find(banner => banner.category === service.pricingCategory);

    // Siapkan object banner dengan fail-safe
    const bannerObj = bannerData ? bannerData.banner : { id: '/placeholder.jpg', en: '/placeholder.jpg' };

    return {
      ...service,
      // Pass banner as an object { id, en }
      banner: bannerObj
    };
  });

  return (
    <ServicesClientPage services={services} />
  );
}