import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioSection() {
    // Anda bisa mengganti data ini dengan data dari database/CMS nanti
    const projects = [
        {
            title: "Ada Loker - Dashboard Pencarian Kerja",
            image: "/portfolio/Adaloker.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/Adaloker.svg", // Ganti dengan path logo Anda
            alt: "Mockup dashboard website pencarian kerja berwarna gelap"
        },
        {
            title: "TobaLawfirm - Layanan Hukum Terpercaya",
            image: "/portfolio/TobalawFirm.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/tobalaw.jpg", // Ganti dengan path logo Anda
            alt: "Mockup sistem informasi hotel menampilkan daftar kamar"
        },
        {
            title: "BeeJoys - Travel Landing Page",
            image: "/portfolio/Beejoys.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/BeeJoys.svg", // Ganti dengan path logo Anda
            alt: "Mockup landing page untuk agen travel BeeJoys"
        },
        {
            title: "Sinefolis - Platform Booking Sinema Terbaik",
            image: "/portfolio/Sinefolis.png", // Ganti dengan path gambar Anda
            logo: "/portfolio/logo/Sinefolis.svg", // Ganti dengan path logo Anda
            alt: "Mockup halaman penawaran spesial untuk produk fashion"
        },
    ];

    return (
        <section id="portfolio" className="py-20 bg-[#2ECC71]/15">
            <div className="container mx-auto px-6">
                <div className="text-center md:text-left mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Cek Project Terbaru Kami
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
                        Berikut adalah beberapa karya terbaik kami, menunjukkan keahlian dalam memberikan solusi digital yang inovatif dan efektif.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <Link key={project.title} href="#" className="block group">
                            <div className="relative overflow-hidden rounded-lg shadow-lg aspect-video bg-white">
                                {/* Gambar Utama Proyek */}
                                <Image
                                    src={project.image}
                                    alt={project.alt}
                                    fill
                                    className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                                />

                                {/* Overlay dan Teks yang Muncul Saat Hover */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-5">
                                    {/* Logo Proyek */}
                                    <div className="w-32 h-32 overflow-hidden grid place-items-center">
                                        <Image
                                            src={project.logo}
                                            alt={`${project.title} Logo`}
                                            
                                            width={124}
                                            height={124}
                                        />
                                    </div>
                                    {/* Judul Proyek */}
                                    <h3 className="text-white text-2xl font-bold text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {project.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}