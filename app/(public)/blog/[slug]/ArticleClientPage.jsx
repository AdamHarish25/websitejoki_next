'use client';
import CtaSection from '@/components/sections/CTASection';
import FaqSection from '@/components/sections/FaqSection';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';
import Image from 'next/image';
import TableOfContents from '@/components/blog/tableofcontents';
import { useLanguage } from '@/context/LanguageContext';
import { useMemo } from 'react';
// Note: We use Regex here to avoid using JSDOM (which is Node.js only) in a Client Component.
function extractHeadings(contentHTML) {
    if (!contentHTML || typeof contentHTML !== 'string') {
        return { headings: [], modifiedContent: '' };
    }

    const headings = [];
    // Regex to match h2 and h3 tags. 
    // Captures: 1=tag (h2/h3), 2=attributes, 3=content
    const regex = /<(h[23])((?:\s+[^>]*)*)>(.*?)<\/\1>/gi;

    const modifiedContent = contentHTML.replace(regex, (match, tag, attrs, content) => {
        // Remove HTML tags from content to get plain text for ID and TOC
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        const id = plainText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        headings.push({
            level: parseInt(tag.substring(1)),
            text: plainText,
            id: id
        });

        // Reconstruct the tag with the new ID. 
        // We preserve existing attributes but strictly speaking, if an ID existed, this might duplicate it.
        // For our Tiptap content, this is generally safe.
        return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
    });

    return { headings, modifiedContent };
}

export default function ArticleClientPage({ article }) {
    const { language, t } = useLanguage();

    // Logic Translation Content
    // Cek apakah content EN ada. Jika ada dan language === 'en', gunakan.
    const isEn = language === 'en';
    const contentToRender = (isEn && article.content_en) ? article.content_en : article.content;
    const titleToRender = (isEn && article.title_en) ? article.title_en : article.title;
    // const authorToRender = article.author; // Author biasanya sama

    // Extract headings dari konten yang sudah dipilih bahasanya
    const { headings, modifiedContent } = useMemo(() => {
        return extractHeadings(contentToRender);
    }, [contentToRender]);

    return (
        <article className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl py-16">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{titleToRender}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('blog.published_on')} {article.createdAt} • By {article.author}
                    </p>
                </header>

                {headings.length > 0 && <TableOfContents headings={headings} />}

                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-5 shadow-lg">
                    <Image
                        src={article.coverImageUrl}
                        alt={`Gambar cover untuk artikel ${titleToRender}`} // Translation untuk alt text
                        className="object-cover object-center w-full h-full"
                        width={800}
                        height={450}
                    />
                </div>
                <p className='text-gray-400 pb-10'>Source: Pexels.com</p>

                <div
                    className="prose lg:prose-xl dark:prose-invert max-w-none prose-headings:mb-3 prose-headings:mt-8 
    prose-p:my-4                          
    prose-ul:my-4                           
    prose-ol:my-4"
                    dangerouslySetInnerHTML={{ __html: modifiedContent }}
                />
            </div>


            <FaqSection />
            {/* <CtaSection /> */}

            <FloatingWhatsApp />

        </article>
    );
}
