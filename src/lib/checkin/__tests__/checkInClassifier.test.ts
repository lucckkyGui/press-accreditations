import { describe, it, expect } from "vitest";
import {
  classifyCheckIn,
  extractToken,
  isAdmit,
  CHECK_IN_STATUS_ORDER,
  type CheckInGuest,
  type CheckInStatus,
} from "../checkInClassifier";

const EVENT = "11111111-1111-1111-1111-111111111111";
const OTHER_EVENT = "22222222-2222-2222-2222-222222222222";
const FUTURE = "2030-01-01T00:00:00.000Z";
const PAST = "2020-01-01T00:00:00.000Z";

function guest(over: Partial<CheckInGuest> = {}): CheckInGuest {
  return {
    id: crypto.randomUUID(),
    event_id: EVENT,
    status: "confirmed",
    qr_code: `PA-${Math.random().toString(36).slice(2)}`,
    checked_in_at: null,
    ...over,
  };
}

const ctx = (over: Partial<Parameters<typeof classifyCheckIn>[1]> = {}) => ({
  eventId: EVENT,
  hasPermission: true,
  eventEnd: FUTURE,
  ...over,
});

describe("checkInClassifier — extractToken", () => {
  it("zwraca surowy token", () => {
    expect(extractToken("PA-ABC")).toBe("PA-ABC");
    expect(extractToken("  PA-ABC  ")).toBe("PA-ABC");
  });
  it("wyciąga token z JSON {qrCode}", () => {
    expect(extractToken('{"qrCode":"PA-XYZ","eventId":"e"}')).toBe("PA-XYZ");
    expect(extractToken('{"qr_code":"PA-Q"}')).toBe("PA-Q");
  });
  it("pusty payload → pusty string", () => {
    expect(extractToken("")).toBe("");
    expect(extractToken("   ")).toBe("");
  });
});

describe("checkInClassifier — pojedyncze przypadki", () => {
  it("valid → success (mutates)", () => {
    const r = classifyCheckIn(guest(), ctx(), "PA-1");
    expect(r.status).toBe("success");
    expect(r.admit).toBe(true);
    expect(r.mutates).toBe(true);
  });

  it("drugi scan → duplicate (nie mutuje)", () => {
    const r = classifyCheckIn(guest({ checked_in_at: "2026-06-01T10:00:00Z" }), ctx(), "PA-1");
    expect(r.status).toBe("duplicate");
    expect(r.admit).toBe(false);
    expect(r.mutates).toBe(false);
  });

  it("inny event → wrong_event", () => {
    expect(classifyCheckIn(guest({ event_id: OTHER_EVENT }), ctx(), "PA-1").status).toBe("wrong_event");
  });

  it("zakończony event → expired", () => {
    expect(classifyCheckIn(guest(), ctx({ eventEnd: PAST }), "PA-1").status).toBe("expired");
  });

  it("cofnięta akredytacja → revoked (z powodem)", () => {
    const r = classifyCheckIn(guest({ status: "revoked", revocation_reason: "naruszenie zasad" }), ctx(), "PA-1");
    expect(r.status).toBe("revoked");
    expect(r.message).toContain("naruszenie zasad");
  });

  it("brak gościa → invalid", () => {
    expect(classifyCheckIn(null, ctx(), "PA-NOPE").status).toBe("invalid");
  });

  it("pusty payload → invalid", () => {
    expect(classifyCheckIn(guest(), ctx(), "").status).toBe("invalid");
  });

  it("brak uprawnień → unauthorized (dominuje nad wszystkim)", () => {
    const r = classifyCheckIn(guest(), ctx({ hasPermission: false }), "PA-1");
    expect(r.status).toBe("unauthorized");
  });

  it("priorytet: revoked przed expired", () => {
    const r = classifyCheckIn(guest({ status: "revoked" }), ctx({ eventEnd: PAST }), "PA-1");
    expect(r.status).toBe("revoked");
  });

  it("priorytet: wrong_event przed revoked", () => {
    const r = classifyCheckIn(guest({ event_id: OTHER_EVENT, status: "revoked" }), ctx(), "PA-1");
    expect(r.status).toBe("wrong_event");
  });

  it("isAdmit: tylko success", () => {
    expect(isAdmit("success")).toBe(true);
    for (const s of CHECK_IN_STATUS_ORDER.filter((x) => x !== "success")) {
      expect(isAdmit(s)).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// TEST MATRIX — 100 QR (80 success, 10 duplicate, 3 wrong_event,
// 3 expired, 2 revoked, 2 invalid) wg specyfikacji Tygodnia 5.
// ─────────────────────────────────────────────────────────────
describe("checkInClassifier — test matrix 100 QR", () => {
  interface Fixture { guest: CheckInGuest | null; eventEnd: string; payload: string; expected: CheckInStatus; }

  const fixtures: Fixture[] = [];
  // 80 success
  for (let i = 0; i < 80; i++) fixtures.push({ guest: guest(), eventEnd: FUTURE, payload: `PA-OK${i}`, expected: "success" });
  // 10 duplicate
  for (let i = 0; i < 10; i++) fixtures.push({ guest: guest({ checked_in_at: "2026-06-01T09:00:00Z" }), eventEnd: FUTURE, payload: `PA-DUP${i}`, expected: "duplicate" });
  // 3 wrong_event
  for (let i = 0; i < 3; i++) fixtures.push({ guest: guest({ event_id: OTHER_EVENT }), eventEnd: FUTURE, payload: `PA-WE${i}`, expected: "wrong_event" });
  // 3 expired
  for (let i = 0; i < 3; i++) fixtures.push({ guest: guest(), eventEnd: PAST, payload: `PA-EXP${i}`, expected: "expired" });
  // 2 revoked
  for (let i = 0; i < 2; i++) fixtures.push({ guest: guest({ status: "revoked", revocation_reason: "test" }), eventEnd: FUTURE, payload: `PA-REV${i}`, expected: "revoked" });
  // 2 invalid (brak gościa)
  for (let i = 0; i < 2; i++) fixtures.push({ guest: null, eventEnd: FUTURE, payload: `PA-BAD${i}`, expected: "invalid" });

  it("ma dokładnie 100 fixture'ów w rozkładzie ze specyfikacji", () => {
    expect(fixtures).toHaveLength(100);
    const dist = fixtures.reduce<Record<string, number>>((acc, f) => { acc[f.expected] = (acc[f.expected] ?? 0) + 1; return acc; }, {});
    expect(dist).toEqual({ success: 80, duplicate: 10, wrong_event: 3, expired: 3, revoked: 2, invalid: 2 });
  });

  it("każdy z 100 QR daje oczekiwany status", () => {
    const results = fixtures.map((f) =>
      classifyCheckIn(f.guest, ctx({ eventEnd: f.eventEnd }), f.payload).status,
    );
    results.forEach((status, idx) => expect(status).toBe(fixtures[idx].expected));

    const counts = results.reduce<Record<string, number>>((acc, s) => { acc[s] = (acc[s] ?? 0) + 1; return acc; }, {});
    expect(counts.success).toBe(80);
    expect(counts.duplicate).toBe(10);
    expect(counts.wrong_event).toBe(3);
    expect(counts.expired).toBe(3);
    expect(counts.revoked).toBe(2);
    expect(counts.invalid).toBe(2);
  });

  it("tylko 80 success wpuszcza (admit)", () => {
    const admitted = fixtures.filter((f) => classifyCheckIn(f.guest, ctx({ eventEnd: f.eventEnd }), f.payload).admit);
    expect(admitted).toHaveLength(80);
  });
});
