
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, CheckCircle, QrCode, Users, Database, AlertTriangle,
  TrendingUp, FileText, Activity, CreditCard, Crown,
  Plus, Eye, Settings, UserPlus, ArrowRight, Sparkles, BarChart3, Ticket, HardDrive
} from "lucide-react";
import { TICKET_TYPE_LABELS, GuestTicketType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import DatabaseSchema from "@/components/database/DatabaseSchema";
import CheckInActivityChart from "@/components/dashboard/CheckInActivityChart";
import ResourceMonitor from "@/components/dashboard/ResourceMonitor";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useCheckout } from "@/hooks/useCheckout";
import { STRIPE_TIERS } from "@/config/stripe";

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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('start_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: guestsStats } = useQuery({
    queryKey: ['organizerGuestsStats', user?.id, statsEventFilter],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return { total: 0, checkedIn: 0, byTicketType: {} as Record<string, number> };
      const eventIds = statsEventFilter === 'all'
        ? eventsData.map(e => e.id)
        : [statsEventFilter];
      const { data, error } = await supabase
        .from('guests')
        .select('id, status, checked_in_at, ticket_type')
        .in('event_id', eventIds);
      if (error) throw error;
      const total = data?.length || 0;
      const checkedIn = data?.filter(g => g.checked_in_at)?.length || 0;
      const byTicketType: Record<string, number> = {};
      data?.forEach(g => {
        const tt = g.ticket_type || 'uczestnik';
        byTicketType[tt] = (byTicketType[tt] || 0) + 1;
      });
      return { total, checkedIn, byTicketType };
    },
    enabled: !!eventsData?.length,
  });

  const { data: accreditationRequests } = useQuery({
    queryKey: ['pendingAccreditations', user?.id],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const eventIds = eventsData.map(e => e.id);
      const { data, error } = await supabase
        .from('accreditation_requests')
        .select('*')
        .in('event_id', eventIds)
        .eq('status', 'pending')
        .limit(5);
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

  const upcomingEvents = eventsData?.filter(e => new Date(e.start_date) > new Date()) || [];
  const activeEvents = eventsData?.filter(e => {
    const now = new Date();
    return new Date(e.start_date) <= now && new Date(e.end_date) >= now;
  }) || [];

  const handleSync = async () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Witaj, {profile?.firstName || 'Organizatorze'}! 👋
          </h1>
          <p className="text-muted-foreground text-base">
            Panel zarządzania wydarzeniami i akredytacjami
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus onSyncClick={handleSync} />
          <Button onClick={() => navigate('/events')} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4" />
            Nowe wydarzenie
          </Button>
        </div>
      </div>

      {/* Offline alert */}
      {!isOnline && (
        <Alert variant="destructive" className="bg-warning/10 border-warning/30 text-foreground rounded-xl">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Tryb offline</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Pracujesz w trybie offline. Niektóre dane mogą być nieaktualne.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription card */}
      <Card className={`rounded-2xl overflow-hidden border-0 shadow-md ${subscribed ? 'bg-primary/5' : 'bg-warning/5'}`}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5 px-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${subscribed ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-foreground">
                  {subLoading ? 'Sprawdzanie...' : subscribed ? `Plan ${tier ? STRIPE_TIERS[tier].name : 'Aktywny'}` : 'Brak aktywnego planu'}
                </span>
                {subscribed && (
                  <Badge className="text-xs bg-primary/15 text-primary border-0 hover:bg-primary/20">Aktywny</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subscribed && subscriptionEnd
                  ? `Odnowienie: ${new Date(subscriptionEnd).toLocaleDateString('pl-PL')}`
                  : 'Wybierz plan, aby odblokować pełne możliwości'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {subscribed ? (
              <Button variant="outline" size="sm" onClick={openCustomerPortal} disabled={portalLoading} className="rounded-xl">
                <CreditCard className="h-4 w-4 mr-2" />
                {portalLoading ? 'Otwieranie...' : 'Zarządzaj subskrypcją'}
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/home#pricing')} className="rounded-xl gap-2">
                <Sparkles className="h-4 w-4" />
                Wybierz plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event filter + Stats grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Statystyki</h2>
        <Select value={statsEventFilter} onValueChange={setStatsEventFilter}>
          <SelectTrigger className="w-full sm:w-64 h-10 rounded-xl border-border/60 bg-card">
            <SelectValue placeholder="Wszystkie wydarzenia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
            {(eventsData || []).map((e: any) => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wszystkie wydarzenia"
          value={eventsData?.length || 0}
          icon={<Calendar className="h-5 w-5" />}
          description={`${activeEvents.length} aktywnych teraz`}
          trend="up"
        />
        <StatCard
          title="Zarejestrowani goście"
          value={guestsStats?.total || 0}
          icon={<Users className="h-5 w-5" />}
          description={`${guestsStats?.checkedIn || 0} zameldowanych`}
          trend="up"
        />
        <StatCard
          title="Oczekujące akredytacje"
          value={accreditationRequests?.length || 0}
          icon={<FileText className="h-5 w-5" />}
          description={accreditationRequests?.length ? "wymaga uwagi" : "brak oczekujących"}
        />
        <StatCard
          title="Współczynnik check-in"
          value={guestsStats?.total ? `${Math.round((guestsStats.checkedIn / guestsStats.total) * 100)}%` : '0%'}
          icon={<TrendingUp className="h-5 w-5" />}
          description="wskaźnik obecności"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="mb-6 bg-primary/5 p-1 rounded-xl border border-border grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="truncate">Przegląd</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">Wydarzenia</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <Database className="h-4 w-4 shrink-0" />
            <span className="truncate">Baza</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <HardDrive className="h-4 w-4 shrink-0" />
            <span className="truncate">Zasoby</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending accreditations */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Oczekujące akredytacje</CardTitle>
                  <CardDescription className="mt-1">Prośby wymagające Twojej decyzji</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/guests')} className="text-primary gap-1 hover:bg-primary/10">
                  Zobacz wszystkie
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {accreditationRequests?.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-success/15 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-success" />
                    </div>
                    <p className="font-medium text-foreground">Brak oczekujących akredytacji</p>
                    <p className="text-sm mt-1">Wszystko jest na bieżąco 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accreditationRequests?.slice(0, 4).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 transition-colors">
                        <div>
                          <p className="font-medium text-sm text-foreground">{request.media_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{request.contact_email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">Odrzuć</Button>
                          <Button size="sm" className="rounded-lg text-xs h-8">Zaakceptuj</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">Szybkie akcje</CardTitle>
                <CardDescription className="mt-1">Najczęściej używane funkcje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Plus, label: "Dodaj wydarzenie", path: "/events" },
                    { icon: UserPlus, label: "Dodaj gości", path: "/guests" },
                    { icon: QrCode, label: "Skaner QR", path: "/scanner" },
                    { icon: Settings, label: "Ustawienia", path: "/settings" },
                  ].map(({ icon: Icon, label, path }) => (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className="group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity placeholder */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Aktywność check-in</CardTitle>
              <CardDescription>Statystyki zameldowań w czasie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground rounded-xl bg-primary/5 border border-dashed border-primary/20">
                <Activity className="h-10 w-10 mb-3 text-primary/30" />
                <span className="font-medium text-foreground/60">Wykres aktywności</span>
                <span className="text-xs mt-1">Dane pojawią się po pierwszych zameldowaniach</span>
              </div>
            </CardContent>
          </Card>

          {/* Ticket type stats */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Rejestracje wg typu biletu
              </CardTitle>
              <CardDescription>Rozkład gości według kategorii akredytacji</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const byType = guestsStats?.byTicketType || {};
                const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
                const total = guestsStats?.total || 0;

                if (entries.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <Ticket className="h-10 w-10 mb-3 text-primary/30" />
                      <span className="font-medium text-foreground/60">Brak danych</span>
                      <span className="text-xs mt-1">Dodaj gości, aby zobaczyć statystyki</span>
                    </div>
                  );
                }

                const colors = [
                  'bg-primary', 'bg-info', 'bg-success', 'bg-warning',
                  'bg-destructive', 'bg-accent', 'bg-secondary', 'bg-muted-foreground', 'bg-primary/60'
                ];

                return (
                  <div className="space-y-3">
                    {entries.map(([type, count], i) => {
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const label = TICKET_TYPE_LABELS[type as GuestTicketType] || type;
                      return (
                        <div key={type} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{label}</span>
                            <span className="text-muted-foreground tabular-nums">{count} <span className="text-xs">({pct}%)</span></span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-border flex justify-between text-sm">
                      <span className="text-muted-foreground">Łącznie</span>
                      <span className="font-semibold text-foreground tabular-nums">{total}</span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {activeEvents.length > 0 && (
            <Card className="border-0 rounded-2xl bg-success/5 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                  <CardTitle className="text-lg text-success font-semibold">Aktywne wydarzenia</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-success/20">
                      <div>
                        <h4 className="font-semibold text-foreground">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/scanner')} className="rounded-lg">
                          <QrCode className="h-4 w-4 mr-1" />
                          Skanuj
                        </Button>
                        <Button size="sm" onClick={() => navigate('/events')} className="rounded-lg">
                          <Eye className="h-4 w-4 mr-1" />
                          Szczegóły
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Nadchodzące wydarzenia</CardTitle>
                <CardDescription className="mt-1">Twoje zaplanowane wydarzenia</CardDescription>
              </div>
              <Button onClick={() => navigate('/events')} className="rounded-xl gap-1.5">
                <Plus className="h-4 w-4" />
                Dodaj
              </Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-14 text-muted-foreground">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="font-medium text-foreground">Brak nadchodzących wydarzeń</p>
                  <p className="text-sm mt-1 mb-4">Utwórz swoje pierwsze wydarzenie</p>
                  <Button className="rounded-xl" onClick={() => navigate('/events')}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Utwórz wydarzenie
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-2.5 bg-primary/10 rounded-xl min-w-[60px]">
                          <div className="text-lg font-bold text-primary leading-none">
                            {new Date(event.start_date).getDate()}
                          </div>
                          <div className="text-[11px] text-primary/70 mt-1 font-medium uppercase">
                            {new Date(event.start_date).toLocaleDateString('pl-PL', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.location || 'Brak lokalizacji'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={event.is_published ? "default" : "secondary"} className="rounded-lg">
                          {event.is_published ? "Opublikowane" : "Szkic"}
                        </Badge>
                        <Button size="sm" variant="ghost" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <DatabaseSchema />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizerDashboard;
