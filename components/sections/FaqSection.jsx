'use client';
import FaqItem from '../FaqItem';
import { useLanguage } from '@/context/LanguageContext';

export default function FaqSection() {
  const { t } = useLanguage();
  const faqs = [
    {
      q: t('faq.questions.process.q'),
      a: (
        // Di sini kita tambahkan class Tailwind secara manual
        <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
          <li><strong className="font-medium text-gray-900 dark:text-white">{t('faq.questions.process.a.1.label')}</strong> {t('faq.questions.process.a.1.text')}</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">{t('faq.questions.process.a.2.label')}</strong> {t('faq.questions.process.a.2.text')}</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">{t('faq.questions.process.a.3.label')}</strong> {t('faq.questions.process.a.3.text')}</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">{t('faq.questions.process.a.4.label')}</strong> {t('faq.questions.process.a.4.text')}</li>
          <li><strong className="font-medium text-gray-900 dark:text-white">{t('faq.questions.process.a.5.label')}</strong> {t('faq.questions.process.a.5.text')}</li>
        </ol>
      )
    },
    { q: t('faq.questions.cost.q'), a: <p className="text-gray-700 dark:text-gray-300">{t('faq.questions.cost.a')}</p> },

    { q: t('faq.questions.time.q'), a: <p className="text-gray-700 dark:text-gray-300">{t('faq.questions.time.a')}</p> },

    { q: t('faq.questions.warranty.q'), a: <p className="text-gray-700 dark:text-gray-300">{t('faq.questions.warranty.a')}</p> },

    { q: t('faq.questions.seo.q'), a: <p className="text-gray-700 dark:text-gray-300">{t('faq.questions.seo.a')}</p> },



    // ... Tambahkan FAQ lainnya
  ];

  return (
    <section id='faq' className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('faq.title')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}