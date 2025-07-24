import { CheckCircle } from 'lucide-react';

export default function FeaturesGrid({ features, title }) {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20">
      <div className="container mx-auto px-6">
        <div className="text-start md:text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold">{title || "Fitur yang Termasuk"}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Jangan khawatir, standar layanan seluruh paket website kami sudah termasuk fitur-fitur sebagai berikut:
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features && features.map((feature, index) => (
            feature && (
              <div 
                key={index} 
                className="bg-white transition-transform duration-300 hover:scale-110 dark:bg-gray-700 p-5 rounded-lg shadow-md flex items-center"
              >
                <CheckCircle className="text-green-500 w-6 h-6 mr-4 flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}