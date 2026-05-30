import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { localDb, setSyncMetaValue, type LocalScanQueueEntry } from "@/lib/db/localDb";
import { captureError, trackAction } from "@/lib/observability";

export interface SyncWorkerState {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  nextRetryAt: string | null;
}

export interface SyncRunResult {
  attempted: number;
  synced: number;
  failed: number;
}

type SyncWorkerListener = (state: SyncWorkerState) => void;

interface RpcScanResponse {
  status?: unknown;
  message?: unknown;
  checkedInAt?: unknown;
}

const SYNC_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 5 * 60_000;
const LAST_SYNC_META_KEY = "scanQueueLastSyncedAt";

const listeners = new Set<SyncWorkerListener>();

let isStarted = false;
let isSyncing = false;
let intervalId: number | null = null;
let pendingTimerId: number | null = null;
let lastSyncedAt: string | null = null;
let lastError: string | null = null;

const getNowIso = () => new Date().toISOString();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const normalizeRpcResponse = (value: Json | null): RpcScanResponse => {
  if (!isRecord(value)) {
    return {};
  }

  return {
    status: value.status,
    message: value.message,
    checkedInAt: value.checkedInAt,
  };
};

const getBackoffMs = (retryCount: number) => {
  const attempt = Math.max(0, retryCount);
  return Math.min(MAX_BACKOFF_MS, 2 ** attempt * 1000);
};

const isDueForSync = (entry: LocalScanQueueEntry, now: Date) => {
  if (entry.status === "pending") return true;
  if (entry.status !== "failed") return false;
  if (!entry.nextRetryAt) return true;

  return new Date(entry.nextRetryAt).getTime() <= now.getTime();
};

const getSyncableEntries = async (forceRetry: boolean) => {
  const now = new Date();
  const entries = await localDb.scanQueue
    .filter((entry) => forceRetry ? entry.status === "pending" || entry.status === "failed" : isDueForSync(entry, now))
    .toArray();

  return entries.sort((left, right) => new Date(left.scannedAt).getTime() - new Date(right.scannedAt).getTime());
};

const readState = async (): Promise<SyncWorkerState> => {
  const [pendingCount, failedEntries] = await Promise.all([
    localDb.scanQueue.where("status").equals("pending").count(),
    localDb.scanQueue.where("status").equals("failed").toArray(),
  ]);

  const nextRetryAt = failedEntries.reduce<string | null>((current, entry) => {
    if (!entry.nextRetryAt) return current;
    if (!current) return entry.nextRetryAt;
    return entry.nextRetryAt < current ? entry.nextRetryAt : current;
  }, null);

  return {
    isSyncing,
    pendingCount,
    failedCount: failedEntries.length,
    lastSyncedAt,
    lastError,
    nextRetryAt,
  };
};

const emitState = async () => {
  const state = await readState();
  listeners.forEach((listener) => listener(state));
};

const markFailed = async (entry: LocalScanQueueEntry, errorMessage: string) => {
  const now = new Date();
  const retryCount = (entry.retryCount ?? 0) + 1;
  const nextRetryAt = new Date(now.getTime() + getBackoffMs(retryCount)).toISOString();

  await localDb.scanQueue.put({
    ...entry,
    status: "failed",
    retryCount,
    lastAttemptAt: now.toISOString(),
    nextRetryAt,
    lastError: errorMessage,
  });
};

const updateLocalGuestFromServer = async (entry: LocalScanQueueEntry, checkedInAt: string | undefined) => {
  if (!entry.guestId || !checkedInAt) return;

  const guest = await localDb.guests.get(entry.guestId);
  if (!guest) return;

  await localDb.guests.put({
    ...guest,
    checked_in_at: checkedInAt,
    status: "checked-in",
    updated_at: checkedInAt,
  });
};

