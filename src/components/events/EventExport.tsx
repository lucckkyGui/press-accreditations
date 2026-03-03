
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { Guest } from "@/types";
import { toast } from "sonner";

interface EventExportProps {
  guests: Guest[];
  eventName: string;
}

const EventExport = ({ guests, eventName }: EventExportProps) => {
  const handleExportCSV = () => {
    try {
      // Nagłówki CSV
      const headers = [
        "Imię", 
        "Nazwisko", 
        "Email", 
        "Firma", 
        "Strefa", 
        "Status", 
        "Status e-mail",
        "Data wysłania zaproszenia", 
        "Data otwarcia zaproszenia", 
        "Data wejścia"
      ].join(",");
      
      // Dane gości
      const csvData = guests.map(guest => {
        return [
          guest.firstName,
          guest.lastName,
          guest.email,
          guest.company || "",
          guest.ticketType,
          guest.status,
          guest.emailStatus || "unknown",
          guest.invitationSentAt ? new Date(guest.invitationSentAt).toLocaleString() : "",
          guest.invitationOpenedAt ? new Date(guest.invitationOpenedAt).toLocaleString() : "",
          guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleString() : ""
        ].join(",");
      }).join("\n");
      
      // Pełny plik CSV
      const csv = `${headers}\n${csvData}`;
      
      // Tworzenie Blob i link do pobrania
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${eventName.replace(/\s+/g, '_')}_goście.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Plik CSV został wygenerowany");
    } catch (error) {
      console.error("Błąd podczas eksportu do CSV:", error);
      toast.error("Nie udało się wygenerować pliku CSV");
    }
  };

  const handleExportPDF = () => {
    // W rzeczywistej aplikacji tutaj byłaby logika generowania PDF
    toast.info("Eksport do PDF będzie dostępny w pełnej wersji");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Eksportuj
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          Eksportuj do CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          Eksportuj do PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventExport;
