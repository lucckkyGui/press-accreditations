import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, Users, Mail, QrCode, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X
} from "lucide-react";

const ONBOARDING_KEY = "press-accreditations-onboarding-complete";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
  action: string;
  route: string;
}

const steps: Step[] = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Witaj w Press Accreditations!",
    description: "Twoje nowe narzędzie do zarządzania gośćmi i akredytacjami na wydarzeniach. Pokażemy Ci jak zacząć w 4 prostych krokach.",
    tip: "Cały proces zajmie Ci mniej niż 5 minut.",
    action: "Zaczynamy →",
    route: "",
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Krok 1: Stwórz wydarzenie",
    description: "Rozpocznij od dodania swojego pierwszego wydarzenia. Podaj nazwę, datę, lokalizację i opis — resztę zrobimy za Ciebie.",
    tip: "Możesz później edytować każdy szczegół z poziomu dashboardu.",
    action: "Przejdź do Wydarzeń",
    route: "/events",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Krok 2: Dodaj gości",
    description: "Zaimportuj listę gości z pliku CSV lub dodaj ich ręcznie. System automatycznie wykryje duplikaty i przypisze kody QR.",
    tip: "Obsługujemy pliki CSV, Excel i ręczne dodawanie gości.",
    action: "Przejdź do Gości",
    route: "/guests",
  },
  {
    icon: <Mail className="h-8 w-8" />,
    title: "Krok 3: Wyślij zaproszenia",
    description: "Wybierz profesjonalny szablon e-mail, spersonalizuj treść i wyślij zaproszenia z kodami QR do wszystkich gości jednym kliknięciem.",
    tip: "Każdy gość otrzyma unikalny kod QR w zaproszeniu.",
    action: "Otwórz edytor zaproszeń",
    route: "/invitation-editor",
  },
  {
    icon: <QrCode className="h-8 w-8" />,
    title: "Krok 4: Skanuj na evencie",
    description: "W dniu wydarzenia otwórz skaner QR na telefonie lub tablecie. Skanuj kody gości — check-in trwa 2 sekundy. Działa nawet bez internetu!",
    tip: "Dodaj aplikację do ekranu głównego, żeby korzystać offline.",
    action: "Otwórz skaner",
    route: "/scanner",
  },
];

const OnboardingWizard = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.route) {
      handleClose();
      navigate(step.route);
    } else {
      handleNext();
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />

        <div className="p-8">
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-8 bg-primary' : i < currentStep ? 'w-2 bg-primary/40' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-6">
            {step.icon}
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>
          
          {/* Tip */}
          <Card className="bg-muted/50 border-0 mb-8">
            <CardContent className="p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{step.tip}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Wstecz
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
                Pomiń
              </Button>
            )}

            <div className="flex gap-3">
              {!isFirst && !isLast && (
                <Button variant="outline" onClick={handleNext}>
                  Dalej
                </Button>
              )}
              <Button onClick={handleAction} className="gap-2">
                {step.action}
                {!isLast && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
