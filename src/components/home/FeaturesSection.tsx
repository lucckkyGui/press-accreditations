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
    colorClass: "bg-primary/10 text-primary",
  },
  {
    icon: Mail,
    title: "Automatyczny mailing",
    description: "Spersonalizowane zaproszenia z kodem QR dla tysięcy gości. Jedno kliknięcie — wysyłka gotowa.",
    colorClass: "bg-info/10 text-info",
  },
  {
    icon: Users,
    title: "Zarządzanie gośćmi",
    description: "Import CSV, strefy dostępu, statusy, historia zmian. Pełna kontrola nad listą gości.",
    colorClass: "bg-secondary/10 text-secondary",
  },
  {
    icon: BarChart3,
    title: "Analityka na żywo",
    description: "Dashboard real-time: frekwencja, check-in, raporty dla sponsorów — wszystko w jednym widoku.",
    colorClass: "bg-accent/10 text-accent",
  },
  {
    icon: Calendar,
    title: "Multi-event",
    description: "Zarządzaj wieloma wydarzeniami jednocześnie. Kopiuj ustawienia i listy gości między eventami.",
    colorClass: "bg-destructive/10 text-destructive",
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo & RODO",
    description: "Szyfrowanie danych, kontrola dostępu, audit log i pełna zgodność z RODO.",
    colorClass: "bg-success/10 text-success",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/40 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 blob blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/5 blob blur-[100px]" />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Funkcjonalności</span>
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
              className="group relative overflow-hidden border bg-card shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 rounded-2xl"
            >
              <CardContent className="p-8">
                <div className={`inline-flex p-3 rounded-xl mb-6 ${feature.colorClass}`}>
                  <feature.icon className="h-6 w-6" />
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
              <Smartphone className="h-5 w-5 text-primary" />
              <span>PWA Ready</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5 text-secondary" />
              <span>10 języków</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-accent" />
              <span>Real-time sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
