
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the plan that fits your event size. All plans include full access to invitation templates and QR check-in.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
        <PricingCard
          title="Starter"
          price="$29"
          period="/ month"
          description="Perfect for small events"
          features={[
            "Up to 100 guests per event",
            "Professional email templates",
            "QR code check-in",
            "Real-time analytics",
            "CSV import/export",
            "Email support",
          ]}
          buttonText="Start Free Trial"
          onSelect={() => handleSelectPackage("basic")}
        />
        <PricingCard
          title="Professional"
          price="$79"
          period="/ month"
          description="For growing organizations"
          features={[
            "Up to 500 guests per event",
            "Custom branded templates",
            "Bulk email sending",
            "Team access (3 users)",
            "Priority support",
            "Advanced reporting",
            "Offline scanner mode",
          ]}
          buttonText="Start Free Trial"
          isPrimary={true}
          badge="Most Popular"
          onSelect={() => handleSelectPackage("standard")}
        />
        <PricingCard
          title="Enterprise"
          price="$199"
          period="/ month"
          description="For large-scale events"
          features={[
            "Unlimited guests",
            "White-label solution",
            "API access",
            "Unlimited team members",
            "Dedicated account manager",
            "Custom integrations",
            "SLA guarantee",
            "On-site training",
          ]}
          buttonText="Contact Sales"
          onSelect={() => handleSelectPackage("premium")}
        />
      </div>
      
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
