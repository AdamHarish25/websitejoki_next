import { Instagram, Dribbble, Linkedin, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    // Data untuk social media links agar mudah dikelola
    const socialLinks = [
        { name: 'Instagram', icon: <Instagram size={20} />, href: "https://www.instagram.com/webjoki.id/" },
        { name: 'Dribbble', icon: <Dribbble size={20} />, href: "https://dribbble.com/websitejokiid" },
        { name: 'Linkedin', icon: <Linkedin size={20} />, href: "https://www.linkedin.com/in/adam-abdurrahman/" },
    ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-6 py-8">
        
        {/* Ikon Social Media */}
        <div className="flex justify-center space-x-6 mb-6">
            {socialLinks.map((link) => (
                <Link 
                    key={link.name} 
                    href={link.href} 
                    aria-label={link.name}
                    className="hover:text-white transition-colors"
                >
                    {link.icon}
                </Link>
            ))}
        </div>
        
        {/* Copyright Notice */}
        <div className="text-center text-sm">
          <p>© 2025 WEBSITEJOKI.MY.ID. All Rights Reserved.</p>
          
          {/* Link Kebijakan Privasi & Ketentuan Layanan */}
          <div className="mt-2">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:text-white transition-colors">Ketentuan Layanan</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}