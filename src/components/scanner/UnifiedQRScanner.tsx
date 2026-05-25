import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { CheckCircle, Clock, MapPin, QrCode, Smartphone, Wifi, WifiOff, XCircle } from "lucide-react";
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
  if (!isJsonRecord(value)) {
    return {};
  }

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

const isScannerSettingKey = (key: string): key is keyof ScannerSettingsState =>
  key in DEFAULT_SCANNER_SETTINGS;

const getStatusTone = (status: LocalQrScanResult["status"]) => {
  switch (status) {
    case "found":
      return "success";
    case "already_checked_in_locally":
      return "warning";
    case "wrong_event":
    case "unknown":
      return "error";
  }
};

const getStatusLabel = (status: LocalQrScanResult["status"]) => {
  switch (status) {
    case "found":
      return "found";
    case "unknown":
      return "unknown";
    case "wrong_event":
      return "wrong_event";
    case "already_checked_in_locally":
      return "already_checked_in_locally";
  }
};

const STATUS_LABELS: Record<LocalQrScanResult["status"], string> = {
  found: "Wpuszczony",
  already_checked_in_locally: "Już zameldowany",
  wrong_event: "Złe wydarzenie",
  unknown: "Nieznany",
};

const getStatusIcon = (status: LocalQrScanResult["status"]) => {
  const tone = getStatusTone(status);
  if (tone === "success") return <CheckCircle className="h-5 w-5 text-success" />;
  if (tone === "warning") return <Clock className="h-5 w-5 text-warning" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
};

const getStatusBadge = (status: LocalQrScanResult["status"]) => {
  if (status === "found") {
    return <Badge className="bg-success/15 text-success border border-success/30">{STATUS_LABELS.found}</Badge>;
  }
  if (status === "already_checked_in_locally") {
    return <Badge variant="secondary">{STATUS_LABELS.already_checked_in_locally}</Badge>;
  }
  return <Badge variant="destructive">{STATUS_LABELS[status]}</Badge>;
};

const getAlertClassName = (status: LocalQrScanResult["status"]) => {
  const tone = getStatusTone(status);
  if (tone === "success") return "border-success/50 bg-success/10";
  if (tone === "warning") return "border-warning/50 bg-warning/10";
  return "border-destructive/50 bg-destructive/10";
};

