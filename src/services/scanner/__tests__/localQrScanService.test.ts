import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalGuest } from "@/lib/db/localDb";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: supabaseMocks.from,
  },
}));

import { getOrCreateDeviceId, localDb } from "@/lib/db/localDb";
import { processLocalQrScan } from "../localQrScanService";

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

describe("processLocalQrScan", () => {
  beforeEach(async () => {
    supabaseMocks.from.mockReset();
    await localDb.guests.clear();
    await localDb.scanQueue.clear();
    await localDb.eventManifest.clear();
    await localDb.syncMeta.clear();
  });

  it("validates a matching QR locally, queues the scan, and updates the guest", async () => {
    await localDb.guests.put(createGuest());

    const result = await processLocalQrScan({
      eventId: "event-1",
      qrPayload: JSON.stringify({ qrCode: "qr-123" }),
      deviceId: "device-1",
    });

    expect(result.status).toBe("found");
    expect(result.elapsedMs).toBeLessThan(100);
    expect(result.guest?.id).toBe("guest-1");
    expect(result.guest?.checkedInAt).toEqual(new Date(result.scannedAt));
    expect(supabaseMocks.from).not.toHaveBeenCalled();

    const queuedScan = await localDb.scanQueue.get(result.clientScanId);
    expect(queuedScan).toMatchObject({
      clientScanId: result.clientScanId,
      guestId: "guest-1",
      eventId: "event-1",
      qrPayload: JSON.stringify({ qrCode: "qr-123" }),
      scannedAt: result.scannedAt,
      deviceId: "device-1",
      status: "pending",
      validationResult: "found",
    });

    const updatedGuest = await localDb.guests.get("guest-1");
    expect(updatedGuest?.checked_in_at).toBe(result.scannedAt);
    expect(updatedGuest?.status).toBe("checked-in");
  });

  it("returns already_checked_in_locally on the second local scan", async () => {
    await localDb.guests.put(createGuest({ checked_in_at: "2026-05-20T12:00:00.000Z" }));

    const result = await processLocalQrScan({
      eventId: "event-1",
      qrPayload: "qr-123",
      deviceId: "device-1",
    });

    expect(result.status).toBe("already_checked_in_locally");
    expect(result.guest?.checkedInAt).toEqual(new Date("2026-05-20T12:00:00.000Z"));
    expect(await localDb.scanQueue.count()).toBe(1);
  });

  it("distinguishes wrong_event from unknown", async () => {
    await localDb.guests.put(createGuest({ event_id: "event-2" }));

    const wrongEventResult = await processLocalQrScan({
      eventId: "event-1",
      qrPayload: "qr-123",
      deviceId: "device-1",
    });
    const unknownResult = await processLocalQrScan({
      eventId: "event-1",
      qrPayload: "missing-qr",
      deviceId: "device-1",
    });

    expect(wrongEventResult.status).toBe("wrong_event");
    expect(wrongEventResult.guest?.id).toBe("guest-1");
    expect(unknownResult.status).toBe("unknown");
    expect(unknownResult.guest).toBeNull();
    expect(await localDb.scanQueue.count()).toBe(2);
  });

  it("keeps a stable device id in syncMeta", async () => {
    const firstDeviceId = await getOrCreateDeviceId();
    const secondDeviceId = await getOrCreateDeviceId();

    expect(secondDeviceId).toBe(firstDeviceId);
    expect(await localDb.syncMeta.get("scannerDeviceId")).toMatchObject({
      key: "scannerDeviceId",
      value: firstDeviceId,
    });
  });
});
