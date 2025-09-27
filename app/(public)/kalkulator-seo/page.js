import SeoCalculator from "@/components/sections/SEOCalculator";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CtaSection from "@/components/sections/CTASection";
import CalculatorExplanation from "@/components/sections/CalculatorExplanation";

export const metadata = {
    title: 'Kalkulator Proyeksi SEO | WebsiteJoki.ID',
    description: 'Hitung potensi ROI dan pertumbuhan bisnis Anda dengan investasi SEO. Coba kalkulator gratis kami untuk melihat estimasi trafik, leads, dan pendapatan.',
};


export default function KalkulatorSeoPage() {
    return (
        <main className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <div className="container mx-auto px-6 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kalkulator Estimasi ROI SEO</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Penasaran seberapa besar dampak SEO bagi bisnis Anda? Masukkan beberapa angka di bawah ini untuk melihat estimasi potensi pendapatan dan Return on Investment.
                </p>
            </div>
            <SeoCalculator />
            <CalculatorExplanation/>
            <CtaSection/>
        </main>
    );
}