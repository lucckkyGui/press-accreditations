import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[60px]" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
      
      <div className="container text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Konfiguracja w mniej niż 5 minut</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight text-white">
            Gotowy uprościć zarządzanie wydarzeniami?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/80">
            Dołącz do setek organizatorów, którzy wysyłają profesjonalne zaproszenia 
            i zarządzają check-inami bez wysiłku.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              className="bg-white hover:bg-white/90 text-primary hover:text-primary/90 group text-base px-8 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => navigate("/auth/register")}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Zacznij 14-dniowy trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg"
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-base px-8 backdrop-blur-sm transition-all duration-300"
              onClick={() => navigate("/contact")}
            >
              Umów demo
            </Button>
          </motion.div>
          
          <p className="mt-6 text-sm text-white/60">
            Bez karty kredytowej • Pełen dostęp do funkcji • Anuluj w każdej chwili
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
