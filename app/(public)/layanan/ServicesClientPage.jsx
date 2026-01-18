'use client';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ServicesClientPage({ services }) {
    const { t, language } = useLanguage();

    return (
        <div className='w-full h-fit rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
            <div className="container h-full mx-auto px-6 py-16 rounded-xl">
                <h1 className="text-4xl font-bold text-center mb-12">{t('services.page_title')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full gap-8">
                    {services.map((service) => {
                        // Logic validation for poster/banner
                        // If language is 'en' and banner.en exists, use it. Otherwise use banner.id or fallback.
                        const bannerSrc = (language === 'en' && service.banner?.en)
                            ? service.banner.en
                            : service.banner?.id || '/placeholder.jpg';

                        return (
                            <Link key={service.id} href={`/layanan/${service.slug}`} className="block group">
                                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-fit flex flex-col">
                                    {/* Bagian Gambar/Banner */}
                                    <div className="relative w-full h-fit bg-[#2ECC71]/10 dark:bg-gray-800 flex items-center justify-center p-3">
                                        <Image
                                            src={bannerSrc}
                                            alt={`Ikon untuk layanan ${service.title}`}
                                            className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300 dark:bg-white"
                                            width={500}
                                            height={300}
                                            priority
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
