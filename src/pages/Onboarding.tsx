
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, UserCheck, Calendar, Users, QrCode,
  ArrowRight, Sparkles, ChevronRight, ExternalLink
} from "lucide-react";

interface ChecklistStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  checkFn: () => Promise<boolean>;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stepStatus, setStepStatus] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(true);

  const steps: ChecklistStep[] = [
    {
      id: "account",
      icon: <UserCheck className="h-5 w-5" />,
      title: "Utwórz konto organizatora",
      description: "Zarejestruj się i zaloguj do panelu. To Twój punkt startowy.",
      route: "/auth/register",
      checkFn: async () => !!isAuthenticated,
    },
    {
      id: "event",
      icon: <Calendar className="h-5 w-5" />,
      title: "Stwórz pierwsze wydarzenie",
      description: "Dodaj nazwę, datę i lokalizację. Wydarzenie to podstawa całego systemu.",
      route: "/events",
      checkFn: async () => {
        if (!user) return false;
        const { count } = await supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("organizer_id", user.id);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "guests",
      icon: <Users className="h-5 w-5" />,
      title: "Dodaj gości",
      description: "Zaimportuj listę z CSV lub dodaj ręcznie. Każdy gość dostanie unikalny kod QR.",
      route: "/guests",
      checkFn: async () => {
        if (!user) return false;
        const { data: events } = await supabase
          .from("events")
          .select("id")
          .eq("organizer_id", user.id)
          .limit(1);
        if (!events?.length) return false;
        const { count } = await supabase
          .from("guests")
          .select("id", { count: "exact", head: true })
          .eq("event_id", events[0].id);
        return (count ?? 0) > 0;
      },
    },
    {
      id: "scanner",
      icon: <QrCode className="h-5 w-5" />,
      title: "Przetestuj skaner QR",
      description: "Otwórz skaner i zeskanuj kod gościa. Działa też offline jako PWA!",
      route: "/scanner",
      checkFn: async () => false, // manual step
    },
  ];

  useEffect(() => {
    const checkAll = async () => {
      setChecking(true);
      const results: Record<string, boolean> = {};
      for (const step of steps) {
        try {
          results[step.id] = await step.checkFn();
        } catch {
          results[step.id] = false;
        }
      }
      setStepStatus(results);
      setChecking(false);
    };
    if (!isLoading) checkAll();
  }, [isLoading, isAuthenticated, user]);

  const completedCount = Object.values(stepStatus).filter(Boolean).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <Badge variant="secondary" className="text-xs font-bold tracking-wider">
              ONBOARDING
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Szybki start
          </h1>
          <p className="text-muted-foreground text-lg">
            Wykonaj te 4 kroki, aby w pełni uruchomić system akredytacji.
          </p>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-4">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
              {completedCount}/{steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {steps.map((step, i) => {
          const done = stepStatus[step.id];
          const isNext = !done && Object.values(stepStatus).filter(Boolean).length === i;

          return (
            <Card
              key={step.id}
              className={`transition-all duration-200 ${
                done
                  ? "border-primary/20 bg-primary/[0.03]"
                  : isNext
                  ? "border-primary/40 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                {/* Status icon */}
                <div className={`mt-0.5 shrink-0 ${done ? "text-primary" : "text-muted-foreground/40"}`}>
                  {done ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground/50">
                      KROK {i + 1}
                    </span>
                    {done && (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0">
                        GOTOWE
                      </Badge>
                    )}
                  </div>
                  <h3 className={`font-bold text-base mb-1 ${done ? "line-through text-muted-foreground" : ""}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant={isNext ? "default" : "ghost"}
                  className="shrink-0 gap-1.5 mt-1"
                  onClick={() => navigate(step.route)}
                  disabled={checking}
                >
                  {done ? (
                    <>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Otwórz
                    </>
                  ) : (
                    <>
                      Rozpocznij
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* All done */}
        {completedCount >= 3 && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 mt-8">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Prawie gotowe!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Twój system akredytacji jest skonfigurowany. Przejdź do dashboardu.
              </p>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                Otwórz Dashboard
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
