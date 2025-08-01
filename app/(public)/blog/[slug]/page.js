import CtaSection from '@/components/sections/CTASection';
import FaqSection from '@/components/sections/FaqSection';
import AnimatedSection from '@/components/shared/AnimatedSection';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TableOfContents from '@/components/blog/tableofcontents'; // <-- Impor komponen baru
import { JSDOM } from 'jsdom'; // <-- Impor JSDOM untuk membaca HTML


async function getArticle(slug) {
  const q = query(collection(db, "articles"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    notFound();
  }

  const articleData = querySnapshot.docs[0].data();

  // Menambahkan validasi: jika artikel ada tapi tidak dipublish, anggap tidak ditemukan
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

  return {
    title: `${article.title} | WebsiteJoki.ID`,
    // Gunakan metaDescription dari database, atau potong konten jika kosong
    description: article.metaDescription || article.content.replace(/<[^>]+>/g, '').substring(0, 155) + '...',
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.content.replace(/<[^>]+>/g, '').substring(0, 155) + '...',
      images: [{ url: article.coverImageUrl }],
    },
  };
}

function extractHeadings(content) {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const headings = Array.from(document.querySelectorAll('h2, h3'));

  const toc = headings.map(h => {
    const id = h.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    h.setAttribute('id', id); // Tambahkan ID ke elemen heading
    return {
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent,
      id: id,
    };
  });

  // Kembalikan daftar heading DAN konten yang sudah dimodifikasi
  return {
    headings: toc,
    modifiedContent: document.body.innerHTML,
  };
}


export async function generateStaticParams() {
  const articlesCol = collection(db, 'articles');
  // Menambahkan filter untuk hanya membuat halaman statis bagi artikel yang dipublish
  const q = query(articlesCol, where("published", "==", true));
  const articleSnapshot = await getDocs(q);
  const paths = articleSnapshot.docs.map(doc => ({
    slug: doc.data().slug || '',
  })).filter(path => path.slug);

  return paths;
}

export const revalidate = 60;

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const { headings, modifiedContent } = extractHeadings(article.content);

  return (
    <article className="bg-white dark:bg-gray-900">
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