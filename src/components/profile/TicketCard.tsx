
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, QrCode, Share, Download, Printer, Mail } from "lucide-react";
import { Ticket as TicketType } from "@/hooks/useTickets";

interface TicketCardProps {
  ticket: TicketType;
  onShowQr: () => void;
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onShowQr,
  onShare,
  onDownload,
  onPrint,
  onEmail,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktywny</Badge>;
      case "used":
        return <Badge variant="secondary">Wykorzystany</Badge>;
      case "expired":
        return <Badge variant="destructive">Wygasły</Badge>;
      default:
        return <Badge>Nieznany</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-br from-card to-muted/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{ticket.eventName}</h3>
            <p className="text-muted-foreground">{ticket.ticketType}</p>
          </div>
          {getStatusBadge(ticket.status)}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(ticket.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ticket className="h-4 w-4 text-primary" />
            <span>Zakupiono: {formatDate(ticket.purchaseDate)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2" 
            onClick={onShowQr}
          >
            <QrCode className="h-4 w-4" />
            Pokaż QR
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onShare}
          >
            <Share className="h-4 w-4" />
            Udostępnij
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Pobierz PDF
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Drukuj
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onEmail}
          >
            <Mail className="h-4 w-4" />
            Wyślij na email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
