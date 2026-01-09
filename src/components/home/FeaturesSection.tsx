import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  QrCode, 
  BarChart3, 
  Mail, 
  Shield,
  Smartphone,
  Zap,
  Globe
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const FeaturesSection = () => {
  const { t } = useI18n();
  
  const features = [
    {
      icon: QrCode,
      title: "Skanowanie QR",
      description: "Błyskawiczna weryfikacja gości w czasie rzeczywistym. Działa offline i synchronizuje się automatycznie.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Mail,
      title: "Automatyczny mailing",
      description: "Wysyłaj spersonalizowane zaproszenia z kodem QR do tysięcy gości jednym kliknięciem.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Users,
      title: "Zarządzanie gośćmi",
      description: "Importuj, kategoryzuj i zarządzaj listą gości. Przydzielaj strefy i śledź statusy.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: BarChart3,
      title: "Analityka na żywo",
      description: "Dashboard w czasie rzeczywistym. Frekwencja, statystyki check-in i raporty dla sponsorów.",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Calendar,
      title: "Multi-event",
      description: "Zarządzaj wieloma wydarzeniami jednocześnie. Kopiuj ustawienia i listy gości.",
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Shield,
      title: "Bezpieczeństwo",
      description: "Szyfrowanie end-to-end, kontrola dostępu i pełna historia zmian.",
      color: "from-slate-500 to-zinc-500",
      bgColor: "bg-slate-500/10",
    },
  ];

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Funkcjonalności</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kompleksowe narzędzia do zarządzania akredytacjami, gośćmi i komunikacją 
            na wydarzeniach każdej skali.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-0 bg-background shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8">
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6`}>
                  <feature.icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                  <feature.icon className={`h-6 w-6`} style={{ 
                    background: `linear-gradient(135deg, ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('green') ? '#22c55e' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('red') ? '#ef4444' : '#64748b'} 0%, ${feature.color.includes('cyan') ? '#06b6d4' : feature.color.includes('pink') ? '#ec4899' : feature.color.includes('emerald') ? '#10b981' : feature.color.includes('amber') ? '#f59e0b' : feature.color.includes('rose') ? '#f43f5e' : '#71717a'} 100%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }} />
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
              
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </Card>
          ))}
        </div>
        
        {/* Bottom highlight */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-5 w-5" />
              <span>PWA Ready</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5" />
              <span>Multi-language</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5" />
              <span>Real-time sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
