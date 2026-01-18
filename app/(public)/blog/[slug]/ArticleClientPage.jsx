'use client';

import CtaSection from '@/components/sections/CTASection';
import FaqSection from '@/components/sections/FaqSection';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';
import Image from 'next/image';
import TableOfContents from '@/components/blog/tableofcontents';
import { useLanguage } from '@/context/LanguageContext';
import { useMemo } from 'react';
import { Calendar, User, Clock, Share2 } from 'lucide-react';

// Note: We use Regex here to avoid using JSDOM (which is Node.js only) in a Client Component.
function extractHeadings(contentHTML) {
    if (!contentHTML || typeof contentHTML !== 'string') {
        return { headings: [], modifiedContent: '' };
    }

    const headings = [];
    const regex = /<(h[23])((?:\s+[^>]*)*)>(.*?)<\/\1>/gi;

    const modifiedContent = contentHTML.replace(regex, (match, tag, attrs, content) => {
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        const id = plainText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        headings.push({
            level: parseInt(tag.substring(1)),
            text: plainText,
            id: id
        });

        return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
    });

    return { headings, modifiedContent };
}

export default function ArticleClientPage({ article }) {
    const { language, t } = useLanguage();

    const isEn = language === 'en';
    const contentToRender = (isEn && article.content_en) ? article.content_en : article.content;
    const titleToRender = (isEn && article.title_en) ? article.title_en : article.title;
    const metaDescToRender = (isEn && article.metaDescription_en) ? article.metaDescription_en : article.metaDescription;

    const { headings, modifiedContent } = useMemo(() => {
        return extractHeadings(contentToRender);
    }, [contentToRender]);

    // Estimate read time (approx 200 words per min)
    const readTime = useMemo(() => {
        const words = contentToRender?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.ceil(words / 200);
    }, [contentToRender]);

    return (
        <article className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300">

            {/* Header Section (Centered & Narrow) */}
            <div className="container mx-auto px-4 md:px-0 max-w-3xl pt-24 pb-10">

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight mb-6 text-gray-900 dark:text-gray-50 leading-tight">
                    {titleToRender}
                </h1>

                {/* Subtitle / Meta Description (Medium style often puts this before the author) */}
                {metaDescToRender && (
                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-serif leading-relaxed mb-8 border-l-4 border-gray-300 dark:border-gray-700 pl-4">
                        {metaDescToRender}
                    </p>
                )}

                {/* Author & Meta Data */}
                <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden relative">
                            {/* Placeholder Avatar if no image provided (assuming article doesn't have author image yet) */}
                            <span className='font-serif font-bold text-gray-500'>{article.author ? article.author[0].toUpperCase() : 'A'}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center gap-2">
                                {article.author}
                                {/* <span className='text-green-600 dark:text-green-400 text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/30 rounded-full'>Follow</span> */}
                            </p>
                            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span>{new Date(article.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>{readTime} min read</span>
                            </div>
                        </div>
                    </div>

                    {/* Share / Actions (Visual only for now) */}
                    <div className="flex gap-4 text-gray-400">
                        <Share2 className="w-5 h-5 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Featured Image (Wide) */}
            <div className="container mx-auto px-4 md:px-0 max-w-5xl mb-12">
                <div className="relative w-full aspect-[2/1] md:aspect-[2.5/1] rounded-lg overflow-hidden shadow-sm">
                    <Image
                        src={article.coverImageUrl}
                        alt={titleToRender}
                        className="object-cover object-center w-full h-full hover:scale-105 transition-transform duration-700"
                        width={1200}
                        height={600}
                        priority
                    />
                </div>
                <p className='text-center text-sm text-gray-500 mt-3 font-serif italic'>
                    Source: Image by Author / Pexels
                </p>
            </div>

            {/* Main Content (Narrow & Serif) */}
            <div className="container mx-auto px-4 md:px-0 max-w-3xl pb-20">

                {/* TOC (Optional, can be sidebar on desktop but inline here for simplicity) */}
                {headings.length > 0 && (
                    <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Table of Contents</p>
                        <TableOfContents headings={headings} />
                    </div>
                )}

                <div
                    className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                    font-serif 
                    prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight 
                    prose-p:leading-loose prose-p:text-gray-800 dark:prose-p:text-gray-300
                    prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-md
                    prose-blockquote:border-l-green-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
                    dangerouslySetInnerHTML={{ __html: modifiedContent }}
                />

                {/* Tags / Categories (Dummy for now) */}
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                        {['Business', 'Technology', 'Web Design'].map(tag => (
                            <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

            </div>


            <div className='max-w-4xl mx-auto px-4'>
                <FaqSection />
            </div>

            <FloatingWhatsApp />

        </article>
    );
}
