'use client';

import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useLanguage } from '@/context/LanguageContext';

export default function PricingSection({ category }) {
    const { language, t } = useLanguage();
    const isEn = language === 'en';

    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            setIsLoading(true);
            let packagesQuery = query(collection(db, 'packages'), orderBy('order'));
            if (category) {
                packagesQuery = query(collection(db, 'packages'), where('category', '==', category), orderBy('order'));
            }
            const querySnapshot = await getDocs(packagesQuery);
            setPackages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        };
        fetchPackages();
    }, [category]);

    if (isLoading) {
        return <div className="text-center py-20 flex justify-center"><Loader2 className='animate-spin text-green-500 w-8 h-8' /></div>
    }

    // Headline Content
    const headline = isEn
        ? category ? `Pricing for ${category.toUpperCase()} Services` : 'Our Pricing Packages'
        : category ? `Rincian Paket Jasa ${category.toUpperCase()}` : 'Rincian Paket Jasa';

    const subheadline = isEn
        ? "We believe in transparency. Here are the packages designed to meet your business needs in 2025."
        : "Kami percaya pada transparansi. Berikut adalah paket-paket yang kami rancang untuk memenuhi berbagai kebutuhan bisnis di tahun 2025.";

    return (
        <section id="harga" className="bg-white dark:bg-gray-900 py-20 font-sans transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="text-start md:text-center mb-16">
                    <h2 className="text-4xl font-extrabold mb-4 font-serif text-gray-900 dark:text-gray-50">{headline}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-serif">
                        {subheadline}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {packages.map((pkg) => {
                        const name = (isEn && pkg.nameEn) ? pkg.nameEn : pkg.name;
                        const subtitle = (isEn && pkg.subtitleEn) ? pkg.subtitleEn : pkg.subtitle;
                        const description = (isEn && pkg.descriptionEn) ? pkg.descriptionEn : pkg.description;
                        const features = (isEn && pkg.featuresEn && pkg.featuresEn.length > 0) ? pkg.featuresEn : pkg.features;

                        return (
                            <div key={pkg.id} className={`relative border rounded-xl shadow-lg p-6 md:p-8 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 ${pkg.isPopular ? 'border-green-500 border-2 bg-green-50/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                                {pkg.isPopular && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                        <span className="bg-green-500 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
                                            {isEn ? 'Most Popular' : 'Paling Populer'}
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold font-serif mb-2 text-gray-900 dark:text-white">{name}</h3>
                                    {subtitle && <p className="text-green-600 dark:text-green-400 font-medium text-sm">{subtitle}</p>}
                                </div>

                                <div className="mb-8 text-center">
                                    <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-100 italic tracking-tighter">Rp.{pkg.price}</span>
                                    {/* pkg.pricePeriod is usually "per bulan" or similar. Assuming manual string for now or untranslated if simpler */}
                                </div>

                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 h-12 flex items-center justify-center font-serif leading-relaxed px-4">
                                    {description}
                                </p>

                                <ul className="space-y-4 flex-grow mb-10 pl-2">
                                    {features && features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5 shrink-0">
                                                <Check className="text-green-600 dark:text-green-400 w-3 h-3" />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <Link href="https://wa.me/6285179808325" className={`w-full text-center block px-6 py-4 rounded-lg font-bold transition-all shadow-sm ${pkg.isPopular ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                        {isEn ? 'Choose Plan' : 'Pilih Paket'}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}