'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TableOfContents({ headings }) {
  const [isOpen, setIsOpen] = useState(true);

  // Fungsi untuk scroll ke ID heading
  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Opsi untuk smooth scroll
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-8 bg-gray-50 dark:bg-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center font-bold text-lg"
      >
        Daftar Isi
        <ChevronDown
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] mt-4' : 'max-h-0'}`}
      >
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} className={`toc-level-${heading.level}`}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleScroll(e, heading.id)}
                className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}