/**
 * UnifiedQRScanner.tsx — przepisany layout zgodny z mockupem
 * "Check-in skaner · live".
 *
 * Logika pozostaje 1:1: dexie (localDb), processLocalQrScan, useEffects,
 * settings, manual scan form. Zmienia się TYLKO struktura renderowania:
 *
 *  - Lewa kolumna: pełnoekranowy viewfinder (corner brackets + scan laser)
 *    + last-scan card pod spodem.
 *  - Prawa kolumna: stats strip + scan stream live log + keyboard footer.
 *
 * Wszystko używa istniejących komponentów (CameraPreview, ScannerSettings,
 * OfflineEventManifestCard, OfflineEmergencyExportPanel) — bez zmian w API.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ChevronDown, Clock, MapPin, QrCode, Smartphone, Wifi, WifiOff, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Event, Guest } from "@/types";
import CameraPreview from "./CameraPreview";
import OfflineEventManifestCard from "./OfflineEventManifestCard";
import ScannerSettings from "./ScannerSettings";
import OfflineEmergencyExportPanel from "@/components/offline/OfflineEmergencyExportPanel";
import { getOrCreateDeviceId, getSyncMetaValue, localDb, setSyncMetaValue } from "@/lib/db/localDb";
import type { Json } from "@/integrations/supabase/types";
import type { LocalQrScanResult } from "@/services/scanner/localQrScanService";
import { processLocalQrScan } from "@/services/scanner/localQrScanService";
import { isAudioSupported, playSound } from "@/utils/soundEffects";
import "./QRScanner.css";

// ─── Types & constants (bez zmian) ─────────────────────────────
interface UnifiedQRScannerProps {
  event: Event;
  onGuestCheckedIn?: (guest: Guest) => void;
}

interface ScannerSettingsState {
  autoScan: boolean;
  hapticFeedback: boolean;
  playSound: boolean;
  frontCamera: boolean;
  flashlight: boolean;
}

interface LocalScannerMeta {
  pendingCount: number;
  manifestGuestCount: number | null;
}

const SCANNER_SETTINGS_KEY = "scannerSettings";

const DEFAULT_SCANNER_SETTINGS: ScannerSettingsState = {
  autoScan: false,
  hapticFeedback: true,
  playSound: true,
  frontCamera: false,
  flashlight: false,
};

const isJsonRecord = (value: Json | null): value is { [key: string]: Json | undefined } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeScannerSettings = (value: Json | null): Partial<ScannerSettingsState> => {
  if (!isJsonRecord(value)) return {};
  return {
    ...(typeof value.autoScan === "boolean" ? { autoScan: value.autoScan } : {}),
    ...(typeof value.hapticFeedback === "boolean" ? { hapticFeedback: value.hapticFeedback } : {}),
    ...(typeof value.playSound === "boolean" ? { playSound: value.playSound } : {}),
    ...(typeof value.frontCamera === "boolean" ? { frontCamera: value.frontCamera } : {}),
    ...(typeof value.flashlight === "boolean" ? { flashlight: value.flashlight } : {}),
  };
};

const serializeScannerSettings = (settings: ScannerSettingsState): Json => ({
  autoScan: settings.autoScan,
  hapticFeedback: settings.hapticFeedback,
  playSound: settings.playSound,
  frontCamera: settings.frontCamera,
  flashlight: settings.flashlight,
});

const isScannerSettingKey = (key: string): key is keyof ScannerSettingsState => key in DEFAULT_SCANNER_SETTINGS;

const STATUS_TONE = (status: LocalQrScanResult["status"]) => {
  switch (status) {
    case "found":                       return "ok";
    case "already_checked_in_locally":  return "warn";
    case "wrong_event":
    case "unknown":                     return "bad";
  }
};

const STATUS_LABELS: Record<LocalQrScanResult["status"], string> = {
  found:                       "OK",
  already_checked_in_locally:  "Już wszedł",
  wrong_event:                 "Złe wydarzenie",
  unknown:                     "Nieznany",
};

const STATUS_KIND: Record<LocalQrScanResult["status"], "ok" | "warn" | "bad"> = {
  found:                       "ok",
  already_checked_in_locally:  "warn",
  wrong_event:                 "bad",
  unknown:                     "bad",
};

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// ─── Component ─────────────────────────────────────────────────
const UnifiedQRScanner = ({ event, onGuestCheckedIn }: UnifiedQRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualQrPayload, setManualQrPayload] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ScannerSettingsState>(DEFAULT_SCANNER_SETTINGS);
  const [lastScanResult, setLastScanResult] = useState<LocalQrScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<LocalQrScanResult[]>([]);
  const [localMeta, setLocalMeta] = useState<LocalScannerMeta>({ pendingCount: 0, manifestGuestCount: null });

  const shortDeviceId = useMemo(() => deviceId?.slice(0, 8) ?? "........", [deviceId]);

  // ─── Effects (bez zmian semantycznie) ──────────────────────
  const refreshLocalMeta = useCallback(async () => {
    const [manifest, pendingCount] = await Promise.all([
      localDb.eventManifest.get(event.id),
      localDb.scanQueue.where("eventId").equals(event.id).and((entry) => entry.status === "pending").count(),
    ]);
    setLocalMeta({ pendingCount, manifestGuestCount: manifest?.guestCount ?? null });
  }, [event.id]);

  useEffect(() => {
    let active = true;
    Promise.all([getOrCreateDeviceId(), getSyncMetaValue<Json>(SCANNER_SETTINGS_KEY), refreshLocalMeta()])
      .then(([nextDeviceId, storedSettings]) => {
        if (!active) return;
        setDeviceId(nextDeviceId);
        setSettings((s) => ({ ...s, ...normalizeScannerSettings(storedSettings) }));
      })
      .catch(() => toast.error("Nie udało się przygotować lokalnego skanera"));
    return () => { active = false; };
  }, [refreshLocalMeta]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    setLastScanResult(null);
    setScanHistory([]);
    setManualQrPayload("");
    void refreshLocalMeta();
  }, [event.id, refreshLocalMeta]);

  const performFeedback = useCallback((success: boolean) => {
    if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(success ? [100, 50, 100] : [300]);
    if (settings.playSound && isAudioSupported()) playSound(success ? "success" : "error").catch(() => undefined);
  }, [settings.hapticFeedback, settings.playSound]);

  const startScanning = useCallback(() => {
    setScanning(true); setCameraActive(true); setLastScanResult(null);
    if (settings.playSound && isAudioSupported()) playSound("scan").catch(() => undefined);
  }, [settings.playSound]);

  const stopScanning = useCallback(() => { setScanning(false); setCameraActive(false); }, []);

  const updateSetting = useCallback((key: string, value: boolean) => {
    if (!isScannerSettingKey(key)) return;
    setSettings((s) => {
      const next = { ...s, [key]: value };
      void setSyncMetaValue(SCANNER_SETTINGS_KEY, serializeScannerSettings(next));
      return next;
    });
  }, []);

  const handleScanResult = useCallback((result: LocalQrScanResult) => {
    setLastScanResult(result);
    setScanHistory((h) => [result, ...h.slice(0, 49)]);
    const ok = result.status === "found";
    performFeedback(ok);
    if (ok && result.guest) { toast.success(result.message); onGuestCheckedIn?.(result.guest); return; }
    if (result.status === "already_checked_in_locally") { toast.warning(result.message); return; }
    toast.error(result.message);
  }, [onGuestCheckedIn, performFeedback]);

  const processQrPayload = useCallback(async (qrPayload: string) => {
    if (isProcessing) return;
    const payload = qrPayload.trim();
    if (!payload) { toast.error("Wprowadź lub zeskanuj kod QR"); return; }
    setIsProcessing(true); setScanning(false); setCameraActive(false);
    try {
      const result = await processLocalQrScan({ eventId: event.id, qrPayload: payload, deviceId: deviceId ?? undefined });
      handleScanResult(result);
      setManualQrPayload("");
      void refreshLocalMeta();
      if (settings.autoScan) window.setTimeout(() => { setLastScanResult(null); startScanning(); }, 1200);
    } catch {
      performFeedback(false);
      toast.error("Nie udało się zapisać skanu lokalnie");
    } finally {
      setIsProcessing(false);
    }
  }, [deviceId, event.id, handleScanResult, isProcessing, performFeedback, refreshLocalMeta, settings.autoScan, startScanning]);

  const submitManualScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void processQrPayload(manualQrPayload);
  };

  // Keyboard shortcuts (M = manual focus, R = restart scan)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "m" || e.key === "M") { document.querySelector<HTMLInputElement>('[data-testid="manual-qr-input"]')?.focus(); }
      if (e.key === "r" || e.key === "R") { stopScanning(); window.setTimeout(startScanning, 60); }
      if (e.key === "Escape") stopScanning();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [startScanning, stopScanning]);

  // Derived
  const sessionCount = scanHistory.filter((r) => r.status === "found").length;
  const denialsCount = scanHistory.filter((r) => r.status !== "found" && r.status !== "already_checked_in_locally").length;
  const sessionRate = scanHistory.length
    ? `${Math.round((sessionCount / Math.max(scanHistory.length, 1)) * 100)}%`
    : "—";

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top utility cards — bez zmian */}
      <OfflineEventManifestCard event={event} />
      <OfflineEmergencyExportPanel eventId={event.id} eventName={event.name} compact />

      {/* MAIN 2-col split */}
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr] min-h-[640px]">
        {/* ── LEFT: viewfinder + last scan ─────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <h2 className="display text-xl m-0 mr-2">Check-in skaner</h2>
            <span className="chip chip-ok">
              <span className="chip-dot pulse-live" />
              <span className="mono">ONLINE · OFFLINE-READY</span>
            </span>
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="rounded-md gap-1 h-8 text-[12px]">
              <MapPin className="h-3 w-3" /> {event.location || "Bramka A"} <ChevronDown className="h-3 w-3" />
            </Button>
            <ScannerSettings settings={settings} onSettingChange={updateSetting} />
          </div>

          {/* Viewfinder */}
          <div
            className="relative flex-1 rounded-xl overflow-hidden border border-hairline-2 grid-bg-sm min-h-[460px]"
            style={{
              background:
                "radial-gradient(80% 60% at 50% 40%, hsl(var(--primary) / 0.10), transparent 70%), " +
                "linear-gradient(180deg, #0a0a0c, #050507)",
            }}
          >
            {/* Corner brackets */}
            {(["tl", "tr", "bl", "br"] as const).map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={[
                  "absolute w-[30px] h-[30px] border-primary",
                  pos === "tl" && "top-[22%] left-[22%] border-l-2 border-t-2 rounded-tl-md",
                  pos === "tr" && "top-[22%] right-[22%] border-r-2 border-t-2 rounded-tr-md",
                  pos === "bl" && "bottom-[22%] left-[22%] border-l-2 border-b-2 rounded-bl-md",
                  pos === "br" && "bottom-[22%] right-[22%] border-r-2 border-b-2 rounded-br-md",
                ].filter(Boolean).join(" ")}
                style={{ boxShadow: "0 0 16px hsl(var(--primary))" }}
              />
            ))}

            {/* Camera preview / placeholder */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] aspect-square">
              {scanning ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm">
                  <CameraPreview
                    scanning={scanning}
                    cameraActive={cameraActive}
                    onStartScanning={startScanning}
                    onStopScanning={stopScanning}
                    onQrCodeDetected={(qrPayload) => void processQrPayload(qrPayload)}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full rounded-lg flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-center gap-3">
                  <QrCode className="h-9 w-9 text-muted-foreground" />
                  <Button onClick={startScanning} size="sm" className="rounded-md bg-primary hover:bg-primary/90 glow-accent gap-1.5" disabled={isProcessing || !deviceId}>
                    <Smartphone className="h-3.5 w-3.5" /> Rozpocznij skanowanie
                  </Button>
                  <span className="kbd">spacja</span>
                </div>
              )}
            </div>

            {/* Scan laser when scanning */}
            {scanning && <span className="scanner-laser" />}

            {/* Top-left status pill */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur border border-hairline-2">
              <span className={`h-1.5 w-1.5 rounded-full ${scanning ? "bg-success pulse-live" : "bg-muted-foreground"}`} />
              <span className="mono text-[11px] text-foreground tracking-wider">
                {scanning ? "SKANOWANIE · 18 fps" : "GOTOWY"}
              </span>
            </div>

            {/* Top-right last scan ts */}
            {lastScanResult && (
              <div className="absolute top-4 right-4 text-right">
                <div className="mono text-[10.5px] text-muted-foreground">OSTATNI</div>
                <div className="mono text-[13px] text-foreground mt-0.5">{fmtTime(lastScanResult.scannedAt)}</div>
              </div>
            )}

            {/* Bottom hint bar */}
            <div className="absolute left-1/2 bottom-5 -translate-x-1/2 inline-flex items-center gap-3 px-3.5 py-2 rounded-full bg-black/55 backdrop-blur border border-hairline-2">
              <span className="text-[12px] text-foreground">Wyceluj QR w okno • automatyczna detekcja</span>
              <span className="w-px h-3.5 bg-hairline-2" />
              <span className="mono text-[11px] text-muted-foreground">Online:</span>
              <span className="inline-flex items-center gap-1">
                {isOnline ? <Wifi className="h-3 w-3 text-success" /> : <WifiOff className="h-3 w-3 text-destructive" />}
                <span className={`mono text-[11px] ${isOnline ? "text-success" : "text-destructive"}`}>
                  {isOnline ? "POŁĄCZONY" : "OFFLINE"}
                </span>
              </span>
              <span className="w-px h-3.5 bg-hairline-2" />
              <span className="kbd">M</span>
              <span className="text-[11.5px] text-muted-foreground">tryb ręczny</span>
            </div>
          </div>

          {/* Manual input (collapsed below viewfinder) */}
          <form onSubmit={submitManualScan} className="flex flex-col gap-2 sm:flex-row">
            <Input
              data-testid="manual-qr-input"
              aria-label="Kod QR"
              value={manualQrPayload}
              onChange={(e) => setManualQrPayload(e.target.value)}
              placeholder="Kod QR lub payload JSON (M)"
              disabled={isProcessing || !deviceId}
              className="rounded-md h-9 text-[13px]"
            />
            <Button type="submit" variant="outline" className="rounded-md h-9" disabled={isProcessing || !deviceId} data-testid="manual-qr-submit">
              Sprawdź
            </Button>
          </form>

          {/* Last scan card */}
          {lastScanResult && <LastScanCard result={lastScanResult} />}
        </div>

        {/* ── RIGHT: stats + scan stream + footer ───────── */}
        <aside className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
          {/* Stats strip */}
          <div className="grid grid-cols-3 px-5 py-4 border-b border-border">
            <Stat label="Sesja" value={sessionCount.toString()} sub="od początku" tone="ok" />
            <Stat label="Sukces" value={sessionRate} sub="OK / wszystkie" tone="ok" divider />
            <Stat label="Odrzuc." value={denialsCount.toString()} sub={scanHistory.length ? `${((denialsCount / scanHistory.length) * 100).toFixed(1)}%` : "0%"} tone="bad" divider />
          </div>

          {/* Stream header */}
          <div className="px-5 pt-3 pb-1 flex items-center">
            <h3 className="text-[13px] font-medium text-foreground">Strumień skanów</h3>
            <span className="mono text-[11px] text-muted-foreground ml-2">· ostatnie {scanHistory.length}</span>
            <div className="flex-1" />
            <span className="mono text-[10.5px] text-muted-foreground/70">Device: {shortDeviceId}</span>
          </div>

          {/* Stream */}
          <div className="flex-1 overflow-auto px-5 pb-3">
            {scanHistory.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg py-12 text-center text-[12px] text-muted-foreground mt-2">
                Wynik ostatniego skanu pojawi się tutaj.
              </div>
            ) : (
              scanHistory.map((row, i) => (
                <StreamRow key={`${row.clientScanId ?? i}`} row={row} divider={i > 0} />
              ))
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="px-5 py-3 border-t border-border bg-background flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1.5"><span className="kbd">M</span> manual</span>
              <span className="inline-flex items-center gap-1.5"><span className="kbd">R</span> reskan</span>
              <span className="inline-flex items-center gap-1.5"><span className="kbd">Esc</span> stop</span>
            </div>
            <span className="mono">v2.4.1 · {localMeta.pendingCount} w kolejce sync</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────
function Stat({
  label,
  value,
  sub,
  tone,
  divider = false,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "ok" | "warn" | "bad";
  divider?: boolean;
}) {
  const subColor = tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-destructive";
  return (
    <div className={divider ? "pl-4 border-l border-border/60" : ""}>
      <div className="mono text-[10.5px] tracking-wider uppercase text-muted-foreground">{label}</div>
      <div className="mono text-[22px] text-foreground mt-1 tracking-tight">{value}</div>
      <div className={`mono text-[10.5px] mt-0.5 ${subColor}`}>{sub}</div>
    </div>
  );
}

function LastScanCard({ result }: { result: LocalQrScanResult }) {
  const kind = STATUS_KIND[result.status];
  const palette =
    kind === "ok"
      ? { bg: "bg-success/10", text: "text-success", ring: "ring-success/40", glow: "shadow-[0_0_0_1px_hsl(var(--success)),0_0_24px_hsl(var(--success)/0.4)]" }
      : kind === "warn"
      ? { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/40", glow: "" }
      : { bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/40", glow: "" };

  return (
    <div className="card-glow rounded-xl p-4 relative">
      <div className="flex items-center gap-3 relative">
        <div className={`w-14 h-14 rounded-lg grid place-items-center ${palette.bg} ${palette.glow}`}>
          {kind === "ok" ? (
            <CheckCircle className={`h-6 w-6 ${palette.text}`} strokeWidth={2.2} />
          ) : kind === "warn" ? (
            <Clock className={`h-6 w-6 ${palette.text}`} />
          ) : (
            <XCircle className={`h-6 w-6 ${palette.text}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`mono text-[10.5px] tracking-wider uppercase font-medium ${palette.text}`}>
            {STATUS_LABELS[result.status]} · {fmtTime(result.scannedAt)}
          </div>
          <div className="text-[20px] font-semibold text-foreground mt-0.5 truncate">
            {result.guest ? `${result.guest.firstName} ${result.guest.lastName}` : result.message}
          </div>
          {result.guest && (
            <div className="flex gap-4 mt-1 text-[12px] text-muted-foreground">
              <span><span className="text-muted-foreground/60">Email · </span>{result.guest.email}</span>
              {result.guest.ticketType && <Badge variant="outline" className="rounded-md h-5 text-[10px]">{result.guest.ticketType}</Badge>}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="mono text-[10.5px] text-muted-foreground">Czas</div>
          <div className="mono text-[14px] text-foreground">{result.elapsedMs} ms</div>
        </div>
      </div>
    </div>
  );
}

function StreamRow({ row, divider }: { row: LocalQrScanResult; divider: boolean }) {
  const tone = STATUS_TONE(row.status);
  const dot = tone === "ok" ? "bg-success" : tone === "warn" ? "bg-warning" : "bg-destructive";
  const label = STATUS_LABELS[row.status];
  return (
    <div className={`grid grid-cols-[70px_14px_1fr_auto] gap-2.5 items-center py-2 ${divider ? "border-t border-border/60" : ""}`}>
      <span className="mono text-[10.5px] text-muted-foreground tabular-nums">{fmtTime(row.scannedAt)}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shadow-[0_0_8px_currentColor]`} />
      <div className="min-w-0">
        <div className="text-[12.5px] text-foreground truncate font-medium">
          {row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : row.qrCode || "Nieznany QR"}
        </div>
        <div className={`text-[11px] truncate ${tone === "bad" ? "text-destructive" : "text-muted-foreground"}`}>
          {row.message}
        </div>
      </div>
      <span className={`mono text-[10px] tracking-wider uppercase ${tone === "ok" ? "text-success" : tone === "warn" ? "text-warning" : "text-destructive"}`}>
        {label}
      </span>
    </div>
  );
}

export default UnifiedQRScanner;
