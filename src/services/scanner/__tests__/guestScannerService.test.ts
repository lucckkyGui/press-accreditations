import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: supabaseMocks.rpc,
    from: supabaseMocks.from,
  },
}));

import { guestScannerService } from "../guestScannerService";

const rpcGuest = {
  id: "guest-1",
  firstName: "Anna",
  lastName: "Kowalska",
  email: "anna@example.com",
  company: "Press Org",
  phone: "+48123456789",
  ticketType: "media",
  zones: ["press"],
  status: "checked-in",
  qrCode: "qr-123",
  checkedInAt: "2026-05-20T14:00:00.000Z",
};

describe("guestScannerService.verifyAndCheckIn", () => {
  beforeEach(() => {
    supabaseMocks.rpc.mockReset();
    supabaseMocks.from.mockReset();
  });

  it("returns a successful check-in result from the RPC contract", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: {
        success: true,
        status: "success",
        message: "Gość został pomyślnie zarejestrowany",
        checkedInAt: "2026-05-20T14:00:00.000Z",
        scanTime: "2026-05-20T14:00:01.000Z",
        guest: rpcGuest,
      },
      error: null,
    });

    const result = await guestScannerService.verifyAndCheckIn(
      "qr-123",
      "event-1",
      { source: "test" }
    );

    expect(supabaseMocks.rpc).toHaveBeenCalledWith("process_qr_check_in", {
      _qr_code: "qr-123",
      _event_id: "event-1",
      _device_info: { source: "test" },
    });
    expect(result.success).toBe(true);
    expect(result.status).toBe("success");
    expect(result.guest?.firstName).toBe("Anna");
    expect(result.guest?.checkedInAt).toEqual(new Date("2026-05-20T14:00:00.000Z"));
  });

  it("maps duplicate scans without treating them as successful check-ins", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: {
        success: false,
        status: "duplicate",
        message: "Gość został już wcześniej zarejestrowany",
        checkedInAt: "2026-05-20T14:00:00.000Z",
        guest: rpcGuest,
      },
      error: null,
    });

    const result = await guestScannerService.verifyAndCheckIn(
      "qr-123",
      "event-1",
      { source: "test" }
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe("duplicate");
    expect(result.alreadyCheckedIn).toBe(true);
    expect(result.checkInTime).toBe("2026-05-20T14:00:00.000Z");
    expect(result.guest?.id).toBe("guest-1");
  });

  it("requires an event before calling the RPC", async () => {
    const result = await guestScannerService.verifyAndCheckIn("qr-123");

    expect(supabaseMocks.rpc).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.status).toBe("invalid");
    expect(result.message).toBe("Wybierz wydarzenie przed rozpoczęciem skanowania");
  });

  it("returns a controlled failure when the RPC errors", async () => {
    supabaseMocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "network error" },
    });

    const result = await guestScannerService.verifyAndCheckIn(
      "qr-123",
      "event-1",
      { source: "test" }
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe("invalid");
    expect(result.message).toBe("Błąd podczas rejestracji gościa");
  });
});
