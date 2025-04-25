
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, QrCode, Share, Download, Printer, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTickets, Ticket as TicketType } from "@/hooks/useTickets";
import TicketStatistics from "./TicketStatistics";

const PurchasedTickets: React.FC = () => {
  const { tickets, loading, stats } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  // Get status badge color based on ticket status
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

  // Share ticket functionality
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
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Bilet na ${ticket.eventName} w dniu ${formatDate(ticket.eventDate)}`);
      toast.success('Link do biletu skopiowany do schowka!');
    }
  };

  // Download ticket as PDF (mock)
  const handleDownloadTicket = (ticket: TicketType) => {
    // In a real app, this would generate and download a PDF
    toast.success(`Pobieranie biletu na ${ticket.eventName}...`);
  };

  // Print ticket
  const handlePrintTicket = (ticket: TicketType) => {
    // In a real app, this would open a print dialog with formatted ticket
    toast.success(`Przygotowanie do druku biletu na ${ticket.eventName}...`);
  };

  // Send ticket to email
  const handleEmailTicket = (ticket: TicketType) => {
    // In a real app, this would send an email with the ticket
    toast.success(`Wysyłanie biletu na ${ticket.eventName} na email...`);
  };

  // Show QR code dialog
  const showQrCode = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
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

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Nie masz jeszcze zakupionych biletów</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/ticketing"}>
            Przejdź do zakupu biletów
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TicketStatistics 
        totalTickets={stats.totalTickets}
        activeTickets={stats.activeTickets}
        usedTickets={stats.usedTickets}
        upcomingEvents={stats.upcomingEvents}
      />

      {tickets.map(ticket => (
        <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{ticket.eventName}</h3>
                  <p className="text-muted-foreground">{ticket.ticketType}</p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(ticket.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>Zakupiono: {formatDate(ticket.purchaseDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => showQrCode(ticket)}
                >
                  <QrCode className="h-4 w-4" />
                  Pokaż QR
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleShareTicket(ticket)}
                >
                  <Share className="h-4 w-4" />
                  Udostępnij
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleDownloadTicket(ticket)}
                >
                  <Download className="h-4 w-4" />
                  Pobierz PDF
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handlePrintTicket(ticket)}
                >
                  <Printer className="h-4 w-4" />
                  Drukuj
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleEmailTicket(ticket)}
                >
                  <Mail className="h-4 w-4" />
                  Wyślij na email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
