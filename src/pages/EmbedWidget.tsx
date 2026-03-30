import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Copy, Code, Eye, Palette, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

const TICKET_TYPE_OPTIONS = [
  { value: "general", label: "Wstęp ogólny" },
  { value: "vip", label: "VIP" },
  { value: "press", label: "Prasa / Media" },
  { value: "speaker", label: "Prelegent" },
  { value: "exhibitor", label: "Wystawca" },
];

const PreviewForm = ({
  primaryColor,
  borderRadius,
  selectedEvent,
  showCompany,
  showPhone,
  showTicketType,
  className = "",
  compact = false,
}: {
  primaryColor: string;
  borderRadius: string;
  selectedEvent: string;
  showCompany: boolean;
  showPhone: boolean;
  showTicketType: boolean;
  className?: string;
  compact?: boolean;
}) => {
  const fieldRadius = `${Math.min(parseInt(borderRadius), 8)}px`;
  const fieldHeight = compact ? "h-7" : "h-9";
  const textSize = compact ? "text-[10px]" : "text-xs";

  return (
    <div
      className={`bg-background rounded-lg shadow-lg ${compact ? "p-3 space-y-2" : "p-6 space-y-4"} ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div className="text-center space-y-1">
        <div
          className={`${compact ? "h-1.5 w-16 mb-2" : "h-2 w-24 mb-4"} rounded-full mx-auto`}
          style={{ backgroundColor: primaryColor }}
        />
        <h3 className={`font-bold text-foreground ${compact ? "text-sm" : ""}`}>Rejestracja</h3>
        <p className={`${textSize} text-muted-foreground`}>
          {selectedEvent ? "Wypełnij formularz" : "Wybierz wydarzenie..."}
        </p>
      </div>
      <div className={compact ? "space-y-1.5" : "space-y-3"}>
        {[
          { label: "Imię *", show: true },
          { label: "Nazwisko *", show: true },
          { label: "Email *", show: true },
          { label: "Firma", show: showCompany },
          { label: "Telefon", show: showPhone },
        ]
          .filter((f) => f.show)
          .map((f) => (
            <div key={f.label} className="space-y-0.5">
              <div className={`${textSize} text-muted-foreground`}>{f.label}</div>
              <div className={`${fieldHeight} bg-muted rounded-md`} style={{ borderRadius: fieldRadius }} />
            </div>
          ))}
        {showTicketType && (
          <div className="space-y-0.5">
            <div className={`${textSize} text-muted-foreground`}>Typ biletu *</div>
            <div className={`${fieldHeight} bg-muted rounded-md`} style={{ borderRadius: fieldRadius }} />
          </div>
        )}
      </div>
      <div
        className={`${compact ? "h-8 text-xs" : "h-10 text-sm"} rounded-md flex items-center justify-center font-medium text-white`}
        style={{ backgroundColor: primaryColor, borderRadius: fieldRadius }}
      >
        Zarejestruj się
      </div>
    </div>
  );
};

const EmbedWidget = () => {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [borderRadius, setBorderRadius] = useState("12");
  const [showCompany, setShowCompany] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showTicketType, setShowTicketType] = useState(true);
  const [language, setLanguage] = useState("pl");

  const embedUrl = `${window.location.origin}/embed/register/${selectedEvent}`;

  const iframeCode = `<iframe
  src="${embedUrl}?color=${encodeURIComponent(primaryColor)}&radius=${borderRadius}&lang=${language}&company=${showCompany}&phone=${showPhone}&ticket=${showTicketType}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: ${borderRadius}px; max-width: 480px;"
  title="Rejestracja na wydarzenie"
></iframe>`;

  const scriptCode = `<div id="event-register-widget"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}?color=${encodeURIComponent(primaryColor)}&radius=${borderRadius}&lang=${language}&company=${showCompany}&phone=${showPhone}';
  iframe.style.cssText = 'width:100%;height:600px;border:none;border-radius:${borderRadius}px;max-width:480px;';
  iframe.title = 'Rejestracja na wydarzenie';
  document.getElementById('event-register-widget').appendChild(iframe);
})();
</script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano do schowka!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Widget rejestracji</h1>
        <p className="text-muted-foreground mt-1">
          Wygeneruj embeddable widget i osadź formularz rejestracji na swojej stronie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Konfiguracja widgetu
              </CardTitle>
              <CardDescription>Dostosuj wygląd i zachowanie formularza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wydarzenie</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz wydarzenie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(events || []).map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.title || e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kolor główny</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 rounded-lg border cursor-pointer"
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zaokrąglenie (px)</Label>
                  <Input
                    type="number"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    min="0"
                    max="24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Język</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pl">Polski</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Pole "Firma"</Label>
                  <Switch checked={showCompany} onCheckedChange={setShowCompany} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Pole "Telefon"</Label>
                  <Switch checked={showPhone} onCheckedChange={setShowPhone} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code snippets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5 text-primary" />
                Kod do osadzenia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="iframe">
                <TabsList className="w-full">
                  <TabsTrigger value="iframe" className="flex-1">iFrame</TabsTrigger>
                  <TabsTrigger value="script" className="flex-1">Script</TabsTrigger>
                </TabsList>
                <TabsContent value="iframe" className="mt-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                      <code>{iframeCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(iframeCode)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Kopiuj
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="script" className="mt-3">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                      <code>{scriptCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(scriptCode)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Kopiuj
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-primary" />
              Podgląd
            </CardTitle>
            <CardDescription>Tak będzie wyglądał formularz na Twojej stronie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Desktop + Mobile previews */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Desktop preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </div>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30"
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  <PreviewForm
                    primaryColor={primaryColor}
                    borderRadius={borderRadius}
                    selectedEvent={selectedEvent}
                    showCompany={showCompany}
                    showPhone={showPhone}
                    className="max-w-sm mx-auto"
                  />
                </div>
              </div>

              {/* Mobile preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </div>
                <div className="flex justify-center">
                  <div
                    className="relative border-[3px] border-foreground/20 rounded-[2rem] p-2 bg-muted/30"
                    style={{ width: 260 }}
                  >
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground/20 rounded-b-xl" />
                    <div
                      className="bg-background rounded-[1.5rem] pt-6 pb-4 px-3 overflow-hidden"
                    >
                      <PreviewForm
                        primaryColor={primaryColor}
                        borderRadius={borderRadius}
                        selectedEvent={selectedEvent}
                        showCompany={showCompany}
                        showPhone={showPhone}
                        className="w-full"
                        compact
                      />
                    </div>
                    {/* Home indicator */}
                    <div className="mt-2 mx-auto w-24 h-1 bg-foreground/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {selectedEvent && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Otwórz w nowym oknie
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmbedWidget;
