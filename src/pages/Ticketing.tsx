
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import TicketingSystem from "@/components/ticketing/TicketingSystem";
import { toast } from "sonner";

const Ticketing = () => {
  const navigate = useNavigate();

  const handleTicketCheckout = () => {
    toast.success("Bilety zostały zarezerwowane pomyślnie!");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Nagłówek */}
      <header className="border-b bg-background p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Press Acreditations</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do strony głównej
          </Button>
        </div>
      </header>

      {/* Główna treść */}
      <main className="flex-1 container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">System Biletowy</h1>
        <p className="mb-8 text-muted-foreground">
          Zarezerwuj bilety na wybrane wydarzenia i zarządzaj swoimi akredytacjami.
        </p>
        
        <TicketingSystem standalone={true} onCheckout={handleTicketCheckout} />
      </main>

      {/* Stopka */}
      <footer className="bg-muted py-6 border-t">
        <div className="container text-center">
          <p className="text-muted-foreground">© 2025 Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Ticketing;
