import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa'

export default function CtaSection() {
  return (
    // Section dengan ID "kontak" untuk navigasi dan background hijau
    <section id="kontak" className="bg-green-600">
       <div className="container mx-auto px-6 py-16 md:py-20 text-center text-white grid place-items-center">
        
        {/* Judul Utama CTA */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Eksplor Potensi Usahamu dan Mulai Perjalananmu Hari ini.
        </h2>
        
        {/* Tombol Aksi Utama */}
        <Link 
            href="https://wa.me/6285179808325" 
            className="w-fit flex px-6 py-4 rounded-full items-center justify-center gap-4 text-black bg-white shadow-md transition-transform hover:scale-96"
        >
            Konsultasi Gratis <FaWhatsapp/>
        </Link>
       </div>
    </section>
  );
}