'use client';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from '@/components/cards/ServiceCard';

export default function ServicesSection() {
  const { t } = useLanguage();
  // Data layanan bisa diletakkan di sini atau diambil dari CMS

  const services = [
    { title: t('services.items.app'), description: t('services.descriptions.app'), image: "/services/AppMob.png", alt: "Mockup aplikasi mobile" },
    { title: t('services.items.hak_merk'), description: t('services.descriptions.hak_merk'), image: "/services/Trademark.png", alt: "Mockup hak merk" },
    { title: t('services.items.website'), description: t('services.descriptions.website'), image: "/services/web.png", alt: "Mockup website profesional" },
    { title: t('services.items.dashboard'), description: t('services.descriptions.dashboard'), image: "/services/Dashboard.png", alt: "Mockup dashboard analitik" },
    { title: t('services.items.ads'), description: t('services.descriptions.ads'), image: "/services/Ads.png", alt: "Iklan Google di halaman pencarian" },
    { title: t('services.items.seo'), description: t('services.descriptions.seo'), image: "/services/SEO.png", alt: "Contoh hasil artikel SEO" },
  ];

  return (
    <section id='layanan' className="py-20">
      <div className="container space-y-8 mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services.title')}</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto dark:text-gray-400">{t('services.subtitle')}</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              image={service.image}
              alt={service.alt}
              className="h-full min-h-[400px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}