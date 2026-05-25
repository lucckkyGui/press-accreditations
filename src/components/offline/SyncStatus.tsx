
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RotateCw, CloudSun, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { syncWorker, type SyncWorkerState } from "@/lib/sync/syncWorker";
import { toast } from "sonner";

interface SyncStatusProps {
  onSyncClick?: () => Promise<void>;
}

const INITIAL_SYNC_STATE: SyncWorkerState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,
  nextRetryAt: null,
};

const formatLastSync = (value: string | null) => {
  if (!value) return "Jeszcze nie synchronizowano";

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export function SyncStatus({ onSyncClick }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncWorkerState>(INITIAL_SYNC_STATE);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    syncWorker.start();
    const unsubscribe = syncWorker.subscribe(setSyncState);

    void syncWorker.getState().then(setSyncState);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleSync = async () => {
    if (syncState.isSyncing) return;

    setShowProgress(true);
    setSyncProgress(20);

    try {
      const result = await syncWorker.syncNow({ force: true });
      await onSyncClick?.();
      setSyncProgress(100);

      if (result.failed > 0) {
        toast.warning(`Zsynchronizowano ${result.synced}, błędów: ${result.failed}`);
      } else {
        toast.success(result.synced > 0 ? `Zsynchronizowano ${result.synced} skanów` : "Brak skanów do synchronizacji");
      }

      window.setTimeout(() => {
        setShowProgress(false);
      }, 1000);
    } catch (error) {
      toast.error("Synchronizacja nie powiodła się");
      setShowProgress(false);
    }
  };

  const StatusIcon = isOnline ? Wifi : WifiOff;
  const statusColor = isOnline ? "text-green-500" : "text-red-500";
  const pendingTotal = syncState.pendingCount + syncState.failedCount;
  
  const iconToRender = syncState.isSyncing ? <CloudSun className="h-4 w-4" /> : <StatusIcon className="h-4 w-4" />;

  return (
    <div className="flex flex-col">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md">
            <div className={`${syncState.isSyncing ? 'text-blue-500 animate-pulse' : statusColor}`}>
              {iconToRender}
            </div>
            
            {pendingTotal > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {pendingTotal}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={!isOnline || syncState.isSyncing || pendingTotal === 0}
              className="h-8 w-8 p-0"
            >
              <RotateCw className={`h-4 w-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Synchronizuj teraz</span>
            </Button>
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="font-medium">
            {isOnline 
              ? 'Połączony z siecią' 
              : 'Tryb offline - zmiany zostaną zsynchronizowane po połączeniu'}
          </p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Ostatnia synchronizacja: {formatLastSync(syncState.lastSyncedAt)}
            </p>
            <p>
              {syncState.pendingCount} oczekujących, {syncState.failedCount} do ponowienia
            </p>
            {syncState.nextRetryAt && (
              <p>Następna próba: {formatLastSync(syncState.nextRetryAt)}</p>
            )}
          </div>
          {pendingTotal > 0 && (
            <p className="text-xs text-yellow-600">
              {pendingTotal} {pendingTotal === 1 ? 'skan czeka' : 'skanów czeka'} na synchronizację
            </p>
          )}
          {syncState.lastError && (
            <p className="mt-2 text-xs text-destructive">{syncState.lastError}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={!isOnline || syncState.isSyncing || pendingTotal === 0}
            className="mt-3 w-full gap-2"
          >
            <RotateCw className={`h-4 w-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            Synchronizuj teraz
          </Button>
        </HoverCardContent>
      </HoverCard>
      
      {showProgress && (
        <div className="mt-1 w-32">
          <Progress value={syncProgress} className="h-1 bg-gray-200" />
        </div>
      )}
    </div>
  );
}
