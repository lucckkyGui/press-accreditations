import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Play, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target]);

  return <span>{display}{suffix}</span>;
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
      {/* Animated blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-accent/15 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.1, 1], y: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Platforma akredytacyjna nowej generacji</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight"
            >
              <span className="block text-foreground">Akredytacje</span>
              <motion.span
                className="block gradient-text-hero"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
              >
                bez chaosu.
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed"
            >
              Zaproszenia z QR, automatyczny mailing, check-in w&nbsp;2&nbsp;sekundy — 
              nawet offline. Jedno narzędzie do obsługi gości na&nbsp;każdym wydarzeniu.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-14"
            >
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
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Shield, label: "Zgodne z RODO", color: "text-secondary" },
                { icon: Zap, label: "Setup w 5 minut", color: "text-accent" },
                { icon: CheckCircle2, label: "Działa offline", color: "text-success" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Right side - Dashboard preview */}
          <div className="hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Main card */}
              <div className="relative bg-card rounded-2xl border border-border p-6 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <span className="text-muted-foreground text-sm ml-4 font-mono">dashboard</span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Zarejestrowani", value: 247, color: "primary" },
                      { label: "Check-in", value: 189, color: "secondary" },
                      { label: "Frekwencja", value: 76, color: "info", suffix: "%" },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className={`bg-${stat.color}/5 rounded-xl p-4 border border-${stat.color}/10`}
                      >
                        <div className={`text-2xl font-bold text-${stat.color === "primary" ? "foreground" : stat.color}`}>
                          <Counter target={stat.value} suffix={stat.suffix} />
                        </div>
                        <div className="text-muted-foreground text-xs">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Activity bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'VIP', pct: 85, color: 'bg-primary' },
                      { label: 'Media', pct: 72, color: 'bg-info' },
                      { label: 'Standard', pct: 91, color: 'bg-secondary' },
                    ].map((bar, i) => (
                      <div key={bar.label} className="flex items-center gap-3">
                        <div className="w-16 text-muted-foreground text-xs font-mono">{bar.label}</div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <motion.div
                            className={`${bar.color} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.pct}%` }}
                            transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute -bottom-4 -left-6 bg-success rounded-xl p-3.5 shadow-lg shadow-success/25"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                  <div>
                    <div className="text-success-foreground font-medium text-sm">Check-in OK</div>
                    <div className="text-success-foreground/70 text-xs">Anna K. • VIP</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating badge top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4, type: "spring", stiffness: 200 }}
                className="absolute -top-3 -right-3 gradient-warm rounded-xl px-4 py-2 shadow-lg"
              >
                <div className="text-accent-foreground font-bold text-sm">+12 dziś</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
