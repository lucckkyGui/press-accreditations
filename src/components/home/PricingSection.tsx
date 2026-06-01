import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

/**
 * PressOps pricing — niszowy cennik media operations (NIE generic guest/event).
 * Plany: Press Starter, Press Pro, EventOps Pilot, White-label Agency.
 * Pilot i White-label to kontakt sprzedażowy (book pilot / request demo).
 */

interface PressPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaAction: "register" | "contact";
  isPrimary?: boolean;
  badge?: string;
}

const PLANS: PressPlan[] = [
  {
    id: "press-starter",
    title: "Press Starter",
    price: "490 zł",
    period: "/ event",
    description: "Pojedyncze wydarzenie, biuro prasowe",
    features: [
      "1 wydarzenie",
      "Publiczny landing akredytacyjny",
      "Do 150 zgłoszeń mediów",
      "Media verification scoring",
      "QR pass + check-in (offline-ready)",
      "Podstawowy coverage board",
      "E-mail powiadomienia o decyzji",
    ],
    cta: "Zacznij",
    ctaAction: "register",
  },
  {
    id: "press-pro",
    title: "Press Pro",
    price: "1 490 zł",
    period: "/ miesiąc",
    description: "Organizatorzy z serią wydarzeń",
    features: [
      "Nielimitowane wydarzenia",
      "Pełen Media CRM (kontakty + outlets)",
      "Coverage collection + reminders",
      "Media Coverage Report (PDF/CSV)",
      "Quality rating, tagi, historia mediów",
      "Audit trail + role-based access",
      "Priorytetowe wsparcie",
    ],
    cta: "Request demo",
    ctaAction: "contact",
    isPrimary: true,
    badge: "Najpopularniejszy",
  },
  {
    id: "eventops-pilot",
    title: "EventOps Pilot",
    price: "od 3 900 zł",
    period: "/ pilotaż",
    description: "Wdrożenie na 1 realnym evencie",
    features: [
      "Wszystko z Press Pro",
      "Onboarding i konfiguracja eventu",
      "Wsparcie on-site / zdalne podczas eventu",
      "Raport wartości medialnej dla sponsora",
      "Case study po wydarzeniu",
      "8-tygodniowy program pilotażowy",
    ],
    cta: "Book pilot",
    ctaAction: "contact",
  },
  {
    id: "whitelabel-agency",
    title: "White-label Agency",
    price: "Wycena",
    period: "indywidualna",
    description: "Agencje i biura prasowe pod własną marką",
    features: [
      "Wszystko z Press Pro",
      "White-label (własna marka i domena)",
      "Wiele zespołów / klientów",
      "Dostęp API i webhooki",
      "Dedykowany opiekun",
      "Umowa powierzenia (DPA)",
    ],
    cta: "Skontaktuj się",
    ctaAction: "contact",
  },
];

const PricingCard = ({ plan, onSelect }: { plan: PressPlan; onSelect: () => void }) => (
  <Card className={`flex flex-col relative rounded-lg transition-all duration-300 hover:-translate-y-0.5 ${plan.isPrimary ? "border-2 border-primary shadow-glow-soft bg-card" : "border bg-card shadow-card hover:shadow-card-hover"}`}>
    {plan.badge && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground border-0 px-4 py-1">
        <Sparkles className="h-3 w-3 mr-1" />
        {plan.badge}
      </Badge>
    )}
    <CardHeader className="text-center pb-4">
      <CardTitle className="text-xl">{plan.title}</CardTitle>
      <CardDescription>{plan.description}</CardDescription>
      <div className="mt-4">
        <span className={`text-3xl font-extrabold ${plan.isPrimary ? "gradient-text" : ""}`}>{plan.price}</span>
        {plan.period && <span className="text-muted-foreground text-sm"> {plan.period}</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2.5">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className={`rounded-full p-0.5 ${plan.isPrimary ? "bg-primary/10" : "bg-secondary/10"}`}>
              <Check className={`h-4 w-4 ${plan.isPrimary ? "text-primary" : "text-secondary"} shrink-0`} />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button
        className={`w-full ${plan.isPrimary ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" : ""}`}
        variant={plan.isPrimary ? "default" : "outline"}
        size="lg"
        onClick={onSelect}
      >
        {plan.cta}
      </Button>
    </CardFooter>
  </Card>
);

const PricingSection = () => {
  const navigate = useNavigate();

  const handleSelect = (plan: PressPlan) => {
    navigate(plan.ctaAction === "register" ? "/auth/register" : "/contact");
  };

  return (
    <section id="pricing" className="py-20 container" aria-labelledby="pricing-heading">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold text-accent">Cennik PressOps</span>
        </div>
        <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">Cennik dopasowany do media operations</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Od pojedynczego wydarzenia po agencję pod własną marką. Pilotaż na realnym
          evencie z raportem wartości medialnej dla sponsora.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto items-start px-4 md:px-0">
        {PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={() => handleSelect(plan)} />
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Pilotaż i White-label wyceniamy indywidualnie — umów demo, pokażemy pełny workflow w 12 minut.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
