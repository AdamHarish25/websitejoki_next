// Lokasi: app/blog/[slug]/page.jsx

import CtaSection from '@/components/sections/CTASection';
import FaqSection from '@/components/sections/FaqSection';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TableOfContents from '@/components/blog/tableofcontents';
import { JSDOM } from 'jsdom';

// ===================================================================
// PERUBAHAN UTAMA DI SINI
// ===================================================================

// Hapus atau beri komentar pada fungsi generateStaticParams dan revalidate
/*
export async function generateStaticParams() {
  // ... FUNGSI INI DITIDAKAKTIFKAN
}
*/
// export const revalidate = 60; // <-- HAPUS ATAU KOMENTARI BARIS INI

// TAMBAHKAN BARIS INI untuk memaksa Server-Side Rendering (SSR)
// Ini memastikan data selalu di-fetch dari Firestore setiap kali halaman dibuka.
export const dynamic = 'force-dynamic';

// ===================================================================

async function getArticle(slug) {
  const q = query(collection(db, "articles"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    notFound();
  }

  const articleData = querySnapshot.docs[0].data();

  if (articleData.published !== true) {
    notFound();
  }

  return {
    ...articleData,
    createdAt: articleData.createdAt.toDate().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }
  
  const description = article.metaDescription || (article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 155) + '...' : '');

  return {
    title: `${article.title} | WebsiteJoki.ID`,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      images: [{ url: article.coverImageUrl }],
    },
  };
}

function extractHeadings(content) {
    if (!content || typeof content !== 'string') {
        return { headings: [], modifiedContent: '' };
    }
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const headings = Array.from(document.querySelectorAll('h2, h3'));

  const toc = headings.map(h => {
    const text = h.textContent || '';
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    h.setAttribute('id', id);
    return {
      level: parseInt(h.tagName.substring(1)),
      text: text,
      id: id,
    };
  });

  return {
    headings: toc,
    modifiedContent: document.body.innerHTML,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const { headings, modifiedContent } = extractHeadings(article.content);

  return (
    <article className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-16">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{article.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">Oleh {article.author} • Dipublikasikan pada {article.createdAt}</p>
        </header>

        {headings.length > 0 && <TableOfContents headings={headings} />}

        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-5 shadow-lg">
          <Image
            src={article.coverImageUrl}
            alt={`Gambar cover untuk artikel ${article.title}`}
            className="object-cover object-center w-full h-full"
            width={800}
            height={450}
          />
        </div>
        <p className='text-gray-400 pb-10'>Source: Pexels.com</p>

        <div
          className="prose lg:prose-xl dark:prose-invert max-w-none prose-headings:mb-3 prose-headings:mt-8 // Atur jarak atas/bawah untuk judul
    prose-p:my-4                          // Atur jarak atas/bawah untuk paragraf
    prose-ul:my-4                           // Atur jarak atas/bawah untuk list
    prose-ol:my-4                           // Atur jarak atas/bawah untuk list"
          dangerouslySetInnerHTML={{ __html: modifiedContent }}
        />
      </div>


      <FaqSection />
      {/* <CtaSection /> */}

      <FloatingWhatsApp />

    </article>
  );
}