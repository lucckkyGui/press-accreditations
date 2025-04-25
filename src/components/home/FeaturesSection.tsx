
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, QrCode, BarChart3, Cpu, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="h-full">
    <CardHeader>
      {icon}
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => (
  <section className="py-16 container">
    <h2 className="text-3xl font-bold text-center mb-12">Główne funkcjonalności</h2>
    <div className="grid md:grid-cols-3 gap-8">
      <FeatureCard 
        icon={<Calendar className="h-8 w-8 text-primary mb-2" />}
        title="Zarządzanie wydarzeniami"
        description="Twórz i zarządzaj wydarzeniami, wydawaj akredytacje i monitoruj frekwencję w czasie rzeczywistym. Zyskaj pełną kontrolę nad listą gości."
      />
      <FeatureCard 
        icon={<Users className="h-8 w-8 text-primary mb-2" />}
        title="Baza gości"
        description="Zarządzaj listą gości, przydzielaj im odpowiednie strefy i śledź ich status potwierdzenia. Personalizuj zaproszenia dla każdej grupy."
      />
      <FeatureCard 
        icon={<QrCode className="h-8 w-8 text-primary mb-2" />}
        title="Skanowanie QR"
        description="Szybka weryfikacja gości poprzez skanowanie kodów QR, działające również w trybie offline. Synchronizacja danych po ponownym połączeniu."
      />
      <FeatureCard 
        icon={<BarChart3 className="h-8 w-8 text-primary mb-2" />}
        title="Szczegółowe statystyki"
        description="Analizuj dane uczestników, śledź potwierdzeń i obecności. Generuj raporty dla sponsorów i interesariuszy."
      />
      <FeatureCard 
        icon={<Cpu className="h-8 w-8 text-primary mb-2" />}
        title="Praca offline"
        description="Aplikacja działa również bez dostępu do internetu, a dane są synchronizowane automatycznie po przywróceniu połączenia."
      />
      <FeatureCard 
        icon={<Zap className="h-8 w-8 text-primary mb-2" />}
        title="Automatyczne powiadomienia"
        description="Wysyłaj automatyczne przypomnienia i aktualizacje do gości. Zwiększ frekwencję dzięki proaktywnemu informowaniu."
      />
    </div>
  </section>
);

export default FeaturesSection;
