'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { Loader2, ArrowLeft, Sparkles, ImagePlus, FileText, Globe, Box, Layout, Plus, Trash2 } from 'lucide-react';
import TextBlock from '@/components/admin/TextBlock';
import ImageTextBlock from '@/components/admin/ImageTextBlock';

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-[#2ECC71]" />}
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default function EditServicePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { id } = useParams();
    const [isMounted, setIsMounted] = useState(false);

    // ID States
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [features, setFeatures] = useState(['']);

    // EN States
    const [titleEn, setTitleEn] = useState('');
    const [shortDescriptionEn, setShortDescriptionEn] = useState('');
    const [featuresEn, setFeaturesEn] = useState(['']);

    // Metadata & Content
    const [pricingCategory, setPricingCategory] = useState('seo');
    const [heroImage, setHeroImage] = useState(null);
    const [existingHeroImageUrl, setExistingHeroImageUrl] = useState('');
    const [pageContent, setPageContent] = useState([]);

    // Content Builder Logic
    const [activeTab, setActiveTab] = useState('id'); // 'id' or 'en'
    const [pageContentEn, setPageContentEn] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch Content
    useEffect(() => {
        if (id) {
            const fetchService = async () => {
                setIsFetchingData(true);
                const docRef = doc(db, 'services', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || '');
                    setSlug(data.slug || '');
                    setShortDescription(data.shortDescription || '');
                    setPricingCategory(data.pricingCategory || 'seo');
                    setExistingHeroImageUrl(data.heroImageUrl || '');
                    setFeatures(data.featuresList || ['']);
                    setPageContent(data.pageContent || []);

                    // EN Data
                    setTitleEn(data.title_en || '');
                    setShortDescriptionEn(data.shortDescription_en || '');
                    setFeaturesEn(data.featuresList_en || ['']);
                    setPageContentEn(data.pageContent_en || []);
                } else {
                    alert("Layanan tidak ditemukan!");
                    router.push('/admin');
                }
                setIsFetchingData(false);
            };
            fetchService();
        }
    }, [id, router]);

    // Handlers
    const handleFeatureChange = (index, value, isEn = false) => {
        const targetState = isEn ? featuresEn : features;
        const setTargetState = isEn ? setFeaturesEn : setFeatures;
        const newFeatures = [...targetState];
        newFeatures[index] = value;
        setTargetState(newFeatures);
    };

    const addFeature = (isEn = false) => {
        const targetState = isEn ? featuresEn : features;
        const setTargetState = isEn ? setFeaturesEn : setFeatures;
        setTargetState([...targetState, '']);
    };

    const removeFeature = (index, isEn = false) => {
        const targetState = isEn ? featuresEn : features;
        const setTargetState = isEn ? setFeaturesEn : setFeatures;
        setTargetState(targetState.filter((_, i) => i !== index));
    };

    // Helper for sequential translation to avoid rate limits
    const translateText = async (text) => {
        if (!text) return '';
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, sourceLang: 'id', targetLang: 'en' }),
            });
            if (!res.ok) return text; // Fallback to original
            const data = await res.json();
            return data.translatedText || text;
        } catch (e) {
            console.error("Translation failed:", e);
            return text;
        }
    };

    const handleAutoTranslate = async () => {
        setIsTranslating(true);
        try {
            if (title && !titleEn) {
                const globalTitle = await translateText(title);
                setTitleEn(globalTitle);
            }
            if (shortDescription && !shortDescriptionEn) {
                const globalDesc = await translateText(shortDescription);
                setShortDescriptionEn(globalDesc);
            }

            // Translate Features Sequentially
            if (features.length > 0 && (featuresEn.length === 1 && !featuresEn[0])) {
                const newFeaturesEn = [];
                for (const f of features) {
                    const trans = await translateText(f);
                    newFeaturesEn.push(trans);
                }
                setFeaturesEn(newFeaturesEn);
            }

            // Translate Page Content Sequentially (Mirror ID to EN)
            if (pageContent.length > 0 && pageContentEn.length === 0) {
                const newPageContentEn = [];
                for (const block of pageContent) {
                    // Deep copy
                    const newBlock = JSON.parse(JSON.stringify(block));
                    newBlock.id = `block-en-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    if (newBlock.type === 'richText') {
                        newBlock.content = await translateText(newBlock.content);
                    } else if (newBlock.type === 'imageLeftTextRight') {
                        newBlock.content.text = await translateText(newBlock.content.text);
                        // Re-attach file object if it exists
                        if (block.content.imageFile) {
                            newBlock.content.imageFile = block.content.imageFile;
                        }
                    }
                    newPageContentEn.push(newBlock);
                }
                setPageContentEn(newPageContentEn);
            }

        } catch (error) {
            console.error("Auto translate error:", error);
            alert('Auto-translation partially failed. Some fields might not remain translated.');
        } finally {
            setIsTranslating(false);
        }
    };

    // Page Builder Handlers 
    const addBlock = (type) => {
        const targetState = activeTab === 'en' ? pageContentEn : pageContent;
        const setTargetState = activeTab === 'en' ? setPageContentEn : setPageContent;
        const newBlock = {
            id: `block-${Date.now()}`,
            type: type,
            content: type === 'richText'
                ? (activeTab === 'en' ? '<p>New text...</p>' : '<p>Teks baru...</p>')
                : { imageUrl: '', text: activeTab === 'en' ? '<h2>Feature Title</h2><p>Feature description...</p>' : '<h2>Judul Fitur</h2><p>Penjelasan fitur...</p>', imageFile: null, imagePosition: 'left' }
        };
        setTargetState([...targetState, newBlock]);
    };

    const updateTextBlockContent = (index, newContentString) => {
        const targetState = activeTab === 'en' ? pageContentEn : pageContent;
        const setTargetState = activeTab === 'en' ? setPageContentEn : setPageContent;
        const updatedPageContent = [...targetState];
        updatedPageContent[index].content = newContentString;
        setTargetState(updatedPageContent);
    };

    const updateImageTextBlockContent = (index, newContentObject) => {
        const targetState = activeTab === 'en' ? pageContentEn : pageContent;
        const setTargetState = activeTab === 'en' ? setPageContentEn : setPageContent;
        const updatedPageContent = [...targetState];
        updatedPageContent[index].content = newContentObject;
        setTargetState(updatedPageContent);
    };

    const removeBlock = (index) => {
        const targetState = activeTab === 'en' ? pageContentEn : pageContent;
        const setTargetState = activeTab === 'en' ? setPageContentEn : setPageContent;
        setTargetState(targetState.filter((_, i) => i !== index));
    };

    const processBlocks = async (blocks) => {
        return Promise.all(blocks.map(async (block) => {
            if (block.type === 'imageLeftTextRight' && block.content.imageFile) {
                const blockFormData = new FormData();
                blockFormData.append('file', block.content.imageFile);
                blockFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                const blockResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: blockFormData });
                const blockData = await blockResponse.json();
                if (!blockResponse.ok) throw new Error(blockData.error.message);
                const { imageFile, ...restOfContent } = block.content;
                return { ...block, content: { ...restOfContent, imageUrl: blockData.secure_url } };
            }
            if (block.content && block.content.imageFile) {
                const { imageFile, ...restOfContent } = block.content;
                return { ...block, content: restOfContent };
            }
            return block;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let updatedHeroImageUrl = existingHeroImageUrl;
            if (heroImage) {
                const heroFormData = new FormData();
                heroFormData.append('file', heroImage);
                heroFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                const heroResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: heroFormData });
                const heroData = await heroResponse.json();
                if (!heroResponse.ok) throw new Error(heroData.error.message);
                updatedHeroImageUrl = heroData.secure_url;
            }

            const processedPageContent = await processBlocks(pageContent);
            const processedPageContentEn = await processBlocks(pageContentEn);

            const docRef = doc(db, 'services', id);
            await updateDoc(docRef, {
                title, slug, shortDescription,
                heroImageUrl: updatedHeroImageUrl,
                pricingCategory,
                featuresList: features.filter(f => f),

                title_en: titleEn || null,
                shortDescription_en: shortDescriptionEn || null,
                featuresList_en: featuresEn.filter(f => f),

                pageContent: processedPageContent,
                pageContent_en: processedPageContentEn,
                updatedAt: serverTimestamp(),
            });

            alert("Layanan berhasil diupdate!");
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}&path=/layanan`);
            router.push('/admin');
        } catch (error) {
            console.error("Error updating document: ", error);
            alert(`Gagal update layanan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Labels for ID/EN
    const builderLabels = activeTab === 'en' ? {
        positionLabel: "Image Position",
        leftLabel: "Left",
        rightLabel: "Right",
        uploadLabel: "Upload Image",
        textLabel: "Accompanying Text"
    } : {
        positionLabel: "Posisi Gambar",
        leftLabel: "Kiri",
        rightLabel: "Kanan",
        uploadLabel: "Upload Gambar",
        textLabel: "Teks Pendamping"
    };

    if (!isMounted || loading || isFetchingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin text-green-500 w-10 h-10" /></div>;

    if (user) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className='space-y-2'>
                            <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Layanan</h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleAutoTranslate}
                                disabled={isTranslating}
                                className="hidden md:flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Auto-Translate Info
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-1 md:flex-none items-center justify-center px-6 py-3 bg-[#2ECC71] text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Layanan'}
                            </button>
                        </div>
                    </div>

                    <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* ID Content */}
                            <SectionCard title="Informasi Utama (Indonesia)" icon={FileText} className="border-l-4 border-l-[#2ECC71]">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Judul Layanan</label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. Jasa Pembuatan Website" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Deskripsi Singkat</label>
                                        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Deskripsi singkat layanan..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Fitur Unggulan</label>
                                        <div className="space-y-2">
                                            {features.map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700" placeholder="Fitur..." />
                                                    <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addFeature()} className="text-sm text-green-600 flex items-center gap-1 font-semibold"><Plus className="w-4 h-4" /> Tambah Fitur</button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* EN Content */}
                            <SectionCard title="English Translation" icon={Globe} className="border-l-4 border-l-blue-500">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Service Title (EN)</label>
                                        <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. Website Development Service" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Short Description (EN)</label>
                                        <textarea value={shortDescriptionEn} onChange={(e) => setShortDescriptionEn(e.target.value)} rows={3} className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Short description..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Key Features (EN)</label>
                                        <div className="space-y-2">
                                            {featuresEn.map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value, true)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700" placeholder="Feature..." />
                                                    <button type="button" onClick={() => removeFeature(index, true)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addFeature(true)} className="text-sm text-blue-600 flex items-center gap-1 font-semibold"><Plus className="w-4 h-4" /> Add Feature</button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Page Builder */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2"><Layout className="w-5 h-5" /> Page Content Builder</h2>
                                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('id')}
                                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${activeTab === 'id' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                        >
                                            🇮🇩 Indonesian
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('en')}
                                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${activeTab === 'en' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                        >
                                            🇺🇸 English
                                        </button>
                                    </div>
                                </div>

                                <div className={`space-y-4 p-4 border-2 border-dashed rounded-xl transition-colors ${activeTab === 'en' ? 'border-blue-300 bg-blue-50/50' : 'border-gray-300 dark:border-gray-700'}`}>
                                    {(activeTab === 'en' ? pageContentEn : pageContent).map((block, index) => (
                                        <div key={block.id || index} className="bg-white dark:bg-gray-800 p-4 rounded-lg relative group border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <button type="button" onClick={() => removeBlock(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                                            <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-gray-500">{block.type === 'richText' ? 'Rich Text Block' : 'Split Image & Text Block'}</h3>

                                            {block.type === 'richText' && (
                                                <TextBlock content={block.content} onUpdate={(newContent) => updateTextBlockContent(index, newContent)} />
                                            )}
                                            {block.type === 'imageLeftTextRight' && (
                                                <ImageTextBlock content={block.content} onUpdate={(newContent) => updateImageTextBlockContent(index, newContent)} labels={builderLabels} />
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex gap-4 pt-4 justify-center">
                                        <button type="button" onClick={() => addBlock('richText')} className={`bg-white dark:bg-gray-700 border ${activeTab === 'en' ? 'border-blue-300' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors`}>+ Add Text Block</button>
                                        <button type="button" onClick={() => addBlock('imageLeftTextRight')} className={`bg-white dark:bg-gray-700 border ${activeTab === 'en' ? 'border-blue-300' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors`}>+ Add Image/Text Split</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-8 h-fit lg:sticky lg:top-8">
                            <SectionCard title="Settings" icon={Box}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Slug</label>
                                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                            <span className="p-3 text-gray-500 select-none text-sm border-r border-gray-300 dark:border-gray-600">/layanan/</span>
                                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-3 bg-transparent outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Category</label>
                                        <select value={pricingCategory} onChange={(e) => setPricingCategory(e.target.value)} className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                            <option value="seo">Jasa SEO</option>
                                            <option value="ads">Jasa Google Ads</option>
                                            <option value="web">Jasa Web Design</option>
                                            <option value="app">App Development</option>
                                            <option value="dash">Dashboard System</option>
                                            <option value="brand">Branding</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Hero Image</label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                onChange={(e) => setHeroImage(e.target.files[0])}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {heroImage ? (
                                                <p className="text-sm font-semibold text-green-600 truncate">{heroImage.name}</p>
                                            ) : existingHeroImageUrl ? (
                                                <div className="space-y-2">
                                                    <img src={existingHeroImageUrl} alt="Current hero" className="w-full h-20 object-cover rounded-md" />
                                                    <p className="text-xs text-gray-500">Click to change</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-gray-400">
                                                    <ImagePlus className="w-8 h-8 mx-auto" />
                                                    <p className="text-xs">Upload Hero Image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    return null;
}