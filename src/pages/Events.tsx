import React, { useMemo, useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Download, Upload, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types";
import EventForm from "@/components/events/EventForm";
import { EventsSkeleton } from "@/components/common/PageSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type EventStatus = "live" | "upcoming" | "draft" | "past";
type FilterTab = "all" | EventStatus;

const getEventStatus = (event: Event): EventStatus => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate || event.startDate);
  if (!event.isPublished) return "draft";
  if (now >= start && now <= end) return "live";
  if (now > end) return "past";
  return "upcoming";
};

const STATUS_CONFIG: Record<EventStatus, { label: string; chip: string; dot?: boolean }> = {
  live:     { label: "LIVE",        chip: "chip chip-ok", dot: true },
  upcoming: { label: "ZAPLANOWANE", chip: "chip chip-acc" },
  draft:    { label: "SZKIC",       chip: "chip" },
  past:     { label: "ZAKOŃCZONE",  chip: "chip" },
};

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all",      label: "Wszystkie" },
  { value: "live",     label: "Trwające" },
  { value: "upcoming", label: "Zaplanowane" },
  { value: "draft",    label: "Szkice" },
  { value: "past",     label: "Zakończone" },
];

const getEventCode = (id: string) =>
  `EVT-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

const Events = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle("Wydarzenia");
  const [open, setOpen] = useState(false);

  // Otwórz kreator od razu przy wejściu z ?new=1 (przyciski pulpitu, paleta komend).
  // Czyścimy parametr, żeby odświeżenie/wstecz nie otwierało dialogu ponownie.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const { events, createEvent, isCreating, isEventsLoading } = useEvents();
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});

  // "/" shortcut — focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      e.preventDefault();
      document.getElementById("events-search")?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // "N" shortcut — new event
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "n" && e.key !== "N") return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Fetch guest counts
  useEffect(() => {
    if (events.length === 0) return;
    const ids = events.map(e => e.id);
    supabase
      .from("guests")
      .select("event_id")
      .in("event_id", ids)
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        data.forEach((g: any) => {
          counts[g.event_id] = (counts[g.event_id] || 0) + 1;
        });
        setGuestCounts(counts);
      });
  }, [events]);

  const handleCreateEvent = async (data: Partial<Event>) => {
    const response = await createEvent(data);
    if (!response.error) setOpen(false);
  };

  const eventsWithStatus = useMemo(
    () => events.map(e => ({ ...e, _status: getEventStatus(e) })),
    [events]
  );

  const tabCounts = useMemo(() => {
    const c: Record<FilterTab, number> = { all: events.length, live: 0, upcoming: 0, draft: 0, past: 0 };
    eventsWithStatus.forEach(e => { c[e._status]++; });
    return c;
  }, [eventsWithStatus, events.length]);

  const filtered = useMemo(() =>
    eventsWithStatus
      .filter(e => {
        if (filter !== "all" && e._status !== filter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          (e.location ?? "").toLowerCase().includes(q) ||
          getEventCode(e.id).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [eventsWithStatus, filter, search]
  );

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Wydarzenia
            <span className="text-sm font-normal text-muted-foreground tabular-nums">{events.length}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Zarządzaj kalendarzem, akredytacjami i biletami.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" /> Eksport
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-8">
            <Upload className="h-3.5 w-3.5" /> Import .csv
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-primary hover:bg-primary/90 glow-accent gap-1.5 h-8"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Nowe wydarzenie
            <span className="kbd ml-0.5">N</span>
          </Button>
        </div>
      </div>

      {/* ── Tabs + search ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap border-r border-border last:border-r-0",
                filter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 text-[11px] tabular-nums",
                filter === tab.value ? "text-primary/70" : "text-muted-foreground/50"
              )}>
                {tabCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            id="events-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj nazwa / lokalizacja / kod..."
            className="pl-9 pr-10 h-9 w-72 rounded-lg border-border/60 text-sm bg-card"
          />
          {!search && (
            <span className="kbd absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">/</span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {isEventsLoading ? (
        <EventsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-border">
          <div className="rounded-lg bg-primary/10 p-4 mb-4">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Brak wydarzeń</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search ? `Brak wyników dla „${search}"` : "Utwórz pierwsze wydarzenie, aby rozpocząć."}
          </p>
          {!search && (
            <Button className="mt-4 rounded-lg" size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Nowe wydarzenie
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-28 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-4">Kod</TableHead>
                <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nazwa</TableHead>
                <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Lokalizacja</TableHead>
                <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Termin</TableHead>
                <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-4 hidden xl:table-cell">
                  Akredytacje · Frekwencja
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(event => {
                const cfg = STATUS_CONFIG[event._status];
                const count = guestCounts[event.id] || 0;
                const cap = event.maxGuests || 0;
                const pct = cap > 0 ? Math.min(Math.round((count / cap) * 100), 100) : 0;
                return (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/20 transition-colors group"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <TableCell className="pl-4">
                      <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground/70 transition-colors">
                        {getEventCode(event.id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {event.name}
                      </div>
                      {count > 0 && (
                        <div className="text-[11px] text-muted-foreground">{count} dziennikarzy</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                      {event.location || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      <span className="text-sm text-foreground">{formatDate(event.startDate)}</span>
                      <span className="text-muted-foreground/50 text-sm"> · {formatTime(event.startDate)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cfg.chip}>
                        <span className={cn("chip-dot", cfg.dot && "pulse-live")} />
                        {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 hidden xl:table-cell">
                      {cap > 0 ? (
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {count} <span className="text-muted-foreground/40">/ {cap}</span>
                          </span>
                          <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/30 text-right block">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── New event dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[760px] rounded-lg border-border shadow-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Utwórz nowe wydarzenie</DialogTitle>
            <DialogDescription>Wprowadź szczegóły wydarzenia, aby je utworzyć i zarządzać akredytacjami.</DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setOpen(false)} isSubmitting={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
