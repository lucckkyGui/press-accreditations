import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, QrCode, Users, Zap, Clock, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ValuePropositionSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      icon: <FileText className="h-6 w-6" />,
      title: "Stwórz wydarzenie",
      description: "Dodaj nazwę, datę i lokalizację. Konfiguracja zajmuje 30 sekund.",
      time: "30 sekund",
      colorClass: "bg-primary/10 text-primary",
    },
    {
      step: "02",
      icon: <Users className="h-6 w-6" />,
      title: "Importuj gości",
      description: "Wgraj plik CSV lub dodaj gości ręcznie. Duplikaty wykrywamy automatycznie.",
      time: "1 minuta",
      colorClass: "bg-secondary/10 text-secondary",
    },
    {
      step: "03",
      icon: <Mail className="h-6 w-6" />,
      title: "Wyślij zaproszenia",
      description: "Wybierz szablon, spersonalizuj wiadomość i wyślij do wszystkich jednym kliknięciem.",
      time: "2 minuty",
      colorClass: "bg-info/10 text-info",
    },
    {
      step: "04",
      icon: <QrCode className="h-6 w-6" />,
      title: "Skanuj na evencie",
      description: "Skanuj kody QR telefonem. Działa offline. Frekwencja śledzona w real-time.",
      time: "2 sek. na gościa",
      colorClass: "bg-accent/10 text-accent",
    }
  ];

  const highlights = [
    { icon: <Clock className="h-5 w-5" />, text: "Setup w 5 minut", color: "bg-primary/10 text-primary" },
    { icon: <Zap className="h-5 w-5" />, text: "Bez wiedzy technicznej", color: "bg-accent/10 text-accent" },
    { icon: <CheckCircle2 className="h-5 w-5" />, text: "Działa offline", color: "bg-secondary/10 text-secondary" },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blob blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 border border-info/20 mb-6">
            <Zap className="h-4 w-4 text-info" />
            <span className="text-sm font-semibold text-info">Niesamowicie proste</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Od konfiguracji do check-inu w{" "}
            <span className="gradient-text">4 krokach</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bez skomplikowanych ustawień. Bez szkoleń. System, który działa tak, jak tego oczekujesz.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className={`inline-flex items-center gap-2 ${highlight.color} px-4 py-2 rounded-full`}
              >
                {highlight.icon}
                <span className="text-sm font-medium">{highlight.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((item, index) => (
            <Card 
              key={index} 
              className="relative group hover:shadow-card-hover transition-all duration-300 border hover:border-primary/20 rounded-2xl hover:-translate-y-1"
            >
              <CardContent className="pt-8 pb-6 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.colorClass}`}>
                    {item.icon}
                  </div>
                  <span className="text-4xl font-extrabold text-muted-foreground/10">{item.step}</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center text-sm font-medium text-primary">
                  <Clock className="h-4 w-4 mr-1" />
                  {item.time}
                </div>
              </CardContent>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary/30" />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="gradient-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[40px]" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-[60px]" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">
              Gotowy, by uprościć zarządzanie eventami?
            </h3>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Dołącz do setek organizatorów, którzy przeszli na prostszy i efektywniejszy 
              sposób zarządzania zaproszeniami i check-inami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/auth/register")}
                className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                Zacznij za darmo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="ghost"
                onClick={() => navigate("/pitch")}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm"
              >
                Zobacz jak to działa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
