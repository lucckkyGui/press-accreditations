import Dexie, { type Table } from "dexie";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

type GuestRow = Database["public"]["Tables"]["guests"]["Row"];

export type LocalGuest = Omit<GuestRow, "zones"> & {
  zones: string[];
};

export type ScanQueueStatus = "pending" | "synced" | "failed";
export type ScanQueueAction = "check-in" | "check-out";
export type LocalScanValidationResult = "found" | "unknown" | "wrong_event" | "already_checked_in_locally";

export interface LocalScanQueueEntry {
  clientScanId: string;
  eventId: string;
  guestId: string | null;
  qrPayload: string;
  status: ScanQueueStatus;
  scannedAt: string;
  deviceId: string;
  validationResult: LocalScanValidationResult;
  guestName?: string;
  action?: ScanQueueAction;
  retryCount?: number;
  qrCode?: string;
  syncedAt?: string;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  lastError?: string;
  serverStatus?: string;
}

export interface EventManifestRecord {
  eventId: string;
  version: string;
  downloadedAt: string;
  guestCount: number;
}

export interface SyncMetaRecord {
  key: string;
  value: Json;
  updatedAt: string;
}

export type DownloadEventManifestPhase = "fetching" | "saving" | "done";

export interface DownloadEventManifestProgress {
  eventId: string;
  downloaded: number;
  total?: number;
  phase: DownloadEventManifestPhase;
}

class PressAccreditationsLocalDb extends Dexie {
  guests!: Table<LocalGuest, string>;
  scanQueue!: Table<LocalScanQueueEntry, string>;
  eventManifest!: Table<EventManifestRecord, string>;
  syncMeta!: Table<SyncMetaRecord, string>;

  constructor() {
    super("press-accreditations-local");

    this.version(1).stores({
      guests: "id, event_id, qr_code",
      scanQueue: "clientScanId, status, eventId",
      eventManifest: "eventId",
      syncMeta: "key",
    });
  }
}

export const localDb = new PressAccreditationsLocalDb();

const GUEST_MANIFEST_PAGE_SIZE = 1000;
const DEVICE_ID_SYNC_META_KEY = "scannerDeviceId";
let cachedDeviceId: string | null = null;

const normalizeGuestRow = (guest: GuestRow): LocalGuest => ({
  ...guest,
  zones: guest.zones ?? [],
});

const getLatestGuestVersionValue = (guests: LocalGuest[]): string | null =>
  guests.reduce<string | null>((latest, guest) => {
    const candidate = guest.updated_at ?? guest.created_at;
    if (!candidate) return latest;

    return latest === null || candidate > latest ? candidate : latest;
  }, null);

const buildManifestVersion = (eventId: string, guestCount: number, versionValue: string | null, downloadedAt: string) =>
  `${eventId}:${guestCount}:${versionValue ?? downloadedAt}`;

export const downloadEventManifest = async (
  eventId: string,
  onProgress?: (progress: DownloadEventManifestProgress) => void
): Promise<EventManifestRecord> => {
  const normalizedEventId = eventId.trim();
  if (!normalizedEventId) {
    throw new Error("Brak identyfikatora wydarzenia do pobrania manifestu offline");
  }

  const guests: LocalGuest[] = [];
  let expectedTotal: number | undefined;
  let from = 0;

  while (true) {
    const to = from + GUEST_MANIFEST_PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("guests")
      .select("*", { count: "exact" })
      .eq("event_id", normalizedEventId)
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(error.message || "Nie udało się pobrać listy gości do trybu offline");
    }

    if (typeof count === "number") {
      expectedTotal = count;
    }

    const batch = (data ?? []).map(normalizeGuestRow);
    guests.push(...batch);

    onProgress?.({
      eventId: normalizedEventId,
      downloaded: guests.length,
      total: expectedTotal,
      phase: "fetching",
    });

    if (batch.length < GUEST_MANIFEST_PAGE_SIZE) {
      break;
    }

    if (expectedTotal !== undefined && guests.length >= expectedTotal) {
      break;
    }

    from += GUEST_MANIFEST_PAGE_SIZE;
  }

  onProgress?.({
    eventId: normalizedEventId,
    downloaded: guests.length,
    total: expectedTotal,
    phase: "saving",
  });

  const downloadedAt = new Date().toISOString();
  const manifest: EventManifestRecord = {
    eventId: normalizedEventId,
    version: buildManifestVersion(
      normalizedEventId,
      guests.length,
      getLatestGuestVersionValue(guests),
      downloadedAt
    ),
    downloadedAt,
    guestCount: guests.length,
  };

  await localDb.transaction("rw", localDb.guests, localDb.eventManifest, async () => {
    await localDb.guests.where("event_id").equals(normalizedEventId).delete();
    if (guests.length > 0) {
      await localDb.guests.bulkPut(guests);
    }
    await localDb.eventManifest.put(manifest);
  });

  onProgress?.({
    eventId: normalizedEventId,
    downloaded: guests.length,
    total: guests.length,
    phase: "done",
  });

  return manifest;
};

export const getSyncMetaValue = async <TValue extends Json>(key: string): Promise<TValue | null> => {
  const record = await localDb.syncMeta.get(key);
  return (record?.value as TValue | undefined) ?? null;
};

export const setSyncMetaValue = async (key: string, value: Json): Promise<void> => {
  await localDb.syncMeta.put({
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
};

export const getOrCreateDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  const storedDeviceId = await getSyncMetaValue<string>(DEVICE_ID_SYNC_META_KEY);
  if (storedDeviceId) {
    cachedDeviceId = storedDeviceId;
    return storedDeviceId;
  }

  const nextDeviceId = crypto.randomUUID();
  await setSyncMetaValue(DEVICE_ID_SYNC_META_KEY, nextDeviceId);
  cachedDeviceId = nextDeviceId;

  return nextDeviceId;
};
