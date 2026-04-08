import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserPlus, QrCode, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const quickActions = [
  { icon: Plus, label: "Dodaj wydarzenie", path: "/events" },
  { icon: UserPlus, label: "Dodaj gości", path: "/guests" },
  { icon: QrCode, label: "Skaner QR", path: "/scanner" },
  { icon: Settings, label: "Ustawienia", path: "/settings" },
];

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Szybkie akcje</CardTitle>
        <CardDescription className="mt-1">Najczęściej używane funkcje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
