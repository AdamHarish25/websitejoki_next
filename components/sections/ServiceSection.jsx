import Image from 'next/image';

export default function ServicesSection() {
  // Data layanan bisa diletakkan di sini atau diambil dari CMS

  const services = [
    { title: "Aplikasi Mobile", description: "Tingkatkan loyalitas pelanggan...", image: "/services/AppMob.png", alt: "Mockup aplikasi mobile" },
    { title: "Hak Merk", description: "Tingkatkan loyalitas pelanggan...", image: "/services/HakMerk.png", alt: "Mockup hak merk" },
    { title: "Website", description: "Ubah pengunjung menjadi pelanggan...", image: "/services/Web.png", alt: "Mockup website profesional" },
    { title: "Dashboard", description: "Ambil keputusan bisnis lebih cerdas...", image: "/services/Dashboard.png", alt: "Mockup dashboard analitik" },
    { title: "Advertising Online", description: "Dapatkan pelanggan berkualitas secara instan...", image: "/services/Ads.png", alt: "Iklan Google di halaman pencarian" },
    { title: "Artikel SEO", description: "Dominasi peringkat Google dan bangun kepercayaan...", image: "/services/SEO.png", alt: "Contoh hasil artikel SEO" },
  ];

  return (
    <section id='layanan' className="py-20">
      <div className="container space-y-8 mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Layanan Digital</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto dark:text-gray-400">yang kami tawarkan</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 '>
          {services.map((service, index) => (
            <div key={index} className="p-0 md:p-3 h-80 w-auto lg:h-[450px] rounded-xl shadow-md md:shadow-none lg:shadow-md text-left transition-transform hover:-translate-y-2">
              <div className="relative w-full h-full mb-4 rounded-lg overflow-hidden">
                <Image src={service.image} alt={service.alt} fill className='object-cover md:object-contain lg:object-cover dark:bg-white' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}