import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Play, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating orbs — subtler */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[100px]" />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/10 mb-8">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/80">Platforma akredytacyjna nowej generacji</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight">
              <span className="block">Akredytacje</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                bez chaosu.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 max-w-lg mb-10 leading-relaxed">
              Zaproszenia z QR, automatyczny mailing, check-in w&nbsp;2&nbsp;sekundy — 
              nawet offline. Jedno narzędzie do obsługi gości na&nbsp;każdym wydarzeniu.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-14">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-white/90 gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-white/10"
                onClick={() => navigate("/auth/register")}
              >
                Wypróbuj za darmo
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] gap-2 px-8 py-6 text-base backdrop-blur-sm"
                onClick={() => navigate("/pitch")}
              >
                <Play className="h-4 w-4" />
                Zobacz demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Shield className="h-4 w-4" />
                <span>Zgodne z RODO</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Zap className="h-4 w-4" />
                <span>Setup w 5 minut</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Działa offline</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Dashboard preview */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="text-white/30 text-sm ml-4 font-mono">dashboard</span>
                </div>
                
                {/* Mock dashboard content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/[0.06] rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">247</div>
                      <div className="text-white/40 text-xs">Zarejestrowani</div>
                    </div>
                    <div className="bg-white/[0.06] rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-400">189</div>
                      <div className="text-white/40 text-xs">Check-in</div>
                    </div>
                    <div className="bg-white/[0.06] rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">76%</div>
                      <div className="text-white/40 text-xs">Frekwencja</div>
                    </div>
                  </div>
                  
                  {/* Activity bars */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'VIP', pct: '85%', color: 'from-purple-500 to-pink-500' },
                      { label: 'Media', pct: '72%', color: 'from-blue-500 to-cyan-500' },
                      { label: 'Standard', pct: '91%', color: 'from-emerald-500 to-green-500' },
                    ].map((bar) => (
                      <div key={bar.label} className="flex items-center gap-3">
                        <div className="w-16 text-white/35 text-xs font-mono">{bar.label}</div>
                        <div className="flex-1 bg-white/[0.06] rounded-full h-1.5">
                          <div className={`bg-gradient-to-r ${bar.color} h-1.5 rounded-full`} style={{ width: bar.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-6 bg-emerald-500 rounded-xl p-3.5 shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-white font-medium text-sm">Check-in OK</div>
                    <div className="text-white/70 text-xs">Anna K. • VIP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
