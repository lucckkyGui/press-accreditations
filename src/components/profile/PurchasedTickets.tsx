
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, QrCode, Share } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PurchasedTicket {
  id: string;
  eventName: string;
  ticketType: string;
  purchaseDate: Date;
  eventDate: Date;
  price: number;
  status: "active" | "used" | "expired";
  qrCode: string;
}

interface PurchasedTicketsProps {
  tickets: PurchasedTicket[];
}

const PurchasedTickets: React.FC<PurchasedTicketsProps> = ({ tickets }) => {
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);

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
  const handleShareTicket = (ticket: PurchasedTicket) => {
    if (navigator.share) {
      navigator.share({
        title: `Bilet na ${ticket.eventName}`,
        text: `Sprawdź mój bilet na ${ticket.eventName} w dniu ${formatDate(ticket.eventDate)}!`,
        url: window.location.href,
      }).catch(err => {
        console.error('Wystąpił błąd podczas udostępniania:', err);
      });
    } else {
      console.log('Web Share API is not supported in your browser');
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Bilet na ${ticket.eventName} w dniu ${formatDate(ticket.eventDate)}`);
      alert('Link do biletu skopiowany do schowka!');
    }
  };

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
    <div className="space-y-4">
      {tickets.map(ticket => (
        <Card key={ticket.id} className="overflow-hidden">
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
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(ticket.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span>Zakupiono: {formatDate(ticket.purchaseDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedTicket(ticket)}>
                      <QrCode className="h-4 w-4" />
                      Pokaż QR
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedTicket?.eventName}</DialogTitle>
                      <DialogDescription>{selectedTicket?.ticketType}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(selectedTicket?.qrCode || "")}&size=200x200`} 
                          alt="Kod QR biletu" 
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Pokaż ten kod QR podczas wejścia na wydarzenie
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleShareTicket(ticket)}
                >
                  <Share className="h-4 w-4" />
                  Udostępnij
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PurchasedTickets;
