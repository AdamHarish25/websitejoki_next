import Link from 'next/link';
import Image from 'next/image';
import CustomVideoPlayer from '../shared/CustomVideoPlayer';
import HeroSocialProof from '../shared/HeroSocialProof';
import { FaArrowCircleDown, FaWhatsapp } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Level up Bisnis Anda dengan <span className="text-green-600">Website, Google Ads, & Aplikasi</span> Sesuai Kebutuhan Anda!
          </h1>
          <p className="text-lg text-gray-600">
            Kami adalah mitra teknologi yang mengembangkan aplikasi kustom, website, dan SEO untuk membantu brand berkembang dan mencapai tujuan bisnis mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="https://wa.me/6285179808325" className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-white bg-[#2ECC71] shadow-md transition-transform hover:scale-96">
              Konsultasi Gratis <FaWhatsapp/>
            </Link>
            <Link href="#layanan" className="flex px-6 py-4 rounded-full items-center justify-center gap-4 text-black bg-white shadow-md transition-transform hover:scale-96">
              Lihat Layanan <FaArrowCircleDown/>
            </Link>
          </div>
          <div className="flex items-center pt-4 text-sm text-gray-500">
            <HeroSocialProof />
          </div>
        </div>
        <div className="relative w-full h-fit rounded-xl overflow-hidden shadow-2xl">
           <CustomVideoPlayer src="/video/hero_video.mp4" thumbnailSrc={'/hero/thumbnail2.png'}/>
        </div>
      </div>
    </section>
  );
}