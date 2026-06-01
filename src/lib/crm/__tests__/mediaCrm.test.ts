import { describe, it, expect } from "vitest";
import {
  normalizeEmail, emailDomain, normalizeOutletName, normalizeDomain, outletDedupKey,
  qualityLabel, isValidQualityRating, suggestQualityRating,
  noShowRate, showRate, coverageRate,
  COVERAGE_STATUSES, isCoverageStatus, canTransitionCoverage,
  generateCoverageToken, isValidCoverageTokenFormat, isTokenExpired,
  dueReminderStage, REMINDER_STAGES,
} from "../mediaCrm";

describe("mediaCrm — normalizacja / dedup", () => {
  it("normalizeEmail: lower + trim", () => {
    expect(normalizeEmail("  Anna.Kowalska@WYBORCZA.pl ")).toBe("anna.kowalska@wyborcza.pl");
  });
  it("emailDomain", () => {
    expect(emailDomain("a@wyborcza.pl")).toBe("wyborcza.pl");
    expect(emailDomain("nie-email")).toBeNull();
  });
  it("normalizeOutletName: usuwa sufiksy prawne i akcenty", () => {
    expect(normalizeOutletName("Gazeta Wyborcza Sp. z o.o.")).toBe("gazeta wyborcza");
    expect(normalizeOutletName("TVN S.A.")).toBe("tvn");
    expect(normalizeOutletName("Łódź Times")).toBe("lodz times");
  });
  it("normalizeDomain: usuwa protokół/www/ścieżkę", () => {
    expect(normalizeDomain("https://www.Wyborcza.pl/artykul")).toBe("wyborcza.pl");
    expect(normalizeDomain("")).toBeNull();
  });
});

describe("mediaCrm — outlet dedup (nowy vs duplikat)", () => {
  it("ten sam outlet po nazwie → ten sam klucz (duplikat)", () => {
    const a = outletDedupKey({ name: "Gazeta Wyborcza" });
    const b = outletDedupKey({ name: "GAZETA WYBORCZA Sp. z o.o." });
    expect(a.normalizedName).toBe(b.normalizedName);
  });
  it("ten sam outlet po domenie → ta sama domena (duplikat)", () => {
    const a = outletDedupKey({ name: "Wyborcza", website: "https://wyborcza.pl" });
    const b = outletDedupKey({ name: "Gazeta", domain: "www.wyborcza.pl" });
    expect(a.domain).toBe("wyborcza.pl");
    expect(b.domain).toBe("wyborcza.pl");
  });
  it("różne media → różne klucze (nowy outlet)", () => {
    const a = outletDedupKey({ name: "Gazeta Wyborcza" });
    const b = outletDedupKey({ name: "Rzeczpospolita" });
    expect(a.normalizedName).not.toBe(b.normalizedName);
  });
});

describe("mediaCrm — quality rating", () => {
  it("etykiety 1–5", () => {
    expect(qualityLabel(5)).toBe("Top");
    expect(qualityLabel(1)).toContain("No-show");
    expect(qualityLabel(null)).toBe("—");
  });
  it("walidacja", () => {
    expect(isValidQualityRating(3)).toBe(true);
    expect(isValidQualityRating(0)).toBe(false);
    expect(isValidQualityRating(6)).toBe(false);
    expect(isValidQualityRating(2.5)).toBe(false);
  });
  it("sugestia: approved bez check-inu → 1 (no-show)", () => {
    expect(suggestQualityRating({ approved: 1, checkedIn: 0, coverageSubmitted: 0 })).toBe(1);
  });
  it("sugestia: przyszedł bez coverage → 2", () => {
    expect(suggestQualityRating({ approved: 1, checkedIn: 1, coverageSubmitted: 0 })).toBe(2);
  });
  it("sugestia: pełne coverage → 5", () => {
    expect(suggestQualityRating({ approved: 2, checkedIn: 2, coverageSubmitted: 2 })).toBe(5);
  });
});

