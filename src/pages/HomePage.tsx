
import React from "react";
import { QrCode } from "lucide-react";
import FAQSection from "@/components/home/FAQSection";
import UserNavigation from "@/components/home/UserNavigation";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";
import FooterSection from "@/components/home/FooterSection";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
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
        <HeroSection />
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
