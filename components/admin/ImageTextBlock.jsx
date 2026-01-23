'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from 'next/image';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-t-md p-2 flex flex-wrap gap-1">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 rounded hover:bg-gray-200">Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 rounded hover:bg-gray-200">Italic</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 rounded hover:bg-gray-200">H2</button>
        </div>
    );
};

export default function ImageTextBlock({ content, onUpdate, labels }) {
    // Fungsi untuk memperbaiki data teks yang formatnya salah
    const getSanitizedText = (textData) => {
        if (textData && typeof textData === 'object' && !Array.isArray(textData) && Object.keys(textData).length > 0 && Object.keys(textData).every(k => !isNaN(Number(k)))) {
            return Object.values(textData).join('');
        }
        return textData || '';
    };

    const textEditor = useEditor({
        extensions: [StarterKit],
        content: getSanitizedText(content.text), // Gunakan teks yang sudah dibersihkan
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onUpdate({ ...content, text: editor.getHTML() });
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 border-x border-b border-gray-300 rounded-b-md min-h-[200px] focus:outline-none bg-white',
            },
        },
    });

    // Tambahkan useEffect untuk sinkronisasi yang aman, agar konsisten dengan TextBlock
    useEffect(() => {
        if (textEditor && !textEditor.isDestroyed) {
            const sanitized = getSanitizedText(content.text);
            if (sanitized !== textEditor.getHTML()) {
                textEditor.commands.setContent(sanitized, false);
            }
        }
    }, [content.text, textEditor]);


    const handleImageChange = (file) => {
        if (file) {
            onUpdate({ ...content, imageFile: file, imageUrl: URL.createObjectURL(file) });
        }
    };

    const handlePositionChange = (position) => {
        onUpdate({ ...content, imagePosition: position });
    };

    const {
        positionLabel = "Posisi Gambar",
        leftLabel = "Kiri",
        rightLabel = "Kanan",
        uploadLabel = "Upload Gambar",
        textLabel = "Teks Pendamping"
    } = labels || {};

    return (
        <div className="p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">{positionLabel}</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => handlePositionChange('left')} className={`px-3 py-1 rounded text-sm ${content.imagePosition === 'left' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{leftLabel}</button>
                    <button type="button" onClick={() => handlePositionChange('right')} className={`px-3 py-1 rounded text-sm ${content.imagePosition === 'right' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{rightLabel}</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">{uploadLabel}</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} className="w-full text-sm" />
                    {content.imageUrl && (
                        <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                            <Image src={content.imageUrl} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{textLabel}</label>
                    <MenuBar editor={textEditor} />
                    <EditorContent editor={textEditor} />
                </div>
            </div>
        </div>
    );
}