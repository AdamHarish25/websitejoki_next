import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FeaturesGrid({ features, title }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const defaultTitle = isEn ? "Included Features" : "Fitur yang Termasuk";
  const defaultDesc = isEn
    ? "Rest assured, our standard service standards include the following features:"
    : "Jangan khawatir, standar layanan seluruh paket website kami sudah termasuk fitur-fitur sebagai berikut:";

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20 font-sans">
      <div className="container mx-auto px-6">
        <div className="text-start md:text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-gray-900 dark:text-gray-100">{title || defaultTitle}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto font-serif">
            {defaultDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features && features.map((feature, index) => (
            feature && (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex items-start transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <CheckCircle className="text-green-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-gray-800 dark:text-gray-200">{feature}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}