import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Wallet, QrCode, Download, CheckCircle2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PassData {
  guestName: string;
  eventName: string;
  ticketType: string;
  date: string;
}

const DigitalPassGenerator = () => {
  const [passData, setPassData] = useState<PassData>({
    guestName: "",
    eventName: "",
    ticketType: "standard",
    date: "",
  });
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (!passData.guestName || !passData.eventName || !passData.date) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    setGenerated(true);
    toast.success("Pass wygenerowany! (podgląd)");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Generator Digital Pass
            </CardTitle>
            <CardDescription>
              Wygeneruj cyfrowy pass do Apple Wallet lub Google Wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Imię i nazwisko gościa *</Label>
              <Input
                id="guest-name"
                placeholder="Jan Kowalski"
                value={passData.guestName}
                onChange={e => setPassData(p => ({ ...p, guestName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-name">Nazwa wydarzenia *</Label>
              <Input
                id="event-name"
                placeholder="Tech Conference 2026"
                value={passData.eventName}
                onChange={e => setPassData(p => ({ ...p, eventName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-type">Typ biletu</Label>
              <Select value={passData.ticketType} onValueChange={v => setPassData(p => ({ ...p, ticketType: v }))}>
                <SelectTrigger id="ticket-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="press">Prasa</SelectItem>
                  <SelectItem value="speaker">Prelegent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Data wydarzenia *</Label>
              <Input
                id="event-date"
                type="date"
                value={passData.date}
                onChange={e => setPassData(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full gradient-primary text-primary-foreground">
              <CreditCard className="h-4 w-4 mr-2" />
              Generuj pass
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Podgląd passy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto w-[280px]">
              {/* Phone frame */}
              <div className="bg-gradient-to-b from-muted to-muted/50 rounded-[2rem] p-3 shadow-xl">
                <div className="bg-card rounded-[1.5rem] overflow-hidden">
                  {/* Pass header */}
                  <div className="gradient-primary p-5 text-primary-foreground">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs opacity-80">WYDARZENIE</p>
                        <p className="font-bold text-sm truncate max-w-[160px]">
                          {passData.eventName || "Nazwa wydarzenia"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {passData.ticketType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">GOŚĆ</p>
                      <p className="font-semibold text-sm">
                        {passData.guestName || "Imię Nazwisko"}
                      </p>
                    </div>
                  </div>

                  {/* Pass body */}
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="text-muted-foreground">DATA</p>
                        <p className="font-medium text-foreground">{passData.date || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">STATUS</p>
                        <p className="font-medium text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ważny
                        </p>
                      </div>
                    </div>

                    {/* QR placeholder */}
                    <div className="flex justify-center">
                      <div className="w-28 h-28 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                        <QrCode className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground">
                      Pokaż ten kod QR przy wejściu
                    </p>
                  </div>
                </div>
              </div>

              {/* Status overlay */}
              {generated && (
                <div className="absolute inset-0 bg-success/10 rounded-[2rem] flex items-center justify-center backdrop-blur-[1px]">
                  <Badge className="bg-success text-success-foreground text-sm px-4 py-2 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Wygenerowano!
                  </Badge>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {generated && (
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => toast.info("Apple Wallet — dostępne wkrótce")}>
                  <Smartphone className="h-4 w-4 mr-1" />
                  Apple Wallet
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info("Google Wallet — dostępne wkrótce")}>
                  <Download className="h-4 w-4 mr-1" />
                  Google Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitalPassGenerator;