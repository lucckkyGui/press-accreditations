
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanEntry } from "@/types/scanner";
import { toast } from "sonner";

type StatsCardsProps = {
  total: number;
  successful: number;
  failed: number;
  onExportData?: (format: "csv" | "pdf") => void;
  scanHistory?: ScanEntry[];
};

const StatsCards: React.FC<StatsCardsProps> = ({ 
  total, 
  successful, 
  failed,
  onExportData,
  scanHistory
}) => {
  const exportToCSV = () => {
    if (!scanHistory || scanHistory.length === 0) {
      toast.error("Brak danych do eksportu");
      return;
    }

    try {
      // Nagłówki CSV
      const headers = [
        "ID", 
        "Gość", 
        "Email", 
        "Firma", 
        "Strefa", 
        "Status", 
        "Data skanowania", 
        "Wynik"
      ].join(",");
      
      // Dane skanowań
      const csvData = scanHistory.map(scan => {
        return [
          scan.id,
          `${scan.guest.firstName} ${scan.guest.lastName}`,
          scan.guest.email,
          scan.guest.company || "",
          scan.guest.zone,
          scan.guest.status,
          scan.timestamp.toLocaleString(),
          scan.successful ? "Zatwierdzony" : "Odrzucony"
        ].join(",");
      }).join("\n");
      
      // Pełny plik CSV
      const csv = `${headers}\n${csvData}`;
      
      // Tworzenie Blob i link do pobrania
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `historia_skanowania_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleExportFormat = (format: "csv" | "pdf") => {
    if (onExportData) {
      onExportData(format);
    } else if (format === "csv") {
      exportToCSV();
    } else {
      toast.info("Eksport do PDF będzie dostępny wkrótce");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Karta sumy skanowań */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-muted-foreground text-sm">Łącznie skanowań</div>
        </CardContent>
      </Card>
      
      {/* Karta udanych skanowań */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
          <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/20">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{successful}</div>
          <div className="text-muted-foreground text-sm">Zatwierdzonych</div>
        </CardContent>
      </Card>
      
      {/* Karta odrzuconych skanowań */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
          <div className="bg-red-100 p-3 rounded-full dark:bg-red-900/20">
            <UserX className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{failed}</div>
          <div className="text-muted-foreground text-sm">Odrzuconych</div>
        </CardContent>
      </Card>
      
      {/* Karta eksportu danych */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
          <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900/20">
            <Download className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="text-sm font-medium">Eksport danych</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportFormat("csv")}
              className="text-xs"
            >
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportFormat("pdf")}
              className="text-xs"
            >
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
