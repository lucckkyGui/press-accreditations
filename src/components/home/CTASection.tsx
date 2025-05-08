
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useIsMobile } from "@/hooks/use-mobile";

const CTASection = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  
  const handleSelectPackage = (packageName: string) => {
    navigate("/purchase", { state: { selectedPackage: packageName } });
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/20"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10"></div>
      </div>
      
      <div className="container text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Gotowy, by usprawnić zarządzanie wydarzeniami?</h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Dołącz do setek organizatorów, którzy już korzystają z Press Acreditations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size={isMobile ? "default" : "lg"}
            variant="outline" 
            className="bg-white hover:bg-white/90 text-primary hover:text-primary/90 border-primary-foreground group"
            onClick={() => handleSelectPackage("free-trial")}
          >
            Rozpocznij 14-dniowy okres próbny
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size={isMobile ? "default" : "lg"}
            variant="ghost" 
            className="bg-transparent hover:bg-white/10 border border-white/40"
            onClick={() => handleSelectPackage("demo")}
          >
            Umów prezentację systemu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
