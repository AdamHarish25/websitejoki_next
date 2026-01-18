'use client';

import { trackEvent } from "@/lib/analytics";
import Image from "next/image"
import Link from "next/link"
import { FaArrowCircleDown, FaWhatsapp } from "react-icons/fa"
import { useLanguage } from '@/context/LanguageContext';

export default function ExperienceSection() {
    const { t } = useLanguage();

    const handleClick = () => {
        trackEvent({
            action: 'click_whatsapp',
            category: 'Contact',
            label: 'CTA Button for WhatsApp', // Anda bisa membuat labelnya lebih spesifik
        });
        // Tidak perlu window.open karena Link akan menanganinya
    };


    return (
        <section id="experience" className="container grid grid-cols-1 my-10 lg:grid-cols-2 place-items-center gap-10 lg:gap-8 p-6 mx-auto">
            <div className="space-y-8 lg:space-y-6 grid place-content-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {t('experience.title')}
                </h2>
                <p className="text-gray-600 text-lg dark:text-gray-400">
                    {t('experience.description')}
                </p>

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-10">
                    <Link onClick={handleClick} className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-white bg-[#2ECC71] shadow-md transition-transform hover:scale-96" href={'https://wa.me/6285179808325'}>
                        {t('experience.cta_consult')} <FaWhatsapp />
                    </Link>
                    <Link className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-black bg-white shadow-md transition-transform hover:scale-96" href={'#portfolio'}>
                        {t('experience.cta_portfolio')} <FaArrowCircleDown />
                    </Link>
                </div>
            </div>

            <div className="relative">
                <Image
                    src="/experience.jpg"
                    alt="experiences"
                    width={600}
                    height={600}
                    className=" object-cover rounded-3xl shadow-lg"
                />
            </div>
        </section>
    )
}