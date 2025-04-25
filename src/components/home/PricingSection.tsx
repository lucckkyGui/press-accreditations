
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
  onSelect: () => void;
}

const PricingCard = ({ title, price, features, buttonText, isPrimary = false, onSelect }: PricingCardProps) => (
  <Card className={`flex flex-col ${isPrimary ? 'border-primary shadow-lg' : ''}`}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Dla {title.toLowerCase()}</CardDescription>
      <div className="mt-2">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Darmowy" && <span className="text-muted-foreground"> / miesiąc</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-primary shrink-0 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        variant={isPrimary ? "default" : "outline"}
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
    <section className="py-16 container">
      <h2 className="text-3xl font-bold text-center mb-4">Cennik</h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
        Wybierz pakiet dopasowany do wielkości Twojego wydarzenia
      </p>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <PricingCard
          title="Podstawowy"
          price="99 PLN"
          features={[
            "Do 100 gości",
            "Podstawowe zarządzanie wydarzeniami",
            "Skanowanie QR kodów",
            "Eksport listy gości",
            "1 organizator",
            "Email support",
          ]}
          buttonText="Wybierz pakiet"
          onSelect={() => handleSelectPackage("basic")}
        />
        <PricingCard
          title="Standard"
          price="299 PLN"
          features={[
            "Do 500 gości",
            "Zaawansowane zarządzanie wydarzeniami",
            "Skanowanie QR kodów",
            "Eksport danych",
            "Dostęp dla 3 organizatorów",
            "Priorytetowe wsparcie",
          ]}
          buttonText="Wybierz pakiet"
          isPrimary={true}
          onSelect={() => handleSelectPackage("standard")}
        />
        <PricingCard
          title="Premium"
          price="599 PLN"
          features={[
            "Nieograniczona liczba gości",
            "Pełne zarządzanie wydarzeniami",
            "Skanowanie QR kodów",
            "Zaawansowane raporty",
            "Dostęp dla 10 organizatorów",
            "Wsparcie premium 24/7",
          ]}
          buttonText="Wybierz pakiet"
          onSelect={() => handleSelectPackage("premium")}
        />
      </div>
      <div className="text-center mt-8">
        <Button variant="link" size="lg" onClick={() => handleSelectPackage("enterprise")}>
          Potrzebujesz rozwiązania dla większej organizacji? Sprawdź nasz pakiet Enterprise
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;
