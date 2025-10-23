import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { TrackingSection } from '@/components/sections/TrackingSection';
import { DriverSection } from '@/components/sections/DriverSection';
import { MerchantSection } from '@/components/sections/MerchantSection';

import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isScrolled={isScrolled} />
      <main>
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <PricingSection />
        <TrackingSection />
        <DriverSection />
        <MerchantSection />

        <SocialProofSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}