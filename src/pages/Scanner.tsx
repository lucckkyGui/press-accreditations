import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { QrCode, Wifi, WifiOff, CheckCircle, XCircle, Clock, ChevronDown, Camera } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Event, Guest } from "@/types";
import { processLocalQrScan } from "@/services/scanner/localQrScanService";
import type { LocalQrScanResult } from "@/services/scanner/localQrScanService";
import { getOrCreateDeviceId } from "@/lib/db/localDb";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CameraPreview from "@/components/scanner/CameraPreview";
import OfflineEventManifestCard from "@/components/scanner/OfflineEventManifestCard";

type ScanEntry = LocalQrScanResult & { _id: string };

const GATES = ["Bramka A · Wejście główne", "Bramka B · Wejście boczne", "Wejście VIP", "Backstage"];
const CAMERAS = ["Kamera: Tylna", "Kamera: Przednia"];

const statusOf = (s: LocalQrScanResult["status"]) => {
  if (s === "found") return "ok";
  if (s === "already_checked_in_locally") return "warn";
  return "bad";
};

const StatusBadge = ({ status }: { status: LocalQrScanResult["status"] }) => {
  const t = statusOf(status);
  if (t === "ok")   return <span className="text-[10px] font-bold tabular-nums text-success">OK</span>;
  if (t === "warn") return <span className="text-[10px] font-bold tabular-nums text-warning">WARN</span>;
  return <span className="text-[10px] font-bold tabular-nums text-destructive">BAD</span>;
};

const StatusDot = ({ status }: { status: LocalQrScanResult["status"] }) => {
  const t = statusOf(status);
  return (
    <span className={cn("h-2 w-2 rounded-full shrink-0",
      t === "ok"   ? "bg-success" :
      t === "warn" ? "bg-warning" : "bg-destructive"
    )} />
  );
};

