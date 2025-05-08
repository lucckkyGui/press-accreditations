
import React from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FAQSection from "@/components/home/FAQSection";
import UserNavigation from "@/components/home/UserNavigation";
import HeroSection from "@/components/home/HeroSection"; 
import InteractiveHero from "@/components/home/InteractiveHero";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";
import FooterSection from "@/components/home/FooterSection";
import { useI18n } from "@/hooks/useI18n";

const HomePage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full py-3">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t('accreditation.title')}</span>
          </div>
          <UserNavigation />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <HeroSection />
        <InteractiveHero />
        
        {/* Features section moved up for better flow */}
        <FeaturesSection />
        
        {/* Testimonials section */}
        <TestimonialsSection />
        
        {/* FAQ section */}
        <FAQSection />
        
        {/* Pricing section */}
        <PricingSection />
        
        {/* Call to action section */}
        <CTASection />
      </main>

      <FooterSection />
    </div>
  );
};

export default HomePage;
