'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    const menuButtons = [
        { name: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
        { name: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
        { name: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', level: 1 },
        { name: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', level: 2 },
        { name: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: 'heading', level: 3 },
        { name: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote' },
        { name: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
        { name: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
    ];
    return (
        <div className="border border-white bg-[#2ECC71]/50 rounded-t-md p-2 flex flex-wrap gap-x-3 gap-y-2">
            {menuButtons.map(btn => (
                <button key={btn.name} type="button" onClick={btn.action} className={editor.isActive(btn.active, { level: btn.level }) ? 'is-active' : 'px-2 py-1 rounded hover:bg-green-700 text-white font-bold'}>
                    {btn.name}
                </button>
            ))}
        </div>
    );
};

export default function CreateArticlePage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [metaDescription, setMetaDescription] = useState(''); // <-- STATE BARU
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Tulis artikel Anda di sini...</p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 border-b border-x border-white bg-[#2ECC71]/50 text-black rounded-b-md min-h-[300px] focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (!isSlugManuallyEdited) {
            const autoSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
            setSlug(autoSlug);
        }
    }, [title, isSlugManuallyEdited]);

    const handleSlugChange = (e) => {
        setIsSlugManuallyEdited(true);
        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = editor.getHTML();
        if (!title || !slug || !metaDescription || content === '<p></p>' || !coverImage) {
            alert("Semua field wajib diisi, termasuk Meta Description!");
            return;
        }
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', coverImage);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            const imageUrl = data.secure_url;

            await addDoc(collection(db, "articles"), {
                title,
                slug,
                metaDescription, // <-- SIMPAN META DESCRIPTION
                content,
                coverImageUrl: imageUrl,
                createdAt: serverTimestamp(),
                author: user.email,
                published: true,
            });
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`);

            alert("Artikel berhasil dibuat!");
            router.push('/admin');
        } catch (error) {
            console.error("Error creating document: ", error);
            alert("Gagal membuat artikel.");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div className="bg-gray-800 text-white min-h-screen flex items-center justify-center">Loading...</div>;

    if (user) {
        return (
            <div className="bg-white text-black min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/admin" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mb-8">Create New Article</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium mb-1">Judul Artikel</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border border-white rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1">Slug (URL)</label>
                            <input type="text" value={slug} onChange={handleSlugChange} required className="w-full p-2 border border-white rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                            <p className="text-sm text-gray-400 mt-1">URL akan menjadi: `.../blog/{slug}`</p>
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-1">Meta Description (untuk SEO, max 160 karakter)</label>
                            <textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                rows={3}
                                maxLength={160}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400"
                            />
                            <p className="text-sm text-right">{metaDescription.length} / 160</p>
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-1">Gambar Cover</label>
                            <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} required className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2ECC71] file:text-white hover:file:bg-green-700" />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-2">Konten</label>
                            <MenuBar editor={editor} />
                            <EditorContent editor={editor} />
                        </div>
                        <div className="pt-8">
                            <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-md text-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                                {isLoading ? 'Memproses...' : 'Publikasikan Artikel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    return null;
}