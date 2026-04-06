import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useCheckout } from "@/hooks/useCheckout";
import { STRIPE_TIERS } from "@/config/stripe";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
  badge?: string;
  isLoading?: boolean;
  onSelect: () => void;
}

const PricingCard = ({ title, price, originalPrice, period, description, features, buttonText, isPrimary = false, badge, isLoading, onSelect }: PricingCardProps) => (
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
        {originalPrice && (
          <span className="text-lg text-muted-foreground line-through mr-2">{originalPrice}</span>
        )}
        <span className={`text-4xl font-extrabold ${isPrimary ? 'gradient-text' : ''}`}>{price}</span>
        {period && <span className="text-muted-foreground"> {period}</span>}
      </div>
      {originalPrice && (
        <Badge variant="secondary" className="mt-2 text-xs bg-success/10 text-success border-success/20">
          Oszczędzasz 20%
        </Badge>
      )}
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

const monthlyPrices = { starter: "119 zł", professional: "319 zł", enterprise: "799 zł" };
const annualPrices = { starter: "95 zł", professional: "255 zł", enterprise: "639 zł" };
const annualOriginal = { starter: "119 zł", professional: "319 zł", enterprise: "799 zł" };

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, isLoading } = useCheckout();
  const [showComparison, setShowComparison] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const prices = isAnnual ? annualPrices : monthlyPrices;
  const period = isAnnual ? "/ mies. (rocznie)" : "/ miesiąc";

  const handleSelectPlan = (priceId: string) => {
    if (!user) {
      toast.info("Zaloguj się, aby wybrać plan.");
      navigate("/login");
      return;
    }
    startCheckout(priceId);
  };

  return (
    <section id="pricing" className="py-20 container" aria-labelledby="pricing-heading">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold text-accent">Cennik</span>
        </div>
        <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">Prosty, przejrzysty cennik</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Wybierz plan dopasowany do skali Twoich wydarzeń. Każdy plan zawiera szablony zaproszeń i QR check-in.
        </p>
      </div>

      {/* Annual / Monthly toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Label htmlFor="billing-toggle" className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Miesięcznie
        </Label>
        <Switch
          id="billing-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          aria-label="Przełącz między planem miesięcznym a rocznym"
        />
        <Label htmlFor="billing-toggle" className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Rocznie
        </Label>
        {isAnnual && (
          <Badge variant="secondary" className="ml-1 bg-success/10 text-success border-success/20 text-xs">
            -20%
          </Badge>
        )}
      </div>

      {/* Feature comparison toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
          aria-expanded={showComparison}
        >
          {showComparison ? 'Ukryj porównanie' : 'Pokaż pełne porównanie funkcji'}
          <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showComparison ? 'rotate-90' : ''}`} aria-hidden="true" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-start px-4 md:px-0">
        <PricingCard
          title="Starter"
          price={prices.starter}
          originalPrice={isAnnual ? annualOriginal.starter : undefined}
          period={period}
          description="Idealny na małe eventy"
          features={[
            "Do 500 gości łącznie",
            "5 wydarzeń",
            "QR code check-in",
            "Import/export CSV",
            "Bulk email",
            "Wsparcie e-mail",
          ]}
          buttonText="Wypróbuj 14 dni za darmo"
          isLoading={isLoading}
          onSelect={() => handleSelectPlan(STRIPE_TIERS.starter.price_id)}
        />
        <PricingCard
          title="Professional"
          price={prices.professional}
          originalPrice={isAnnual ? annualOriginal.professional : undefined}
          period={period}
          description="Dla rosnących organizacji"
          features={[
            "Do 5 000 gości łącznie",
            "20 wydarzeń",
            "Mass mailing",
            "Zaawansowana analityka",
            "Własny branding",
            "Priorytetowe wsparcie",
            "Tryb offline skanera",
          ]}
          buttonText="Wypróbuj 14 dni za darmo"
          isPrimary={true}
          badge="Najpopularniejszy"
          isLoading={isLoading}
          onSelect={() => handleSelectPlan(STRIPE_TIERS.professional.price_id)}
        />
        <PricingCard
          title="Enterprise"
          price={prices.enterprise}
          originalPrice={isAnnual ? annualOriginal.enterprise : undefined}
          period={period}
          description="Dla dużych wydarzeń"
          features={[
            "Nielimitowani goście",
            "Nielimitowane wydarzenia",
            "Dostęp do API i webhooków",
            "White-label (własna marka)",
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

      {/* Feature comparison table */}
      {showComparison && (
        <div className="max-w-5xl mx-auto mt-12 overflow-x-auto" role="region" aria-label="Porównanie planów">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground" scope="col">Funkcja</th>
                <th className="text-center p-4 font-semibold text-foreground" scope="col">Starter</th>
                <th className="text-center p-4 font-semibold text-primary bg-primary/5" scope="col">Professional</th>
                <th className="text-center p-4 font-semibold text-foreground" scope="col">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Maks. gości', '500', '5 000', '∞'],
                ['Maks. wydarzeń', '5', '20', '∞'],
                ['QR check-in', '✓', '✓', '✓'],
                ['Bulk email', '✓', '✓', '✓'],
                ['Mass mailing', '—', '✓', '✓'],
                ['Analityka', '—', '✓', '✓'],
                ['Własny branding', '—', '✓', '✓'],
                ['Dostęp API', '—', '—', '✓'],
                ['Webhooky', '—', '—', '✓'],
                ['Tryb offline', '—', '✓', '✓'],
                ['SLA', '—', '—', '✓'],
              ].map(([feature, s, p, e], i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-foreground">{feature}</td>
                  <td className="p-3 text-center text-muted-foreground">{s}</td>
                  <td className="p-3 text-center bg-primary/5 font-medium">{p}</td>
                  <td className="p-3 text-center text-muted-foreground">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Każdy plan zawiera 14-dniowy okres próbny. Karta kredytowa nie jest wymagana.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;