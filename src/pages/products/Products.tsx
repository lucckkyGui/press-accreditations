
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";
import { useCheckout } from "@/hooks/useCheckout";
import { STRIPE_TIERS } from "@/config/stripe";
import { toast } from "sonner";

const products = [
  {
    id: "starter" as const,
    name: "Starter",
    description: "Idealny na początek dla małych wydarzeń",
    price: STRIPE_TIERS.starter.price,
    icon: Zap,
    popular: false,
    features: [
      "Do 500 gości na wydarzenie",
      "5 aktywnych wydarzeń",
      "Szablony zaproszeń e-mail",
      "Skanowanie kodów QR",
      "Import/export CSV",
      "Wsparcie email",
    ],
  },
  {
    id: "professional" as const,
    name: "Professional",
    description: "Dla profesjonalnych organizatorów wydarzeń",
    price: STRIPE_TIERS.professional.price,
    icon: Star,
    popular: true,
    features: [
      "Do 5000 gości na wydarzenie",
      "20 aktywnych wydarzeń",
      "Własny branding",
      "Masowy mailing",
      "Zaawansowana analityka",
      "Priorytetowe wsparcie",
      "Tryb offline skanera",
    ],
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    description: "Rozwiązanie dla dużych organizacji",
    price: STRIPE_TIERS.enterprise.price,
    icon: Building2,
    popular: false,
    features: [
      "Nielimitowani goście",
      "Nielimitowane wydarzenia",
      "Dostęp do API i webhooków",
      "Dedykowany opiekun konta",
      "SLA 99.9%",
      "Integracje na zamówienie",
      "Szkolenie on-site",
    ],
  },
];

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, isLoading } = useCheckout();

  const handleSelectPlan = (tierId: keyof typeof STRIPE_TIERS) => {
    if (!user) {
      toast.info("Zaloguj się, aby wybrać plan.");
      navigate("/auth/login");
      return;
    }
    startCheckout(STRIPE_TIERS[tierId].price_id);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4">
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Powrót do strony głównej
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Wybierz plan dla siebie</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dopasuj pakiet do skali Twoich wydarzeń. Każdy plan zawiera 14-dniowy okres próbny.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12">
          {products.map((product) => {
            const IconComponent = product.icon;
            return (
              <Card
                key={product.id}
                className={`relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                  product.popular
                    ? "border-2 border-primary shadow-xl shadow-primary/10 md:scale-105"
                    : "border shadow-sm hover:shadow-md"
                }`}
              >
                {product.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Najpopularniejszy
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${product.popular ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle>{product.name}</CardTitle>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold">{product.price} zł</span>
                    <span className="text-muted-foreground"> / miesiąc</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={product.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSelectPlan(product.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Przetwarzanie..." : "Wypróbuj za darmo"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Często zadawane pytania</h2>
          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-lg">Czy mogę zmienić plan?</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Tak, w dowolnym momencie przez portal klienta Stripe.</p></CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-lg">Czy jest okres próbny?</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Tak, 14-dniowy bezpłatny okres próbny na wszystkich planach.</p></CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader><CardTitle className="text-lg">Jakie metody płatności?</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Karty (Visa, Mastercard), przelewy SEPA, Apple Pay, Google Pay — przez Stripe.</p></CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
