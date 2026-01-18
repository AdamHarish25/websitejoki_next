'use client';

import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import { Share2, ArrowRight, CheckCircle } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import FeaturesGrid from '@/components/sections/FeatureGrid';
import PricingSection from '@/components/sections/PricingSections';
import FaqSection from '@/components/sections/FaqSection';
import SeoCalculator from '@/components/sections/SEOCalculator';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';

// --- Display Components ---

function RichTextBlockDisplay({ content }) {
    // Medium-style: Clean serif typography, no heavy containers by default
    return (
        <section className="container mx-auto px-4 md:px-0 max-w-3xl py-8">
            <div
                className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                font-serif 
                prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:leading-loose prose-p:text-gray-800 dark:prose-p:text-gray-300
                prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-green-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </section>
    );
}

function ImageTextSplitBlockDisplay({ imageUrl, text, imagePosition }) {
    const imageOrderClass = imagePosition === 'right' ? 'md:order-last' : '';

    return (
        <section className="container mx-auto px-4 md:px-0 max-w-5xl py-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg ${imageOrderClass}`}>
                    <Image
                        src={imageUrl}
                        alt="Service illustration"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div
                    className="prose prose-lg dark:prose-invert font-serif"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            </div>
        </section>
    );
}

export default function ServiceClientPage({ service }) {
    const { language } = useLanguage();
    const isEn = language === 'en';

    // Content Language Logic
    const title = (isEn && service.title_en) ? service.title_en : service.title;
    const shortDescription = (isEn && service.shortDescription_en) ? service.shortDescription_en : service.shortDescription;
    const featuresList = (isEn && service.featuresList_en && service.featuresList_en.length > 0) ? service.featuresList_en : service.featuresList || [];

    // Note: Page Content Blocks (richText etc) usually contain HTML. 
    // If we wanted them translated, we would have needed to translate them in Admin.
    // Assuming for now they store the specific language version or are mixed.
    // (The Admin PageContent builder didn't seem to have explicit dual-lang support for blocks yet, 
    // it was just "Page Content". So we render what is there).

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300">

            {/* Header Section (Medium Style: Text First, then Image) */}
            <div className="container mx-auto px-4 md:px-0 max-w-3xl pt-24 pb-10 text-center md:text-left">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight mb-6 text-gray-900 dark:text-gray-50 leading-tight">
                    {title}
                </h1>

                {/* Subtitle / Short Desc */}
                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-serif leading-relaxed mb-8">
                    {shortDescription}
                </p>

                {/* Meta / Actions */}
                <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                            W
                        </div>
                        <div>
                            <p className="font-bold text-sm">WebsiteJoki Team</p>
                            <p className="text-xs text-gray-500">{service.category || 'Service'}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-gray-400">
                        <Share2 className="w-5 h-5 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Featured Image (Wide) */}
            {service.heroImageUrl && (
                <div className="container mx-auto px-4 md:px-0 max-w-5xl mb-16">
                    <div className="relative w-full aspect-[2/1] md:aspect-[2.5/1] rounded-xl overflow-hidden shadow-sm">
                        <Image
                            src={service.heroImageUrl}
                            alt={title}
                            className="object-cover object-center w-full h-full hover:scale-105 transition-transform duration-700"
                            width={1200}
                            height={600}
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Page Builder Content Blocks */}
            <div className="space-y-4">
                {service.pageContent && service.pageContent.map((block, index) => {
                    switch (block.type) {
                        case 'richText':
                            return <AnimatedSection key={index}><RichTextBlockDisplay content={block.content} /></AnimatedSection>;
                        case 'imageLeftTextRight':
                            return <AnimatedSection key={index}><ImageTextSplitBlockDisplay imageUrl={block.content.imageUrl} text={block.content.text} imagePosition={block.content.imagePosition} /></AnimatedSection>;
                        default:
                            return null;
                    }
                })}
            </div>

            {/* Features Grid */}
            {featuresList && featuresList.length > 0 && (
                <div className="py-12 bg-gray-50 dark:bg-gray-800/50 mt-12">
                    <AnimatedSection>
                        <div className="container mx-auto px-4 max-w-5xl">
                            <h2 className="text-3xl font-bold text-center mb-10 font-sans">
                                {isEn ? `What's included in ${title}?` : `Apa Saja yang Termasuk Dalam ${title}?`}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuresList.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            )}

            {/* SEO Calculator (Specific) */}
            {service.pricingCategory === 'seo' && (
                <AnimatedSection>
                    <div className="py-16">
                        <div className="container mx-auto px-6 text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-sans">
                                {isEn ? 'Calculate Your SEO ROI' : 'Hitung Potensi ROI SEO Anda'}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-serif">
                                {isEn ? 'Use our calculator to estimate potential returns.' : 'Gunakan kalkulator interaktif kami untuk mendapatkan estimasi potensi keuntungan dari investasi SEO Anda.'}
                            </p>
                        </div>
                        <SeoCalculator />
                    </div>
                </AnimatedSection>
            )}

            {/* Pricing Section */}
            {service.pricingCategory && (
                <AnimatedSection>
                    <div className="py-12">
                        <PricingSection category={service.pricingCategory} />
                    </div>
                </AnimatedSection>
            )}

            {/* FAQ */}
            <AnimatedSection>
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <FaqSection />
                </div>
            </AnimatedSection>

            <FloatingWhatsApp />
        </div>
    );
}
