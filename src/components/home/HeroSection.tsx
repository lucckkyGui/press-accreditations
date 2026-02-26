import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Play, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
      {/* Colorful blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/15 blob blur-[80px] animate-pulse-slow" />
        <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-secondary/15 blob blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-accent/15 blob blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Platforma akredytacyjna nowej generacji</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="block text-foreground">Akredytacje</span>
              <span className="block gradient-text-hero">
                bez chaosu.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Zaproszenia z QR, automatyczny mailing, check-in w&nbsp;2&nbsp;sekundy — 
              nawet offline. Jedno narzędzie do obsługi gości na&nbsp;każdym wydarzeniu.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-14 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                className="gradient-primary text-primary-foreground hover:opacity-90 gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                onClick={() => navigate("/auth/register")}
              >
                Wypróbuj za darmo
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border bg-background hover:bg-muted gap-2 px-8 py-6 text-base transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => navigate("/pitch")}
              >
                <Play className="h-4 w-4 text-primary" />
                Zobacz demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4 text-secondary" />
                <span>Zgodne z RODO</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Zap className="h-4 w-4 text-accent" />
                <span>Setup w 5 minut</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Działa offline</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Dashboard preview */}
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-card rounded-2xl border border-border p-6 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <span className="text-muted-foreground text-sm ml-4 font-mono">dashboard</span>
                </div>
                
                {/* Mock dashboard content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                      <div className="text-2xl font-bold text-foreground">247</div>
                      <div className="text-muted-foreground text-xs">Zarejestrowani</div>
                    </div>
                    <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/10">
                      <div className="text-2xl font-bold text-secondary">189</div>
                      <div className="text-muted-foreground text-xs">Check-in</div>
                    </div>
                    <div className="bg-info/5 rounded-xl p-4 border border-info/10">
                      <div className="text-2xl font-bold text-info">76%</div>
                      <div className="text-muted-foreground text-xs">Frekwencja</div>
                    </div>
                  </div>
                  
                  {/* Activity bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'VIP', pct: '85%', color: 'bg-primary' },
                      { label: 'Media', pct: '72%', color: 'bg-info' },
                      { label: 'Standard', pct: '91%', color: 'bg-secondary' },
                    ].map((bar) => (
                      <div key={bar.label} className="flex items-center gap-3">
                        <div className="w-16 text-muted-foreground text-xs font-mono">{bar.label}</div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className={`${bar.color} h-2 rounded-full transition-all duration-1000`} style={{ width: bar.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-6 bg-success rounded-xl p-3.5 shadow-lg shadow-success/25 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                  <div>
                    <div className="text-success-foreground font-medium text-sm">Check-in OK</div>
                    <div className="text-success-foreground/70 text-xs">Anna K. • VIP</div>
                  </div>
                </div>
              </div>
              
              {/* Floating badge top right */}
              <div className="absolute -top-3 -right-3 gradient-warm rounded-xl px-4 py-2 shadow-lg animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="text-accent-foreground font-bold text-sm">+12 dziś</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
