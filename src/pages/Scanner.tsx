import { useState, useEffect, useCallback, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  QrCode, Wifi, WifiOff, CheckCircle, XCircle, Clock, Camera, Search, Ban, ShieldAlert, Loader2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import {
  guestScannerService, type ScanResult, type QrCheckInStatus, type ManualSearchResult,
} from "@/services/scanner/guestScannerService";
import { processLocalQrScan } from "@/services/scanner/localQrScanService";
import { getOrCreateDeviceId } from "@/lib/db/localDb";
import { accessLevelLabel } from "@/lib/accreditation/decisionFlow";
import { createAuditLog } from "@/services/audit/auditService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CameraPreview from "@/components/scanner/CameraPreview";
import OfflineEventManifestCard from "@/components/scanner/OfflineEventManifestCard";

interface ScanRecord {
  _id: string;
  status: QrCheckInStatus;
  message: string;
  name: string | null;
  company: string | null;
  ticketType: string | null;
  accessLevel: string | null;
  code: string | null;
  checkInTime: string | null;
  scannedAt: string;
  elapsedMs: number;
}

const STATUS_META: Record<QrCheckInStatus, { label: string; tone: "ok" | "warn" | "bad"; hint: string }> = {
  success:      { label: "WEJŚCIE OK",      tone: "ok",   hint: "Akredytacja potwierdzona" },
  duplicate:    { label: "DUPLIKAT",        tone: "warn", hint: "Już zeskanowano" },
  invalid:      { label: "NIEZNANY QR",     tone: "bad",  hint: "Brak akredytacji" },
  wrong_event:  { label: "ZŁE WYDARZENIE",  tone: "bad",  hint: "QR z innego eventu" },
  expired:      { label: "WYGASŁE",         tone: "bad",  hint: "Wydarzenie zakończone" },
  revoked:      { label: "COFNIĘTE",        tone: "bad",  hint: "Akredytacja cofnięta" },
  unauthorized: { label: "BRAK UPRAWNIEŃ",  tone: "bad",  hint: "Brak dostępu do skanu" },
};

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

const Scanner = () => {
  usePageTitle("Check-in akredytacji");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualQr, setManualQr] = useState("");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [last, setLast] = useState<ScanRecord | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [admitCount, setAdmitCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);

  // Manual search fallback
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ManualSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const manualRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

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
        const mapped: Event[] = data.map((e) => ({
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
      setDeviceId(await getOrCreateDeviceId());
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const pushResult = useCallback((rec: ScanRecord, success: boolean) => {
    setLast(rec);
    setResultOpen(true); // duży popup wyniku — zostaje aż obsługa kliknie „Skanuj kolejnego"
    setHistory((prev) => [rec, ...prev].slice(0, 20));
    setSessionCount((n) => n + 1);
    if (success) setAdmitCount((n) => n + 1); else setRejectCount((n) => n + 1);
    const tone = STATUS_META[rec.status].tone;
    if (tone === "ok") toast.success(rec.message);
    else if (tone === "warn") toast.warning(rec.message);
    else toast.error(rec.message);
  }, []);

  const auditScan = useCallback((result: ScanResult, eventId: string) => {
    // Audyt dla istotnych zdarzeń: success / revoked / duplicate.
    if (!["success", "revoked", "duplicate"].includes(result.status)) return;
    const name = result.guest ? `${result.guest.firstName} ${result.guest.lastName}` : "—";
    createAuditLog({
      action: `checkin.${result.status}`,
      resource: "guests",
      resource_id: result.guest?.id,
      severity: result.status === "revoked" ? "warning" : "info",
      details: `Check-in ${result.status}: ${name}` + (result.revocationReason ? ` — ${result.revocationReason}` : ""),
      metadata: { event_id: eventId, access_level: result.accessLevel ?? null },
    }).catch((e) => console.error("audit log failed (non-critical):", e));
  }, []);

  const runScan = useCallback(async (payload: string) => {
    if (isProcessing || !selectedEvent || resultOpen) return; // popup otwarty → wstrzymaj nowe skany
    const p = payload.trim();
    if (!p) return;
    setIsProcessing(true);
    const started = performance.now();
    try {
      if (isOnline) {
        // Online-first: pełna walidacja przez RPC (7 statusów).
        const result = await guestScannerService.verifyAndCheckIn(p, selectedEvent.id, {
          source: "scanner", deviceId: deviceId ?? "unknown", online: true,
        });
        const elapsedMs = Math.round(performance.now() - started);
        auditScan(result, selectedEvent.id);
        pushResult({
          _id: crypto.randomUUID(),
          status: result.status,
          message: result.message,
          name: result.guest ? `${result.guest.firstName} ${result.guest.lastName}` : null,
          company: result.guest?.company ?? null,
          ticketType: result.guest?.ticketType ?? null,
          accessLevel: result.accessLevel ?? null,
          code: result.guest?.qrCode ?? p,
          checkInTime: result.checkInTime ?? null,
          scannedAt: new Date().toISOString(),
          elapsedMs,
        }, result.success);
      } else {
        // Offline fallback: lokalny manifest (kolejka sync po sieci).
        const local = await processLocalQrScan({ eventId: selectedEvent.id, qrPayload: p, deviceId: deviceId ?? undefined });
        const map: Record<string, QrCheckInStatus> = {
          found: "success", already_checked_in_locally: "duplicate",
          wrong_event: "wrong_event", revoked: "revoked", unknown: "invalid",
        };
        const status = map[local.status] ?? "invalid";
        pushResult({
          _id: crypto.randomUUID(),
          status,
          message: local.message + " (offline)",
          name: local.guest ? `${local.guest.firstName} ${local.guest.lastName}` : null,
          company: local.guest?.company ?? null,
          ticketType: local.guest?.ticketType ?? null,
          accessLevel: null,
          code: local.qrCode ?? null,
          checkInTime: local.guest?.checkedInAt ? new Date(local.guest.checkedInAt).toISOString() : null,
          scannedAt: local.scannedAt,
          elapsedMs: local.elapsedMs,
        }, status === "success");
      }
      setManualQr("");
      setScanning(false);
      setCameraActive(false);
    } catch {
      toast.error("Błąd przetwarzania skanu");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, selectedEvent, deviceId, isOnline, resultOpen, pushResult, auditScan]);

  const runSearch = useCallback(async (term: string) => {
    if (!selectedEvent || term.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      setSearchResults(await guestScannerService.searchAccreditations(selectedEvent.id, term));
      createAuditLog({
        action: "checkin.manual_search", resource: "guests",
        severity: "info", details: `Manualne wyszukanie: „${term.trim()}"`,
        metadata: { event_id: selectedEvent.id },
      }).catch(() => {});
    } finally {
      setSearching(false);
    }
  }, [selectedEvent]);

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh]"><LoadingSpinner /></div>;
  }

  const lastMeta = last ? STATUS_META[last.status] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -mx-4 md:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/95 backdrop-blur shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          <QrCode className="h-3.5 w-3.5 text-primary" /> Check-in akredytacji
        </div>
        <div className="h-4 w-px bg-border" />
        <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", isOnline ? "text-success" : "text-warning")}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? "ONLINE" : "OFFLINE · kolejka"}
        </div>
        <div className="ml-auto">
          <Select
            value={selectedEvent?.id || ""}
            onValueChange={(val) => {
              const ev = events.find((e) => e.id === val);
              if (ev) { setSelectedEvent(ev); setLast(null); setHistory([]); setSearchResults([]); }
            }}
          >
            <SelectTrigger className="h-7 text-[11px] border-border/50 bg-transparent rounded-lg gap-1 pr-2 pl-3 max-w-[220px]">
              <SelectValue placeholder="Wybierz wydarzenie" />
            </SelectTrigger>
            <SelectContent>
              {events.map((ev) => <SelectItem key={ev.id} value={ev.id} className="text-xs">{ev.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left: viewfinder + manual */}
        <div className="flex-1 min-h-0 flex flex-col relative bg-[#060609] border-b md:border-r md:border-b-0 border-border">
          <div className="flex-1 flex items-center justify-center relative p-8">
            {scanning && cameraActive ? (
              <div className="w-full max-w-sm mx-auto">
                <CameraPreview
                  scanning={scanning}
                  cameraActive={cameraActive}
                  onStartScanning={() => { setScanning(true); setCameraActive(true); }}
                  onStopScanning={() => { setScanning(false); setCameraActive(false); }}
                  onQrCodeDetected={(payload) => void runScan(payload)}
                />
              </div>
            ) : (
              <div className="relative w-72 h-72">
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => <div key={i} className={cn("absolute h-10 w-10 border-primary/60", cls)} />)}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="text-[11px] text-white/40 text-center px-4">Wyceluj QR akredytacji w okno</div>
                  <Button
                    className="rounded-lg bg-primary hover:bg-primary/90 gap-2"
                    onClick={() => { setScanning(true); setCameraActive(true); }}
                    disabled={!selectedEvent || !deviceId}
                  >
                    <Camera className="h-4 w-4" /> Uruchom kamerę
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Pełnoekranowy popup wyniku — zostaje aż obsługa kliknie „Skanuj kolejnego" */}
          {resultOpen && last && lastMeta && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
              role="alertdialog"
              aria-modal="true"
              aria-label={lastMeta.label}
            >
              <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-card">
                {/* Header: mocny kolor wyniku (funkcjonalny przy drzwiach) */}
                <div className={cn(
                  "flex flex-col items-center gap-2 px-6 pt-6 pb-5 text-center",
                  lastMeta.tone === "ok" ? "bg-success/15 text-success"
                    : lastMeta.tone === "warn" ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive",
                )}>
                  {lastMeta.tone === "ok" ? <CheckCircle className="h-16 w-16" />
                    : lastMeta.tone === "warn" ? <Clock className="h-16 w-16" />
                    : last.status === "revoked" ? <Ban className="h-16 w-16" />
                    : last.status === "unauthorized" ? <ShieldAlert className="h-16 w-16" />
                    : <XCircle className="h-16 w-16" />}
                  <div className="text-2xl font-extrabold tracking-tight">{lastMeta.label}</div>
                </div>

                {/* Dane uczestnika */}
                <div className="space-y-1 px-6 py-5 text-center text-foreground">
                  <div className="text-xl font-semibold leading-tight">{last.name ?? "Nieznana akredytacja"}</div>
                  {(last.ticketType || last.accessLevel) && (
                    <p className="text-sm text-muted-foreground">
                      {[last.ticketType, last.accessLevel ? accessLevelLabel(last.accessLevel) : null].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {last.company && <p className="text-sm text-muted-foreground">{last.company}</p>}

                  {lastMeta.tone === "bad" && (
                    <p className="mt-2 text-sm font-medium text-destructive">{last.message || lastMeta.hint}</p>
                  )}
                  {last.status === "duplicate" && last.checkInTime && (
                    <p className="mt-2 text-sm font-medium text-warning">Pierwszy check-in: {formatTime(last.checkInTime)}</p>
                  )}
                  {last.code && (
                    <p className="pt-3 font-mono text-xs tracking-wider text-muted-foreground">kod {last.code}</p>
                  )}
                </div>

                {/* Przycisk zamknięcia → wznawia skaner */}
                <div className="border-t border-border p-4">
                  <Button
                    size="lg"
                    onClick={() => { setResultOpen(false); setScanning(true); setCameraActive(true); }}
                    className="w-full gap-2"
                  >
                    <Camera className="h-4 w-4" /> Skanuj kolejnego
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Manual QR input — solidne tło + obramowanie, by nigdy nie zlewało się ze statystykami */}
          <div className="border-t border-border bg-card p-4">
            <form onSubmit={(e) => { e.preventDefault(); void runScan(manualQr); }} className="flex gap-2">
              <Input
                ref={manualRef}
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value)}
                placeholder="Wpisz lub wklej token QR…"
                className="h-10 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground"
                disabled={isProcessing || !selectedEvent}
              />
              <Button type="submit" variant="outline" size="sm" className="h-10 rounded-lg shrink-0"
                disabled={isProcessing || !manualQr.trim()}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sprawdź"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right panel: stats + manual search + last 20 */}
        <div className="w-full md:w-[360px] md:shrink-0 flex flex-col bg-background border-t md:border-l md:border-t-0 border-border max-h-[45vh] md:max-h-none min-h-0">
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { label: "SKANY", value: sessionCount, warn: false },
              { label: "WEJŚCIA", value: admitCount, warn: false },
              { label: "ODMOWY", value: rejectCount, warn: rejectCount > 0 },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className={cn("text-2xl font-bold tabular-nums", s.warn ? "text-destructive" : "text-foreground")}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Offline manifest: auto-prefetch + status dla obsługi bramki */}
          {selectedEvent && (
            <div className="border-b border-border p-3">
              <OfflineEventManifestCard event={selectedEvent} />
            </div>
          )}

          {/* Manual search fallback */}
          <div className="border-b border-border p-3">
            <form onSubmit={(e) => { e.preventDefault(); void runSearch(searchTerm); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Szukaj: nazwisko / e-mail / medium"
                  className="h-8 text-xs pl-8 rounded-lg"
                  disabled={!selectedEvent}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-8 rounded-lg shrink-0" disabled={searching || searchTerm.trim().length < 2}>
                {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Szukaj"}
              </Button>
            </form>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setManualQr(r.qrCode); void runScan(r.qrCode); setSearchResults([]); setSearchTerm(""); }}
                    className="w-full text-left rounded-lg border border-border/60 px-2.5 py-1.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">{r.firstName} {r.lastName}</span>
                      {r.checkedInAt
                        ? <span className="text-[10px] text-warning shrink-0">obecny</span>
                        : r.status === "revoked"
                          ? <span className="text-[10px] text-destructive shrink-0">cofnięta</span>
                          : <span className="text-[10px] text-success shrink-0">check-in</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {r.company ? `${r.company} · ` : ""}{r.accessLevel ? accessLevelLabel(r.accessLevel) : r.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Last 20 scans */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-[11px] font-semibold text-foreground">
              Ostatnie skany <span className="text-muted-foreground font-normal ml-1">· 20</span>
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40">
                <QrCode className="h-8 w-8 mb-2" />
                <p className="text-xs">Brak skanów w tej sesji</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {history.map((entry) => {
                  const meta = STATUS_META[entry.status];
                  return (
                    <div key={entry._id} className="flex items-start gap-3 px-4 py-2.5">
                      <div className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5 w-14">{formatTime(entry.scannedAt)}</div>
                      <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5",
                        meta.tone === "ok" ? "bg-success" : meta.tone === "warn" ? "bg-warning" : "bg-destructive")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{entry.name ?? "Anonim"}</span>
                          <span className={cn("text-[10px] font-bold tabular-nums shrink-0",
                            meta.tone === "ok" ? "text-success" : meta.tone === "warn" ? "text-warning" : "text-destructive")}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {entry.accessLevel ? accessLevelLabel(entry.accessLevel) : meta.hint}
                          {entry.status === "duplicate" && entry.checkInTime ? ` · od ${formatTime(entry.checkInTime)}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
