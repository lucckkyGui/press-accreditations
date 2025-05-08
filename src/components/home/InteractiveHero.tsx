
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Ticket } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const InteractiveHero = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const animateButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.classList.add('animate-scale-in');
    setTimeout(() => button.classList.remove('animate-scale-in'), 200);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 py-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="animate-fade-in mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            {t("home.heroTitle")}
            <span className="text-primary"> {t("home.heroTitleHighlight")}</span>
          </h1>
          
          <p className="animate-fade-in mb-10 text-lg text-muted-foreground">
            {t("home.heroSubtitle")}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="animate-fade-in gap-2 hover:scale-105 transition-transform"
              onClick={(e) => {
                animateButton(e);
                navigate('/ticketing');
              }}
            >
              <Ticket className="h-5 w-5" />
              {t("home.buyTicket")}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="animate-fade-in gap-2 hover:scale-105 transition-transform"
              onClick={(e) => {
                animateButton(e);
                navigate('/events');
              }}
            >
              <Calendar className="h-5 w-5" />
              {t("home.viewEvents")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveHero;
