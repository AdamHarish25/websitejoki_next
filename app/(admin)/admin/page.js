'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const triggerRevalidation = async () => {
    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`);
  };

  // Fungsi untuk mengambil semua artikel dari Firestore
  const fetchArticles = async () => {
    setIsLoading(true);
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const articlesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Format tanggal menjadi YYYY-MM-DD agar mudah disortir
      createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-CA')
    }));
    setArticles(articlesData);
    setIsLoading(false);
  };

  // Jalankan fetchArticles saat komponen dimuat dan ada user
  useEffect(() => {
    if (user && !loading) {
      fetchArticles();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const articleRef = doc(db, 'articles', id);
    try {
      await updateDoc(articleRef, {
        published: !currentStatus
      });
      // Ambil ulang data untuk update tampilan secara real-time
      fetchArticles();
      await triggerRevalidation(); // <-- PANGGIL REVALIDASI DI SINI
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Gagal mengubah status.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus artikel ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        fetchArticles(); // Ambil ulang data
        await triggerRevalidation(); // <-- PANGGIL REVALIDASI DI SINI
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Gagal menghapus artikel.");
      }
    }
  };

  // Menampilkan loading state jika data user atau artikel sedang diambil
  if (loading || isLoading) {
    return (
      <div className="bg-gray-800 text-white min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  // Tampilkan dashboard jika user sudah login
  if (user) {
    return (
      <div className="bg-white text-black min-h-screen p-4 md:p-8">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold"><span className='text-[#2ECC71] font-bold'>WebjokiID</span> Dashboard</h1>
            <p className="text-gray-400">Welcome, {user.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white font-bold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Logout</button>
        </header>

        <div className="bg-[#2ECC71]/15 p-6 rounded-lg mb-10">
          <p className="mb-4">This is your admin dashboard where you can manage articles.</p>
          <Link href="/admin/create-article" className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition-colors mr-4">
            + Create New Article
          </Link>
          {/* <Link href="/admin/create-service" className="bg-teal-600 text-white px-5 py-3 rounded-md hover:bg-teal-700 transition-colors">+ Create New Service</Link> */}
        </div>

        {/* Tabel Artikel */}
        <div className="bg-[#2ECC71]/15 p-6 rounded-lg overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Manage Articles</h2>
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="p-3">TITLE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">DATE CREATED</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {articles.length > 0 ? articles.map(article => (
                <tr key={article.id} className="border-b border-gray-600 hover:bg-[#2ECC71]/30">
                  <td className="p-3">{article.title}</td>
                  <td className="p-3">
                    <label className="switch">
                      <input type="checkbox" checked={article.published || false} onChange={() => handleStatusToggle(article.id, article.published)} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td className="p-3">{article.createdAt}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/edit-article/${article.id}`} className="text-yellow-400 hover:underline mr-4">Edit</Link>
                    <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">No articles found. Create one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tambahkan Tabel Services di sini dengan cara yang sama */}

      </div>
    );
  }
  return null; // Atau redirect ke login
}