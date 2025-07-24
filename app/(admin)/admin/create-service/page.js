'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';

// Impor untuk Tiptap & Ekstensi Tabel
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

// Komponen MenuBar khusus untuk halaman ini
const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="border border-gray-600 bg-[#2ECC71]/15 rounded-t-md p-2 text-black flex flex-wrap gap-x-3 gap-y-2">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">H1</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">H3</button>

            <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">Buat Tabel</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">Tambah Kolom</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white">Tambah Baris</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 rounded hover:bg-[#2ECC71] hover:text-white text-red-400">Hapus Tabel</button>
        </div>
    );
};

export default function CreateServicePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const [heroImage, setHeroImage] = useState(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [pricingCategory, setPricingCategory] = useState('seo'); // Default kategori
    const [features, setFeatures] = useState(['']);
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk mengubah isi fitur
    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    // Fungsi untuk menambah input fitur baru
    const addFeature = () => {
        setFeatures([...features, '']);
    };

    // Fungsi untuk menghapus input fitur
    const removeFeature = (index) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: `
            <h2>Keuntungan & Harga</h2>
            <table>
              <tbody>
                <tr>
                  <th>Fitur</th>
                  <th>Deskripsi</th>
                </tr>
                <tr>
                  <td>
                    <p><strong>Harga Mulai Dari</strong></p>
                  </td>
                  <td>
                    <p>Rp 3.000.000 (Hubungi untuk detail)</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p><strong>Waktu Pengerjaan</strong></p>
                  </td>
                  <td>
                    <p>2-4 Minggu</p>
                  </td>
                </tr>
              </tbody>
            </table>
        `,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none p-4 border-b border-x border-gray-600 bg-[#2ECC71]/15 text-black rounded-b-md min-h-[300px] focus:outline-none',
            },
        },
    });

    useEffect(() => {
        const autoSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
        setSlug(autoSlug);
    }, [title]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const advantagesHTML = editor ? editor.getHTML() : '';

        if (!title || !slug || !shortDescription || !heroImage) {
            alert("Judul, Slug, Deskripsi Singkat, dan Gambar Utama wajib diisi!");
            return;
        }
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', heroImage);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message || 'Gagal upload gambar');

            const heroImageUrl = data.secure_url; // URL gambar utama dari Cloudinary

            await addDoc(collection(db, "services"), {
                title,
                slug,
                shortDescription,
                heroImageUrl, // <-- SIMPAN URL GAMBAR
                pricingCategory,
                featuresList: features, // <-- Simpan array fitur ke Firestore
                advantagesHTML,
                createdAt: serverTimestamp(),
                author: user.email,
                published: true,
            });
            alert("Layanan baru berhasil dibuat!");
            // Memicu update cache untuk halaman /layanan
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}&path=/layanan`);
            router.push('/admin');
        } catch (error) {
            console.error("Error creating document: ", error);
            alert("Gagal membuat layanan.");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div className="bg-gray-800 text-black min-h-screen flex items-center justify-center">Loading...</div>;

    if (user) {
        return (
            <div className="bg-white text-black min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/admin" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mb-8">Create New Service</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium mb-1">Judul Layanan</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border border-gray-600 rounded-md bg-[#2ECC71]/15 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1">Slug (URL)</label>
                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full p-2 border border-gray-600 rounded-md bg-[#2ECC71]/15 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1">Category</label>
                            <input type="text" value={pricingCategory} onChange={(e) => setPricingCategory(e.target.value)} required className="w-full p-2 border border-gray-600 rounded-md bg-[#2ECC71]/15 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                            <label className="block text-xs font-medium mb-1 text-gray-400">Kategori: (seo, web, app, ads, dash)</label>
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1">Deskripsi Singkat (untuk kartu layanan)</label>
                            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} required className="w-full p-2 border border-gray-600 rounded-md bg-[#2ECC71]/15 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-1">Gambar Utama (Hero Image)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setHeroImage(e.target.files[0])} 
                                accept="image/png, image/jpeg, image/webp"
                                required 
                                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2ECC71] file:text-white hover:file:bg-[#2ECC71]/80 file:cursor-pointer file:transition-colors file:duration-200 file:ease-in-out"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-2">Fitur Unggulan (Daftar List)</label>
                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="w-full p-2 border border-gray-600 rounded-md bg-[#2ECC71]/15 text-black"
                                            placeholder={`Fitur #${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeFeature(index)} className="bg-red-600 text-white px-3 py-2 rounded-md">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addFeature} className="mt-2 bg-[#2ECC71] text-white px-4 py-2 rounded-md text-sm">+ Tambah Fitur</button>
                        </div>

                        {/* <div>
                            <label className="block text-lg font-medium mb-2">Tabel Keuntungan & Harga</label>
                            <MenuBar editor={editor} />
                            <EditorContent editor={editor} />
                        </div> */}
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-teal-600 text-white font-bold rounded-md text-lg hover:bg-teal-700 disabled:bg-gray-500">
                            {isLoading ? 'Memproses...' : 'Publikasikan Layanan'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return null;
}