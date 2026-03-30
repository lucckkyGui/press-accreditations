
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star, Zap, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    id: "starter",
    name: "Starter",
    description: "Idealny na początek dla małych wydarzeń",
    price: 0,
    period: "za darmo",
    icon: Zap,
    popular: false,
    features: [
      "Do 100 gości na wydarzenie",
      "1 aktywne wydarzenie",
      "Podstawowe szablony zaproszeń",
      "Skanowanie kodów QR",
      "Podstawowe statystyki",
      "Wsparcie email"
    ],
    limitations: [
      "Brak własnego brandingu",
      "Ograniczone integracje"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    description: "Dla profesjonalnych organizatorów wydarzeń",
    price: 199,
    period: "/miesiąc",
    icon: Star,
    popular: true,
    features: [
      "Do 1000 gości na wydarzenie",
      "5 aktywnych wydarzeń",
      "Zaawansowane szablony zaproszeń",
      "Własny branding",
      "Integracja z kalendarzem",
      "Zaawansowana analityka",
      "Priorytetowe wsparcie",
      "Eksport danych CSV/PDF"
    ],
    limitations: []
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Rozwiązanie dla dużych organizacji",
    price: 499,
    period: "/miesiąc",
    icon: Building2,
    popular: false,
    features: [
      "Nielimitowani goście",
      "Nielimitowane wydarzenia",
      "Wszystkie funkcje Professional",
      "API dostęp",
      "Dedykowany opiekun klienta",
      "SLA 99.9%",
      "SSO (Single Sign-On)",
      "Własna domena",
      "Zaawansowane role i uprawnienia"
    ],
    limitations: []
  },
  {
    id: "vip",
    name: "VIP",
    description: "Ekskluzywne rozwiązanie premium",
    price: 999,
    period: "/miesiąc",
    icon: Crown,
    popular: false,
    features: [
      "Wszystkie funkcje Enterprise",
      "Dedykowany serwer",
      "Wsparcie 24/7",
      "Niestandardowe integracje",
      "Szkolenia dla zespołu",
      "Konsultacje strategiczne",
      "Wczesny dostęp do nowych funkcji"
    ],
    limitations: []
  }
];

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do strony głównej
          </Button>
        </div>
      </header>

      <main className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Wybierz plan dla siebie</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dopasuj pakiet do swoich potrzeb. Wszystkie plany zawierają 14-dniowy okres próbny.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => {
            const IconComponent = product.icon;
            return (
              <Card 
                key={product.id}
                className={`relative flex flex-col ${
                  product.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {product.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Najpopularniejszy
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${
                      product.popular ? "bg-primary/10 text-primary" : "bg-muted"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle>{product.name}</CardTitle>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {product.price === 0 ? "Darmowy" : `${product.price} zł`}
                    </span>
                    {product.price > 0 && (
                      <span className="text-muted-foreground">{product.period}</span>
                    )}
                  </div>
                  
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {product.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-4 w-4 mt-0.5 shrink-0 text-center">-</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={product.popular ? "default" : "outline"}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.price === 0 ? "Zacznij za darmo" : "Wybierz plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Często zadawane pytania</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Czy mogę zmienić plan w dowolnym momencie?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tak, możesz zmienić plan w dowolnym momencie. Przy upgrade różnica zostanie naliczona proporcjonalnie. Przy downgrade zmiana zostanie aktywowana od następnego okresu rozliczeniowego.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Czy jest okres próbny?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tak, wszystkie płatne plany mają 14-dniowy bezpłatny okres próbny. Nie wymagamy karty kredytowej do rozpoczęcia.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jakie metody płatności akceptujecie?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Akceptujemy karty kredytowe (Visa, Mastercard, American Express), przelewy bankowe oraz płatności przez PayPal i Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
