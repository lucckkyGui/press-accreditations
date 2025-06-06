
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ValuePropositionSection from '@/components/home/ValuePropositionSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PricingSection from '@/components/home/PricingSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';
import FooterSection from '@/components/home/FooterSection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
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
