"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function PortfolioSection() {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    // Anda bisa mengganti data ini dengan data dari database/CMS nanti
    const projects = [
        {
            title: t('portfolio.projects.inoted.title'),
            image: "/portfolio/Inoted.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/Inoted.png", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.inoted.alt'),
            link: "https://inoted-daily.netlify.app/"
        },
        {
            title: t('portfolio.projects.adaloker.title'),
            image: "/portfolio/Adaloker.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/Adaloker.svg", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.adaloker.alt'),
            link: "https://adaloker.netlify.app/"
        },
        {
            title: t('portfolio.projects.tobalaw.title'),
            image: "/portfolio/TobalawFirm.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/tobalaw.jpg", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.tobalaw.alt'),
            link: "https://tobalaw.com"
        },
        {
            title: t('portfolio.projects.beejoys.title'),
            image: "/portfolio/Beejoys.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/BeeJoys.svg", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.beejoys.alt'),
            link: "https://beejoystravel.netlify.app/"
        },
        {
            title: t('portfolio.projects.sinefolis.title'),
            image: "/portfolio/Sinefolis.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/Sinefolis.svg", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.sinefolis.alt'),
            link: "https://sinefolis-movies.netlify.app/"
        },
        {
            title: t('portfolio.projects.terapi.title'),
            image: "/portfolio/TerapiChaira.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/terapiChaira.png", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.terapi.alt'),
            link: "https://terapitumbuhkembangchaira.com/"
        },
        {
            title: t('portfolio.projects.finplay.title'),
            image: "/portfolio/finplay-edu.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/finplay-eduLogo.png", // Ganti dengan path logo Anda
            alt: t('portfolio.projects.finplay.alt'),
            link: "https://finplay-edu.netlify.app/"
        }
    ];


    const visibleProjects = expanded ? projects : projects.slice(0, 4);

    return (
        <section id="portfolio" className="py-20 bg-[#2ECC71]/15">
            <div className="container mx-auto px-6">
                <div className="text-center md:text-left mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('portfolio.title')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
                        {t('portfolio.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {visibleProjects.map((project) => (
                        <Link key={project.title} href={project.link} className="block group">
                            <div className="relative overflow-hidden rounded-lg shadow-lg aspect-video bg-white">
                                {/* Gambar Utama Proyek */}
                                <Image
                                    src={project.image}
                                    alt={project.alt}
                                    fill
                                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                                />

                                {/* Overlay dan Teks yang Muncul Saat Hover */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-5">
                                    {/* Logo Proyek */}
                                    <div className="w-32 h-32 overflow-hidden grid place-items-center">
                                        <Image
                                            src={project.logo}
                                            alt={`${project.title} Logo`}

                                            width={124}
                                            height={124}
                                        />
                                    </div>
                                    {/* Judul Proyek */}
                                    <h3 className="text-white font-bold text-lg lg:text-2xl text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {project.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {projects.length > 4 && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center px-4 py-2 bg-[#2ECC71] text-white rounded-full shadow hover:bg-[#27ae60] transition"
                        >
                            {expanded ? (
                                <>
                                    {t('portfolio.buttons.show_less')}
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    {t('portfolio.buttons.show_all')}
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}