
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, QrCode, BarChart3, Cpu, Zap } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="h-full hover:shadow-md transition-shadow duration-300 border-primary/10">
    <CardHeader>
      {icon}
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => {
  const { t } = useI18n();
  
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-primary mb-2" />,
      title: "Zarządzanie wydarzeniami",
      description: "Twórz i zarządzaj wydarzeniami, wydawaj akredytacje i monitoruj frekwencję w czasie rzeczywistym. Zyskaj pełną kontrolę nad listą gości."
    },
    {
      icon: <Users className="h-8 w-8 text-primary mb-2" />,
      title: "Baza gości",
      description: "Zarządzaj listą gości, przydzielaj im odpowiednie strefy i śledź ich status potwierdzenia. Personalizuj zaproszenia dla każdej grupy."
    },
    {
      icon: <QrCode className="h-8 w-8 text-primary mb-2" />,
      title: "Skanowanie QR",
      description: "Szybka weryfikacja gości poprzez skanowanie kodów QR, działające również w trybie offline. Synchronizacja danych po ponownym połączeniu."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary mb-2" />,
      title: "Szczegółowe statystyki",
      description: "Analizuj dane uczestników, śledź potwierdzeń i obecności. Generuj raporty dla sponsorów i interesariuszy."
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary mb-2" />,
      title: "Praca offline",
      description: "Aplikacja działa również bez dostępu do internetu, a dane są synchronizowane automatycznie po przywróceniu połączenia."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary mb-2" />,
      title: "Automatyczne powiadomienia",
      description: "Wysyłaj automatyczne przypomnienia i aktualizacje do gości. Zwiększ frekwencję dzięki proaktywnemu informowaniu."
    }
  ];

  return (
    <section className="py-16 container">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Główne funkcjonalności</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Wszystko czego potrzebujesz do efektywnego zarządzania akredytacjami prasowymi
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
