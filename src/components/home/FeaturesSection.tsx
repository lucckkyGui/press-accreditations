import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, Users, QrCode, BarChart3, Mail, Shield, Smartphone, Zap, Globe
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Skanowanie QR",
    description: "Weryfikacja gości w 2 sekundy. Działa offline — synchronizuje się automatycznie po połączeniu.",
    accent: "hsl(210, 100%, 60%)",
  },
  {
    icon: Mail,
    title: "Automatyczny mailing",
    description: "Spersonalizowane zaproszenia z kodem QR dla tysięcy gości. Jedno kliknięcie — wysyłka gotowa.",
    accent: "hsl(270, 80%, 65%)",
  },
  {
    icon: Users,
    title: "Zarządzanie gośćmi",
    description: "Import CSV, strefy dostępu, statusy, historia zmian. Pełna kontrola nad listą gości.",
    accent: "hsl(150, 70%, 50%)",
  },
  {
    icon: BarChart3,
    title: "Analityka na żywo",
    description: "Dashboard real-time: frekwencja, check-in, raporty dla sponsorów — wszystko w jednym widoku.",
    accent: "hsl(30, 95%, 55%)",
  },
  {
    icon: Calendar,
    title: "Multi-event",
    description: "Zarządzaj wieloma wydarzeniami jednocześnie. Kopiuj ustawienia i listy gości między eventami.",
    accent: "hsl(0, 80%, 60%)",
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo & RODO",
    description: "Szyfrowanie danych, kontrola dostępu, audit log i pełna zgodność z RODO.",
    accent: "hsl(220, 15%, 50%)",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
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
            Kompleksowe narzędzia do zarządzania akredytacjami i gośćmi na wydarzeniach każdej skali.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-0 bg-background shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8">
                <div className="inline-flex p-3 rounded-xl mb-6" style={{ backgroundColor: `${feature.accent}15` }}>
                  <feature.icon className="h-6 w-6" style={{ color: feature.accent }} />
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-5 w-5" />
              <span>PWA Ready</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5" />
              <span>10 języków</span>
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
