'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';

// Impor komponen Blok
import TextBlock from '@/components/admin/TextBlock';
import ImageTextBlock from '@/components/admin/ImageTextBlock';

export default function CreateServicePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    // State untuk data layanan baru
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [pricingCategory, setPricingCategory] = useState('seo');
    const [heroImage, setHeroImage] = useState(null);
    const [features, setFeatures] = useState(['']);
    const [pageContent, setPageContent] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk mengelola input fitur (logika tidak berubah)
    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };
    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

    // ================== INI BAGIAN LOGIKA YANG DIPERBAIKI (SAMA SEPERTI EDIT) ==================

    const addBlock = (type) => {
        const newBlock = {
            id: `block-${Date.now()}`, // ID unik sementara
            type: type,
            content: type === 'richText' 
                ? '<p>Teks baru...</p>' 
                : { imageUrl: '', text: '<h2>Judul Fitur</h2><p>Penjelasan fitur...</p>', imageFile: null, imagePosition: 'left' }
        };
        setPageContent([...pageContent, newBlock]);
    };
    
    // Handler KHUSUS untuk 'richText' (TextBlock) yang menerima STRING
    const updateTextBlockContent = (index, newContentString) => {
        const updatedPageContent = [...pageContent];
        // Langsung timpa field 'content' dengan string baru. Ini adalah Kunci Perbaikannya.
        updatedPageContent[index].content = newContentString;
        setPageContent(updatedPageContent);
    };

    // Handler KHUSUS untuk 'imageLeftTextRight' (ImageTextBlock) yang menerima OBJECT
    const updateImageTextBlockContent = (index, newContentObject) => {
        const updatedPageContent = [...pageContent];
        // Langsung timpa field 'content' dengan objek baru.
        updatedPageContent[index].content = newContentObject;
        setPageContent(updatedPageContent);
    };
    
    const removeBlock = (index) => setPageContent(pageContent.filter((_, i) => i !== index));

    // ================== AKHIR DARI BAGIAN LOGIKA YANG DIPERBAIKI ==================

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !slug || !shortDescription) {
            alert("Judul, Slug, dan Deskripsi wajib diisi!");
            return;
        }
        setIsLoading(true);

        try {
            let heroImageUrl = '';

            // Proses upload gambar utama jika ada
            if (heroImage) {
                const heroFormData = new FormData();
                heroFormData.append('file', heroImage);
                heroFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                const heroResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: heroFormData });
                const heroData = await heroResponse.json();
                if (!heroResponse.ok) throw new Error(heroData.error.message);
                heroImageUrl = heroData.secure_url;
            }
            
            // Proses gambar di dalam blok konten
            const processedPageContent = await Promise.all(pageContent.map(async (block) => {
                if (block.type === 'imageLeftTextRight' && block.content.imageFile) {
                    const blockFormData = new FormData();
                    blockFormData.append('file', block.content.imageFile);
                    blockFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                    const blockResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: blockFormData });
                    const blockData = await blockResponse.json();
                    if (!blockResponse.ok) throw new Error(blockData.error.message);
                    
                    // Buat konten bersih tanpa imageFile
                    const { imageFile, ...restOfContent } = block.content;
                    return { ...block, content: { ...restOfContent, imageUrl: blockData.secure_url } };
                }
                 // Jika tidak ada file gambar baru, pastikan properti imageFile dihapus
                if (block.content && block.content.imageFile) {
                    const { imageFile, ...restOfContent } = block.content;
                    return { ...block, content: restOfContent };
                }
                return block;
            }));

            // Tambahkan dokumen baru ke Firestore
            await addDoc(collection(db, 'services'), {
                title,
                slug,
                shortDescription,
                heroImageUrl,
                pricingCategory,
                featuresList: features.filter(f => f),
                pageContent: processedPageContent, // Data sudah dijamin benar
                createdAt: serverTimestamp(),
            });

            alert("Layanan baru berhasil dibuat!");
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}&path=/layanan`);
            router.push('/admin');
        } catch (error) {
            console.error("Error creating document: ", error);
            alert(`Gagal membuat layanan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div className="bg-white text-black min-h-screen flex items-center justify-center">Loading...</div>;

    // ================== BAGIAN JSX - TAMPILAN TIDAK DIUBAH SAMA SEKALI ==================
    if (user) {
        return (
            <div className="bg-white text-black min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/admin" className="text-blue-600 hover:underline mb-6 block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mb-8">Create New Service</h1>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="p-6 bg-[#2ECC71]/10 rounded-lg space-y-4">
                            <div>
                                <label className="block text-lg font-medium mb-1">Judul Layanan</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Slug (URL)</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Kategori Harga</label>
                                <select value={pricingCategory} onChange={(e) => setPricingCategory(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black">
                                    <option value="seo">Jasa SEO</option>
                                    <option value="ads">Jasa Ads</option>
                                    <option value="web-design">Jasa Web Design</option>
                                    <option value="app">Jasa App Development</option>
                                    <option value="dash">Jasa Dashboard</option>
                                    <option value="brand">Jasa Branding</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Deskripsi Singkat</label>
                                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} required className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Gambar Utama</label>
                                <input type="file" onChange={(e) => setHeroImage(e.target.files[0])} accept="image/png, image/jpeg, image/webp" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2ECC71] file:text-white hover:file:bg-[#2ECC71]/80 file:cursor-pointer" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-2">Fitur Unggulan</label>
                                <div className="space-y-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" placeholder={`Fitur #${index + 1}`} />
                                            <button type="button" onClick={() => removeFeature(index)} className="bg-red-600 text-white px-3 py-2 rounded-md">×</button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addFeature} className="mt-2 bg-[#2ECC71] text-white px-4 py-2 rounded-md text-sm">+ Tambah Fitur</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xl font-semibold mb-4">Konten Halaman (Page Builder)</label>
                            <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                {pageContent.map((block, index) => (
                                    <div key={block.id || index} className="bg-gray-100 p-4 rounded-md relative group">
                                        <button type="button" onClick={() => removeBlock(index)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                        <h3 className="font-bold mb-2 text-sm uppercase text-gray-500">{block.type === 'richText' ? 'Blok Teks' : 'Blok Gambar & Teks'}</h3>
                                        
                                        {/* PANGGIL HANDLER YANG BENAR DI SINI */}
                                        {block.type === 'richText' && (
                                            <TextBlock content={block.content} onUpdate={(newContent) => updateTextBlockContent(index, newContent)} />
                                        )}
                                        {block.type === 'imageLeftTextRight' && (
                                            <ImageTextBlock content={block.content} onUpdate={(newContent) => updateImageTextBlockContent(index, newContent)} />
                                        )}
                                    </div>
                                ))}
                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => addBlock('richText')} className="bg-blue-600 text-white px-4 py-2 rounded-md">+ Tambah Blok Teks</button>
                                    <button type="button" onClick={() => addBlock('imageLeftTextRight')} className="bg-teal-600 text-white px-4 py-2 rounded-md">+ Tambah Blok Gambar & Teks</button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-4 bg-yellow-500 text-black font-bold rounded-md text-lg hover:bg-yellow-600 disabled:bg-gray-500">
                            {isLoading ? 'Menyimpan...' : 'Simpan Layanan'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return null;
}