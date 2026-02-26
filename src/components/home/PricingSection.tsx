import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useCheckout } from "@/hooks/useCheckout";
import { STRIPE_TIERS } from "@/config/stripe";
import { toast } from "sonner";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
  badge?: string;
  isLoading?: boolean;
  onSelect: () => void;
}

const PricingCard = ({ title, price, period, description, features, buttonText, isPrimary = false, badge, isLoading, onSelect }: PricingCardProps) => (
  <Card className={`flex flex-col relative rounded-2xl transition-all duration-300 hover:-translate-y-1 ${isPrimary ? 'border-2 border-primary shadow-xl shadow-primary/10 md:scale-105 bg-card' : 'border bg-card shadow-soft hover:shadow-card-hover'}`}>
    {badge && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground border-0 px-4 py-1">
        <Sparkles className="h-3 w-3 mr-1" />
        {badge}
      </Badge>
    )}
    <CardHeader className="text-center pb-4">
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <div className="mt-4">
        <span className={`text-4xl font-extrabold ${isPrimary ? 'gradient-text' : ''}`}>{price}</span>
        {period && <span className="text-muted-foreground"> {period}</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`rounded-full p-0.5 ${isPrimary ? 'bg-primary/10' : 'bg-secondary/10'}`}>
              <Check className={`h-4 w-4 ${isPrimary ? 'text-primary' : 'text-secondary'} shrink-0`} />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className={`w-full transition-all duration-300 ${isPrimary ? 'gradient-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20' : ''}`}
        variant={isPrimary ? "default" : "outline"}
        size="lg"
        onClick={onSelect}
        disabled={isLoading}
      >
        {isLoading ? "Przetwarzanie..." : buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, isLoading } = useCheckout();

  const handleSelectPlan = (priceId: string) => {
    if (!user) {
      toast.info("Zaloguj się, aby wybrać plan.");
      navigate("/login");
      return;
    }
    startCheckout(priceId);
  };

  return (
    <section className="py-20 container">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Cennik</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Prosty, przejrzysty cennik</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Wybierz plan dopasowany do skali Twoich wydarzeń. Każdy plan zawiera szablony zaproszeń i QR check-in.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-start px-4 md:px-0">
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
          isLoading={isLoading}
          onSelect={() => handleSelectPlan(STRIPE_TIERS.starter.price_id)}
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
          isLoading={isLoading}
          onSelect={() => handleSelectPlan(STRIPE_TIERS.professional.price_id)}
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
          isLoading={isLoading}
          onSelect={() => handleSelectPlan(STRIPE_TIERS.enterprise.price_id)}
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
