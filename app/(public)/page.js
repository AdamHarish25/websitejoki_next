import AnimatedSection from '@/components/shared/AnimatedSection';
import CollaborationSection from '@/components/sections/CollaborationSection';
import CtaSection from '@/components/sections/CtaSection';
// import ExperienceSection from '@/components/sections/ExperienceSection';
import FaqSection from '@/components/sections/FaqSection';
import HeroSection from '@/components/sections/HeroSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import ServicesSection from '@/components/sections/ServiceSection';
import StatsSection from '@/components/sections/StatsSection';
import FloatingWhatsApp from '@/components/shared/floatingWAButton';

export default function HomePage() {

  return (
    <main className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <HeroSection />
      <AnimatedSection><StatsSection /></AnimatedSection>
      <AnimatedSection><ServicesSection /></AnimatedSection>
      <AnimatedSection><CollaborationSection /></AnimatedSection>
      {/* <AnimatedSection><ExperienceSection /></AnimatedSection> */}
      <AnimatedSection><PortfolioSection /></AnimatedSection>
      <AnimatedSection><FaqSection /></AnimatedSection>
      <AnimatedSection><CtaSection /></AnimatedSection>
      <FloatingWhatsApp />
    </main>
  );
}

// export default function HomePage() {
//   return (
//     <div className="flex items-center justify-center h-screen">
//       <h1 className="text-4xl font-bold">Halo, ini Halaman Beranda!</h1>
//     </div>
//   );
// }