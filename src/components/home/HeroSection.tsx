
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, Ticket } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-muted/30 py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
          alt="Technology background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              System Zarządzania Akredytacjami
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Zarządzaj akredytacjami prasowymi i wejściówkami na wydarzenia w prosty i efektywny sposób
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" onClick={() => navigate("/login", { state: { role: "organizator" } })}>
                <CheckCircle2 className="h-5 w-5" />
                Zaloguj się jako Organizator
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/ticketing")}>
                <Ticket className="h-5 w-5" />
                System Biletowy
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
              alt="Event Management"
              className="rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
