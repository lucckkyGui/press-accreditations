import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
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

const CLIENT_LOGOS = [
  "TVN24",
  "Polsat",
  "Onet",
  "RMF FM",
  "Open'er",
  "Sopot Fest",
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background grid-bg">
      {/* Aurora glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-background/80" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="chip chip-acc mb-8">
              <span className="chip-dot" />
              <Sparkles className="h-3 w-3" />
              Platforma akredytacyjna nowej generacji
            </div>

            <h1 className="mb-6 font-extrabold leading-[1.05] tracking-tighter">
              <span className="block text-5xl md:text-6xl lg:text-[4.25rem]">
                Akredytacje prasowe,
              </span>
              <span className="block text-5xl md:text-6xl lg:text-[4.25rem] serif-italic gradient-text-hero">
                zaprojektowane
              </span>
              <span className="block text-5xl md:text-6xl lg:text-[4.25rem]">
                dla zespołów które organizują.
              </span>
            </h1>

            <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Zaproszenia z QR, automatyczny mailing, check-in w&nbsp;2&nbsp;sekundy —
              nawet offline. Jedno narzędzie do obsługi gości na&nbsp;każdym wydarzeniu.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="glow-accent bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-7 font-semibold transition-all duration-200 hover:-translate-y-px"
                onClick={() => navigate("/auth/register")}
              >
                Wypróbuj za darmo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mb-12">
              {[
                { icon: Shield,       label: "Zgodne z RODO", color: "text-secondary" },
                { icon: Zap,          label: "Setup w 5 minut", color: "text-primary" },
                { icon: CheckCircle2, label: "Działa offline",  color: "text-success" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Client logo bar */}
            <div>
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest mb-4 font-medium">
                Zaufali nam
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {CLIENT_LOGOS.map((logo) => (
                  <span
                    key={logo}
                    className="text-muted-foreground/40 text-sm font-semibold tracking-tight hover:text-muted-foreground/70 transition-colors"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — dashboard preview */}
          <div className="hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Main card */}
              <div className="relative bg-card rounded-lg border border-border p-6 shadow-card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  <span className="text-muted-foreground text-xs mono ml-3">dashboard</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Zarejestrowani", value: 247, color: "primary" },
                      { label: "Check-in",       value: 189, color: "secondary" },
                      { label: "Frekwencja",     value: 76,  color: "info", suffix: "%" },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-muted/60 rounded-lg p-3 hair"
                      >
                        <div className={`text-xl font-bold mono text-${stat.color === "primary" ? "foreground" : stat.color}`}>
                          <Counter target={stat.value} suffix={stat.suffix} />
                        </div>
                        <div className="text-muted-foreground text-[11px] mt-0.5">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Activity bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'VIP',      pct: 85, color: 'bg-primary' },
                      { label: 'Media',    pct: 72, color: 'bg-info' },
                      { label: 'Standard', pct: 91, color: 'bg-secondary' },
                    ].map((bar, i) => (
                      <div key={bar.label} className="flex items-center gap-3">
                        <div className="w-14 text-muted-foreground text-[11px] mono shrink-0">{bar.label}</div>
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <motion.div
                            className={`${bar.color} h-1.5 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.pct}%` }}
                            transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scan stream preview */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2 font-medium">
                      Ostatnie check-iny
                    </div>
                    {[
                      { name: "Krzysztof W.", zone: "Foto", time: "14:32", ok: true },
                      { name: "Monika B.",    zone: "VIP",  time: "14:31", ok: true },
                      { name: "Jan K.",       zone: "Press", time: "14:29", ok: false },
                    ].map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${entry.ok ? "bg-success" : "bg-destructive"}`} />
                          <span className="text-foreground font-medium">{entry.name}</span>
                          <span className="text-muted-foreground/50">{entry.zone}</span>
                        </div>
                        <span className="text-muted-foreground/40 mono">{entry.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating check-in notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute -bottom-4 -left-6 bg-success rounded-lg p-3 shadow-lg shadow-success/25"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                  <div>
                    <div className="text-success-foreground font-semibold text-[13px] leading-none">Check-in OK</div>
                    <div className="text-success-foreground/70 text-[11px] mt-0.5">Anna K. • VIP</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating counter badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4, type: "spring", stiffness: 200 }}
                className="absolute -top-3 -right-3 bg-primary rounded-lg px-3 py-1.5 shadow-glow"
              >
                <div className="text-primary-foreground font-bold text-[13px] mono">+12 dziś</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
