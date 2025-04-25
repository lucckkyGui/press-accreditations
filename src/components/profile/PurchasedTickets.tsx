
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTickets, Ticket as TicketType } from "@/hooks/useTickets";
import TicketStatistics from "./TicketStatistics";
import TicketCard from "./TicketCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, QrCode, Share, Download, Printer, Mail } from "lucide-react";

interface PurchasedTicketsProps {
  tickets?: TicketType[];
}

const PurchasedTickets: React.FC<PurchasedTicketsProps> = ({ tickets: propTickets }) => {
  const { tickets: hookTickets, loading, stats } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const tickets = propTickets || hookTickets;

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

  const handleShareTicket = (ticket: TicketType) => {
    if (navigator.share) {
      navigator.share({
        title: `Bilet na ${ticket.eventName}`,
        text: `Sprawdź mój bilet na ${ticket.eventName} w dniu ${formatDate(ticket.eventDate)}!`,
        url: window.location.href,
      }).catch(err => {
        console.error('Wystąpił błąd podczas udostępniania:', err);
        toast.error("Nie udało się udostępnić biletu");
      });
    } else {
      navigator.clipboard.writeText(`Bilet na ${ticket.eventName} w dniu ${formatDate(ticket.eventDate)}`);
      toast.success('Link do biletu skopiowany do schowka!');
    }
  };

  const handleDownloadTicket = (ticket: TicketType) => {
    toast.success(`Pobieranie biletu na ${ticket.eventName}...`);
  };

  const handlePrintTicket = (ticket: TicketType) => {
    toast.success(`Przygotowanie do druku biletu na ${ticket.eventName}...`);
  };

  const handleEmailTicket = (ticket: TicketType) => {
    toast.success(`Wysyłanie biletu na ${ticket.eventName} na email...`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie biletów...</p>
        </CardContent>
      </Card>
    );
  }

  if (!tickets?.length) {
    return (
      <Card className="bg-gradient-to-br from-muted/50 to-background border">
        <CardContent className="pt-6 text-center">
          <img
            src="https://images.unsplash.com/photo-1500673922987-e212871fec22"
            alt="Brak biletów"
            className="w-48 h-48 mx-auto rounded-full object-cover opacity-50"
          />
          <p className="text-muted-foreground mt-4">Nie masz jeszcze zakupionych biletów</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/ticketing"}>
            Przejdź do zakupu biletów
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TicketStatistics {...stats} />

      {tickets?.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onShowQr={() => {
            setSelectedTicket(ticket);
            setQrDialogOpen(true);
          }}
          onShare={() => handleShareTicket(ticket)}
          onDownload={() => handleDownloadTicket(ticket)}
          onPrint={() => handlePrintTicket(ticket)}
          onEmail={() => handleEmailTicket(ticket)}
        />
      ))}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.eventName}</DialogTitle>
            <DialogDescription>{selectedTicket?.ticketType}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(selectedTicket?.qrCode || "")}&size=200x200`} 
                alt="Kod QR biletu" 
                className="max-w-full max-h-full"
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Pokaż ten kod QR podczas wejścia na wydarzenie
            </p>
            <p className="text-xs text-center mt-2 font-mono">{selectedTicket?.qrCode}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchasedTickets;