describe("mediaCrm — wskaźniki", () => {
  it("no-show rate = 1 − checked_in/approved", () => {
    expect(noShowRate({ approved: 10, checkedIn: 7, coverageSubmitted: 0 })).toBe(30);
    expect(noShowRate({ approved: 0, checkedIn: 0, coverageSubmitted: 0 })).toBe(0);
  });
  it("show rate = checked_in/approved", () => {
    expect(showRate({ approved: 10, checkedIn: 7, coverageSubmitted: 0 })).toBe(70);
  });
  it("coverage rate = coverage_submitted/checked_in", () => {
    expect(coverageRate({ approved: 10, checkedIn: 8, coverageSubmitted: 6 })).toBe(75);
    expect(coverageRate({ approved: 5, checkedIn: 0, coverageSubmitted: 0 })).toBe(0);
  });
});

describe("mediaCrm — coverage statuses", () => {
  it("ma 4 statusy", () => {
    expect(COVERAGE_STATUSES).toEqual([
      "coverage_pending", "coverage_submitted", "coverage_verified", "coverage_missing",
    ]);
  });
  it("isCoverageStatus", () => {
    expect(isCoverageStatus("coverage_verified")).toBe(true);
    expect(isCoverageStatus("done")).toBe(false);
  });
  it("przejścia: pending→submitted OK, pending→verified NIE", () => {
    expect(canTransitionCoverage("coverage_pending", "coverage_submitted")).toBe(true);
    expect(canTransitionCoverage("coverage_pending", "coverage_verified")).toBe(false);
    expect(canTransitionCoverage("coverage_submitted", "coverage_verified")).toBe(true);
    expect(canTransitionCoverage("coverage_verified", "coverage_submitted")).toBe(true);
  });
});

describe("mediaCrm — token", () => {
  it("generuje token CVG- niezgadywalny i unikalny", () => {
    const t = generateCoverageToken();
    expect(t.startsWith("CVG-")).toBe(true);
    expect(isValidCoverageTokenFormat(t)).toBe(true);
    const set = new Set(Array.from({ length: 100 }, () => generateCoverageToken()));
    expect(set.size).toBe(100);
  });
  it("odrzuca niepoprawny format (invalid)", () => {
    expect(isValidCoverageTokenFormat("123")).toBe(false);
    expect(isValidCoverageTokenFormat("CVG-")).toBe(false);
    expect(isValidCoverageTokenFormat(null)).toBe(false);
  });
  it("wykrywa wygaśnięcie (expired)", () => {
    expect(isTokenExpired("2020-01-01T00:00:00Z")).toBe(true);
    expect(isTokenExpired("2999-01-01T00:00:00Z")).toBe(false);
    expect(isTokenExpired(null)).toBe(false);
  });
});

describe("mediaCrm — reminder schedule", () => {
  const eventEnd = "2026-06-01T12:00:00.000Z";
  it("przed 24h → null", () => {
    expect(dueReminderStage(eventEnd, [], new Date("2026-06-01T20:00:00Z"))).toBeNull();
  });
  it("po 24h, nic nie wysłane → 24h", () => {
    expect(dueReminderStage(eventEnd, [], new Date("2026-06-02T13:00:00Z"))).toBe("24h");
  });
  it("po 72h, 24h wysłane → 72h", () => {
    expect(dueReminderStage(eventEnd, ["24h"], new Date("2026-06-04T13:00:00Z"))).toBe("72h");
  });
  it("po 7d, 24h+72h wysłane → 7d", () => {
    expect(dueReminderStage(eventEnd, ["24h", "72h"], new Date("2026-06-09T13:00:00Z"))).toBe("7d");
  });
  it("wszystko wysłane → null", () => {
    expect(dueReminderStage(eventEnd, ["24h", "72h", "7d"], new Date("2026-07-01T00:00:00Z"))).toBeNull();
  });
  it("ma 3 etapy", () => {
    expect(REMINDER_STAGES).toEqual(["24h", "72h", "7d"]);
  });
});
