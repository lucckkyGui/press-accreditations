import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  HardDrive,
  Plus,
  QrCode,
  TrendingUp,
  UserPlus,
  Users,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import DatabaseSchema from "@/components/database/DatabaseSchema";
import CheckInActivityChart from "@/components/dashboard/CheckInActivityChart";
import ResourceMonitor from "@/components/dashboard/ResourceMonitor";
import { SyncStatus } from "@/components/offline/SyncStatus";
import RecentScansWidget from "@/components/dashboard/RecentScansWidget";
import UsageTracker from "@/components/dashboard/UsageTracker";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import PendingAccreditationsCard from "@/components/dashboard/PendingAccreditationsCard";
import TicketTypeStatsCard from "@/components/dashboard/TicketTypeStatsCard";
import EventsTabContent from "@/components/dashboard/EventsTabContent";
import { useQuery } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useCheckout } from "@/hooks/useCheckout";

type DashboardTone = "success" | "warning" | "info" | "muted";

const toneStyles: Record<DashboardTone, { badge: string; icon: string; panel: string }> = {
  success: {
    badge: "border-success/20 bg-success/10 text-success",
    icon: "bg-success/10 text-success",
    panel: "border-success/20 bg-success/5",
  },
  warning: {
    badge: "border-warning/20 bg-warning/10 text-warning",
    icon: "bg-warning/10 text-warning",
    panel: "border-warning/20 bg-warning/5",
  },
  info: {
    badge: "border-info/20 bg-info/10 text-info",
    icon: "bg-info/10 text-info",
    panel: "border-info/20 bg-info/5",
  },
  muted: {
    badge: "border-border bg-muted text-muted-foreground",
    icon: "bg-muted text-muted-foreground",
    panel: "border-border bg-muted/40",
  },
};

interface EventData {
  id: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string;
  is_published: boolean | null;
}

interface DashboardSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

interface OperationalItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: DashboardTone;
}

interface NextStep {
  title: string;
  description: string;
  actionLabel: string;
  path: string;
  icon: React.ElementType;
  tone: DashboardTone;
}

