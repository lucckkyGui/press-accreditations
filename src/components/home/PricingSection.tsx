import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
  badge?: string;
  onSelect: () => void;
}

const PricingCard = ({ title, price, period, description, features, buttonText, isPrimary = false, badge, onSelect }: PricingCardProps) => (
  <Card className={`flex flex-col relative ${isPrimary ? 'border-2 border-primary shadow-xl scale-105' : 'border'}`}>
    {badge && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
        {badge}
      </Badge>
    )}
    <CardHeader className="text-center pb-4">
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <div className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground"> {period}</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        variant={isPrimary ? "default" : "outline"}
        size="lg"
        onClick={onSelect}
      >
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const PricingSection = () => {
  const navigate = useNavigate();
  
  const handleSelectPackage = (packageName: string) => {
    navigate("/purchase", { state: { selectedPackage: packageName } });
  };

  return (
    <section className="py-20 container">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Prosty, przejrzysty cennik</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Wybierz plan dopasowany do skali Twoich wydarzeń. Każdy plan zawiera szablony zaproszeń i QR check-in.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
        <PricingCard
          title="Starter"
          price="119 zł"
          period="/ miesiąc"
          description="Idealny na małe eventy"
          features={[
            "Do 100 gości na wydarzenie",
            "Profesjonalne szablony e-mail",
            "QR code check-in",
            "Analityka w czasie rzeczywistym",
            "Import/export CSV",
            "Wsparcie e-mail",
          ]}
          buttonText="Wypróbuj za darmo"
          onSelect={() => handleSelectPackage("basic")}
        />
        <PricingCard
          title="Professional"
          price="319 zł"
          period="/ miesiąc"
          description="Dla rosnących organizacji"
          features={[
            "Do 500 gości na wydarzenie",
            "Szablony z własnym brandingiem",
            "Masowy mailing",
            "Dostęp dla zespołu (3 osoby)",
            "Priorytetowe wsparcie",
            "Zaawansowane raporty",
            "Tryb offline skanera",
          ]}
          buttonText="Wypróbuj za darmo"
          isPrimary={true}
          badge="Najpopularniejszy"
          onSelect={() => handleSelectPackage("standard")}
        />
        <PricingCard
          title="Enterprise"
          price="799 zł"
          period="/ miesiąc"
          description="Dla dużych wydarzeń"
          features={[
            "Nieograniczona liczba gości",
            "White-label (własna marka)",
            "Dostęp do API",
            "Nielimitowani członkowie zespołu",
            "Dedykowany opiekun konta",
            "Integracje na zamówienie",
            "Gwarancja SLA",
            "Szkolenie on-site",
          ]}
          buttonText="Skontaktuj się"
          onSelect={() => handleSelectPackage("premium")}
        />
      </div>
      
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Każdy plan zawiera 14-dniowy okres próbny. Karta kredytowa nie jest wymagana.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
