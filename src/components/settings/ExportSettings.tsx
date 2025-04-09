
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, FileJson, FileCsv, FileArchive, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ExportSettings = () => {
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [exportInProgress, setExportInProgress] = useState(false);
  const [selectedData, setSelectedData] = useState({
    events: true,
    guests: true,
    statistics: true,
    invitations: true,
  });

  const handleExport = () => {
    const selectedItems = Object.entries(selectedData)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);

    if (selectedItems.length === 0) {
      toast.error("Wybierz co najmniej jeden typ danych do eksportu");
      return;
    }

    setExportInProgress(true);
    
    // Symulacja eksportu
    setTimeout(() => {
      setExportInProgress(false);
      toast.success(`Eksport danych zakończony. Format: ${exportFormat.toUpperCase()}`);
      
      // W rzeczywistej aplikacji tutaj byłoby pobieranie pliku
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eksport danych</CardTitle>
        <CardDescription>
          Eksportuj dane z systemu do wybranego formatu pliku.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Format eksportu</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center">
                  <FileCsv className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center">
                  <FileJson className="mr-2 h-4 w-4" />
                  <span>JSON</span>
                </div>
              </SelectItem>
              <SelectItem value="xlsx">
                <div className="flex items-center">
                  <FileArchive className="mr-2 h-4 w-4" />
                  <span>Excel (XLSX)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Dane do eksportu</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="events" 
              checked={selectedData.events}
              onCheckedChange={(checked) => 
                setSelectedData({...selectedData, events: !!checked})
              }
            />
            <Label htmlFor="events" className="flex-1 cursor-pointer">
              Wydarzenia
              <p className="text-xs text-muted-foreground">
                Informacje o wszystkich wydarzeniach, włącznie z ustawieniami i statystykami
              </p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="guests" 
              checked={selectedData.guests}
              onCheckedChange={(checked) => 
                setSelectedData({...selectedData, guests: !!checked})
              }
            />
            <Label htmlFor="guests" className="flex-1 cursor-pointer">
              Goście
              <p className="text-xs text-muted-foreground">
                Lista gości, dane kontaktowe, statusy zaproszeń i obecności
              </p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="statistics" 
              checked={selectedData.statistics}
              onCheckedChange={(checked) => 
                setSelectedData({...selectedData, statistics: !!checked})
              }
            />
            <Label htmlFor="statistics" className="flex-1 cursor-pointer">
              Statystyki
              <p className="text-xs text-muted-foreground">
                Szczegółowe statystyki wydarzeń, frekwencji i zaangażowania
              </p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="invitations" 
              checked={selectedData.invitations}
              onCheckedChange={(checked) => 
                setSelectedData({...selectedData, invitations: !!checked})
              }
            />
            <Label htmlFor="invitations" className="flex-1 cursor-pointer">
              Szablony zaproszeń
              <p className="text-xs text-muted-foreground">
                Wszystkie utworzone szablony zaproszeń i powiadomień
              </p>
            </Label>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleExport} 
            disabled={exportInProgress}
            className="w-full sm:w-auto"
          >
            {exportInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eksportowanie...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Eksportuj dane
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSettings;
