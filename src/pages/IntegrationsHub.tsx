import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, Calendar, Share2, Video, CreditCard, Database, ExternalLink, Check, X, Settings, Zap } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  connected: boolean;
  status: "active" | "inactive" | "error";
  features: string[];
}

const IntegrationsHub = () => {
  usePageTitle("Integracje");
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "salesforce", name: "Salesforce", description: "Synchronizuj kontakty i leady z CRM", icon: Database, category: "crm", connected: false, status: "inactive", features: ["Auto-sync kontaktów", "Lead scoring", "Pipeline tracking"] },
    { id: "hubspot", name: "HubSpot", description: "Marketing automation i CRM", icon: Database, category: "crm", connected: true, status: "active", features: ["Kontakty", "Kampanie email", "Raporty"] },
    { id: "pipedrive", name: "Pipedrive", description: "CRM sprzedażowy", icon: Database, category: "crm", connected: false, status: "inactive", features: ["Deal tracking", "Kontakty", "Automatyzacje"] },
    { id: "google-calendar", name: "Google Calendar", description: "Dwukierunkowa synchronizacja kalendarza", icon: Calendar, category: "calendar", connected: true, status: "active", features: ["Sync wydarzeń", "Przypomnienia", "Dwukierunkowy sync"] },
    { id: "outlook", name: "Microsoft Outlook", description: "Kalendarz i kontakty Outlook", icon: Calendar, category: "calendar", connected: false, status: "inactive", features: ["Kalendarz", "Kontakty", "Teams integration"] },
    { id: "facebook", name: "Facebook / Meta", description: "Auto-publikacja wydarzeń", icon: Share2, category: "social", connected: false, status: "inactive", features: ["Auto-post", "Event promotion", "Audience insights"] },
    { id: "linkedin", name: "LinkedIn", description: "Publikuj wydarzenia na LinkedIn", icon: Share2, category: "social", connected: true, status: "active", features: ["Post events", "Company page", "Analytics"] },
    { id: "x-twitter", name: "X (Twitter)", description: "Automatyczne tweety o wydarzeniach", icon: Share2, category: "social", connected: false, status: "inactive", features: ["Auto-tweet", "Thread creator", "Engagement"] },
    { id: "zoom", name: "Zoom", description: "Wideokonferencje dla eventów hybrydowych", icon: Video, category: "video", connected: false, status: "inactive", features: ["Webinaria", "Meetings", "Nagrywanie"] },
    { id: "google-meet", name: "Google Meet", description: "Spotkania wideo od Google", icon: Video, category: "video", connected: false, status: "inactive", features: ["Video calls", "Screen sharing", "Nagrywanie"] },
    { id: "p24", name: "Przelewy24", description: "Polskie płatności online", icon: CreditCard, category: "payments", connected: false, status: "inactive", features: ["BLIK", "Przelewy bankowe", "Karty"] },
    { id: "klarna", name: "Klarna", description: "Płatności ratalne i odroczone", icon: CreditCard, category: "payments", connected: false, status: "inactive", features: ["Pay later", "Slice it", "Smooth checkout"] },
    { id: "ideal", name: "iDEAL", description: "Holenderski system płatności", icon: CreditCard, category: "payments", connected: false, status: "inactive", features: ["Płatności bankowe", "NL rynek", "Instant"] },
  ]);

  const categories = [
    { id: "all", label: "Wszystkie" },
    { id: "crm", label: "CRM" },
    { id: "calendar", label: "Kalendarze" },
    { id: "social", label: "Social Media" },
    { id: "video", label: "Video" },
    { id: "payments", label: "Płatności" },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? integrations : integrations.filter(i => i.category === activeCategory);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected, status: i.connected ? "inactive" as const : "active" as const } : i));
    const int = integrations.find(i => i.id === id);
    toast.success(int?.connected ? `${int.name} odłączony` : `${int?.name} połączony`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Plug className="h-8 w-8 text-primary" /> Centrum Integracji
        </h1>
        <p className="text-muted-foreground">Połącz zewnętrzne usługi z Twoją platformą</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.filter(i => i.connected).length}</p>
              <p className="text-sm text-muted-foreground">Aktywne integracje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plug className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-sm text-muted-foreground">Dostępne integracje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">∞</p>
              <p className="text-sm text-muted-foreground">Sync możliwości</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <Button key={c.id} variant={activeCategory === c.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(c.id)}>
            {c.label}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(int => (
          <Card key={int.id} className={int.connected ? "border-primary/30" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${int.connected ? "bg-primary/10" : "bg-muted"}`}>
                    <int.icon className={`h-5 w-5 ${int.connected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{int.name}</CardTitle>
                    <Badge variant={int.connected ? "default" : "outline"} className="text-xs">
                      {int.connected ? "Połączony" : "Niedostępny"}
                    </Badge>
                  </div>
                </div>
                <Switch checked={int.connected} onCheckedChange={() => toggleConnection(int.id)} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{int.description}</p>
              <div className="flex flex-wrap gap-1">
                {int.features.map(f => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsHub;
