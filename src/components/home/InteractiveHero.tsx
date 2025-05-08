
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Ticket, ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const InteractiveHero = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { playSoundEffect } = useSoundEffects();

  const animateButton = (e: React.MouseEvent<HTMLButtonElement>, soundType: "success" | "notification") => {
    const button = e.currentTarget;
    button.classList.add('animate-scale-in');
    
    // Play sound effect and add visual feedback
    playSoundEffect(soundType);
    
    // Remove animation class after it completes
    setTimeout(() => button.classList.remove('animate-scale-in'), 200);
  };

  const handleTicketClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e, "success");
    navigate('/accreditation-request');
  };

  const handleEventsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    animateButton(e, "notification");
    navigate('/events');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 py-20 lg:py-28">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="animate-fade-in mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("home.heroTitle")}{" "}
            <span className="text-primary font-extrabold">{t("home.heroTitleHighlight")}</span>
          </h1>
          
          <p className="animate-fade-in mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8">
            <Button
              size="lg"
              className="animate-fade-in gap-2 hover:scale-105 transition-transform group text-base"
              onClick={handleTicketClick}
            >
              <Ticket className="h-5 w-5" />
              {t("home.buyTicket")}
              <ArrowRight className="h-4 w-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="animate-fade-in gap-2 hover:scale-105 transition-transform text-base"
              onClick={handleEventsClick}
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
