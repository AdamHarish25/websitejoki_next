'use client';
import { icons } from "lucide-react";
import Image from "next/image";
import { useLanguage } from '@/context/LanguageContext';

export default function CollaborationSection() {
    const { t } = useLanguage();
    const points = [
        {
            icons: "/icons/gear.svg",
            title: t('collaboration.points.planning.title'),
            description: t('collaboration.points.planning.description')
        },

        {
            icons: "/icons/star.svg",
            title: t('collaboration.points.creative.title'),
            description: t('collaboration.points.creative.description')
        }
    ]

    return (
        <section id="kolaborasi" className="container grid grid-cols-1 lg:grid-cols-2 place-items-center gap-10 lg:gap-8 p-6 mx-auto">
            <div className="relative lg:w-full">
                <Image
                    src="/Collaborate.jpg"
                    alt="Kolaborasi"
                    width={600}
                    height={600}
                    className=" object-cover rounded-3xl shadow-lg"
                />
            </div>

            <div className="space-y-8 lg:space-y-4 grid place-content-end w-full p-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {t('collaboration.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t('collaboration.description')}
                </p>

                <ul className="space-y-4 pl-0 list-none w-full">
                    {points.map((point, index) => (
                        <li key={index} className="flex flex-col lg:flex-row items-start space-y-6 lg:space-x-6 bg-[#2ECC71]/15 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1">
                            <div className="h-10 w-20 bg-[#2ECC71] text-white flex items-center justify-center rounded-md">
                                <Image src={point.icons} alt={point.title} width={30} height={30} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-800 text-xl dark:text-white">{point.title}</h3>
                                <p className="text-gray-600 text-lg dark:text-gray-400">{point.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}