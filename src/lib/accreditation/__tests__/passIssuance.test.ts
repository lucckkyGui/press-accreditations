import { describe, it, expect } from "vitest";
import {
  parseAccessZones,
  isPassAlreadyIssued,
  canIssuePass,
  buildGuestPassInsert,
  computeValidity,
  buildAccreditationPassInsert,
  PRESS_TICKET_TYPE,
  PRESS_GUEST_STATUS,
  DEFAULT_PRESS_ACCESS_AREA,
  type PassIssuanceSubmission,
} from "../passIssuance";

const baseSubmission: PassIssuanceSubmission = {
  first_name: "Anna",
  last_name: "Kowalska",
  email: "anna.kowalska@wyborcza.pl",
  phone: "+48 600 100 200",
  media_organization: "Gazeta Wyborcza",
  requested_access: "Strefa prasowa, Sala konferencyjna",
  status: "approved",
};

describe("passIssuance — parseAccessZones", () => {
  it("rozbija po przecinkach i nowych liniach, przycina", () => {
    expect(parseAccessZones("Strefa prasowa, Backstage\nFront stage")).toEqual([
      "Strefa prasowa",
      "Backstage",
      "Front stage",
    ]);
  });

  it("usuwa duplikaty (case-insensitive)", () => {
    expect(parseAccessZones("Foto, foto, FOTO")).toEqual(["Foto"]);
  });

  it("zwraca domyślną strefę przy pustym wejściu", () => {
    expect(parseAccessZones("")).toEqual([DEFAULT_PRESS_ACCESS_AREA]);
    expect(parseAccessZones(null)).toEqual([DEFAULT_PRESS_ACCESS_AREA]);
    expect(parseAccessZones("   ")).toEqual([DEFAULT_PRESS_ACCESS_AREA]);
  });
});

describe("passIssuance — idempotencja / kwalifikacja", () => {
  it("isPassAlreadyIssued: true gdy jest kod QR lub guest_id", () => {
    expect(isPassAlreadyIssued(baseSubmission)).toBe(false);
    expect(isPassAlreadyIssued({ ...baseSubmission, pass_qr_code: "abc" })).toBe(true);
    expect(isPassAlreadyIssued({ ...baseSubmission, guest_id: "g1" })).toBe(true);
  });

  it("canIssuePass: tylko approved i bez wydanego passu", () => {
    expect(canIssuePass(baseSubmission)).toBe(true);
    expect(canIssuePass({ ...baseSubmission, status: "pending" })).toBe(false);
    expect(canIssuePass({ ...baseSubmission, status: "rejected" })).toBe(false);
    expect(canIssuePass({ ...baseSubmission, pass_qr_code: "abc" })).toBe(false);
  });
});

describe("passIssuance — buildGuestPassInsert", () => {
  it("mapuje pola zgłoszenia na wpis gościa (skanowalny check-in)", () => {
    const guest = buildGuestPassInsert(baseSubmission, "event-1", "qr-123");
    expect(guest.event_id).toBe("event-1");
    expect(guest.qr_code).toBe("qr-123");
    expect(guest.first_name).toBe("Anna");
    expect(guest.last_name).toBe("Kowalska");
    expect(guest.email).toBe("anna.kowalska@wyborcza.pl");
    expect(guest.company).toBe("Gazeta Wyborcza");
    expect(guest.ticket_type).toBe(PRESS_TICKET_TYPE);
    expect(guest.status).toBe(PRESS_GUEST_STATUS);
    expect(guest.zones).toEqual(["Strefa prasowa", "Sala konferencyjna"]);
  });

  it("przycina białe znaki i mapuje brakujące pola na null", () => {
    const guest = buildGuestPassInsert(
      { first_name: " Jan ", last_name: " Test ", email: " jan@x.pl ", status: "approved" },
      "event-2",
      "qr-9",
    );
    expect(guest.first_name).toBe("Jan");
    expect(guest.last_name).toBe("Test");
    expect(guest.email).toBe("jan@x.pl");
    expect(guest.phone).toBeNull();
    expect(guest.company).toBeNull();
    expect(guest.zones).toEqual([DEFAULT_PRESS_ACCESS_AREA]);
  });
});

describe("passIssuance — computeValidity", () => {
  it("używa dat wydarzenia", () => {
    const r = computeValidity("2026-06-01T10:00:00.000Z", "2026-06-03T22:00:00.000Z");
    expect(r.validity_start).toBe("2026-06-01T10:00:00.000Z");
    expect(r.validity_end).toBe("2026-06-03T22:00:00.000Z");
  });

  it("fallback: brak dat → start=now, koniec=now+1 dzień", () => {
    const now = new Date("2026-05-31T12:00:00.000Z");
    const r = computeValidity(null, null, now);
    expect(r.validity_start).toBe("2026-05-31T12:00:00.000Z");
    expect(r.validity_end).toBe("2026-06-01T12:00:00.000Z");
  });

  it("koryguje koniec wcześniejszy niż start (start + 1 dzień)", () => {
    const r = computeValidity("2026-06-10T00:00:00.000Z", "2026-06-01T00:00:00.000Z");
    expect(r.validity_start).toBe("2026-06-10T00:00:00.000Z");
    expect(r.validity_end).toBe("2026-06-11T00:00:00.000Z");
  });
});

describe("passIssuance — buildAccreditationPassInsert", () => {
  it("buduje payload akredytacji zgodny ze schematem bazy", () => {
    const acc = buildAccreditationPassInsert({
      eventId: "e1",
      userId: "u1",
      guestId: "g1",
      requestId: "r1",
      type: "Prasa",
      issuedAt: "2026-06-01T00:00:00.000Z",
      expiresAt: "2026-06-02T00:00:00.000Z",
    });
    expect(acc).toEqual({
      event_id: "e1",
      user_id: "u1",
      guest_id: "g1",
      accreditation_request_id: "r1",
      type: "Prasa",
      status: "issued",
      issued_at: "2026-06-01T00:00:00.000Z",
      expires_at: "2026-06-02T00:00:00.000Z",
    });
  });

  it("dopuszcza brak powiązanego wniosku (accreditation_request_id=null)", () => {
    const acc = buildAccreditationPassInsert({
      eventId: "e1", userId: "u1", guestId: null, requestId: null,
      type: "Prasa", issuedAt: "a", expiresAt: "b",
    });
    expect(acc.accreditation_request_id).toBeNull();
  });
});
