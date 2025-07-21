'use client';

import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { trackEvent } from '@/lib/analytics'; // Impor fungsi tracking kita

export default function FloatingWhatsApp() {
  // --- Pengaturan Dasar ---
  const phoneNumber = '6285179808325'; // Ganti dengan nomor WhatsApp Anda
  const defaultMessage = 'Halo, saya tertarik dengan layanan Anda dan ingin berkonsultasi.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
  
  const handleClick = () => {
    // Kirim event ke Google Analytics setiap kali tombol diklik
    trackEvent({
      action: 'click_whatsapp',
      category: 'Contact',
      label: 'Floating WhatsApp Button'
    });
  };

  return (
    // 'group' digunakan untuk memicu animasi pada elemen anak saat parent di-hover
    <div className="fixed bottom-6 right-6 z-50 group">
      <Link 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center gap-3"
        aria-label="Hubungi kami via WhatsApp"
      >
        {/* Teks bubble yang muncul saat hover */}
        <span className="
          bg-white 
          text-gray-700 
          px-4 py-2 
          rounded-lg 
          shadow-lg 
          text-sm 
          font-semibold 
          opacity-0 
          group-hover:opacity-100 
          transition-opacity 
          duration-300
          origin-right
          scale-95
          group-hover:scale-100
          hidden sm:block
        ">
          Butuh Bantuan?
        </span>

        {/* Tombol Ikon Utama */}
        <div className="
          bg-green-500 
          text-white 
          w-16 h-16 
          rounded-full 
          flex 
          items-center 
          justify-center 
          shadow-xl 
          hover:bg-green-600 
          transition-all 
          duration-300 
          transform 
          group-hover:scale-110
        ">
          <FaWhatsapp size={32} />
        </div>
      </Link>
    </div>
  );
}