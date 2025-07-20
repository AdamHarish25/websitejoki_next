import Image from 'next/image';

export default function HeroSocialProof() {
    return (
        <div className="flex items-center gap-4 mt-6">
            <Image
                // Ganti nama file ini sesuai dengan nama file Anda
                src="/hero/clients.png"
                alt="Bukti sosial: 100+ orang telah memercayakan kami"
                width={180} // Sesuaikan lebar gambar jika perlu
                height={90}  // Sesuaikan tinggi gambar jika perlu
                priority // Prioritaskan load gambar ini karena ada di bagian atas
                
            />

            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">100+</span> orang telah memercayakan
                kami dalam membantu mengembangkan bisnis online mereka.
            </p>
        </div>
    );
}