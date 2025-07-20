'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ question, answer, isOpenDefault = false }) {
  // State untuk melacak apakah item ini sedang terbuka atau tertutup
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="bg-green-50/50 dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-5 md:p-6"
      >
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">{question}</span>
        <ChevronDown 
          className={`flex-shrink-0 text-green-600 dark:text-green-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Konten jawaban yang bisa buka-tutup dengan animasi */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <div className="px-5 md:px-6 pb-5 text-gray-600 dark:text-gray-300">
          {/* 'prose' class untuk styling otomatis konten jawaban seperti list */}
          <div>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}