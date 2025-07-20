'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4"
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 pr-8 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}