'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
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
        <div className="bg-[#2ECC71]/50 text-white font-bold rounded-t-md p-2 flex flex-wrap gap-x-3 gap-y-2">
            {menuButtons.map(btn => (
                <button key={btn.name} type="button" onClick={btn.action} className={editor.isActive(btn.active, { level: btn.level }) ? 'is-active' : 'px-2 py-1 rounded hover:bg-gray-600 hover:text-white'}>
                    {btn.name}
                </button>
            ))}
        </div>
    );
};

export default function EditArticlePage() {
    const router = useRouter();
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [metaDescription, setMetaDescription] = useState(''); // <-- STATE BARU
    const [isLoading, setIsLoading] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 bg-[#2ECC71]/50 text-black rounded-b-md min-h-[300px] focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (id && editor) {
            const fetchArticle = async () => {
                const docRef = doc(db, 'articles', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const articleData = docSnap.data();
                    setTitle(articleData.title);
                    setSlug(articleData.slug);
                    setMetaDescription(articleData.metaDescription || ''); // <-- AMBIL META DESCRIPTION
                    editor.commands.setContent(articleData.content);
                } else {
                    alert("Artikel tidak ditemukan!");
                    router.push('/admin');
                }
            };
            fetchArticle();
        }
    }, [id, editor, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = editor.getHTML();
        if (!title || !slug || content === '<p></p>') {
            alert("Judul, Slug, dan konten wajib diisi!");
            return;
        }
        setIsLoading(true);
        const articleRef = doc(db, 'articles', id);
        try {
            await updateDoc(articleRef, {
                title: title,
                slug: slug,
                metaDescription, // <-- UPDATE META DESCRIPTION
                content: content,
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

    return (
        <div className="bg-white text-black min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin" className="text-yellow-400 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
                <h1 className="text-3xl font-bold mb-8">Edit Article</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium mb-1">Judul Artikel</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                    </div>
                    <div>
                        <label className="block text-lg font-medium mb-1">Slug (URL)</label>
                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} required className="w-full p-2 rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400" />
                    </div>

                    <div>
                        <label className="block text-lg font-medium mb-1">Meta Description (untuk SEO, max 160 karakter)</label>
                        <textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            rows={3}
                            maxLength={160}
                            required
                            className="w-full p-2 rounded-md bg-[#2ECC71]/50 text-black focus:ring-yellow-400 focus:border-yellow-400"
                        />
                        <p className="text-sm text-right">{metaDescription.length} / 160</p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium mb-2">Konten</label>
                        <MenuBar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                    {/* Catatan: Fungsionalitas update gambar bisa ditambahkan di sini jika perlu */}
                    <div className="pt-8">
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-[#2ECC71]/70 text-gray-900 font-bold rounded-md text-lg hover:bg-[#2ECC71] text-white disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? 'Menyimpan...' : 'Update Artikel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}