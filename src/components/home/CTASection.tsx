import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Clock } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/20" />
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5" />
      </div>
      
      <div className="container text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Konfiguracja w mniej niż 5 minut</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
          Gotowy uprościć zarządzanie wydarzeniami?
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Dołącz do setek organizatorów, którzy wysyłają profesjonalne zaproszenia 
          i zarządzają check-inami bez wysiłku.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white hover:bg-white/90 text-primary hover:text-primary/90 group text-base px-8"
            onClick={() => navigate("/auth/register")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Zacznij 14-dniowy trial
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg"
            variant="ghost" 
            className="bg-transparent hover:bg-white/10 border border-white/40 text-base px-8"
            onClick={() => navigate("/contact")}
          >
            Umów demo
          </Button>
        </div>
        
        <p className="mt-6 text-sm opacity-70">
          Bez karty kredytowej • Pełen dostęp do funkcji • Anuluj w każdej chwili
        </p>
      </div>
    </section>
  );
};

export default CTASection;
