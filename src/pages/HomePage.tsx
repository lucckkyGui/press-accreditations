
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ValuePropositionSection from '@/components/home/ValuePropositionSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PricingSection from '@/components/home/PricingSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';
import FooterSection from '@/components/home/FooterSection';
import UserNavigation from '@/components/home/UserNavigation';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation bar */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4">
        <div className="container flex justify-end">
          <UserNavigation />
        </div>
      </header>
      
      <HeroSection />
      <ValuePropositionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default HomePage;
