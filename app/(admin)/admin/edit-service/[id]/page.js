'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';

// Impor komponen Blok
import TextBlock from '@/components/admin/TextBlock';
import ImageTextBlock from '@/components/admin/ImageTextBlock';

export default function EditServicePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { id } = useParams(); // Mengambil ID dari URL

    // State untuk semua data layanan
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [pricingCategory, setPricingCategory] = useState('seo');
    const [heroImage, setHeroImage] = useState(null); // Untuk file gambar baru
    const [existingHeroImageUrl, setExistingHeroImageUrl] = useState(''); // Untuk URL gambar lama
    const [features, setFeatures] = useState(['']);
    const [pageContent, setPageContent] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);

    // Ambil data layanan yang ada saat halaman dimuat
    useEffect(() => {
        if (id) {
            const fetchService = async () => {
                setIsFetchingData(true);
                const docRef = doc(db, 'services', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setSlug(data.slug);
                    setShortDescription(data.shortDescription);
                    setPricingCategory(data.pricingCategory);
                    setExistingHeroImageUrl(data.heroImageUrl);
                    setFeatures(data.featuresList || ['']);
                    setPageContent(data.pageContent || []);
                } else {
                    alert("Layanan tidak ditemukan!");
                    router.push('/admin');
                }
                setIsFetchingData(false);
            };
            fetchService();
        }
    }, [id, router]);
    
    // Fungsi untuk mengelola input fitur
    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };
    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

    // Fungsi untuk mengelola blok konten
    const addBlock = (type) => {
        if (type === 'richText') {
            setPageContent([...pageContent, { type: 'richText', content: '<p>Teks baru...</p>' }]);
        }
        if (type === 'imageLeftTextRight') {
            setPageContent([...pageContent, {
                type: 'imageLeftTextRight',
                content: { imageUrl: '', text: '<h2>Judul Fitur</h2><p>Penjelasan fitur...</p>', imageFile: null, imagePosition: 'left' }
            }]);
        }
    };
    const updateBlockContent = (index, newContent) => {
        const updatedContent = [...pageContent];
        updatedContent[index].content = newContent;
        setPageContent(updatedContent);
    };
    const removeBlock = (index) => setPageContent(pageContent.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !slug || !shortDescription) {
            alert("Judul, Slug, dan Deskripsi wajib diisi!");
            return;
        }
        setIsLoading(true);

        try {
            let updatedHeroImageUrl = existingHeroImageUrl;

            // Jika ada gambar baru yang diupload, ganti URL-nya
            if (heroImage) {
                const heroFormData = new FormData();
                heroFormData.append('file', heroImage);
                heroFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                const heroResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: heroFormData });
                const heroData = await heroResponse.json();
                if (!heroResponse.ok) throw new Error(heroData.error.message);
                updatedHeroImageUrl = heroData.secure_url;
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
                    return { ...block, content: { ...block.content, imageUrl: blockData.secure_url, imageFile: null } };
                }
                // Jika tidak ada file gambar baru, pastikan imageUrl yang lama tetap ada
                return { ...block, content: { ...block.content, imageFile: null } };
            }));

            // Update dokumen yang sudah ada
            const docRef = doc(db, 'services', id);
            await updateDoc(docRef, {
                title,
                slug,
                shortDescription,
                heroImageUrl: updatedHeroImageUrl,
                pricingCategory,
                featuresList: features.filter(f => f),
                pageContent: processedPageContent,
                updatedAt: serverTimestamp(),
            });

            alert("Layanan berhasil diupdate!");
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}&path=/layanan`);
            router.push('/admin');
        } catch (error) {
            console.error("Error updating document: ", error);
            alert(`Gagal mengupdate layanan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isFetchingData) return <div className="bg-white text-black min-h-screen flex items-center justify-center">Loading Service Data...</div>;

    if (user) {
        return (
            <div className="bg-white text-black min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/admin" className="text-blue-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mb-8">Edit Service</h1>
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
                                </select>
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Deskripsi Singkat</label>
                                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} required className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" />
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-1">Ganti Gambar Utama (Opsional)</label>
                                <input type="file" onChange={(e) => setHeroImage(e.target.files[0])} accept="image/png, image/jpeg, image/webp" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2ECC71] file:text-white hover:file:bg-[#2ECC71]/80 file:cursor-pointer" />
                                {existingHeroImageUrl && <p className="text-xs mt-2">Gambar saat ini: <a href={existingHeroImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Lihat gambar</a></p>}
                            </div>
                            <div>
                                <label className="block text-lg font-medium mb-2">Fitur Unggulan</label>
                                <div className="space-y-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/15 text-black" placeholder={`Fitur #${index + 1}`} />
                                            <button type="button" onClick={() => removeFeature(index)} className="bg-red-600 text-white px-3 py-2 rounded-md">&times;</button>
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
                                    <div key={index} className="bg-gray-100 p-4 rounded-md relative group">
                                        <button type="button" onClick={() => removeBlock(index)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                        <h3 className="font-bold mb-2 text-sm uppercase text-gray-500">{block.type === 'richText' ? 'Blok Teks' : 'Blok Gambar & Teks'}</h3>
                                        {block.type === 'richText' && (
                                            <TextBlock content={block.content} onUpdate={(newContent) => updateBlockContent(index, newContent)} />
                                        )}
                                        {block.type === 'imageLeftTextRight' && (
                                            <ImageTextBlock content={block.content} onUpdate={(newContent) => updateBlockContent(index, newContent)} />
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
                            {isLoading ? 'Menyimpan Perubahan...' : 'Update Layanan'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return null;
}