'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function PricingSection({category}) {
    // Data paket baru yang sudah disesuaikan dengan PDF revisi
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
        return <div className="text-center py-20">Loading Packages...</div>
    }

    return (
        <section id="harga" className="bg-white dark:bg-gray-900 py-20">
            <div className="container mx-auto px-6">
                <div className="text-start md:text-center mb-16">
                    <h2 className="text-4xl font-extrabold mb-4">Rincian Paket Jasa <span className='uppercase'>{category}</span></h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Kami percaya pada transparansi. Berikut adalah paket-paket yang kami rancang untuk memenuhi berbagai kebutuhan bisnis di tahun 2025.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {packages.map((pkg) => (
                        <div key={pkg.name} className={`relative border rounded-xl shadow-lg p-6 md:p-8 flex flex-col ${pkg.isPopular ? 'border-green-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}>
                            {pkg.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="bg-green-500 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase">Paling Populer</span>
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-center">{pkg.name}</h3>
                            <p className="text-green-600 dark:text-green-400 font-semibold text-center mt-1">{pkg.subtitle}</p>
                            
                            <div className="my-6 text-center">
                                <span className="text-5xl font-extrabold">{pkg.price}</span>
                                <span className="text-gray-500 dark:text-gray-400">{pkg.pricePeriod}</span>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center h-20">{pkg.description}</p>

                            <ul className="mt-8 space-y-4 flex-grow pl-2">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="text-green-500 w-5 h-5 mr-3 flex-shrink-0 mt-1" />
                                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                <Link href="/#kontak" className={`w-full text-center block px-6 py-3 rounded-md font-semibold transition-colors ${pkg.isPopular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    Pilih Paket
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}