'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="border border-gray-300 bg-white rounded-t-md p-2 flex flex-wrap gap-1">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 rounded hover:bg-gray-200">Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 rounded hover:bg-gray-200">Italic</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 rounded hover:bg-gray-200">H2</button>
        </div>
    );
};

export default function TextBlock({ content, onUpdate }) {
    // Fungsi untuk memperbaiki data konten yang formatnya salah (objek karakter menjadi string)
    const getSanitizedContent = (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0 && Object.keys(data).every(k => !isNaN(Number(k)))) {
            return Object.values(data).join('');
        }
        return data || '';
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: getSanitizedContent(content), // Gunakan konten yang sudah dibersihkan
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 border-x border-b border-gray-300 rounded-b-md min-h-[150px] focus:outline-none bg-white',
            },
        },
    });

    // Perbaiki useEffect untuk sinkronisasi yang lebih aman
    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            const sanitized = getSanitizedContent(content);
            // Hanya update editor jika konten dari props benar-benar berbeda
            if (sanitized !== editor.getHTML()) {
                editor.commands.setContent(sanitized, false);
            }
        }
    }, [content, editor]);


    if (!editor) return null;

    return (
        <div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}