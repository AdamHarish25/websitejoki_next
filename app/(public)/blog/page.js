import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import BlogClientPage from './BlogClientPage';

async function getArticles() {
  const articlesCollection = collection(db, 'articles');
  // Menambahkan filter untuk hanya mengambil artikel dengan published: true
  const q = query(articlesCollection, where("published", "==", true), orderBy('createdAt', 'desc'));
  const articleSnapshot = await getDocs(q);

  const articleList = articleSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Konversi date di sini agar serializable saat dikirim ke Client Component
      createdAt: data.createdAt.toDate().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    }
  });
  return articleList;
}

export default async function BlogPage() {
  const articles = await getArticles();

  return <BlogClientPage articles={articles} />;
}