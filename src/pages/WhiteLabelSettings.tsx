import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Paintbrush, Globe, Image, Type, Palette, Eye, Save } from "lucide-react";
import { toast } from "sonner";

const WhiteLabelSettings = () => {
  usePageTitle("White-Label");
  const [config, setConfig] = useState({
    brandName: "Moja Platforma",
    tagline: "System akredytacji prasowej",
    primaryColor: "#7c3aed",
    secondaryColor: "#a78bfa",
    logoUrl: "",
    faviconUrl: "",
    customDomain: "",
    hideFooterBranding: false,
    customCss: "",
    emailFromName: "Moja Platforma",
    emailFromDomain: "",
  });

  const handleSave = () => toast.success("Ustawienia white-label zapisane");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White-Label</h1>
          <p className="text-muted-foreground">Dostosuj wygląd platformy pod Twoją markę</p>
        </div>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Zapisz</Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Kolory</TabsTrigger>
          <TabsTrigger value="domain">Domena</TabsTrigger>
          <TabsTrigger value="emails">E-maile</TabsTrigger>
          <TabsTrigger value="preview">Podgląd</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Type className="h-4 w-4" /> Nazwa i opis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nazwa marki</Label>
                  <Input value={config.brandName} onChange={e => setConfig(p => ({ ...p, brandName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={config.tagline} onChange={e => setConfig(p => ({ ...p, tagline: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Image className="h-4 w-4" /> Logo i Favicon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo (URL)</Label>
                  <Input placeholder="https://example.com/logo.png" value={config.logoUrl} onChange={e => setConfig(p => ({ ...p, logoUrl: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Favicon (URL)</Label>
                  <Input placeholder="https://example.com/favicon.ico" value={config.faviconUrl} onChange={e => setConfig(p => ({ ...p, faviconUrl: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" /> Paleta kolorów</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kolor główny</Label>
                  <div className="flex gap-2">
                    <input type="color" value={config.primaryColor} onChange={e => setConfig(p => ({ ...p, primaryColor: e.target.value }))} className="h-10 w-16 rounded cursor-pointer" />
                    <Input value={config.primaryColor} onChange={e => setConfig(p => ({ ...p, primaryColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kolor drugorzędny</Label>
                  <div className="flex gap-2">
                    <input type="color" value={config.secondaryColor} onChange={e => setConfig(p => ({ ...p, secondaryColor: e.target.value }))} className="h-10 w-16 rounded cursor-pointer" />
                    <Input value={config.secondaryColor} onChange={e => setConfig(p => ({ ...p, secondaryColor: e.target.value }))} className="font-mono" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Ukryj branding "Press Accreditations"</p>
                  <p className="text-sm text-muted-foreground">Usuń logo i linki do Press Accreditations z footera</p>
                </div>
                <Switch checked={config.hideFooterBranding} onCheckedChange={v => setConfig(p => ({ ...p, hideFooterBranding: v }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> Własna domena</CardTitle>
              <CardDescription>Podłącz własną domenę aby platforma działała pod Twoim adresem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Domena</Label>
                <Input placeholder="accreditations.mojastrona.pl" value={config.customDomain} onChange={e => setConfig(p => ({ ...p, customDomain: e.target.value }))} />
              </div>
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <p className="font-medium">Konfiguracja DNS:</p>
                <p>Dodaj rekord CNAME wskazujący na <code className="bg-background px-1 rounded">press-accreditations.lovable.app</code></p>
                <p className="text-muted-foreground">Certyfikat SSL zostanie wygenerowany automatycznie.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Konfiguracja e-maili</CardTitle>
              <CardDescription>Spersonalizuj e-maile wysyłane do gości</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nazwa nadawcy</Label>
                  <Input value={config.emailFromName} onChange={e => setConfig(p => ({ ...p, emailFromName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Domena nadawcy</Label>
                  <Input placeholder="mail.mojastrona.pl" value={config.emailFromDomain} onChange={e => setConfig(p => ({ ...p, emailFromDomain: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" /> Podgląd</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 flex items-center gap-3" style={{ backgroundColor: config.primaryColor }}>
                  {config.logoUrl ? <img src={config.logoUrl} alt="" className="h-8" /> : <div className="h-8 w-8 rounded bg-white/20" />}
                  <span className="text-white font-bold">{config.brandName}</span>
                </div>
                <div className="p-8 text-center bg-background">
                  <h2 className="text-2xl font-bold">{config.brandName}</h2>
                  <p className="text-muted-foreground">{config.tagline}</p>
                  <Button className="mt-4" style={{ backgroundColor: config.primaryColor }}>Rozpocznij</Button>
                </div>
                {!config.hideFooterBranding && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t">
                    Powered by Press Accreditations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhiteLabelSettings;
