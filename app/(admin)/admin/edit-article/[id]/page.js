'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowLeft, Loader2, Sparkles, ImagePlus, Globe, FileText } from 'lucide-react';

// --- Shared Components ---

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    const menuButtons = [
        { name: 'B', action: () => editor.chain().focus().toggleBold().run(), active: 'bold', title: 'Bold' },
        { name: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', title: 'Italic' },
        { name: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', level: 1, title: 'Heading 1' },
        { name: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', level: 2, title: 'Heading 2' },
        { name: 'List', action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList', title: 'Bullet List' },
        { name: 'Numbers', action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList', title: 'Ordered List' },
        { name: 'Quote', action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote', title: 'Blockquote' },
    ];
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-2 sticky top-0 z-10">
            {menuButtons.map(btn => (
                <button
                    key={btn.name}
                    type="button"
                    onClick={btn.action}
                    title={btn.title}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${editor.isActive(btn.active, { level: btn.level })
                        ? 'bg-[#2ECC71] text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    {btn.name}
                </button>
            ))}
        </div>
    );
};

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

export default function EditArticlePage() {
    const router = useRouter();
    const { id } = useParams();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ID States
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    // EN States
    const [titleEn, setTitleEn] = useState('');
    const [metaDescriptionEn, setMetaDescriptionEn] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // Translation Loading States
    const [isTranslatingTitle, setIsTranslatingTitle] = useState(false);
    const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
    const [isTranslatingContent, setIsTranslatingContent] = useState(false);

    // Editors
    // Editors
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
        editorProps: { attributes: { class: 'prose prose-sm md:prose-base dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none' } },
    });

    const editorEn = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
        editorProps: { attributes: { class: 'prose prose-sm md:prose-base dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none' } },
    });

    useEffect(() => {
        if (id && editor && editorEn) {
            const fetchArticle = async () => {
                const docRef = doc(db, 'articles', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const articleData = docSnap.data();
                    setTitle(articleData.title);
                    setSlug(articleData.slug);
                    setMetaDescription(articleData.metaDescription || '');
                    editor.commands.setContent(articleData.content);

                    // Set English Data
                    setTitleEn(articleData.title_en || '');
                    setMetaDescriptionEn(articleData.metaDescription_en || '');
                    editorEn.commands.setContent(articleData.content_en || '');
                } else {
                    alert("Artikel tidak ditemukan!");
                    router.push('/admin');
                }
            };
            fetchArticle();
        }
    }, [id, editor, editorEn, router]);


    // Translation Handler
    const handleTranslate = async (sourceText, setTargetFunc, setLoadingFunc, isHtml = false) => {
        if (!sourceText) return;
        setLoadingFunc(true);
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: sourceText, sourceLang: 'id', targetLang: 'en' }),
            });
            const data = await res.json();
            if (data.translatedText) {
                if (isHtml && editorEn) {
                    editorEn.commands.setContent(data.translatedText);
                } else {
                    setTargetFunc(data.translatedText);
                }
            } else {
                console.error("Translation returned empty");
            }
        } catch (error) {
            console.error("Translation failed", error);
            alert("Gagal menerjemahkan otomatis. Coba lagi.");
        } finally {
            setLoadingFunc(false);
        }
    };

    const handleSmartTranslateAll = async () => {
        // Translate Title
        if (title && !titleEn) handleTranslate(title, setTitleEn, setIsTranslatingTitle);
        // Translate Meta
        if (metaDescription && !metaDescriptionEn) handleTranslate(metaDescription, setMetaDescriptionEn, setIsTranslatingDesc);
        // Translate Content
        if (editor && editorEn && (!editorEn.getHTML() || editorEn.getHTML() === '<p></p>')) {
            if (editor.getHTML() !== '<p></p>') {
                handleTranslate(editor.getHTML(), null, setIsTranslatingContent, true);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = editor.getHTML();
        if (!title || !slug || content === '<p></p>') {
            alert("Judul, Slug, dan konten wajib diisi!");
            return;
        }
        setIsLoading(true);

        const contentEn = editorEn ? editorEn.getHTML() : '';
        const articleRef = doc(db, 'articles', id);

        try {
            await updateDoc(articleRef, {
                title: title,
                slug: slug,
                metaDescription,
                content: content,

                // Update English fields
                title_en: titleEn || null,
                metaDescription_en: metaDescriptionEn || null,
                content_en: contentEn === '<p></p>' ? null : contentEn,

                updatedAt: serverTimestamp()
            });
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`);
            alert("Artikel berhasil diupdate!");
            router.push('/admin');
        } catch (error) {
            console.error("Error updating document: ", error);
            alert("Gagal mengupdate artikel.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin text-green-500 w-10 h-10" /></div>;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className='space-y-2'>
                        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Artikel</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSmartTranslateAll}
                            className="hidden md:flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto-Translate All Fields
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 md:flex-none items-center justify-center px-6 py-3 bg-[#2ECC71] text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>

                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content (ID) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Bahasa Indonesia Section */}
                        <SectionCard title="Konten Bahasa Indonesia (Utama)" icon={FileText} className="border-l-4 border-l-[#2ECC71]">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Artikel</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meta Description (SEO)</label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2ECC71] outline-none transition-all resize-none"
                                    />
                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                        <span>Maksimal 160 karakter</span>
                                        <span className={metaDescription.length > 150 ? 'text-red-500 font-bold' : ''}>{metaDescription.length}/160</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-[#2ECC71] transition-all">
                                    <MenuBar editor={editor} />
                                    <div className="bg-white dark:bg-gray-700 min-h-[400px]">
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Bahasa Inggris Section */}
                        <SectionCard title="English Content (Optional - for International SEO)" icon={Globe} className="border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                                <p>Isi bagian ini agar artikel Anda bisa diakses oleh pengunjung berbahasa Inggris.</p>
                                <button
                                    type="button"
                                    onClick={handleSmartTranslateAll}
                                    className="text-xs font-bold hover:underline flex items-center gap-1"
                                >
                                    <Sparkles className="w-3 h-3" /> Auto-Fill from Indonesian
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* English Title */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Title (EN)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={titleEn}
                                            onChange={(e) => setTitleEn(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleTranslate(title, setTitleEn, setIsTranslatingTitle)}
                                            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                                            disabled={isTranslatingTitle}
                                            title="Translate Title Only"
                                        >
                                            {isTranslatingTitle ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-500" />}
                                        </button>
                                    </div>
                                </div>

                                {/* English Meta */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meta Description (EN)</label>
                                    <div className="flex gap-2 items-start">
                                        <textarea
                                            value={metaDescriptionEn}
                                            onChange={(e) => setMetaDescriptionEn(e.target.value)}
                                            rows={3}
                                            maxLength={160}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleTranslate(metaDescription, setMetaDescriptionEn, setIsTranslatingDesc)}
                                            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                                            disabled={isTranslatingDesc}
                                            title="Translate Description Only"
                                        >
                                            {isTranslatingDesc ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-500" />}
                                        </button>
                                    </div>
                                </div>

                                {/* English Content */}
                                <div className="relative rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                                    <div className="bg-blue-50/50 dark:bg-gray-800 p-2 flex justify-between items-center border-b border-gray-200">
                                        <span className='text-xs font-semibold text-blue-600 uppercase tracking-wider ml-2'>English Editor</span>
                                        <button
                                            type="button"
                                            onClick={() => handleTranslate(editor.getHTML(), null, setIsTranslatingContent, true)}
                                            disabled={isTranslatingContent}
                                            className="text-xs bg-white px-2 py-1 rounded border shadow-sm flex items-center gap-1 hover:text-blue-600"
                                        >
                                            {isTranslatingContent ? <Loader2 className='w-3 h-3 animate-spin' /> : <Sparkles className='w-3 h-3 text-blue-500' />}
                                            Translate Body
                                        </button>
                                    </div>
                                    <MenuBar editor={editorEn} />
                                    <div className="bg-gray-50 dark:bg-gray-700 min-h-[400px]">
                                        <EditorContent editor={editorEn} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column - Settings & Media */}
                    <div className="space-y-8 h-fit lg:sticky lg:top-8">

                        <SectionCard title="Pengaturan Publikasi" icon={ImagePlus}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug URL (Otomatis)</label>
                                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                        <span className="p-3 text-gray-500 select-none text-sm bg-gray-200 dark:bg-gray-800 border-r border-gray-300">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }}
                                            className="w-full p-3 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                </div>

                                {/* Mobile Action Button (Visible only on small screens) */}
                                <div className="block md:hidden pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSmartTranslateAll}
                                        className="w-full mb-3 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 border border-blue-200"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Auto-Translate
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="w-full py-3 bg-[#2ECC71] text-white rounded-lg font-bold shadow-lg"
                                    >
                                        {isLoading ? 'Simpan Perubahan' : 'Update Artikel'}
                                    </button>
                                </div>

                            </div>
                        </SectionCard>
                    </div>
                </form>
            </div>
        </div>
    );
}