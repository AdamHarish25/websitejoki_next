'use client';

import { useRef } from 'react';
import Link from 'next/link';
import CustomVideoPlayer from '../shared/CustomVideoPlayer';
import HeroSocialProof from '../shared/HeroSocialProof';
import { FaArrowCircleDown, FaWhatsapp } from 'react-icons/fa';
import { trackEvent } from '@/lib/analytics';
import { useLanguage } from '@/context/LanguageContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function HeroSection() {
  const { t } = useLanguage();
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo('.hero-text-element',
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    )
      .fromTo('.hero-video',
        { x: 30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
        '-=0.6'
      );
  }, { scope: container });

  const handleClick = () => {
    trackEvent({
      action: 'click_whatsapp',
      category: 'Contact',
      label: 'CTA Button for WhatsApp',
    });
    // Tidak perlu window.open karena Link akan menanganinya
  };

  return (
    <section ref={container} className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="hero-text-element invisible text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {t('hero.title')} <span className="text-green-600">{t('hero.highlight')}</span> {t('hero.title_suffix')}
          </h1>
          <p className="hero-text-element invisible text-lg text-gray-600 dark:text-gray-300">
            {t('hero.description')}
          </p>
          <div className="hero-text-element invisible flex flex-col sm:flex-row gap-4 pt-4">
            <Link onClick={handleClick} href="https://wa.me/6285179808325" target="_blank" rel="noopener noreferrer" className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-white bg-[#2ECC71] shadow-md transition-transform hover:scale-96">
              {t('hero.cta_primary')} <FaWhatsapp />
            </Link>
            <Link href="#layanan" className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-black bg-white shadow-md transition-transform hover:scale-96">
              {t('hero.cta_secondary')} <FaArrowCircleDown />
            </Link>
          </div>
          <div className="hero-text-element invisible flex items-center pt-4 text-sm text-gray-500">
            <HeroSocialProof lang={t('hero.lang')} />
          </div>
        </div>
        <div className="hero-video invisible relative w-full h-fit rounded-xl overflow-hidden shadow-2xl">
          <CustomVideoPlayer src="/video/hero_video.mp4" thumbnailSrc={'/hero/thumbnail2.jpg'} />
        </div>
      </div>
    </section>
  );
}