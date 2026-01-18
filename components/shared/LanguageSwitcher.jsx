'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, switchLanguage } = useLanguage();

    return (
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 ml-4">
            <button
                onClick={() => switchLanguage('id')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${language === 'id'
                        ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
            >
                ID
            </button>
            <button
                onClick={() => switchLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${language === 'en'
                        ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