const formatElapsed = (elapsedMs: number) => `${elapsedMs} ms`;

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
  const [localMeta, setLocalMeta] = useState<LocalScannerMeta>({
    pendingCount: 0,
    manifestGuestCount: null,
  });

  const shortDeviceId = useMemo(() => deviceId?.slice(0, 8) ?? "........", [deviceId]);

  const refreshLocalMeta = useCallback(async () => {
    const [manifest, pendingCount] = await Promise.all([
      localDb.eventManifest.get(event.id),
      localDb.scanQueue.where("eventId").equals(event.id).and((entry) => entry.status === "pending").count(),
    ]);

    setLocalMeta({
      pendingCount,
      manifestGuestCount: manifest?.guestCount ?? null,
    });
  }, [event.id]);

  useEffect(() => {
    let active = true;

    Promise.all([
      getOrCreateDeviceId(),
      getSyncMetaValue<Json>(SCANNER_SETTINGS_KEY),
      refreshLocalMeta(),
    ])
      .then(([nextDeviceId, storedSettings]) => {
        if (!active) return;
        setDeviceId(nextDeviceId);
        setSettings((currentSettings) => ({
          ...currentSettings,
          ...normalizeScannerSettings(storedSettings),
        }));
      })
      .catch(() => {
        toast.error("Nie udało się przygotować lokalnego skanera");
      });

    return () => {
      active = false;
    };
  }, [refreshLocalMeta]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setLastScanResult(null);
    setScanHistory([]);
    setManualQrPayload("");
    void refreshLocalMeta();
  }, [event.id, refreshLocalMeta]);

  const performFeedback = useCallback((success: boolean) => {
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(success ? [100, 50, 100] : [300]);
    }

    if (settings.playSound && isAudioSupported()) {
      playSound(success ? "success" : "error").catch(() => undefined);
    }
  }, [settings.hapticFeedback, settings.playSound]);

  const startScanning = useCallback(() => {
    setScanning(true);
    setCameraActive(true);
    setLastScanResult(null);

    if (settings.playSound && isAudioSupported()) {
      playSound("scan").catch(() => undefined);
    }
  }, [settings.playSound]);

  const stopScanning = useCallback(() => {
    setScanning(false);
    setCameraActive(false);
  }, []);

  const updateSetting = useCallback((key: string, value: boolean) => {
    if (!isScannerSettingKey(key)) {
      return;
    }

    setSettings((currentSettings) => {
      const nextSettings = {
        ...currentSettings,
        [key]: value,
      };

      void setSyncMetaValue(SCANNER_SETTINGS_KEY, serializeScannerSettings(nextSettings));
      return nextSettings;
    });
  }, []);

  const handleScanResult = useCallback((result: LocalQrScanResult) => {
    setLastScanResult(result);
    setScanHistory((currentHistory) => [result, ...currentHistory.slice(0, 9)]);

    const isSuccessfulScan = result.status === "found";
    performFeedback(isSuccessfulScan);

    if (isSuccessfulScan && result.guest) {
      toast.success(result.message);
      onGuestCheckedIn?.(result.guest);
      return;
    }

    if (result.status === "already_checked_in_locally") {
      toast.warning(result.message);
      return;
    }

    toast.error(result.message);
  }, [onGuestCheckedIn, performFeedback]);

  const processQrPayload = useCallback(async (qrPayload: string) => {
    if (isProcessing) return;

    const normalizedPayload = qrPayload.trim();
    if (!normalizedPayload) {
      toast.error("Wprowadź lub zeskanuj kod QR");
      return;
    }

    setIsProcessing(true);
    setScanning(false);
    setCameraActive(false);

    try {
      const result = await processLocalQrScan({
        eventId: event.id,
        qrPayload: normalizedPayload,
        deviceId: deviceId ?? undefined,
      });

      handleScanResult(result);
      setManualQrPayload("");
      void refreshLocalMeta();

      if (settings.autoScan) {
        window.setTimeout(() => {
          setLastScanResult(null);
          startScanning();
        }, 1200);
      }
    } catch {
      performFeedback(false);
      toast.error("Nie udało się zapisać skanu lokalnie");
    } finally {
      setIsProcessing(false);
    }
  }, [
    deviceId,
    event.id,
    handleScanResult,
    isProcessing,
    performFeedback,
    refreshLocalMeta,
    settings.autoScan,
    startScanning,
  ]);

  const submitManualScan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void processQrPayload(manualQrPayload);
  };

  return (
    <div className="space-y-4">
      <OfflineEventManifestCard event={event} />
      <OfflineEmergencyExportPanel eventId={event.id} eventName={event.name} compact />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: scanner controls */}
        <Card className="rounded-lg border-border shadow-card">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Skaner QR — {event.name}
                </CardTitle>
                <CardDescription>
                  Skanowanie zapisuje wynik lokalnie i dodaje wpis do kolejki synchronizacji.
                </CardDescription>
              </div>
              <ScannerSettings settings={settings} onSettingChange={updateSetting} />
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{event.location || "Brak lokalizacji"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{event.startDate.toLocaleDateString("pl-PL")}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {isOnline
                    ? <Wifi className="h-4 w-4 text-success" />
                    : <WifiOff className="h-4 w-4 text-destructive" />}
                  {isOnline ? "Online" : "Offline"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Tryb połączenia</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-sm font-bold tabular-nums">{localMeta.manifestGuestCount ?? "—"}</div>
                <p className="mt-1 text-xs text-muted-foreground">W manifeście</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-sm font-bold tabular-nums">{localMeta.pendingCount}</div>
                <p className="mt-1 text-xs text-muted-foreground">Kolejka sync</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Device: <span className="font-mono">{shortDeviceId}</span>
            </div>

            {scanning ? (
              <CameraPreview
                scanning={scanning}
                cameraActive={cameraActive}
                onStartScanning={startScanning}
                onStopScanning={stopScanning}
                onQrCodeDetected={(qrPayload) => void processQrPayload(qrPayload)}
              />
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={startScanning}
                    size="lg"
                    className="gap-2 rounded-lg bg-primary hover:bg-primary/90 glow-accent"
                    disabled={isProcessing || !deviceId}
                  >
                    <Smartphone className="h-5 w-5" />
                    Rozpocznij skanowanie
                  </Button>
                </div>

                <form onSubmit={submitManualScan} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    data-testid="manual-qr-input"
                    aria-label="Kod QR"
                    value={manualQrPayload}
                    onChange={(inputEvent) => setManualQrPayload(inputEvent.target.value)}
                    placeholder="Kod QR lub payload JSON"
                    disabled={isProcessing || !deviceId}
                    className="rounded-lg"
                  />
                  <Button type="submit" variant="outline" className="rounded-lg" disabled={isProcessing || !deviceId} data-testid="manual-qr-submit">
                    Sprawdź
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: last scan result + history */}
        <div className="space-y-4">
          {lastScanResult ? (
            <Alert
              className={getAlertClassName(lastScanResult.status)}
              data-testid="scan-result"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(lastScanResult.status)}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium">{lastScanResult.message}</span>
                    {getStatusBadge(lastScanResult.status)}
                  </div>

                  {lastScanResult.guest && (
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Gość: </span>
                        <span className="font-medium">{lastScanResult.guest.firstName} {lastScanResult.guest.lastName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        {lastScanResult.guest.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Typ: </span>
                        <Badge variant="outline">{lastScanResult.guest.ticketType}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {new Date(lastScanResult.scannedAt).toLocaleTimeString("pl-PL")} · {formatElapsed(lastScanResult.elapsedMs)}
                  </div>
                </div>
              </div>
            </Alert>
          ) : (
            <div className="rounded-lg border border-border border-dashed p-8 text-center text-muted-foreground">
              <QrCode className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Wynik ostatniego skanu pojawi się tutaj</p>
            </div>
          )}

          {scanHistory.length > 0 && (
            <Card className="rounded-lg border-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Historia skanów</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {scanHistory.map((result) => (
                    <div key={result.clientScanId} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {getStatusIcon(result.status)}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {result.guest
                              ? `${result.guest.firstName} ${result.guest.lastName}`
                              : result.qrCode || "Nieznany QR"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(result.scannedAt).toLocaleTimeString("pl-PL")} · {formatElapsed(result.elapsedMs)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedQRScanner;
