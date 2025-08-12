import Image from 'next/image';

export default function ImageTextSplitBlock({ imageUrl, text, imagePosition }) {
    // Tentukan urutan kolom berdasarkan imagePosition
    const imageOrderClass = imagePosition === 'right' ? 'md:order-last' : '';

    return (
        <section className="container mx-auto py-12 px-6">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Kolom Gambar */}
                <div className={`relative aspect-movie rounded-lg overflow-hidden shadow-lg ${imageOrderClass}`}>
                    <Image src={imageUrl} alt="Gambar layanan" fill className="object-cover w-full h-full" />
                </div>
                {/* Kolom Teks */}
                <div
                    className="prose lg:prose-xl dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            </div>
        </section>
    );
}