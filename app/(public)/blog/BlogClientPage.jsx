'use client';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';

export default function BlogClientPage({ articles }) {
    const { t, language } = useLanguage();

    return (
        <div className="bg-white dark:bg-gray-900 h-auto text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    {/* Gunakan translation untuk judul halaman */}
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t('blog.title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{t('blog.subtitle')}</p>
                </div>

                {articles.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">{t('blog.empty_state')}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => {
                            // Logic Translation:
                            // Cek apakah language 'en' aktif dan apakah field bahasa inggris ada di data artikel.
                            // Jika tidak, gunakan default bahasa Indonesia (field biasa).
                            const title = (language === 'en' && article.title_en) ? article.title_en : article.title;
                            const description = (language === 'en' && article.metaDescription_en) ? article.metaDescription_en : article.metaDescription;

                            // Format tanggal juga bisa disesuaikan jika mau
                            // const date = language === 'en' ? ... : article.createdAt; 
                            // Tapi article.createdAt sudah berupa string dari server (format ID). 
                            // Idealnya kirim timestamp mentah jika ingin format date di client, tapi kita pakai string yang ada dulu.

                            return (
                                <Link key={article.id} href={`/blog/${article.slug}`} className="block group">
                                    <div className="hover:border-2 hover:border-[#2ECC71] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                                        <div className="relative w-full h-52">
                                            <Image
                                                src={article.coverImageUrl}
                                                alt={`Gambar cover untuk artikel ${title}`}
                                                className="object-cover w-full h-52"
                                                width={800}
                                                height={450}
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800 space-y-6">
                                            <h2 className="text-lg lg:text-xl font-bold  group-hover:text-green-600 transition-colors">{title}</h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                                {description}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-auto pt-4">
                                                {t('blog.published_on')} {article.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <FloatingWhatsApp />

        </div>
    );
}
