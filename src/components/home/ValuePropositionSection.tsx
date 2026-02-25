import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      time: "30 sekund"
    },
    {
      step: "02",
      icon: <Users className="h-6 w-6" />,
      title: "Importuj gości",
      description: "Wgraj plik CSV lub dodaj gości ręcznie. Duplikaty wykrywamy automatycznie.",
      time: "1 minuta"
    },
    {
      step: "03",
      icon: <Mail className="h-6 w-6" />,
      title: "Wyślij zaproszenia",
      description: "Wybierz szablon, spersonalizuj wiadomość i wyślij do wszystkich jednym kliknięciem.",
      time: "2 minuty"
    },
    {
      step: "04",
      icon: <QrCode className="h-6 w-6" />,
      title: "Skanuj na evencie",
      description: "Skanuj kody QR telefonem. Działa offline. Frekwencja śledzona w real-time.",
      time: "2 sek. na gościa"
    }
  ];

  const highlights = [
    { icon: <Clock className="h-5 w-5" />, text: "Setup w 5 minut" },
    { icon: <Zap className="h-5 w-5" />, text: "Bez wiedzy technicznej" },
    { icon: <CheckCircle2 className="h-5 w-5" />, text: "Działa offline" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
            <Zap className="h-4 w-4 mr-2 text-primary" />
            Niesamowicie proste
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Od konfiguracji do check-inu w{" "}
            <span className="text-primary">4 krokach</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bez skomplikowanych ustawień. Bez szkoleń. System, który działa tak, jak tego oczekujesz.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full"
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
              className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent className="pt-8 pb-6 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">{item.step}</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center text-sm text-primary font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  {item.time}
                </div>
              </CardContent>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Gotowy, by uprościć zarządzanie eventami?
          </h3>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Dołącz do setek organizatorów, którzy przeszli na prostszy i efektywniejszy 
            sposób zarządzania zaproszeniami i check-inami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/auth/register")}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Zacznij za darmo
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button 
              onClick={() => navigate("/pitch")}
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Zobacz jak to działa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
