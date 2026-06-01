import { describe, it, expect } from "vitest";
import {
  APPROVAL_STATUSES,
  ACCESS_LEVELS,
  isApprovalStatus,
  isAccessLevel,
  statusCreatesPass,
  isLimitedStatus,
  accessZonesFor,
  accessLevelLabel,
  suggestedAccessLevel,
  generateAccreditationToken,
  isValidAccreditationToken,
  buildQrPayload,
  isCheckInBlocked,
  validateDecision,
  REVOKED_GUEST_STATUS,
  type ApprovalStatus,
} from "../decisionFlow";

describe("decisionFlow — statusy", () => {
  it("ma dokładnie 4 statusy decyzji", () => {
    expect(APPROVAL_STATUSES.map((s) => s.value).sort()).toEqual(
      ["approved", "approved_limited", "rejected", "waitlisted"].sort(),
    );
  });

  it("isApprovalStatus rozpoznaje poprawne statusy", () => {
    expect(isApprovalStatus("approved")).toBe(true);
    expect(isApprovalStatus("approved_limited")).toBe(true);
    expect(isApprovalStatus("pending")).toBe(false);
    expect(isApprovalStatus("nonsense")).toBe(false);
  });

  it("statusCreatesPass: tylko approved i approved_limited tworzą QR", () => {
    expect(statusCreatesPass("approved")).toBe(true);
    expect(statusCreatesPass("approved_limited")).toBe(true);
    expect(statusCreatesPass("rejected")).toBe(false);
    expect(statusCreatesPass("waitlisted")).toBe(false);
  });

  it("isLimitedStatus: tylko approved_limited", () => {
    expect(isLimitedStatus("approved_limited")).toBe(true);
    expect(isLimitedStatus("approved")).toBe(false);
  });
});

describe("decisionFlow — access levels", () => {
  it("ma dokładnie 10 access levels", () => {
    expect(ACCESS_LEVELS).toHaveLength(10);
    expect(ACCESS_LEVELS.map((a) => a.value).sort()).toEqual(
      [
        "press", "photo", "video", "radio", "podcast", "influencer",
        "photo_pit", "interview", "backstage_limited", "sponsor_media",
      ].sort(),
    );
  });

  it("isAccessLevel waliduje wartości", () => {
    expect(isAccessLevel("photo_pit")).toBe(true);
    expect(isAccessLevel("sponsor_media")).toBe(true);
    expect(isAccessLevel("vip")).toBe(false);
    expect(isAccessLevel(null)).toBe(false);
  });

  it("accessZonesFor zwraca strefy poziomu, fallback do strefy prasowej", () => {
    expect(accessZonesFor("photo_pit")).toContain("Photo pit");
    expect(accessZonesFor("press")).toEqual(["Strefa prasowa"]);
    expect(accessZonesFor(null)).toEqual(["Strefa prasowa"]);
    expect(accessZonesFor("nieznany")).toEqual(["Strefa prasowa"]);
  });

  it("accessLevelLabel mapuje na etykietę PL", () => {
    expect(accessLevelLabel("photo")).toBe("Foto");
    expect(accessLevelLabel("sponsor_media")).toBe("Media sponsora");
    expect(accessLevelLabel(null)).toBe("—");
  });

  it("suggestedAccessLevel mapuje rolę na poziom", () => {
    expect(suggestedAccessLevel("photographer")).toBe("photo");
    expect(suggestedAccessLevel("video")).toBe("video");
    expect(suggestedAccessLevel("influencer")).toBe("influencer");
    expect(suggestedAccessLevel("journalist")).toBe("press");
    expect(suggestedAccessLevel(null)).toBe("press");
  });
});

describe("decisionFlow — token QR", () => {
  it("generuje token z prefiksem PA- i wystarczającą długością", () => {
    const token = generateAccreditationToken();
    expect(token.startsWith("PA-")).toBe(true);
    expect(token.length).toBeGreaterThanOrEqual(20);
    expect(isValidAccreditationToken(token)).toBe(true);
  });

  it("token NIE jest incremental — kolejne wywołania są różne", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateAccreditationToken()));
    expect(tokens.size).toBe(200);
  });

  it("token nie zawiera mylących znaków (I, L, O, U)", () => {
    for (let i = 0; i < 50; i++) {
      const body = generateAccreditationToken().slice(3);
      expect(body).not.toMatch(/[ILOU]/);
    }
  });

  it("isValidAccreditationToken odrzuca śmieci i incremental ID", () => {
    expect(isValidAccreditationToken("123")).toBe(false);
    expect(isValidAccreditationToken("PA-")).toBe(false);
    expect(isValidAccreditationToken("")).toBe(false);
    expect(isValidAccreditationToken(null)).toBe(false);
  });

  it("buildQrPayload zwraca sam token (bez danych osobowych)", () => {
    const token = "PA-ABC123";
    expect(buildQrPayload(token)).toBe(token);
    // payload to czysty string, nie obiekt z PII
    expect(typeof buildQrPayload(token)).toBe("string");
  });
});

describe("decisionFlow — rewokacja / check-in", () => {
  it("isCheckInBlocked: tylko status 'revoked' blokuje", () => {
    expect(isCheckInBlocked(REVOKED_GUEST_STATUS)).toBe(true);
    expect(isCheckInBlocked("revoked")).toBe(true);
    expect(isCheckInBlocked("confirmed")).toBe(false);
    expect(isCheckInBlocked("checked-in")).toBe(false);
    expect(isCheckInBlocked(null)).toBe(false);
  });
});

describe("decisionFlow — macierz akceptacji (status → QR)", () => {
  // Kryteria akceptacji zadania: kontrakt „który status tworzy QR".
  const cases: { status: ApprovalStatus; createsPass: boolean }[] = [
    { status: "approved", createsPass: true },
    { status: "approved_limited", createsPass: true },
    { status: "rejected", createsPass: false },
    { status: "waitlisted", createsPass: false },
  ];
  for (const c of cases) {
    it(`${c.status} → ${c.createsPass ? "tworzy" : "NIE tworzy"} QR`, () => {
      expect(statusCreatesPass(c.status)).toBe(c.createsPass);
    });
  }
});

describe("decisionFlow — validateDecision", () => {
  it("approved bez access level → błąd (missing access level)", () => {
    const r = validateDecision({ status: "approved", accessLevel: null });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/access level/i);
  });

  it("approved_limited bez access level → błąd", () => {
    expect(validateDecision({ status: "approved_limited" }).ok).toBe(false);
  });

  it("approved z access level → ok", () => {
    expect(validateDecision({ status: "approved", accessLevel: "photo" }).ok).toBe(true);
  });

  it("rejected / waitlisted nie wymagają access level", () => {
    expect(validateDecision({ status: "rejected" }).ok).toBe(true);
    expect(validateDecision({ status: "waitlisted" }).ok).toBe(true);
  });

  it("nieprawidłowy access level przy approved → błąd", () => {
    expect(validateDecision({ status: "approved", accessLevel: "vip" }).ok).toBe(false);
  });
});
