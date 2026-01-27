import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, Ticket, Play, ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">AI-Powered Accreditation Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Inteligentne</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Akredytacje
              </span>
              <span className="block text-3xl md:text-4xl text-white/70 font-normal mt-2">
                dla profesjonalistów
              </span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-xl mb-10 leading-relaxed">
              Zautomatyzuj weryfikację gości, wysyłaj zaproszenia jednym kliknięciem 
              i śledź check-iny w czasie rzeczywistym. Wszystko w jednym miejscu.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 gap-2 px-8 py-6 text-lg shadow-lg shadow-blue-500/25"
                onClick={() => navigate("/auth/login", { state: { role: "organizator" } })}
              >
                <CheckCircle2 className="h-5 w-5" />
                Zaloguj się
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2 px-8 py-6 text-lg backdrop-blur-sm"
                onClick={() => navigate("/ticketing")}
              >
                <Play className="h-5 w-5" />
                Zobacz demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-white">50k+</div>
                <div className="text-white/50 text-sm">Gości obsłużonych</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-white/50 text-sm">Uptime systemu</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">&lt;2s</div>
                <div className="text-white/50 text-sm">Czas skanowania</div>
              </div>
            </div>
          </div>
          
          {/* Right side - Dashboard preview */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/40 text-sm ml-4">Dashboard</span>
                </div>
                
                {/* Mock dashboard content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">247</div>
                      <div className="text-white/50 text-xs">Zarejestrowani</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">189</div>
                      <div className="text-white/50 text-xs">Check-in</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">76%</div>
                      <div className="text-white/50 text-xs">Frekwencja</div>
                    </div>
                  </div>
                  
                  {/* Activity bars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-white/40 text-xs">VIP</div>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-white/40 text-xs">Media</div>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-white/40 text-xs">Standard</div>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '91%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating notification card */}
              <div className="absolute -bottom-4 -left-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 shadow-lg shadow-green-500/25 transform -rotate-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <div>
                    <div className="text-white font-medium text-sm">Check-in successful</div>
                    <div className="text-white/70 text-xs">Anna Kowalska • VIP</div>
                  </div>
                </div>
              </div>
              
              {/* QR scan card */}
              <div className="absolute -top-4 -right-8 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 transform rotate-6">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-12 h-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMXoiLz48cGF0aCBkPSJNMTMgMWg3djdoLTd6Ii8+PHBhdGggZD0iTTEgMTNoN3Y3SDF6Ii8+PHBhdGggZD0iTTMgM2gzdjNIM3oiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTUgM2gzdjNoLTN6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMgMTVoM3YzSDN6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTEzIDEzaDJ2MmgtMnoiLz48cGF0aCBkPSJNMTcgMTNoMnYyaC0yeiIvPjxwYXRoIGQ9Ik0xMyAxN2gydjJoLTJ6Ii8+PHBhdGggZD0iTTE3IDE3aDJ2MmgtMnoiLz48cGF0aCBkPSJNMTUgMTVoMnYyaC0yeiIvPjxwYXRoIGQ9Ik05IDloM3YzSDl6Ii8+PC9zdmc+')] bg-contain" />
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
