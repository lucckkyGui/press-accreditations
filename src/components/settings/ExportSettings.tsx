
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, FileJson, Files, FileArchive, Loader2 } from "lucide-react";
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
    <div className="grid md:grid-cols-2 gap-6">
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
                    <Files className="mr-2 h-4 w-4" />
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

      <EmailIntegrationSettings />
    </div>
  );
};

interface EmailProvider {
  id: string;
  name: string;
  logo: string;
}

const EmailIntegrationSettings = () => {
  const [connected, setConnected] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  const emailProviders: EmailProvider[] = [
    { id: "mailchimp", name: "Mailchimp", logo: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg" },
    { id: "sendgrid", name: "SendGrid", logo: "https://cdn.worldvectorlogo.com/logos/sendgrid-1.svg" },
    { id: "mailerlite", name: "MailerLite", logo: "https://cdn.worldvectorlogo.com/logos/mailerlite.svg" }
  ];

  const handleConnect = (providerId: string) => {
    if (apiKey.trim() === "") {
      toast.error("Wprowadź klucz API");
      return;
    }

    setConnecting(true);
    
    // Symulacja łączenia z API
    setTimeout(() => {
      setConnected(providerId);
      setConnecting(false);
      toast.success(`Połączono z ${emailProviders.find(p => p.id === providerId)?.name}`);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(null);
    setApiKey("");
    toast.success("Rozłączono z serwisem mailingowym");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integracja z systemami mailingowymi</CardTitle>
        <CardDescription>
          Połącz swoje konto z systemami do wysyłki wiadomości e-mail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {emailProviders.map(provider => (
            <div 
              key={provider.id} 
              className={`p-4 border rounded-lg flex items-center justify-between ${connected === provider.id ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white rounded p-1 flex items-center justify-center">
                  <img src={provider.logo} alt={provider.name} className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {connected === provider.id 
                      ? "Połączono" 
                      : "Zintegruj z systemem powiadomień"}
                  </p>
                </div>
              </div>

              {connected === provider.id ? (
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Rozłącz
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={connecting || (connected !== null && connected !== provider.id)}
                  onClick={() => handleConnect(provider.id)}
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Połącz
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="api-key">Klucz API</Label>
          <div className="flex space-x-2">
            <input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Wprowadź klucz API..."
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
              disabled={connected !== null}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Klucz API jest przechowywany bezpiecznie i nie jest nigdy udostępniany.
            <a href="#" className="text-primary ml-1">Dowiedz się więcej o integracjach</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSettings;
