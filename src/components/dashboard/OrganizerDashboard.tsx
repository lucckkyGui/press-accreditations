import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Eye,
  FileText,
  Plus,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import CheckInActivityChart from "@/components/dashboard/CheckInActivityChart";
import RecentScansWidget from "@/components/dashboard/RecentScansWidget";
import UsageTracker from "@/components/dashboard/UsageTracker";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import PendingAccreditationsCard from "@/components/dashboard/PendingAccreditationsCard";
import TicketTypeStatsCard from "@/components/dashboard/TicketTypeStatsCard";
import DashboardHero from "@/components/dashboard/DashboardHero";
import LiveEventActivityCard from "@/components/dashboard/LiveEventActivityCard";
import AISuggestionCard from "@/components/dashboard/AISuggestionCard";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { useQuery } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useCheckout } from "@/hooks/useCheckout";

interface EventData {
  id: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string;
  is_published: boolean | null;
}

// ── Inline UpcomingEventsCard ─────────────────────────────────────────────────
interface UpcomingEventsCardProps {
  events: EventData[];
  eventsLoading: boolean;
}

const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ events, eventsLoading }) => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-[14px] font-semibold text-foreground">Nadchodzące wydarzenia</CardTitle>
          <CardDescription className="text-[12px] mt-0.5">Twój kalendarz eventów</CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-md h-7 px-2.5 gap-1 text-[12px]"
          onClick={() => navigate("/events?new=1")}
        >
          <Plus className="h-3 w-3" /> Dodaj
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {eventsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg skeleton" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-[13px] font-medium text-foreground">Brak nadchodzących eventów</p>
            <p className="serif-italic text-[12px] mt-0.5">ale to się zaraz zmieni.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:border-primary/30 hover:bg-primary/5 transition-colors group cursor-pointer"
                onClick={() => navigate("/events")}
              >
                <div className="text-center min-w-[40px]">
                  <div className="mono text-[16px] font-bold text-foreground leading-none">
                    {new Date(event.start_date).getDate()}
                  </div>
                  <div className="mono text-[10px] text-muted-foreground uppercase mt-0.5">
                    {new Date(event.start_date).toLocaleDateString("pl-PL", { month: "short" })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {event.location || "Brak lokalizacji"}
                  </p>
                </div>
                <Badge
                  variant={event.is_published ? "default" : "secondary"}
                  className="rounded-md text-[10px] shrink-0"
                >
                  {event.is_published ? "Pub." : "Szkic"}
                </Badge>
                <Eye className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Compute AI suggestion heuristic ──────────────────────────────────────────
function getAISuggestion(checkInRate: number, pendingCount: number, guestsTotal: number) {
  if (pendingCount > 5) {
    return {
      title: `Rozpatrz ${pendingCount} oczekujących akredytacji`,
      body: "Wnioski mediów czekają na decyzję. Im dłużej czekają, tym większe ryzyko rezygnacji.",
    };
  }
  if (checkInRate > 60 && guestsTotal > 0) {
    return {
      title: "Ponad połowa gości już na miejscu",
      body: `Wskaźnik check-in wynosi ${checkInRate}%. Dobry moment, by sprawdzić kolejki przy wejściu.`,
    };
  }
  if (guestsTotal === 0) {
    return {
      title: "Zaimportuj listę gości",
      body: "Dodaj uczestników przed wydarzeniem, żeby odblokować skaner QR i check-in.",
    };
  }
  return {
    title: "System gotowy do pracy",
    body: "Skaner QR jest skonfigurowany. Możesz uruchomić check-in w dowolnym momencie.",
  };
}

// ── Main component ────────────────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [statsEventFilter, setStatsEventFilter] = useState<string>("all");
  const { isOnline, wasOffline } = useOnlineStatus();
  const { subscribed, tier, subscriptionEnd, isLoading: subLoading } = useSubscription();
  const { openCustomerPortal, isLoading: portalLoading } = useCheckout();

  // ── Queries (unchanged) ──────────────────────────────────────────────────
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["organizerEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("start_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: guestsData } = useQuery({
    queryKey: ["organizerGuestsData", user?.id, statsEventFilter],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      const eventIds =
        statsEventFilter === "all" ? eventsData.map((e) => e.id) : [statsEventFilter];
      const { data, error } = await supabase
        .from("guests")
        .select("id, status, checked_in_at, ticket_type, created_at")
        .in("event_id", eventIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  const guestsStats = useMemo(() => {
    if (!guestsData?.length) return { total: 0, checkedIn: 0, accredited: 0, byTicketType: {} as Record<string, number> };
    const total = guestsData.length;
    const checkedIn = guestsData.filter((g) => g.checked_in_at).length;
    // Akredytowani = wydane akredytacje: status confirmed (zatwierdzony + pass) lub checked-in.
    const accredited = guestsData.filter((g) => g.status === "confirmed" || g.status === "checked-in").length;
    const byTicketType: Record<string, number> = {};
    guestsData.forEach((g) => {
      const t = g.ticket_type || "uczestnik";
      byTicketType[t] = (byTicketType[t] || 0) + 1;
    });
    return { total, checkedIn, accredited, byTicketType };
  }, [guestsData]);

  const { data: accreditationRequests } = useQuery({
    queryKey: ["pendingAccreditations", user?.id],
    queryFn: async () => {
      if (!user?.id || !eventsData?.length) return [];
      // Single source of truth: pending media submissions (landing_page_submissions).
      // RLS scopes to the organizer's events.
      const { data, error } = await supabase
        .from("landing_page_submissions")
        .select("id, media_organization, email")
        .in("event_id", eventsData.map((e) => e.id))
        .eq("status", "pending")
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventsData?.length,
  });

  // Liczniki statusów liczone na WSZYSTKICH wydarzeniach organizatora (nie limit(5)),
  // żeby kafelek „Wydarzenia" pokazywał uczciwą sumę i rozbicie.
  const { data: eventStatusRows } = useQuery({
    queryKey: ["organizerEventStatusCounts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("events")
        .select("start_date, end_date, is_published")
        .eq("organizer_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({
        title: "Połączenie przywrócone",
        description: "Jesteś teraz online. Dane zostaną zsynchronizowane automatycznie.",
      });
    }
  }, [isOnline, wasOffline]);

  // ── Derived state ────────────────────────────────────────────────────────
  const now = useMemo(() => new Date(), []);
  const events = useMemo(() => (eventsData || []) as EventData[], [eventsData]);
  const pendingCount = accreditationRequests?.length || 0;
  const checkInRate = guestsStats.total
    ? Math.round((guestsStats.checkedIn / guestsStats.total) * 100)
    : 0;

  const activeEvents = useMemo(
    () => events.filter((e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now),
    [events, now]
  );
  const upcomingEvents = useMemo(
    () => events.filter((e) => new Date(e.start_date) > now),
    [events, now]
  );

  // Rozbicie statusów (spójne z zakładkami w /events): niepublikowane = szkic;
  // opublikowane → w trakcie (start ≤ teraz ≤ koniec) / zakończone / zaplanowane.
  const eventCounts = useMemo(() => {
    const rows = eventStatusRows || [];
    let live = 0, upcoming = 0, past = 0, draft = 0;
    for (const e of rows) {
      if (!e.is_published) { draft++; continue; }
      const start = new Date(e.start_date);
      const end = new Date(e.end_date || e.start_date);
      if (start <= now && end >= now) live++;
      else if (end < now) past++;
      else upcoming++;
    }
    return { total: rows.length, live, upcoming, past, draft };
  }, [eventStatusRows, now]);

  const eventCountsLabel =
    eventCounts.total === 0
      ? "brak wydarzeń"
      : [
          `${eventCounts.live} w trakcie`,
          `${eventCounts.upcoming} zaplanowane`,
          `${eventCounts.past} zakończone`,
          ...(eventCounts.draft ? [`${eventCounts.draft} szkic.`] : []),
        ].join(" · ");

  const aiSuggestion = useMemo(
    () => getAISuggestion(checkInRate, pendingCount, guestsStats.total),
    [checkInRate, pendingCount, guestsStats.total]
  );

  const selectedEventLabel =
    statsEventFilter === "all"
      ? "Wszystkie wydarzenia"
      : events.find((e) => e.id === statsEventFilter)?.title || "Wybrane wydarzenie";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Offline alert */}
      {!isOnline && (
        <Alert variant="destructive" className="rounded-lg border-warning/30 bg-warning/10 text-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Tryb offline</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Pracujesz w trybie offline. Część danych zostanie zsynchronizowana po odzyskaniu połączenia.
          </AlertDescription>
        </Alert>
      )}

      {/* 1 ── Hero */}
      <DashboardHero
        userName={profile?.firstName ?? "tam"}
        activeEvent={activeEvents[0] ?? null}
        upcomingEvent={upcomingEvents[0] ?? null}
        pendingCount={pendingCount}
      />

      {/* SyncStatus — mini chip po prawej */}
      <div className="flex justify-end -mt-4">
        <SyncStatus />
      </div>

      {/* 2 ── KPI row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="mono text-[11px] tracking-wider uppercase text-muted-foreground">Metryki</p>
          <Select value={statsEventFilter} onValueChange={setStatsEventFilter} disabled={!events.length}>
            <SelectTrigger className="h-7 w-48 rounded-md border-border/60 bg-card text-[12px]">
              <SelectValue placeholder="Wszystkie wydarzenia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Wydarzenia"
            value={eventCounts.total}
            icon={<Calendar className="h-4 w-4" />}
            description={eventCountsLabel}
            tone={eventCounts.live ? "success" : "info"}
          />
          <StatCard
            title="Goście"
            value={guestsStats.total}
            icon={<Users className="h-4 w-4" />}
            description={`${guestsStats.checkedIn} po check-inie`}
            tone={guestsStats.total ? "success" : "warning"}
          />
          <StatCard
            title="Akredytacje"
            value={pendingCount}
            icon={<FileText className="h-4 w-4" />}
            description={pendingCount ? "wymaga decyzji" : "brak oczekujących"}
            tone={pendingCount ? "warning" : "success"}
          />
          <StatCard
            title="Check-in"
            value={`${checkInRate}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            description={`z ${selectedEventLabel.toLowerCase()}`}
            tone={checkInRate > 0 ? "success" : "muted"}
          />
        </div>
      </div>

      {/* 3 ── Main 2-col: live activity + upcoming + AI */}
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <LiveEventActivityCard
          event={activeEvents[0] ?? null}
          accreditationsApproved={guestsStats.accredited}
          accreditationsCapacity={guestsStats.total}
          checkedIn={guestsStats.checkedIn}
          inQueue={pendingCount}
          onOpenEvent={() => navigate("/events")}
        />

        <div className="flex flex-col gap-4">
          <UpcomingEventsCard events={upcomingEvents} eventsLoading={eventsLoading} />
          <AISuggestionCard
            title={aiSuggestion.title}
            body={aiSuggestion.body}
            primaryAction={{
              label: pendingCount > 0 ? "Przejdź do gości" : "Otwórz skaner",
              onClick: () => navigate(pendingCount > 0 ? "/guests" : "/scanner"),
            }}
          />
        </div>
      </div>

      {/* 4 ── Subscription + usage */}
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

      {/* 5 ── Detail widgets (previously in "overview" tab) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PendingAccreditationsCard requests={accreditationRequests || []} />
        <QuickActionsCard />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentScansWidget />
        <CheckInActivityChart guests={guestsData || []} />
      </div>
      <TicketTypeStatsCard byTicketType={guestsStats.byTicketType} total={guestsStats.total} />
    </div>
  );
};

export default OrganizerDashboard;
