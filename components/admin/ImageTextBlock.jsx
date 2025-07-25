'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from 'next/image';

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

export default function ImageTextBlock({ content, onUpdate }) {
    const textEditor = useEditor({
        extensions: [StarterKit],
        content: content.text,
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

    const handleImageChange = (file) => {
        if(file) {
            onUpdate({ ...content, imageFile: file, imageUrl: URL.createObjectURL(file) });
        }
    };
    
    const handlePositionChange = (position) => {
        onUpdate({ ...content, imagePosition: position });
    };

    return (
        <div className="p-4 border border-gray-300 rounded-md bg-white space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Posisi Gambar</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => handlePositionChange('left')} className={`px-3 py-1 rounded text-sm ${content.imagePosition === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Kiri</button>
                    <button type="button" onClick={() => handlePositionChange('right')} className={`px-3 py-1 rounded text-sm ${content.imagePosition === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Kanan</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Upload Gambar</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} className="w-full text-sm"/>
                    {content.imageUrl && (
                        <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                            <Image src={content.imageUrl} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Teks Pendamping</label>
                    <MenuBar editor={textEditor} />
                    <EditorContent editor={textEditor} />
                </div>
            </div>
        </div>
    );
}