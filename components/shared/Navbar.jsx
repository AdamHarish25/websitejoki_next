'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';

export default function Navbar() {
  const navLinks = ["Beranda", "Blog"];
  const navLinksPage = ["layanan", "experience"];

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-green-600">
          <Link href="/"><Image src={"/Logo.svg"} alt="Website Logo" width={180} height={90} ></Image></Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link} href={`${link == "Beranda" ? "/" : link }`} className="text-gray-600 hover:text-green-600 capitalize">
              {link}
            </Link>
          ))}
          {navLinksPage.map((link) => (
            <Link key={link} href={`#${link}`} className="text-gray-600 hover:text-green-600 capitalize">
              {link}
            </Link>
          ))}
        </div>
        <Link href="https://wa.me/6285179808325" className="hidden md:flex px-6 py-4 rounded-full items-center justify-center gap-4 text-white bg-[#2ECC71] shadow-md transition-transform hover:scale-96">
          Konsultasi Gratis <FaWhatsapp/>
        </Link>
        <div className="md:hidden">
          {/* Mobile Menu Button - fungsionalitas bisa ditambahkan nanti */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </div>
      </nav>
    </header>
  );
}