const Scanner = () => {
  usePageTitle("Skaner check-in");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualQr, setManualQr] = useState("");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gate, setGate] = useState(GATES[0]);
  const [camera, setCamera] = useState(CAMERAS[0]);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [lastScan, setLastScan] = useState<ScanEntry | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);
  const sessionStart = useRef(Date.now());
  const manualRef = useRef<HTMLInputElement>(null);

  // Tempo (scans per hour)
  const elapsed = (Date.now() - sessionStart.current) / 3600000;
  const tempo = elapsed > 0 ? Math.round(sessionCount / elapsed) : 0;

  // Online status
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Fetch events + device ID
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("start_date", { ascending: false });
      if (data) {
        const mapped: Event[] = data.map(e => ({
          id: e.id, name: e.title, description: e.description || "",
          location: e.location || "", startDate: new Date(e.start_date),
          endDate: new Date(e.end_date), isPublished: e.is_published || false,
          organizationId: e.organizer_id || "", organizerId: e.organizer_id || "",
          category: e.category || "", imageUrl: e.image_url || "",
          maxGuests: e.max_guests || 0,
          createdAt: new Date(e.created_at || ""), updatedAt: new Date(e.updated_at || ""),
          createdBy: e.organizer_id || "",
        }));
        setEvents(mapped);
        if (mapped.length > 0) setSelectedEvent(mapped[0]);
      }
      const did = await getOrCreateDeviceId();
      setDeviceId(did);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "m" || e.key === "M") { e.preventDefault(); manualRef.current?.focus(); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); setLastScan(null); }
      if (e.key === "Escape") { setScanning(false); setCameraActive(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleScanResult = useCallback((result: LocalQrScanResult) => {
    const entry: ScanEntry = { ...result, _id: crypto.randomUUID() };
    setLastScan(entry);
    setScanHistory(prev => [entry, ...prev].slice(0, 50));
    setSessionCount(prev => prev + 1);
    if (result.status !== "found") setRejectCount(prev => prev + 1);
    if (result.status === "found") {
      toast.success(result.message);
    } else if (result.status === "already_checked_in_locally") {
      toast.warning(result.message);
    } else {
      toast.error(result.message);
    }
  }, []);

  const processQr = useCallback(async (payload: string) => {
    if (isProcessing || !selectedEvent) return;
    const p = payload.trim();
    if (!p) return;
    setIsProcessing(true);
    try {
      const result = await processLocalQrScan({
        eventId: selectedEvent.id,
        qrPayload: p,
        deviceId: deviceId ?? undefined,
      });
      handleScanResult(result);
      setManualQr("");
      setScanning(false);
      setCameraActive(false);
    } catch {
      toast.error("Błąd przetwarzania skanu");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, selectedEvent, deviceId, handleScanResult]);

  const visibleHistory = showOnlyErrors
    ? scanHistory.filter(s => statusOf(s.status) !== "ok")
    : scanHistory;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const lastScanToneClass = lastScan
    ? statusOf(lastScan.status) === "ok"   ? "border-success/40 bg-success/10"
    : statusOf(lastScan.status) === "warn" ? "border-warning/40 bg-warning/10"
    : "border-destructive/40 bg-destructive/10"
    : "border-border bg-card";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -mx-4 md:-mx-6 lg:-mx-8 overflow-hidden">

      {/* ── Top control bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/95 backdrop-blur shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          {scanning ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-success">
              <span className="h-2 w-2 rounded-full bg-success pulse-live" />
              SKANOWANIE · 18 fps
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              GOTOWY
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border" />

        <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", isOnline ? "text-success" : "text-warning")}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? "ONLINE · OFFLINE-READY" : "OFFLINE"}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Gate selector */}
        <Select value={gate} onValueChange={setGate}>
          <SelectTrigger className="h-7 text-[11px] border-border/50 bg-transparent rounded-lg gap-1 pr-2 pl-3 w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GATES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Camera selector */}
        <Select value={camera} onValueChange={setCamera}>
          <SelectTrigger className="h-7 text-[11px] border-border/50 bg-transparent rounded-lg gap-1 pr-2 pl-3 w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMERAS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Event selector */}
        <div className="ml-auto">
          <Select
            value={selectedEvent?.id || ""}
            onValueChange={val => {
              const ev = events.find(e => e.id === val);
              if (ev) { setSelectedEvent(ev); setLastScan(null); setScanHistory([]); }
            }}
          >
            <SelectTrigger className="h-7 text-[11px] border-border/50 bg-transparent rounded-lg gap-1 pr-2 pl-3 max-w-[200px]">
              <SelectValue placeholder="Wybierz wydarzenie" />
            </SelectTrigger>
            <SelectContent>
              {events.map(ev => <SelectItem key={ev.id} value={ev.id} className="text-xs">{ev.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left: viewfinder ── */}
        <div className="flex-1 flex flex-col relative bg-[#060609] border-r border-border">
          {/* Viewfinder area */}
          <div className="flex-1 flex items-center justify-center relative p-8">
            {scanning && cameraActive ? (
              <div className="w-full max-w-sm mx-auto">
                <CameraPreview
                  scanning={scanning}
                  cameraActive={cameraActive}
                  onStartScanning={() => { setScanning(true); setCameraActive(true); }}
                  onStopScanning={() => { setScanning(false); setCameraActive(false); }}
                  onQrCodeDetected={payload => void processQr(payload)}
                />
              </div>
            ) : (
              <div className="relative w-72 h-72">
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div key={i} className={cn("absolute h-10 w-10 border-primary/60", cls)} />
                ))}

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="text-[11px] text-white/40 text-center px-4 leading-relaxed">
                    Wyceluj QR w okno · automatyczna detekcja
                  </div>
                  {/* RFID status */}
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success pulse-live" />
                      RFID: POŁĄCZONY
                    </span>
                    <span className="text-white/30">|</span>
                    <span className="text-white/40">tryb ręczny</span>
                  </div>
                  <Button
                    className="rounded-lg bg-primary hover:bg-primary/90 glow-accent gap-2"
                    onClick={() => { setScanning(true); setCameraActive(true); }}
                    disabled={!selectedEvent || !deviceId}
                  >
                    <Camera className="h-4 w-4" />
                    Uruchom kamerę
                  </Button>
                </div>
              </div>
            )}

            {/* Last success indicator (top right of viewfinder) */}
            {lastScan && (
              <div className="absolute top-4 right-4 text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Ostatni sukces</div>
                <div className="text-sm font-mono text-foreground">
                  {lastScan.elapsedMs}ms temu
                </div>
              </div>
            )}
          </div>

          {/* Manual QR input at bottom of viewfinder */}
          <div className="p-4 border-t border-border/40">
            <form
              onSubmit={e => { e.preventDefault(); void processQr(manualQr); }}
              className="flex gap-2"
            >
              <Input
                ref={manualRef}
                value={manualQr}
                onChange={e => setManualQr(e.target.value)}
                placeholder="Wpisz lub wklej kod QR..."
                className="rounded-lg bg-card/50 border-border/50 text-sm h-9"
                disabled={isProcessing || !selectedEvent}
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-lg h-9 shrink-0"
                disabled={isProcessing || !manualQr.trim()}
              >
                Sprawdź
              </Button>
            </form>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-[360px] shrink-0 flex flex-col bg-background border-l border-border">

          {/* Stats header */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { label: "SESJA",    value: sessionCount, sub: `od ${new Date(sessionStart.current).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` },
              { label: "TEMPO",    value: `${tempo}/h`,  sub: "+12% śr." },
              { label: "ODRZUC.", value: rejectCount,   sub: rejectCount > 0 ? `${Math.round(rejectCount / Math.max(sessionCount, 1) * 100)}%` : "—", warn: rejectCount > 0 },
            ].map(stat => (
              <div key={stat.label} className="px-4 py-3 space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                <div className={cn("text-2xl font-bold tabular-nums", stat.warn ? "text-destructive" : "text-foreground")}>
                  {stat.value}
                </div>
                <div className={cn("text-[11px]", stat.warn ? "text-destructive/70" : "text-muted-foreground")}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Scan stream header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-[11px] font-semibold text-foreground">
              Strumień skanów
              <span className="text-muted-foreground font-normal ml-1">· ostatnie 50</span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowOnlyErrors(false)}
                className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors",
                  !showOnlyErrors ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setShowOnlyErrors(true)}
                className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors",
                  showOnlyErrors ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tylko błędy
              </button>
            </div>
          </div>

          {/* Stream entries */}
          <div className="flex-1 overflow-y-auto">
            {visibleHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40">
                <QrCode className="h-8 w-8 mb-2" />
                <p className="text-xs">Brak skanów w tej sesji</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {visibleHistory.map(entry => (
                  <div key={entry._id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5 w-14">
                      {new Date(entry.scannedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                    <StatusDot status={entry.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {entry.guest ? `${entry.guest.firstName} ${entry.guest.lastName}` : "Anonim"}
                        </span>
                        <StatusBadge status={entry.status} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {entry.status === "found" ? `OK · ${entry.guest?.ticketType || ""}` :
                         entry.status === "already_checked_in_locally" ? "Powtórny scan · ignor." :
                         entry.status === "wrong_event" ? "QR wygasł · Złe wydarzenie" :
                         "Nieznany QR"}
                        {entry.guest?.zones?.length ? ` · ${entry.guest.zones.join(" · ")}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last scan confirmation */}
          {lastScan && (
            <div className={cn("border-t border-border p-4 transition-colors", lastScanToneClass)}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  statusOf(lastScan.status) === "ok"   ? "bg-success text-white" :
                  statusOf(lastScan.status) === "warn" ? "bg-warning text-white" : "bg-destructive text-white"
                )}>
                  {statusOf(lastScan.status) === "ok" ? <CheckCircle className="h-5 w-5" /> :
                   statusOf(lastScan.status) === "warn" ? <Clock className="h-5 w-5" /> :
                   <XCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                    {statusOf(lastScan.status) === "ok" ? `CHECK-IN POTWIERDZONY · ${new Date(lastScan.scannedAt).toLocaleTimeString("pl-PL")}` :
                     statusOf(lastScan.status) === "warn" ? "POWTÓRNY SKAN" : "ODMOWA WEJŚCIA"}
                  </div>
                  <div className="font-bold text-foreground">
                    {lastScan.guest ? `${lastScan.guest.firstName} ${lastScan.guest.lastName}` : "Nieznany gość"}
                  </div>
                  {lastScan.guest && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {lastScan.guest.company && `${lastScan.guest.company} · `}
                        {lastScan.guest.zones?.join(" · ")}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">RFID–{lastScan.clientScanId.slice(-4).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Keyboard shortcuts bar ── */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-background/95 text-[11px] text-muted-foreground shrink-0">
        <span><span className="kbd">M</span> Manual</span>
        <span><span className="kbd">R</span> Reskan</span>
        <span><span className="kbd">Esc</span> Zatrzymaj</span>
        <span className="ml-auto font-mono opacity-50">v2.4 · {isOnline ? "online" : "offline"}</span>
      </div>
    </div>
  );
};

export default Scanner;
