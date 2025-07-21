import Image from 'next/image';

export default function ServicesSection() {
  // Data layanan bisa diletakkan di sini atau diambil dari CMS
  const services1 = [
    { title: "Aplikasi Mobile", description: "Tingkatkan loyalitas pelanggan...", image: "/services/AppMob.svg", alt: "Mockup aplikasi mobile" },
    { title: "Website", description: "Ubah pengunjung menjadi pelanggan...", image: "/services/Web.svg", alt: "Mockup website profesional" },
  ];

  const services2 = [
    { title: "Dashboard", description: "Ambil keputusan bisnis lebih cerdas...", image: "/services/Dashboard.svg", alt: "Mockup dashboard analitik" },
    { title: "Advertising Online", description: "Dapatkan pelanggan berkualitas secara instan...", image: "/services/Ads.svg", alt: "Iklan Google di halaman pencarian" },
    { title: "Artikel SEO", description: "Dominasi peringkat Google dan bangun kepercayaan...", image: "/services/SEO.svg", alt: "Contoh hasil artikel SEO" },
  ];

  return (
    <section id='layanan' className="py-20">
      <div className="container space-y-8 mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Layanan Digital</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">yang kami tawarkan</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ini adalah contoh untuk 1 card, Anda bisa map datanya */}
          {services1.map((service, index) => (
             <div key={index} className="p-0 md:p-3 h-52 md:h-[420px] lg:h-[450px] rounded-xl shadow-md md:shadow-none lg:shadow-md text-left transition-transform hover:-translate-y-2">
               <div className="relative w-full h-full mb-4 rounded-lg overflow-hidden">
                 <Image src={service.image} alt={service.alt} fill className='object-cover md:object-contain lg:object-cover ' />
               </div>
             </div>
          ))}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 '>
          {services2.map((service, index) => (
            <div key={index} className="p-0 md:p-3 h-80 w-auto lg:h-[450px] rounded-xl shadow-md md:shadow-none lg:shadow-md text-left transition-transform hover:-translate-y-2">
              <div className="relative w-full h-full mb-4 rounded-lg overflow-hidden">
                <Image src={service.image} alt={service.alt} fill className='object-cover md:object-contain lg:object-cover ' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}