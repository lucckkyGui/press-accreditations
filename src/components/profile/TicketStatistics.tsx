
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Calendar, Check, X } from "lucide-react";

interface TicketStatisticsProps {
  totalTickets: number;
  activeTickets: number;
  usedTickets: number;
  upcomingEvents: number;
}

const TicketStatistics: React.FC<TicketStatisticsProps> = ({
  totalTickets,
  activeTickets,
  usedTickets,
  upcomingEvents,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Statystyki biletów
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold">{totalTickets}</div>
            <div className="text-sm text-muted-foreground">Wszystkie bilety</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold text-green-600">{activeTickets}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Check className="h-3 w-3" /> Aktywne bilety
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold text-amber-600">{usedTickets}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <X className="h-3 w-3" /> Wykorzystane bilety
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{upcomingEvents}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" /> Nadchodzące wydarzenia
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketStatistics;
