
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  
  const handleSelectPackage = (packageName: string) => {
    navigate("/purchase", { state: { selectedPackage: packageName } });
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-6">Gotowy, by usprawnić zarządzanie wydarzeniami?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Dołącz do setek organizatorów, którzy już korzystają z Press Acreditations
        </p>
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-white hover:bg-white/90 text-primary hover:text-primary/90 border-primary-foreground"
          onClick={() => handleSelectPackage("free-trial")}
        >
          Rozpocznij 14-dniowy okres próbny
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
