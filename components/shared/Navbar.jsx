'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTimes, FaWhatsapp } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { trackEvent } from '@/lib/analytics';
import { RefreshingLink } from './RefreshingLink';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Layanan", href: "/layanan" },
    { name: "Portfolio", href: "/#portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  const closeMenu = () => {setIsMenuOpen(false)};

   const handleClick = () => {
    trackEvent({
      action: 'click_whatsapp',
      category: 'Contact',
      label: 'CTA Button for WhatsApp', // Anda bisa membuat labelnya lebih spesifik
    });
    // Tidak perlu window.open karena Link akan menanganinya
  };


  return (
    <header className="bg-white/80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-sm sticky top-0 z-50 border-b dark:border-0 border-gray-200/80">
      {/* Kontainer utama nav dengan flexbox */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" onClick={closeMenu}>
            <Image src={"/Logo.svg"} alt="Website Logo" width={180} height={40} priority />
          </Link>
        </div>

        {/* Navigasi Desktop */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <RefreshingLink key={link.name} href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300capitalize">
              {link.name}
            </RefreshingLink>
          ))}
        </div>

        {/* Tombol Konsultasi Desktop */}
        <Link onClick={handleClick} href="https://wa.me/6285179808325" target="_blank" className="hidden lg:flex px-6 py-3 rounded-full items-center justify-center gap-3 text-white bg-green-600 shadow-md transition-transform hover:scale-95">
          Konsultasi Gratis <FaWhatsapp />
        </Link>

        {/* Tombol Menu Mobile */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Sidebar Menu Mobile (kode ini tidak berubah) */}
      <div className={`absolute top-0 right-0 h-screen w-full max-w-full bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0 block' : 'translate-x-full hidden'}`}>
        <div className="p-8 flex flex-col space-y-8 mt-16 bg-white">
          {navLinks.map((link) => (
            <RefreshingLink key={link.name} href={link.href} clicked={closeMenu} className="text-2xl text-gray-700 hover:text-green-600 capitalize">
              {link.name}
            </RefreshingLink>
          ))}
          <Link href="https://wa.me/6285179808325" target="_blank" onClick={() => {
            closeMenu(),
            handleClick
          }} className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-white bg-[#2ECC71] shadow-md transition-transform hover:scale-95 text-lg">
            Konsultasi Gratis <FaWhatsapp />
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div onClick={closeMenu} className="absolute top-0 left-0 p-10 text-black group z-40 lg:hidden">
          <FaTimes size={30} className='group-hover:text-[#2ECC71] transition-colors duration-400' />
        </div>
      )}
    </header>
  );
}