const formatEventDate = (date?: string | null) => {
  if (!date) return "Brak daty";
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DashboardSectionHeader = ({ eyebrow, title, description, action }: DashboardSectionHeaderProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{eyebrow}</p>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
    {action}
  </div>
);

const OperationalItem = ({ icon: Icon, label, value, helper, tone }: OperationalItemProps) => {
  const styles = toneStyles[tone];

  return (
    <div className={`rounded-lg border p-4 ${styles.panel}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold text-foreground">{value}</p>
          <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  );
};

const NextStepButton = ({ step }: { step: NextStep }) => {
  const navigate = useNavigate();
  const Icon = step.icon;
  const styles = toneStyles[step.tone];

  return (
    <button
      type="button"
      onClick={() => navigate(step.path)}
      className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{step.title}</p>
          <Badge variant="outline" className={`shrink-0 rounded-md ${styles.badge}`}>
            {step.actionLabel}
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
      </div>
    </button>
  );
};

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "resources" | "schema">("overview");
  const [statsEventFilter, setStatsEventFilter] = useState<string>("all");
  const { isOnline, wasOffline } = useOnlineStatus();
  const { subscribed, tier, subscriptionEnd, isLoading: subLoading } = useSubscription();
  const { openCustomerPortal, isLoading: portalLoading } = useCheckout();

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["organizerEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("events").select("*")
        .eq("organizer_id", user.id).order("start_date", { ascending: true }).limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: guestsData } = useQuery({
    queryKey: ["organizerGuestsData", user?.id, statsEventFilter],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const eventIds = statsEventFilter === "all" ? eventsData.map(e => e.id) : [statsEventFilter];
      const { data, error } = await supabase.from("guests")
        .select("id, status, checked_in_at, ticket_type, created_at").in("event_id", eventIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  const guestsStats = useMemo(() => {
    if (!guestsData?.length) return { total: 0, checkedIn: 0, byTicketType: {} as Record<string, number> };
    const total = guestsData.length;
    const checkedIn = guestsData.filter(g => g.checked_in_at).length;
    const byTicketType: Record<string, number> = {};
    guestsData.forEach(g => {
      const ticketType = g.ticket_type || "uczestnik";
      byTicketType[ticketType] = (byTicketType[ticketType] || 0) + 1;
    });
    return { total, checkedIn, byTicketType };
  }, [guestsData]);

  const { data: accreditationRequests } = useQuery({
    queryKey: ["pendingAccreditations", user?.id],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const { data, error } = await supabase.from("accreditation_requests").select("*")
        .in("event_id", eventsData.map(e => e.id)).eq("status", "pending").limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({
        title: "Połączenie przywrócone",
        description: "Jesteś teraz online. Dane zostaną zsynchronizowane automatycznie.",
      });
    }
  }, [isOnline, wasOffline]);

  const now = useMemo(() => new Date(), []);
  const events = useMemo(() => (eventsData || []) as EventData[], [eventsData]);
  const pendingCount = accreditationRequests?.length || 0;
  const checkInRate = guestsStats.total ? Math.round((guestsStats.checkedIn / guestsStats.total) * 100) : 0;
  const activeEvents = useMemo(
    () => events.filter(e => new Date(e.start_date) <= now && new Date(e.end_date) >= now),
    [events, now]
  );
  const upcomingEvents = useMemo(
    () => events.filter(e => new Date(e.start_date) > now),
    [events, now]
  );
  const nextEvent = activeEvents[0] || upcomingEvents[0];
  const selectedEventLabel = statsEventFilter === "all"
    ? "Wszystkie wydarzenia"
    : events.find(event => event.id === statsEventFilter)?.title || "Wybrane wydarzenie";

  const operationalItems = useMemo<OperationalItemProps[]>(() => [
    {
      icon: activeEvents.length ? CheckCircle2 : Calendar,
      label: activeEvents.length ? "Wydarzenie na żywo" : "Najbliższy event",
      value: eventsLoading ? "Ładowanie danych" : nextEvent?.title || "Brak wydarzeń",
      helper: nextEvent ? formatEventDate(nextEvent.start_date) : "Utwórz event, aby rozpocząć konfigurację.",
      tone: activeEvents.length ? "success" : nextEvent ? "info" : "warning",
    },
    {
      icon: Users,
      label: "Baza gości",
      value: `${guestsStats.total} rekordów`,
      helper: guestsStats.total ? `${guestsStats.checkedIn} osób po check-inie` : "Dodaj lub zaimportuj listę gości.",
      tone: guestsStats.total ? "success" : "warning",
    },
    {
      icon: ClipboardCheck,
      label: "Akredytacje",
      value: pendingCount ? `${pendingCount} do decyzji` : "Brak oczekujących",
      helper: pendingCount ? "Wymagają sprawdzenia przez organizatora." : "Kolejka akredytacji jest czysta.",
      tone: pendingCount ? "warning" : "success",
    },
    {
      icon: isOnline ? CheckCircle2 : WifiOff,
      label: "Łączność",
      value: isOnline ? "Online" : "Offline",
      helper: isOnline ? "Dane mogą synchronizować się na bieżąco." : "Pracujesz w trybie ograniczonym.",
      tone: isOnline ? "success" : "warning",
    },
  ], [activeEvents.length, eventsLoading, guestsStats.checkedIn, guestsStats.total, isOnline, nextEvent, pendingCount]);

  const nextSteps = useMemo<NextStep[]>(() => {
    if (!events.length) {
      return [
        {
          title: "Utwórz pierwsze wydarzenie",
          description: "Dodaj nazwę, daty i lokalizację, aby odblokować listę gości, zaproszenia i check-in.",
          actionLabel: "Start",
          path: "/events",
          icon: Plus,
          tone: "warning",
        },
      ];
    }

    const steps: NextStep[] = [];
    if (!guestsStats.total) {
      steps.push({
        title: "Dodaj listę gości",
        description: "Przygotuj bazę uczestników przed wysyłką zaproszeń i testem skanera.",
        actionLabel: "Goście",
        path: "/guests",
        icon: UserPlus,
        tone: "warning",
      });
    }
    if (pendingCount) {
      steps.push({
        title: "Obsłuż oczekujące akredytacje",
        description: "Sprawdź wnioski mediów, zanim przejdziesz do finalnej listy wejść.",
        actionLabel: "Decyzje",
        path: "/guests",
        icon: FileText,
        tone: "warning",
      });
    }
    if (guestsStats.total && checkInRate === 0) {
      steps.push({
        title: "Przetestuj skaner QR",
        description: "Wykonaj skan testowy przed eventem i sprawdź komunikaty operatora.",
        actionLabel: "Skaner",
        path: "/scanner",
        icon: QrCode,
        tone: "info",
      });
    }
    if (!steps.length) {
      steps.push({
        title: "Monitoruj przebieg wydarzenia",
        description: "Przejdź do widoku skanera albo dashboardu live podczas pracy na wejściu.",
        actionLabel: "Na żywo",
        path: "/scanner",
        icon: BarChart3,
        tone: "success",
      });
    }
    return steps.slice(0, 3);
  }, [checkInRate, events.length, guestsStats.total, pendingCount]);

  return (
    <div className="space-y-6">
      {!isOnline && (
        <Alert variant="destructive" className="rounded-lg border-warning/30 bg-warning/10 text-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Tryb offline</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Pracujesz w trybie offline. Część danych może zostać zsynchronizowana dopiero po odzyskaniu połączenia.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="gap-2 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Status operacyjny</p>
                <CardTitle className="mt-1 text-xl">Gotowość wydarzeń i check-inu</CardTitle>
              </div>
              <SyncStatus />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operationalItems.map((item) => (
              <OperationalItem key={item.label} {...item} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Co dalej</p>
            <CardTitle className="text-xl">Najbliższe akcje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((step) => (
              <NextStepButton key={step.title} step={step} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SubscriptionCard
          subscribed={subscribed}
          tier={tier}
          subscriptionEnd={subscriptionEnd}
          subLoading={subLoading}
          portalLoading={portalLoading}
          openCustomerPortal={openCustomerPortal}
        />
        <UsageTracker guestCount={guestsStats.total} eventCount={events.length} />
      </div>

      <DashboardSectionHeader
        eyebrow="Statystyki"
        title="Najważniejsze metryki"
        description={`Zakres danych: ${selectedEventLabel}. Metryki pokazują stan eventów, gości, akredytacji i check-inu bez zmiany sposobu liczenia danych.`}
        action={(
          <Select value={statsEventFilter} onValueChange={setStatsEventFilter} disabled={!events.length}>
            <SelectTrigger className="h-10 w-full rounded-lg border-border/60 bg-card sm:w-72">
              <SelectValue placeholder="Wszystkie wydarzenia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Wydarzenia"
          value={events.length}
          icon={<Calendar className="h-5 w-5" />}
          description={`${activeEvents.length} aktywnych teraz`}
          tone={activeEvents.length ? "success" : "info"}
        />
        <StatCard
          title="Goście"
          value={guestsStats.total}
          icon={<Users className="h-5 w-5" />}
          description={`${guestsStats.checkedIn} po check-inie`}
          tone={guestsStats.total ? "success" : "warning"}
        />
        <StatCard
          title="Akredytacje"
          value={pendingCount}
          icon={<FileText className="h-5 w-5" />}
          description={pendingCount ? "wymaga decyzji" : "brak oczekujących"}
          tone={pendingCount ? "warning" : "success"}
        />
        <StatCard
          title="Check-in"
          value={`${checkInRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="wskaźnik obecności"
          tone={checkInRate > 0 ? "success" : "muted"}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "overview" | "events" | "resources" | "schema")}
        className="w-full"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DashboardSectionHeader
            eyebrow="Obszary pracy"
            title="Przegląd operacyjny"
            description="Przełączaj się między dashboardem, listą wydarzeń, schematem bazy i zasobami bez utraty kontekstu."
          />
          <TabsList className="grid w-full grid-cols-2 rounded-lg border border-border bg-muted/50 p-1 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="overview" className="gap-1.5 rounded-md text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="truncate">Przegląd</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 rounded-md text-xs sm:text-sm">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">Wydarzenia</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-1.5 rounded-md text-xs sm:text-sm">
              <Database className="h-4 w-4 shrink-0" />
              <span className="truncate">Baza</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 rounded-md text-xs sm:text-sm">
              <HardDrive className="h-4 w-4 shrink-0" />
              <span className="truncate">Zasoby</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <PendingAccreditationsCard requests={accreditationRequests || []} />
            <QuickActionsCard />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RecentScansWidget />
            <CheckInActivityChart guests={guestsData || []} />
          </div>
          <TicketTypeStatsCard byTicketType={guestsStats.byTicketType} total={guestsStats.total} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventsTabContent eventsData={events} eventsLoading={eventsLoading} />
        </TabsContent>

        <TabsContent value="schema" className="mt-4"><DatabaseSchema /></TabsContent>
        <TabsContent value="resources" className="mt-4"><ResourceMonitor /></TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizerDashboard;
