import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalGuest, LocalScanQueueEntry } from "@/lib/db/localDb";

const supabaseMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: supabaseMocks.rpc,
  },
}));

import { localDb } from "@/lib/db/localDb";
import { syncWorker } from "../syncWorker";

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: online,
  });
};

const createGuest = (overrides: Partial<LocalGuest> = {}): LocalGuest => ({
  id: "guest-1",
  event_id: "event-1",
  first_name: "Anna",
  last_name: "Kowalska",
  email: "anna@example.com",
  company: "Press Org",
  phone: null,
  ticket_type: "media",
  zones: ["press"],
  status: "confirmed",
  email_status: "sent",
  qr_code: "qr-123",
  invitation_sent_at: null,
  invitation_opened_at: null,
  checked_in_at: null,
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
  ...overrides,
});

const createScan = (overrides: Partial<LocalScanQueueEntry> = {}): LocalScanQueueEntry => ({
  clientScanId: "00000000-0000-4000-8000-000000000001",
  guestId: "guest-1",
  eventId: "event-1",
  qrPayload: "qr-123",
  status: "pending",
  scannedAt: "2026-05-20T11:00:00.000Z",
  deviceId: "device-1",
  validationResult: "found",
  guestName: "Anna Kowalska",
  action: "check-in",
  qrCode: "qr-123",
  retryCount: 0,
  ...overrides,
});

describe("syncWorker", () => {
  beforeEach(async () => {
    setOnline(true);
    supabaseMocks.rpc.mockReset();
    await localDb.guests.clear();
    await localDb.scanQueue.clear();
    await localDb.eventManifest.clear();
    await localDb.syncMeta.clear();
  });

  afterEach(() => {
    syncWorker.stop();
    setOnline(true);
  });

  it("syncs pending scans once and skips them on rerun", async () => {
    await localDb.guests.put(createGuest());
    await localDb.scanQueue.put(createScan());
    supabaseMocks.rpc.mockResolvedValue({
      data: {
        status: "success",
        message: "ok",
        checkedInAt: "2026-05-20T11:00:00.000Z",
      },
      error: null,
    });

    const firstRun = await syncWorker.syncNow();
    const secondRun = await syncWorker.syncNow();

    expect(firstRun).toEqual({ attempted: 1, synced: 1, failed: 0 });
    expect(secondRun).toEqual({ attempted: 0, synced: 0, failed: 0 });
    expect(supabaseMocks.rpc).toHaveBeenCalledTimes(1);
    expect(supabaseMocks.rpc).toHaveBeenCalledWith("process_qr_check_in", {
      _qr_code: "qr-123",
      _event_id: "event-1",
      _device_info: {
        source: "indexeddb-sync",
        deviceId: "device-1",
        localValidationResult: "found",
      },
      _client_scan_id: "00000000-0000-4000-8000-000000000001",
      _scanned_at: "2026-05-20T11:00:00.000Z",
    });
    await expect(localDb.scanQueue.get("00000000-0000-4000-8000-000000000001")).resolves.toMatchObject({
      status: "synced",
      serverStatus: "success",
    });
    await expect(localDb.guests.get("guest-1")).resolves.toMatchObject({
      checked_in_at: "2026-05-20T11:00:00.000Z",
      status: "checked-in",
    });
  });

  it("keeps scans in IndexedDB when the network drops during synchronization", async () => {
    await localDb.scanQueue.bulkPut([
      createScan({ clientScanId: "00000000-0000-4000-8000-000000000001" }),
      createScan({
        clientScanId: "00000000-0000-4000-8000-000000000002",
        scannedAt: "2026-05-20T11:00:01.000Z",
      }),
    ]);
    supabaseMocks.rpc.mockImplementationOnce(() => {
      setOnline(false);
      return Promise.resolve({
        data: null,
        error: { message: "network down" },
      });
    });

    const result = await syncWorker.syncNow();
    const firstScan = await localDb.scanQueue.get("00000000-0000-4000-8000-000000000001");
    const secondScan = await localDb.scanQueue.get("00000000-0000-4000-8000-000000000002");

    expect(result).toEqual({ attempted: 2, synced: 0, failed: 1 });
    expect(firstScan).toMatchObject({
      status: "failed",
      retryCount: 1,
      lastError: "network down",
    });
    expect(firstScan?.nextRetryAt).toBeDefined();
    expect(secondScan).toMatchObject({
      status: "pending",
    });
    expect(await localDb.scanQueue.count()).toBe(2);
  });
});
