
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Star, Zap, Building2, Crown, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const productsData: Record<string, {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  period: string;
  icon: React.ElementType;
  popular: boolean;
  features: string[];
  detailedFeatures: {
    category: string;
    items: string[];
  }[];
}> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Idealny na początek dla małych wydarzeń",
    fullDescription: "Plan Starter jest idealnym rozwiązaniem dla osób zaczynających przygodę z organizacją wydarzeń. Oferuje wszystkie podstawowe funkcje potrzebne do zarządzania małymi eventami.",
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
    detailedFeatures: [
      {
        category: "Zarządzanie gośćmi",
        items: ["Do 100 gości na wydarzenie", "Import CSV", "Podstawowe filtry"]
      },
      {
        category: "Komunikacja",
        items: ["Podstawowe szablony email", "Wysyłka zaproszeń", "Powiadomienia email"]
      },
      {
        category: "Analityka",
        items: ["Podstawowe statystyki", "Historia check-in"]
      }
    ]
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Dla profesjonalnych organizatorów wydarzeń",
    fullDescription: "Plan Professional to kompleksowe rozwiązanie dla profesjonalnych organizatorów wydarzeń. Oferuje zaawansowane funkcje brandingu, integracje i szczegółową analitykę.",
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
    detailedFeatures: [
      {
        category: "Zarządzanie gośćmi",
        items: ["Do 1000 gości na wydarzenie", "5 aktywnych wydarzeń", "Zaawansowane filtry i segmentacja", "Bulk import/export"]
      },
      {
        category: "Branding",
        items: ["Własne logo", "Kolorystyka marki", "Niestandardowe szablony email"]
      },
      {
        category: "Integracje",
        items: ["Google Calendar", "Outlook", "Webhooks"]
      },
      {
        category: "Analityka",
        items: ["Zaawansowane raporty", "Eksport PDF/CSV", "Śledzenie otwarć emaili"]
      }
    ]
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Rozwiązanie dla dużych organizacji",
    fullDescription: "Plan Enterprise to rozwiązanie klasy enterprise dla dużych organizacji. Oferuje pełną skalowalność, zaawansowane bezpieczeństwo i dedykowane wsparcie.",
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
    detailedFeatures: [
      {
        category: "Skalowalność",
        items: ["Nielimitowani goście", "Nielimitowane wydarzenia", "Nieograniczony storage"]
      },
      {
        category: "Bezpieczeństwo",
        items: ["SSO (SAML 2.0, OIDC)", "Audit log", "Zaawansowane uprawnienia", "IP whitelisting"]
      },
      {
        category: "Integracje",
        items: ["REST API", "Webhooks", "Zapier", "Custom integrations"]
      },
      {
        category: "Wsparcie",
        items: ["Dedykowany opiekun", "SLA 99.9%", "Priorytetowa kolejka"]
      }
    ]
  },
  vip: {
    id: "vip",
    name: "VIP",
    description: "Ekskluzywne rozwiązanie premium",
    fullDescription: "Plan VIP to najwyższy poziom usług dla najbardziej wymagających klientów. Oferuje dedykowaną infrastrukturę, wsparcie 24/7 i pełną personalizację.",
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
    detailedFeatures: [
      {
        category: "Infrastruktura",
        items: ["Dedykowany serwer", "Własna domena", "CDN premium", "Backup co godzinę"]
      },
      {
        category: "Wsparcie",
        items: ["Wsparcie 24/7", "Dedykowany zespół", "Video onboarding", "Szkolenia na miejscu"]
      },
      {
        category: "Rozwój",
        items: ["Early access", "Beta features", "Roadmap input", "Custom development"]
      },
      {
        category: "Konsultacje",
        items: ["Strategia eventowa", "Best practices", "Audyt procesów"]
      }
    ]
  }
};

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const product = productId ? productsData[productId] : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nie znaleziony</h1>
          <Button onClick={() => navigate("/products")}>
            Wróć do listy produktów
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = product.icon;

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (product.price === 0) {
        toast.success("Rozpoczęto darmowy plan!");
        navigate("/auth/register");
      } else {
        toast.success("Przekierowuję do płatności...");
        // TODO: Integrate with payment provider
      }
    } catch (error) {
      toast.error("Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do wszystkich planów
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main content */}
          <div className="space-y-8">
            {/* Product header */}
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl ${
                product.popular ? "bg-primary/10 text-primary" : "bg-muted"
              }`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {product.popular && (
                    <Badge className="bg-primary">Najpopularniejszy</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{product.description}</p>
              </div>
            </div>

            <p className="text-muted-foreground">{product.fullDescription}</p>

            {/* Detailed features */}
            <Tabs defaultValue="features" className="w-full">
              <TabsList>
                <TabsTrigger value="features">Funkcje</TabsTrigger>
                <TabsTrigger value="details">Szczegóły</TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="mt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-background">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  {product.detailedFeatures.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Purchase card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Podsumowanie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <span className="text-4xl font-bold">
                    {product.price === 0 ? "Darmowy" : `${product.price} zł`}
                  </span>
                  {product.price > 0 && (
                    <span className="text-muted-foreground">{product.period}</span>
                  )}
                </div>
                
                <Separator />
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    14-dniowy okres próbny
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Bez karty kredytowej
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Anuluj w dowolnym momencie
                  </li>
                </ul>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                  disabled={isLoading}
                >
                  {isLoading ? "Przetwarzanie..." : (
                    product.price === 0 ? "Zacznij za darmo" : "Wybierz ten plan"
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Bezpieczna płatność
                </div>
              </CardContent>
            </Card>
            
            {/* Contact card */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Masz pytania? Skontaktuj się z nami
                </p>
                <Button variant="outline" className="w-full">
                  Porozmawiaj z ekspertem
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8 mt-12">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;
