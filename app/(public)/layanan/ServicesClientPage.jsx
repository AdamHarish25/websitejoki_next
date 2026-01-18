'use client';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ServicesClientPage({ services }) {
    const { t, language } = useLanguage();

    return (
        <div className='w-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300'>
            <div className="container mx-auto px-6 py-20 leading-relaxed">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 font-serif tracking-tight">{t('services.page_title')}</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-serif">
                        {language === 'en'
                            ? "Explore our professional digital services, tailored to elevate your business in the modern era."
                            : "Jelajahi layanan digital profesional kami, dirancang khusus untuk meningkatkan bisnis Anda di era modern."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map((service) => {
                        // Logic validation for poster/banner
                        const bannerSrc = (language === 'en' && service.banner?.en)
                            ? service.banner.en
                            : service.banner?.id || '/placeholder.jpg';

                        // Translation for Text
                        const title = (language === 'en' && service.title_en) ? service.title_en : service.title;
                        const description = (language === 'en' && service.shortDescription_en) ? service.shortDescription_en : service.shortDescription;

                        return (
                            <Link key={service.id} href={`/layanan/${service.slug}`} className="block group h-full">
                                <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                                    {/* Bagian Gambar/Banner */}
                                    <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700 overflow-hidden">
                                        <Image
                                            src={bannerSrc}
                                            alt={`Layanan ${title}`}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h2 className="text-2xl font-bold font-serif mb-3 group-hover:text-green-600 transition-colors">{title}</h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow font-serif">
                                            {description}
                                        </p>
                                        <div className="flex items-center text-green-600 dark:text-green-400 font-bold text-sm mt-auto group-hover:gap-2 transition-all">
                                            <span>{language === 'en' ? 'Learn More' : 'Pelajari Selengkapnya'}</span>
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
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
