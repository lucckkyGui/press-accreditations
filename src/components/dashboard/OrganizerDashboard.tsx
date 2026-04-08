import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, FileText, TrendingUp, Plus, AlertTriangle, BarChart3, Database, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "resources" | "schema">("overview");
  const [statsEventFilter, setStatsEventFilter] = useState<string>("all");
  const { isOnline, wasOffline } = useOnlineStatus();
  const { subscribed, tier, subscriptionEnd, isLoading: subLoading } = useSubscription();
  const { openCustomerPortal, isLoading: portalLoading } = useCheckout();

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['organizerEvents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('events').select('*')
        .eq('organizer_id', user.id).order('start_date', { ascending: true }).limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: guestsData } = useQuery({
    queryKey: ['organizerGuestsData', user?.id, statsEventFilter],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const eventIds = statsEventFilter === 'all' ? eventsData.map(e => e.id) : [statsEventFilter];
      const { data, error } = await supabase.from('guests')
        .select('id, status, checked_in_at, ticket_type, created_at').in('event_id', eventIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  const guestsStats = useMemo(() => {
    if (!guestsData?.length) return { total: 0, checkedIn: 0, byTicketType: {} as Record<string, number> };
    const total = guestsData.length;
    const checkedIn = guestsData.filter(g => g.checked_in_at)?.length || 0;
    const byTicketType: Record<string, number> = {};
    guestsData.forEach(g => { const tt = g.ticket_type || 'uczestnik'; byTicketType[tt] = (byTicketType[tt] || 0) + 1; });
    return { total, checkedIn, byTicketType };
  }, [guestsData]);

  const { data: accreditationRequests } = useQuery({
    queryKey: ['pendingAccreditations', user?.id],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const { data, error } = await supabase.from('accreditation_requests').select('*')
        .in('event_id', eventsData.map(e => e.id)).eq('status', 'pending').limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({ title: "Połączenie przywrócone", description: "Jesteś teraz online. Dane zostaną zsynchronizowane automatycznie." });
    }
  }, [isOnline, wasOffline]);

  const activeEvents = eventsData?.filter(e => { const now = new Date(); return new Date(e.start_date) <= now && new Date(e.end_date) >= now; }) || [];
  const handleSync = async () => new Promise<void>((resolve) => setTimeout(resolve, 1500));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Witaj, {profile?.firstName || 'Organizatorze'}! 👋
          </h1>
          <p className="text-muted-foreground text-base">Panel zarządzania wydarzeniami i akredytacjami</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus onSyncClick={handleSync} />
          <Button onClick={() => navigate('/events')} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4" /> Nowe wydarzenie
          </Button>
        </div>
      </div>

      {!isOnline && (
        <Alert variant="destructive" className="bg-warning/10 border-warning/30 text-foreground rounded-xl">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Tryb offline</AlertTitle>
          <AlertDescription className="text-muted-foreground">Pracujesz w trybie offline.</AlertDescription>
        </Alert>
      )}

      <SubscriptionCard subscribed={subscribed} tier={tier} subscriptionEnd={subscriptionEnd}
        subLoading={subLoading} portalLoading={portalLoading} openCustomerPortal={openCustomerPortal} />

      <UsageTracker guestCount={guestsStats.total} eventCount={eventsData?.length || 0} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Statystyki</h2>
        <Select value={statsEventFilter} onValueChange={setStatsEventFilter}>
          <SelectTrigger className="w-full sm:w-64 h-10 rounded-xl border-border/60 bg-card"><SelectValue placeholder="Wszystkie wydarzenia" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
            {(eventsData || []).map((e: any) => (<SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Wszystkie wydarzenia" value={eventsData?.length || 0} icon={<Calendar className="h-5 w-5" />} description={`${activeEvents.length} aktywnych teraz`} trend="up" />
        <StatCard title="Zarejestrowani goście" value={guestsStats.total} icon={<Users className="h-5 w-5" />} description={`${guestsStats.checkedIn} zameldowanych`} trend="up" />
        <StatCard title="Oczekujące akredytacje" value={accreditationRequests?.length || 0} icon={<FileText className="h-5 w-5" />} description={accreditationRequests?.length ? "wymaga uwagi" : "brak oczekujących"} />
        <StatCard title="Współczynnik check-in" value={guestsStats.total ? `${Math.round((guestsStats.checkedIn / guestsStats.total) * 100)}%` : '0%'} icon={<TrendingUp className="h-5 w-5" />} description="wskaźnik obecności" />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="mb-6 bg-primary/5 p-1 rounded-xl border border-border grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BarChart3 className="h-4 w-4 shrink-0" /><span className="truncate">Przegląd</span></TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Calendar className="h-4 w-4 shrink-0" /><span className="truncate">Wydarzenia</span></TabsTrigger>
          <TabsTrigger value="schema" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Database className="h-4 w-4 shrink-0" /><span className="truncate">Baza</span></TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><HardDrive className="h-4 w-4 shrink-0" /><span className="truncate">Zasoby</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PendingAccreditationsCard requests={accreditationRequests || []} />
            <QuickActionsCard />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentScansWidget />
            <CheckInActivityChart guests={guestsData || []} />
          </div>
          <TicketTypeStatsCard byTicketType={guestsStats.byTicketType} total={guestsStats.total} />
        </TabsContent>

        <TabsContent value="events">
          <EventsTabContent eventsData={eventsData || []} eventsLoading={eventsLoading} />
        </TabsContent>

        <TabsContent value="schema"><DatabaseSchema /></TabsContent>
        <TabsContent value="resources"><ResourceMonitor /></TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizerDashboard;
