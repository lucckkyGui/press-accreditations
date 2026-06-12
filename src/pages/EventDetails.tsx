import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, MapPin, Users, Bell, Globe,
  Link2, Copy, MoreHorizontal, ScanLine, Clock,
  CheckCircle, AlertCircle, Pencil, Trash2,
} from "lucide-react";
import { Event, Guest } from "@/types";
import { GuestsTable } from "@/components/guests/GuestsTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { qrToDataURL } from "@/utils/qrDataUrl";
import { toast } from "sonner";
import GuestDetails from "@/components/guests/GuestDetails";
import { supabase } from "@/integrations/supabase/client";
import { features } from "@/config/features";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";
import MediaVerificationPanel from "@/components/accreditation/MediaVerificationPanel";
import EventForm from "@/components/events/EventForm";
import { eventService } from "@/services/eventService";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getEventCode = (id: string) =>
  `EVT-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;

const formatDateTime = (date: Date) =>
  new Date(date).toLocaleDateString("pl-PL", {
    day: "numeric", month: "long", year: "numeric",
  });

type EventStatus = "live" | "upcoming" | "draft" | "past";

const getEventStatus = (event: Event): EventStatus => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate || event.startDate);
  if (!event.isPublished) return "draft";
  if (now >= start && now <= end) return "live";
  if (now > end) return "past";
  return "upcoming";
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [landingSlug, setLandingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQRGuest, setCurrentQRGuest] = useState<Guest | null>(null);
  const [guestDetailsOpen, setGuestDetailsOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();
        if (eventError) throw eventError;
        if (eventData) {
          setEvent({
            id: eventData.id,
            name: eventData.title,
            description: eventData.description || "",
            location: eventData.location || "",
            startDate: new Date(eventData.start_date),
            endDate: eventData.end_date ? new Date(eventData.end_date) : new Date(eventData.start_date),
            organizerId: eventData.organizer_id || "",
            organizationId: eventData.organizer_id || "",
            isPublished: eventData.is_published || false,
            imageUrl: eventData.image_url,
            category: eventData.category,
            maxGuests: eventData.max_guests,
            createdAt: new Date(eventData.created_at || Date.now()),
            updatedAt: new Date(eventData.updated_at || Date.now()),
            createdBy: eventData.organizer_id || "",
          });
        }

        // Realny slug publicznej strony akredytacji (event_landing_pages) — tylko gdy aktywna.
        const { data: lp } = await supabase
          .from("event_landing_pages")
          .select("slug")
          .eq("event_id", eventId)
          .eq("is_active", true)
          .maybeSingle();
        setLandingSlug(lp?.slug ?? null);

        const { data: guestsData } = await supabase
          .from("guests")
          .select("*")
          .eq("event_id", eventId);
        if (guestsData) {
          setGuests(guestsData.map((g) => ({
            id: g.id,
            firstName: g.first_name,
            lastName: g.last_name,
            email: g.email,
            company: g.company || "",
            phone: g.phone || undefined,
            ticketType: (g.ticket_type || "uczestnik") as Guest["ticketType"],
            zones: (g.zones || []) as string[],
            status: g.status as Guest["status"],
            emailStatus: (g.email_status || "pending") as Guest["emailStatus"],
            qrCode: g.qr_code,
            checkedInAt: g.checked_in_at ? new Date(g.checked_in_at) : undefined,
          })));
        }
      } catch {
        toast.error("Nie udało się załadować szczegółów wydarzenia");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleDeleteGuest = useCallback(async (guest: Guest) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć gościa ${guest.firstName} ${guest.lastName}?`)) return;
    const { error } = await supabase.from("guests").delete().eq("id", guest.id);
    if (error) { toast.error("Nie udało się usunąć gościa"); return; }
    setGuests(prev => prev.filter(g => g.id !== guest.id));
    toast.success("Gość został usunięty");
  }, []);

  const handleUpdate = async (data: Partial<Event>) => {
    if (!eventId) return;
    setIsSaving(true);
    const res = await eventService.updateEvent(eventId, data);
    setIsSaving(false);
    if (res.error) { toast.error("Nie udało się zapisać zmian"); return; }
    if (res.data) setEvent(res.data);
    setEditOpen(false);
    toast.success("Zapisano zmiany");
  };

  const handleTogglePublish = async () => {
    if (!eventId || !event) return;
    const next = !event.isPublished;
    const res = await eventService.updateEvent(eventId, { isPublished: next });
    if (res.error) { toast.error("Nie udało się zmienić publikacji"); return; }
    setEvent((prev) => (prev ? { ...prev, isPublished: next } : prev));
    toast.success(next ? "Wydarzenie opublikowane" : "Publikacja cofnięta");
  };

  const handleDeleteEvent = async () => {
    if (!eventId || !event) return;
    if (!window.confirm(`Usunąć wydarzenie „${event.name}"? Tej operacji nie można cofnąć.`)) return;
    const res = await eventService.deleteEvent(eventId);
    if (res.error) { toast.error("Nie udało się usunąć wydarzenia"); return; }
    toast.success("Wydarzenie usunięte");
    navigate("/events");
  };

  const renderGuestsTable = (filteredGuests: Guest[]) => (
    <GuestsTable
      guests={filteredGuests}
      total={filteredGuests.length}
      page={0}
      pageSize={Math.max(filteredGuests.length, 1)}
      onPageChange={() => undefined}
      onEdit={() => toast.info("Edycja gościa będzie dostępna wkrótce")}
      onDelete={(id) => { const g = guests.find(x => x.id === id); if (g) handleDeleteGuest(g); }}
      onViewQR={(g) => { setCurrentQRGuest(g); setQrDialogOpen(true); }}
      onResendInvite={async (g) => {
        if (!eventId) { toast.error("Brak wydarzenia — nie można wysłać zaproszenia"); return; }
        if (!g.email) { toast.error(`Gość ${g.firstName} ${g.lastName} nie ma adresu e-mail`); return; }
        try {
          const { data, error } = await supabase.functions.invoke("send-guest-invitation", {
            body: { event_id: eventId, guest_ids: [g.id] },
          });
          if (error) throw error;
          const res = data as { error?: string; results?: Array<{ ok: boolean; detail?: string }> };
          const r = res?.results?.[0];
          if (!r?.ok) {
            toast.error(`Nie wysłano zaproszenia: ${r?.detail ?? res?.error ?? "nieznany błąd"}`);
            return;
          }
          toast.success(`Zaproszenie wysłane do ${g.firstName} ${g.lastName}`);
        } catch (err) {
          toast.error(`Błąd wysyłki: ${err instanceof Error ? err.message : String(err)}`);
        }
      }}
      onViewDetails={(g) => { setSelectedGuest(g); setGuestDetailsOpen(true); }}
      selectedGuests={selectedGuests}
      setSelectedGuests={setSelectedGuests}
      isLoading={false}
    />
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Wydarzenie nie zostało znalezione</h1>
        <Button onClick={() => navigate("/events")}>Powrót do listy wydarzeń</Button>
      </div>
    );
  }

  const status = getEventStatus(event);
  const checkedIn  = guests.filter(g => g.status === "checked-in").length;
  const confirmed  = guests.filter(g => g.status === "confirmed").length;
  const capacity   = event.maxGuests || 0;
  const checkInPct = capacity > 0 ? Math.round((checkedIn / capacity) * 100) : 0;

  // Realna krzywa check-inów: skumulowana liczba zameldowań w równych przedziałach czasu.
  const checkinSeries = (() => {
    const times = guests
      .map((g) => g.checkedInAt?.getTime())
      .filter((t): t is number => typeof t === "number")
      .sort((a, b) => a - b);
    if (times.length < 2) return [] as number[];
    const buckets = 12;
    const min = times[0];
    const span = Math.max(times[times.length - 1] - min, 1);
    const counts = new Array(buckets).fill(0);
    times.forEach((t) => {
      const idx = Math.min(buckets - 1, Math.floor(((t - min) / span) * buckets));
      counts[idx] += 1;
    });
    let acc = 0;
    return counts.map((c) => (acc += c));
  })();

  return (
    <div className="space-y-6">
      {/* ── Hero banner ── */}
      <div className="relative rounded-xl overflow-hidden border border-border min-h-[180px]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#0d1629] to-[#080f20]" />
        {event.imageUrl && (
          <img src={event.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        {/* Aurora */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-secondary/15 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Chips row */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {status === "live" && (
              <span className="chip chip-ok text-[11px]">
                <span className="chip-dot pulse-live" /> LIVE
              </span>
            )}
            <span className="chip text-[11px] font-mono">{getEventCode(event.id)}</span>
            {event.category && (
              <span className="chip text-[11px]">{event.category}</span>
            )}
            {!event.isPublished && (
              <span className="chip text-[11px]">Szkic</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 leading-tight">
            {event.name}
            {event.location && (
              <>
                {" "}
                <span className="text-white/50">—</span>{" "}
                <em className="serif-italic text-white/70 not-italic font-normal">{event.location}</em>
              </>
            )}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-5 flex-wrap text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateTime(event.startDate)}
              {event.endDate && ` — ${new Date(event.endDate).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
            )}
            {capacity > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {capacity} limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* ── Main content ── */}
        <div className="space-y-5 min-w-0">
          <Tabs defaultValue="overview">
            <TabsList className="mb-5 bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto gap-0">
              {[
                { value: "overview", label: "Przegląd" },
                { value: "guests",   label: `Goście · ${guests.length}` },
                { value: "checked",  label: `Check-in · ${checkedIn}` },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => document.querySelector(`[data-tab="${tab.value}"]`)?.dispatchEvent(new MouseEvent("click", { bubbles: true }))}
                  className="hidden"
                />
              ))}
              <TabsTrigger value="overview" data-tab="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Przegląd
              </TabsTrigger>
              <TabsTrigger value="guests" data-tab="guests"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Goście · {guests.length}
              </TabsTrigger>
              <TabsTrigger value="checked" data-tab="checked"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Check-in · {checkedIn}
              </TabsTrigger>
              <TabsTrigger value="program" data-tab="program"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Program
              </TabsTrigger>
              <TabsTrigger value="security" data-tab="security"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Bezpieczeństwo
              </TabsTrigger>
              <TabsTrigger value="verification" data-tab="verification"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground px-4 pb-2 pt-0 h-auto font-medium text-sm">
                Weryfikacja mediów
              </TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Stat cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Accreditations */}
                <div className="rounded-lg border border-border bg-card shadow-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Akredytacje prasowe</span>
                    <Users className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold tabular-nums text-foreground">{guests.length}</span>
                    {capacity > 0 && (
                      <span className="text-muted-foreground text-sm mb-1">/ {capacity}</span>
                    )}
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />Zatwierdzone</span>
                      <span className="tabular-nums">{confirmed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Oczekujące</span>
                      <span className="tabular-nums">{guests.filter(g => g.status === "invited").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive" />Odrzucone</span>
                      <span className="tabular-nums">{guests.filter(g => g.status === "declined").length}</span>
                    </div>
                  </div>
                </div>

                {/* Live check-in */}
                <div className="rounded-lg border border-border bg-card shadow-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      Check-in
                      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-success pulse-live" />}
                    </span>
                    <CheckCircle className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold tabular-nums text-foreground">{checkedIn}</span>
                    {capacity > 0 && (
                      <span className="text-muted-foreground text-sm mb-1">/ {capacity}</span>
                    )}
                  </div>
                  {checkinSeries.length >= 2 ? (
                    <Sparkline data={checkinSeries} color="primary" height={36} />
                  ) : (
                    <div className="h-9 flex items-center text-[11px] text-muted-foreground/60">
                      Wykres pojawi się po pierwszych check-inach
                    </div>
                  )}
                </div>
              </div>

              {/* Plan dnia */}
              <div className="rounded-lg border border-border bg-card shadow-card p-5">
                <div className="mb-2">
                  <h3 className="font-semibold text-foreground text-sm">Plan dnia</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDateTime(event.startDate)}
                  </p>
                </div>
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Harmonogram będzie dostępny wkrótce.
                </div>
              </div>
            </TabsContent>

            {/* Guests tab */}
            <TabsContent value="guests" className="mt-0">
              {guests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Brak gości. Dodaj gości do tego wydarzenia.</p>
                </div>
              ) : renderGuestsTable(guests)}
            </TabsContent>

            {/* Check-in tab */}
            <TabsContent value="checked" className="mt-0">
              {renderGuestsTable(guests.filter(g => g.status === "checked-in"))}
            </TabsContent>

            {/* Program placeholder */}
            <TabsContent value="program" className="mt-0">
              <div className="text-center py-12 text-muted-foreground text-sm">
                Program będzie dostępny wkrótce.
              </div>
            </TabsContent>

            {/* Security placeholder */}
            <TabsContent value="security" className="mt-0">
              <div className="text-center py-12 text-muted-foreground text-sm">
                Konfiguracja bezpieczeństwa będzie dostępna wkrótce.
              </div>
            </TabsContent>

            {/* Media verification tab */}
            <TabsContent value="verification" className="mt-0">
              {eventId && <MediaVerificationPanel eventId={eventId} />}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-lg bg-primary hover:bg-primary/90 glow-accent gap-1.5"
              onClick={() => navigate("/scanner")}
            >
              <ScanLine className="h-4 w-4" />
              Otwórz skaner
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg shrink-0" onClick={() => navigate("/notifications")}>
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edytuj wydarzenie
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePublish}>
                  <Globe className="h-4 w-4 mr-2" /> {event.isPublished ? "Cofnij publikację" : "Opublikuj"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteEvent} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Usuń wydarzenie
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Public link */}
          {landingSlug && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Publiczny link akredytacji
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12px] text-muted-foreground truncate font-mono">
                    {`${window.location.host}/${landingSlug}`}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg shrink-0"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${landingSlug}`); toast.success("Skopiowano link"); }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Aktywne · zamknięcie:{" "}
                {formatDateTime(event.endDate || event.startDate)}
              </p>
            </div>
          )}

          {/* Activity feed */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Aktywność</p>
            <div className="space-y-2.5">
              {guests.slice(0, 5).map(g => (
                <div key={g.id} className="flex items-start gap-2 text-[12px]">
                  <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                    g.status === "checked-in" ? "bg-success" :
                    g.status === "confirmed"  ? "bg-info"    : "bg-muted-foreground/40"
                  )} />
                  <div>
                    <span className="font-medium text-foreground">{g.firstName} {g.lastName[0]}.</span>{" "}
                    <span className="text-muted-foreground">
                      {g.status === "checked-in" ? "wszedł/a" : g.status === "confirmed" ? "zatwierdzona akredytacja" : "zaproszona"}
                    </span>
                  </div>
                </div>
              ))}
              {guests.length === 0 && (
                <p className="text-[12px] text-muted-foreground/60">Brak aktywności</p>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-2">
            {features.landingPageBuilder && (
              <Button variant="outline" size="sm" className="rounded-lg justify-start gap-2" onClick={() => navigate(`/landing-page/${eventId}`)}>
                <Globe className="h-3.5 w-3.5" /> Strona publiczna
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-lg justify-start gap-2" onClick={() => navigate("/invitation-editor")}>
              <Bell className="h-3.5 w-3.5" /> Zaproszenia
            </Button>
          </div>
        </div>
      </div>

      {/* QR dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-lg border-border shadow-card" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Kod QR gościa</DialogTitle>
          </DialogHeader>
          {currentQRGuest && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border border-border">
                {currentQRGuest.qrCode
                  ? <img src={qrToDataURL(currentQRGuest.qrCode, 192)} alt="Kod QR gościa" className="h-48 w-48" />
                  : <div className="h-48 w-48 grid place-items-center text-xs text-muted-foreground">Brak kodu</div>}
              </div>
              <div className="text-center">
                <h3 className="font-medium">{currentQRGuest.firstName} {currentQRGuest.lastName}</h3>
                <p className="text-sm text-muted-foreground">{currentQRGuest.email}</p>
                {currentQRGuest.company && <p className="text-sm text-muted-foreground">{currentQRGuest.company}</p>}
                {currentQRGuest.qrCode &&
                  <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs tracking-wider">{currentQRGuest.qrCode}</code>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit event dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[760px] rounded-lg border-border shadow-card max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl">Edytuj wydarzenie</DialogTitle>
          </DialogHeader>
          <EventForm event={event} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} isSubmitting={isSaving} />
        </DialogContent>
      </Dialog>

      <GuestDetails guest={selectedGuest} open={guestDetailsOpen} onOpenChange={setGuestDetailsOpen} />
    </div>
  );
};

export default EventDetails;
