import React from "react";
import { Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TICKET_TYPE_LABELS, GuestTicketType } from "@/types";

interface TicketTypeStatsCardProps {
  byTicketType: Record<string, number>;
  total: number;
}

const colors = [
  'bg-primary', 'bg-info', 'bg-success', 'bg-warning',
  'bg-destructive', 'bg-accent', 'bg-secondary', 'bg-muted-foreground', 'bg-primary/60'
];

const TicketTypeStatsCard: React.FC<TicketTypeStatsCardProps> = ({ byTicketType, total }) => {
  const entries = Object.entries(byTicketType).sort((a, b) => b[1] - a[1]);

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Rejestracje wg typu biletu
        </CardTitle>
        <CardDescription>Rozkład gości według kategorii akredytacji</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Ticket className="h-10 w-10 mb-3 text-primary/30" />
            <span className="font-medium text-foreground/60">Brak danych</span>
            <span className="text-xs mt-1">Dodaj gości, aby zobaczyć statystyki</span>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(([type, count], i) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const label = TICKET_TYPE_LABELS[type as GuestTicketType] || type;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-muted-foreground tabular-nums">{count} <span className="text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Łącznie</span>
              <span className="font-semibold text-foreground tabular-nums">{total}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketTypeStatsCard;
