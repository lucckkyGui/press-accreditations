
import React from "react";
import { QrCode } from "lucide-react";
import FAQSection from "@/components/home/FAQSection";
import UserNavigation from "@/components/home/UserNavigation";
import InteractiveHero from "@/components/home/InteractiveHero";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";
import FooterSection from "@/components/home/FooterSection";
import { useI18n } from "@/hooks/useI18n";

const HomePage = () => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Press Acreditations</span>
          </div>
          <UserNavigation />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <InteractiveHero />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
        <PricingSection />
        <CTASection />
      </main>

      <FooterSection />
    </div>
  );
};

export default HomePage;
