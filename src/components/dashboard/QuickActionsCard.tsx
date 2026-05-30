import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, QrCode, Settings, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const quickActions = [
  {
    icon: Plus,
    label: "Dodaj wydarzenie",
    description: "Utwórz event i przygotuj jego podstawową konfigurację.",
    path: "/events",
  },
  {
    icon: UserPlus,
    label: "Dodaj gości",
    description: "Przejdź do listy gości, importu i akcji masowych.",
    path: "/guests",
  },
  {
    icon: QrCode,
    label: "Uruchom skaner",
    description: "Otwórz ekran operatora check-inu i testów QR.",
    path: "/scanner",
  },
  {
    icon: Settings,
    label: "Ustawienia",
    description: "Sprawdź konto, integracje i konfigurację workspace.",
    path: "/settings",
  },
];

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Szybkie akcje</CardTitle>
        <CardDescription className="mt-1">Najczęściej używane przepływy w pracy organizatora</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map(({ icon: Icon, label, description, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex min-h-[116px] items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
