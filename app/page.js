import AnimatedSection from "@/components/shared/AnimatedSection";
import CollaborationSection from '@/components/sections/CollaborationSection';
import CtaSection from "@/components/sections/CTASection";
import ExperienceSection from '@/components/sections/ExperienceSection';
import FaqSection from "@/components/sections/FaqSection";
import HeroSection from "@/components/sections/HeroSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import ServicesSection from "@/components/sections/ServiceSection";
import StatsSection from "@/components/sections/StatsSection";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import FloatingWhatsApp from "@/components/shared/floatingWAButton";
import { trackEvent } from "@/lib/analytics";

// Halaman beranda tidak perlu memanggil Navbar dan Footer
// karena itu tugasnya layout
export default function HomePage() {

  
  
  return (
    <main>
      <Navbar />
      <HeroSection  />
      <AnimatedSection>
        <StatsSection />
      </AnimatedSection>
      <AnimatedSection>
        <ServicesSection />
      </AnimatedSection>
      <AnimatedSection><CollaborationSection /></AnimatedSection>
      <AnimatedSection><ExperienceSection /></AnimatedSection>
      <AnimatedSection>
        <PortfolioSection />
      </AnimatedSection>
      <AnimatedSection>
        <FaqSection />
      </AnimatedSection>
      <AnimatedSection>
        <CtaSection />
      </AnimatedSection>
      <FloatingWhatsApp/>
      <Footer/>
    </main>
  );
}
