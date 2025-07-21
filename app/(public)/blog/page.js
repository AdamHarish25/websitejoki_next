import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

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
      createdAt: data.createdAt.toDate().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    }
  });
  return articleList;
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="bg-white dark:bg-gray-900 h-auto lg:h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Blog & Artikel</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Wawasan, tips, dan berita terbaru dari tim kami.</p>
        </div>
        
        {articles.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada artikel yang dipublikasikan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`} className="block group">
                <div className="hover:border-2 border-[#2ECC71] transition-transform duration-400 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                  <div className="relative w-full h-52">
                    <img 
                      src={article.coverImageUrl} 
                      alt={`Gambar cover untuk artikel ${article.title}`} 
                      className="object-cover w-full h-52" 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800">
                    <h2 className="text-lg lg:text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">{article.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-auto pt-4">
                      Dipublikasikan pada {article.createdAt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}