const syncEntry = async (entry: LocalScanQueueEntry) => {
  trackAction("scan_queue_sync_attempt", {
    clientScanId: entry.clientScanId,
    eventId: entry.eventId,
    status: entry.status,
  });

  const { data, error } = await supabase.rpc("process_qr_check_in", {
    _qr_code: entry.qrPayload,
    _event_id: entry.eventId,
    _device_info: {
      source: "indexeddb-sync",
      deviceId: entry.deviceId,
      localValidationResult: entry.validationResult,
    },
    _client_scan_id: entry.clientScanId,
    _scanned_at: entry.scannedAt,
  });

  if (error) {
    throw new Error(error.message || "Nie udało się zsynchronizować skanu");
  }

  const response = normalizeRpcResponse(data);
  const serverStatus = asString(response.status) ?? "unknown";
  const checkedInAt = asString(response.checkedInAt);
  const syncedAt = getNowIso();

  await updateLocalGuestFromServer(entry, checkedInAt);
  await localDb.scanQueue.put({
    ...entry,
    status: "synced",
    retryCount: entry.retryCount ?? 0,
    lastAttemptAt: syncedAt,
    nextRetryAt: undefined,
    syncedAt,
    lastError: undefined,
    serverStatus,
  });
};

const scheduleNextRetry = async () => {
  if (pendingTimerId) {
    window.clearTimeout(pendingTimerId);
    pendingTimerId = null;
  }

  const { nextRetryAt } = await readState();
  if (!nextRetryAt) return;

  const delayMs = Math.max(0, new Date(nextRetryAt).getTime() - Date.now());
  pendingTimerId = window.setTimeout(() => {
    void syncWorker.syncNow();
  }, delayMs);
};

const runSync = async (forceRetry = false): Promise<SyncRunResult> => {
  if (isSyncing) {
    return { attempted: 0, synced: 0, failed: 0 };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await emitState();
    return { attempted: 0, synced: 0, failed: 0 };
  }

  isSyncing = true;
  lastError = null;
  await emitState();

  const entries = await getSyncableEntries(forceRetry);
  const result: SyncRunResult = {
    attempted: entries.length,
    synced: 0,
    failed: 0,
  };

  for (const entry of entries) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      break;
    }

    try {
      await syncEntry(entry);
      result.synced += 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się zsynchronizować skanu";
      await markFailed(entry, errorMessage);
      captureError(error, {
        action: "scan_queue_sync",
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
        metadata: {
          clientScanId: entry.clientScanId,
          eventId: entry.eventId,
          retryCount: (entry.retryCount ?? 0) + 1,
        },
      });
      lastError = errorMessage;
      result.failed += 1;
    }
  }

  if (result.synced > 0) {
    lastSyncedAt = getNowIso();
    await setSyncMetaValue(LAST_SYNC_META_KEY, lastSyncedAt);
  }

  isSyncing = false;
  await scheduleNextRetry();
  await emitState();

  return result;
};

const handleOnline = () => {
  void syncWorker.syncNow({ force: true });
};

export const syncWorker = {
  start() {
    if (isStarted || typeof window === "undefined") return;

    isStarted = true;
    window.addEventListener("online", handleOnline);
    intervalId = window.setInterval(() => {
      void syncWorker.syncNow();
    }, SYNC_INTERVAL_MS);

    void localDb.syncMeta.get(LAST_SYNC_META_KEY).then((record) => {
      lastSyncedAt = typeof record?.value === "string" ? record.value : null;
      return emitState();
    });

    if (navigator.onLine) {
      void syncWorker.syncNow();
    }
  },

  stop() {
    if (typeof window === "undefined") return;

    if (isStarted) {
      isStarted = false;
      window.removeEventListener("online", handleOnline);
    }

    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }

    if (pendingTimerId) {
      window.clearTimeout(pendingTimerId);
      pendingTimerId = null;
    }
  },

  async syncNow(options: { force?: boolean } = {}) {
    return runSync(options.force ?? false);
  },

  async getState() {
    return readState();
  },

  subscribe(listener: SyncWorkerListener) {
    listeners.add(listener);
    void readState().then(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
