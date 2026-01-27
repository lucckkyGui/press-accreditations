
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, CheckCircle, QrCode, Users, Database, AlertTriangle,
  TrendingUp, Mail, Clock, BarChart3, Plus, Eye, Settings, 
  UserPlus, Send, FileText, Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import GuestStatusChart from "@/components/dashboard/GuestStatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DatabaseSchema from "@/components/database/DatabaseSchema";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { mockDashboardService } from "@/services/api/mockDashboardService";
import { mockEventStatsService } from "@/services/api/mockEventStatsService";
import { useQuery } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("today");
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "schema">("overview");
  const { isOnline, wasOffline } = useOnlineStatus();

  // Fetch organizer's events
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

  // Fetch guests count for organizer's events
  const { data: guestsStats } = useQuery({
    queryKey: ['organizerGuestsStats', user?.id],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return { total: 0, checkedIn: 0 };
      const eventIds = eventsData.map(e => e.id);
      const { data, error } = await supabase
        .from('guests')
        .select('id, status, checked_in_at')
        .in('event_id', eventIds);
      if (error) throw error;
      const total = data?.length || 0;
      const checkedIn = data?.filter(g => g.checked_in_at)?.length || 0;
      return { total, checkedIn };
    },
    enabled: !!eventsData?.length,
  });

  // Fetch accreditation requests
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

  // Show toast when coming back online
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Witaj, {profile?.firstName || 'Organizatorze'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Panel zarządzania wydarzeniami i akredytacjami
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus onSyncClick={handleSync} />
          <Button onClick={() => navigate('/events')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nowe wydarzenie
          </Button>
        </div>
      </div>

      {/* Offline alert */}
      {!isOnline && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Tryb offline</AlertTitle>
          <AlertDescription className="text-amber-700">
            Pracujesz w trybie offline. Niektóre dane mogą być nieaktualne.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wszystkie wydarzenia"
          value={eventsData?.length || 0}
          icon={<Calendar className="h-5 w-5" />}
          description={`${activeEvents.length} aktywnych teraz`}
        />
        <StatCard
          title="Zarejestrowani goście"
          value={guestsStats?.total || 0}
          icon={<Users className="h-5 w-5" />}
          description={`${guestsStats?.checkedIn || 0} zameldowanych`}
        />
        <StatCard
          title="Oczekujące akredytacje"
          value={accreditationRequests?.length || 0}
          icon={<FileText className="h-5 w-5" />}
          description={accreditationRequests?.length ? "wymaga uwagi" : undefined}
        />
        <StatCard
          title="Współczynnik check-in"
          value={guestsStats?.total ? `${Math.round((guestsStats.checkedIn / guestsStats.total) * 100)}%` : '0%'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Wydarzenia
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-2">
            <Database className="h-4 w-4" />
            Baza danych
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending accreditations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Oczekujące akredytacje</CardTitle>
                  <CardDescription>Prośby wymagające Twojej decyzji</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/guests')}>
                  Zobacz wszystkie
                </Button>
              </CardHeader>
              <CardContent>
                {accreditationRequests?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Brak oczekujących akredytacji</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accreditationRequests?.slice(0, 4).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium">{request.media_name}</p>
                          <p className="text-sm text-muted-foreground">{request.contact_email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Odrzuć</Button>
                          <Button size="sm">Zaakceptuj</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Szybkie akcje</CardTitle>
                <CardDescription>Najczęściej używane funkcje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/events')}>
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Dodaj wydarzenie</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/guests')}>
                    <UserPlus className="h-5 w-5" />
                    <span className="text-sm">Dodaj gości</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/scanner')}>
                    <QrCode className="h-5 w-5" />
                    <span className="text-sm">Skaner QR</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/settings')}>
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">Ustawienia</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity chart */}
          <Card>
            <CardHeader>
              <CardTitle>Aktywność check-in</CardTitle>
              <CardDescription>Statystyki zameldowań w czasie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <Activity className="h-8 w-8 mr-2" />
                <span>Wykres aktywności będzie tutaj</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Active events */}
          {activeEvents.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <CardTitle className="text-lg text-green-800">Aktywne wydarzenia</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-white border">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/scanner')}>
                          <QrCode className="h-4 w-4 mr-1" />
                          Skanuj
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/events`)}>
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

          {/* Upcoming events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Nadchodzące wydarzenia</CardTitle>
                <CardDescription>Twoje zaplanowane wydarzenia</CardDescription>
              </div>
              <Button onClick={() => navigate('/events')}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj
              </Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Brak nadchodzących wydarzeń</p>
                  <Button className="mt-4" onClick={() => navigate('/events')}>
                    Utwórz pierwsze wydarzenie
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-2 bg-primary/10 rounded-lg min-w-[60px]">
                          <div className="text-lg font-bold text-primary">
                            {new Date(event.start_date).getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.start_date).toLocaleDateString('pl-PL', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.location || 'Brak lokalizacji'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={event.is_published ? "default" : "secondary"}>
                          {event.is_published ? "Opublikowane" : "Szkic"}
                        </Badge>
                        <Button size="sm" variant="ghost">
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
      </Tabs>
    </div>
  );
};

export default OrganizerDashboard;
