import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import ArticleClientPage from './ArticleClientPage';

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
    createdAt: articleData.createdAt?.toDate ? articleData.createdAt.toDate().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }) : articleData.createdAt,
    updatedAt: articleData.updatedAt?.toDate ? articleData.updatedAt.toDate().toISOString() : null,
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

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <ArticleClientPage article={article} />
  );
}