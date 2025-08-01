'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const [articles, setArticles] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- FUNGSI FETCH DATA (Tidak perlu diubah, tapi akan kita gunakan sebagai referensi) ---
    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Fetch Articles
                const articlesQuery = query(collection(db, "articles"), orderBy("createdAt", "desc"));
                const articlesSnapshot = await getDocs(articlesQuery);
                setArticles(articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Services
                const servicesQuery = query(collection(db, "services"), orderBy("createdAt", "desc"));
                const servicesSnapshot = await getDocs(servicesQuery);
                setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [user, loading, router]);


    // ================== INI BAGIAN YANG DIPERBAIKI ==================

    const handleServiceDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus layanan ini?")) {
            try {
                // Hapus dokumen dari Firestore
                await deleteDoc(doc(db, 'services', id));

                // Perbarui state secara manual untuk menghapus item dari UI
                setServices(currentServices => currentServices.filter(service => service.id !== id));
                
                // Panggil revalidasi jika perlu
                await triggerRevalidation('/layanan');
                
                alert("Layanan berhasil dihapus.");
            } catch (error) {
                console.error("Error deleting service: ", error);
                alert("Gagal menghapus layanan.");
            }
        }
    };

  const handleArticleDelete = async (id) => {
        if (window.alert("Yakin ingin menghapus artikel ini?")) {
            try {
                await deleteDoc(doc(db, 'articles', id));
                
                // KESALAHAN UMUM: Sebelumnya mungkin tertulis setServices.
                // PERBAIKAN: Pastikan ini memanggil setArticles.
                setArticles(currentArticles => currentArticles.filter(article => article.id !== id));

                await triggerRevalidation('/blog');
                alert("Artikel berhasil dihapus.");
            } catch (error) {
                console.error("Error deleting article: ", error);
                alert("Gagal menghapus artikel.");
            }
        }
    };

    const triggerRevalidation = async (path) => {
        await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}&path=${path}`);
    };
    
    // ================== AKHIR BAGIAN YANG DIPERBAIKI ==================


    if (loading || isLoading) {
        return <div className="bg-white text-black min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
    }

    if (!user) {
        // Ini seharusnya tidak terjadi karena ada redirect di useEffect, tapi sebagai fallback
        return null;
    }
    
    // ================== JSX TIDAK DIUBAH, HANYA MEMASTIKAN `onClick` BENAR ==================
    return (
        <div className="bg-white text-black min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                <p className="mb-8">Welcome, {user.displayName || user.email}. This is your admin dashboard where you can manage articles.</p>

                <div className="flex gap-4 mb-8">
                    <Link href="/admin/create-article" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">+ Create New Article</Link>
                    <Link href="/admin/create-service" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">+ Create New Service</Link>
                    <Link href="/admin/manage-pricing" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600">+ Manage Pricing Packages</Link>
                </div>

                {/* Manage Articles Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Manage Articles</h2>
                    <div className="overflow-x-auto bg-[#2ECC71]/10 p-4 rounded-lg">
                        <table className="min-w-full text-left">
                            <thead className="border-b-2 border-gray-300">
                                <tr>
                                    <th className="py-2 px-4">TITLE</th>
                                    <th className="py-2 px-4">DATE CREATED</th>
                                    <th className="py-2 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id} className="border-b border-gray-200">
                                        <td className="py-3 px-4">{article.title}</td>
                                        <td className="py-3 px-4 text-gray-500">{article.createdAt ? format(article.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</td>
                                        <td className="py-3 px-4 flex justify-end gap-2">
                                            <Link href={`/admin/edit-article/${article.id}`} className="text-blue-500 hover:underline">Edit</Link>
                                            <button onClick={() => handleArticleDelete(article.id)} className="text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manage Services Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Manage Services</h2>
                     <div className="overflow-x-auto bg-[#2ECC71]/10 p-4 rounded-lg">
                        <table className="min-w-full text-left">
                            <thead className="border-b-2 border-gray-300">
                                <tr>
                                    <th className="py-2 px-4">SERVICE TITLE</th>
                                    <th className="py-2 px-4">DATE CREATED</th>
                                    <th className="py-2 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id} className="border-b border-gray-200">
                                        <td className="py-3 px-4">{service.title}</td>
                                        <td className="py-3 px-4 text-gray-500">{service.createdAt ? format(service.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</td>
                                        <td className="py-3 px-4 flex justify-end gap-2">
                                            <Link href={`/admin/edit-service/${service.id}`} className="text-blue-500 hover:underline">Edit</Link>
                                            <button onClick={() => handleServiceDelete(service.id)} className="text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}