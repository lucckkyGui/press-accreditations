import { useCallback, useEffect, useState } from "react";
import { Activity, Database, HardDrive, RefreshCw, Smartphone, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getOrCreateDeviceId, localDb, type EventManifestRecord } from "@/lib/db/localDb";
import { syncWorker, type SyncWorkerState } from "@/lib/sync/syncWorker";
import OfflineEmergencyExportPanel from "@/components/offline/OfflineEmergencyExportPanel";
import { trackAction } from "@/lib/observability";

interface DiagnosticsState {
  deviceId: string;
  manifests: EventManifestRecord[];
  pendingCount: number;
  failedCount: number;
  syncedCount: number;
  lastSyncedAt: string | null;
  online: boolean;
}

const INITIAL_SYNC_STATE: SyncWorkerState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,
  nextRetryAt: null,
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Brak danych";

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
};

const shortId = (value: string) => `${value.slice(0, 8)}...${value.slice(-6)}`;

const Diagnostics = () => {
  usePageTitle("Diagnostyka offline");
  const [state, setState] = useState<DiagnosticsState | null>(null);
  const [syncState, setSyncState] = useState<SyncWorkerState>(INITIAL_SYNC_STATE);
  const [refreshing, setRefreshing] = useState(false);

  const refreshDiagnostics = useCallback(async () => {
    setRefreshing(true);
    try {
      const [deviceId, manifests, pendingCount, failedCount, syncedCount, workerState] = await Promise.all([
        getOrCreateDeviceId(),
        localDb.eventManifest.toArray(),
        localDb.scanQueue.where("status").equals("pending").count(),
        localDb.scanQueue.where("status").equals("failed").count(),
        localDb.scanQueue.where("status").equals("synced").count(),
        syncWorker.getState(),
      ]);

      setSyncState(workerState);
      setState({
        deviceId,
        manifests,
        pendingCount,
        failedCount,
        syncedCount,
        lastSyncedAt: workerState.lastSyncedAt,
        online: navigator.onLine,
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    syncWorker.start();
    const unsubscribe = syncWorker.subscribe(setSyncState);
    void refreshDiagnostics();

    const intervalId = window.setInterval(() => {
      void refreshDiagnostics();
    }, 10_000);

    const handleConnectivityChange = () => {
      void refreshDiagnostics();
    };
    window.addEventListener("online", handleConnectivityChange);
    window.addEventListener("offline", handleConnectivityChange);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener("online", handleConnectivityChange);
      window.removeEventListener("offline", handleConnectivityChange);
    };
  }, [refreshDiagnostics]);

  const handleSyncNow = async () => {
    trackAction("diagnostics_sync_now");
    const result = await syncWorker.syncNow({ force: true });
    await refreshDiagnostics();

    if (result.failed > 0) {
      toast.warning(`Synchronizacja: ${result.synced} OK, ${result.failed} błędów`);
      return;
    }

    toast.success(result.synced > 0 ? `Zsynchronizowano ${result.synced} skanów` : "Brak skanów do synchronizacji");
  };

  const currentState = state ?? {
    deviceId: "loading",
    manifests: [],
    pendingCount: 0,
    failedCount: 0,
    syncedCount: 0,
    lastSyncedAt: null,
    online: navigator.onLine,
  };

  return (
    <div className="space-y-6" data-testid="diagnostics-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Diagnostyka offline</h1>
          <p className="text-sm text-muted-foreground">
            Stan urządzenia, manifestów i kolejki synchronizacji dla obsługi wydarzenia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDiagnostics} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Odśwież
          </Button>
          <Button onClick={handleSyncNow} disabled={!currentState.online || syncState.isSyncing} className="gap-2" data-testid="diagnostics-sync-now">
            <Wifi className="h-4 w-4" />
            Synchronizuj teraz
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4" />
              Urządzenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm" data-testid="diagnostics-device-id">{shortId(currentState.deviceId)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Stabilny identyfikator IndexedDB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Manifesty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="diagnostics-manifest-count">{currentState.manifests.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Pobrane wydarzenia offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Kolejka
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="diagnostics-pending-count">
              {currentState.pendingCount + currentState.failedCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentState.pendingCount} oczekuje, {currentState.failedCount} do ponowienia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4" />
              Ostatnia synchronizacja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium" data-testid="diagnostics-last-sync">{formatDateTime(currentState.lastSyncedAt)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{currentState.syncedCount} skanów zsynchronizowanych lokalnie</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manifesty wydarzeń</CardTitle>
          <CardDescription>Każdy wpis reprezentuje lokalnie pobraną listę gości.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentState.manifests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak pobranych manifestów na tym urządzeniu.</p>
          ) : (
            currentState.manifests.map((manifest) => (
              <div key={manifest.eventId} className="rounded-lg border p-4" data-testid="diagnostics-manifest-row">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Wydarzenie {shortId(manifest.eventId)}</div>
                    <div className="text-xs text-muted-foreground">Wersja: {manifest.version}</div>
                    <div className="text-xs text-muted-foreground">Pobrano: {formatDateTime(manifest.downloadedAt)}</div>
                  </div>
                  <Badge variant="secondary">{manifest.guestCount} gości</Badge>
                </div>
                <div className="mt-4">
                  <OfflineEmergencyExportPanel
                    eventId={manifest.eventId}
                    eventName={`wydarzenie_${manifest.eventId}`}
                    compact
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Diagnostics;
