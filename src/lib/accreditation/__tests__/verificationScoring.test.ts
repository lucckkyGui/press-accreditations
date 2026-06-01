import { describe, it, expect } from "vitest";
import {
  calculateVerificationScore,
  getVerificationFlags,
  getRiskLevel,
  getScoreBand,
  needsManualReview,
  evaluateSubmission,
  applyManualOverride,
  isBusinessEmail,
  isFreeEmail,
  countValidLinks,
  REVIEW_THRESHOLD,
} from "../verificationScoring";
import type { SubmissionData } from "../types";

// ── Fixtury ──────────────────────────────────────────────────

/** Silny dziennikarz: domena służbowa, redakcja, 3+ linki, opis, prior. */
const strongJournalist: SubmissionData = {
  first_name: "Anna",
  last_name: "Kowalska",
  email: "anna.kowalska@wyborcza.pl",
  phone: "+48 600 100 200",
  role: "journalist",
  media_organization: "Gazeta Wyborcza",
  publication_links:
    "https://wyborcza.pl/artykul-1\nhttps://wyborcza.pl/artykul-2\nhttps://wyborcza.pl/artykul-3",
  coverage_description:
    "Planuję relację na żywo z konferencji, wywiady z prelegentami oraz artykuł podsumowujący.",
  requested_access: "Strefa prasowa, sala konferencyjna",
  previous_accreditation: true,
  consent_data_processing: true,
};

/** Słabe zgłoszenie: darmowa skrzynka, brak redakcji, brak linków. */
const weakGmail: SubmissionData = {
  first_name: "Jan",
  last_name: "Testowy",
  email: "jan.testowy@gmail.com",
  role: "journalist",
  consent_data_processing: true,
};

/** Fotoreporter bez portfolio i bez linków. */
const photographerNoPortfolio: SubmissionData = {
  first_name: "Piotr",
  last_name: "Obiektyw",
  email: "piotr@studiofoto.pl",
  phone: "+48 700 200 300",
  role: "photographer",
  coverage_description:
    "Reportaż fotograficzny z wydarzenia, sesja na scenie i za kulisami dla agencji.",
  requested_access: "Dostęp do sceny i strefy foto",
  consent_data_processing: true,
};

/** Influencer z profilami social media. */
const influencerWithSocials: SubmissionData = {
  first_name: "Kasia",
  last_name: "Creator",
  email: "kasia@kasiacreator.com",
  phone: "+48 800 300 400",
  role: "influencer",
  social_media: "instagram.com/kasiacreator, tiktok.com/@kasiacreator",
  coverage_description:
    "Relacja w stories i rolkach, posty z wydarzenia, zasięg około 50 tys. obserwujących.",
  publication_links: "https://kasiacreator.com/blog/event",
  requested_access: "Strefa foto",
  consent_data_processing: true,
};

// ── Helpery ──────────────────────────────────────────────────

describe("verificationScoring — helpery", () => {
  it("isBusinessEmail: służbowa TAK, darmowa/jednorazowa NIE", () => {
    expect(isBusinessEmail("anna@wyborcza.pl")).toBe(true);
    expect(isBusinessEmail("jan@gmail.com")).toBe(false);
    expect(isBusinessEmail("x@mailinator.com")).toBe(false);
    expect(isBusinessEmail("nie-email")).toBe(false);
  });

  it("isFreeEmail: rozpoznaje globalne i PL darmowe domeny", () => {
    expect(isFreeEmail("a@gmail.com")).toBe(true);
    expect(isFreeEmail("a@wp.pl")).toBe(true);
    expect(isFreeEmail("a@onet.pl")).toBe(true);
    expect(isFreeEmail("a@wyborcza.pl")).toBe(false);
  });

  it("countValidLinks: liczy tylko poprawne http/https", () => {
    expect(countValidLinks("https://a.pl\nhttps://b.pl\nhttps://c.pl")).toBe(3);
    expect(countValidLinks("https://a.pl\nnie-url")).toBe(1);
    expect(countValidLinks("")).toBe(0);
  });

  it("getScoreBand: progi 80 / 60 / 40", () => {
    expect(getScoreBand(90)).toBe("strong");
    expect(getScoreBand(80)).toBe("strong");
    expect(getScoreBand(70)).toBe("acceptable");
    expect(getScoreBand(50)).toBe("needs_review");
    expect(getScoreBand(10)).toBe("weak");
  });

  it("needsManualReview: < 60 wymaga weryfikacji", () => {
    expect(needsManualReview(59)).toBe(true);
    expect(needsManualReview(60)).toBe(false);
    expect(REVIEW_THRESHOLD).toBe(60);
  });

  it("getRiskLevel: high flag dominuje; niski wynik podnosi ryzyko", () => {
    expect(getRiskLevel(90, [])).toBe("low");
    expect(getRiskLevel(70, [{ code: "x", severity: "medium", message: "" }])).toBe("medium");
    expect(getRiskLevel(50, [])).toBe("medium");
    expect(getRiskLevel(30, [])).toBe("high");
    expect(getRiskLevel(95, [{ code: "x", severity: "high", message: "" }])).toBe("high");
  });
});

// ── Wymagane przypadki testowe ───────────────────────────────

describe("verificationScoring — przypadki produktowe", () => {
  it("1. silny dziennikarz → wysoki wynik, niskie ryzyko", () => {
    const r = evaluateSubmission(strongJournalist);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.band).toBe("strong");
    expect(r.riskLevel).toBe("low");
    expect(r.needsManualReview).toBe(false);
    expect(r.flags.filter((f) => f.severity === "high")).toHaveLength(0);
    expect(r.explanation).toContain("/100");
  });

  it("2. słaby Gmail bez linków → niski wynik, wysokie ryzyko, needs_review", () => {
    const r = evaluateSubmission(weakGmail);
    expect(r.score).toBeLessThan(REVIEW_THRESHOLD);
    expect(r.needsManualReview).toBe(true);
    expect(r.band).toBe("weak");
    expect(r.riskLevel).toBe("high");
    const codes = r.flags.map((f) => f.code);
    expect(codes).toContain("journalist_no_organization");
    expect(codes).toContain("no_publication_links");
    expect(codes).toContain("free_email_no_evidence");
  });

  it("3. fotoreporter bez portfolio → flaga high, ryzyko high", () => {
    const r = evaluateSubmission(photographerNoPortfolio);
    const portfolioFlag = r.flags.find((f) => f.code === "photographer_no_portfolio");
    expect(portfolioFlag).toBeDefined();
    expect(portfolioFlag?.severity).toBe("high");
    expect(r.riskLevel).toBe("high");
    expect(r.needsManualReview).toBe(true);
  });

  it("4. influencer z social media → bonus social, brak high ryzyka", () => {
    const r = evaluateSubmission(influencerWithSocials);
    expect(r.contributions.map((c) => c.code)).toContain("social_influencer");
    expect(r.riskLevel).not.toBe("high");
    expect(r.flags.filter((f) => f.severity === "high")).toHaveLength(0);
    expect(r.score).toBeGreaterThanOrEqual(50);

    // bonus social jest faktycznie odzwierciedlony w wyniku
    const withoutSocial = calculateVerificationScore({ ...influencerWithSocials, social_media: "" });
    expect(r.score).toBeGreaterThan(withoutSocial);
  });

  it("5. możliwy duplikat → flaga medium, ryzyko min. medium", () => {
    const baseline = evaluateSubmission(strongJournalist);
    const dup = evaluateSubmission(strongJournalist, { possibleDuplicate: true });
    const dupFlag = dup.flags.find((f) => f.code === "possible_duplicate");
    expect(dupFlag).toBeDefined();
    expect(dupFlag?.severity).toBe("medium");
    expect(dup.riskLevel).toBe("medium");
    // duplikat obniża wynik względem czystego zgłoszenia
    expect(dup.score).toBeLessThan(baseline.score);
  });

  it("6. wcześniejsza akredytacja → dokładnie +5 do wyniku", () => {
    const noPrev = calculateVerificationScore({
      ...influencerWithSocials,
      previous_accreditation: false,
    });
    const withPrev = calculateVerificationScore({
      ...influencerWithSocials,
      previous_accreditation: true,
    });
    expect(withPrev - noPrev).toBe(5);
  });

  it("7. ręczne nadpisanie → nadpisuje wynik/ryzyko, zachowuje wyliczenie", () => {
    const computed = evaluateSubmission(weakGmail);
    expect(computed.score).toBeLessThan(REVIEW_THRESHOLD);

    const overridden = applyManualOverride(computed, {
      score: 85,
      riskLevel: "low",
      notes: "Znam tę dziennikarkę osobiście — wiarygodne medium.",
      overriddenBy: "pr-manager-1",
    });

    expect(overridden.overridden).toBe(true);
    expect(overridden.score).toBe(85);
    expect(overridden.band).toBe("strong");
    expect(overridden.riskLevel).toBe("low");
    expect(overridden.needsManualReview).toBe(false);
    expect(overridden.overriddenBy).toBe("pr-manager-1");
    expect(overridden.overriddenAt).toBeTruthy();
    // pierwotne wyliczenie zachowane do audytu
    expect(overridden.computed.score).toBe(computed.score);
  });
});

// ── Gwarancje produktowe / determinizm ───────────────────────

describe("verificationScoring — gwarancje", () => {
  it("wynik zawsze w zakresie 0–100", () => {
    expect(calculateVerificationScore(strongJournalist)).toBeLessThanOrEqual(100);
    expect(calculateVerificationScore(weakGmail)).toBeGreaterThanOrEqual(0);
  });

  it("scoring jest deterministyczny", () => {
    const a = evaluateSubmission(strongJournalist);
    const b = evaluateSubmission(strongJournalist);
    expect(a.score).toBe(b.score);
    expect(a.flags).toEqual(b.flags);
  });

  it("NIE podejmuje automatycznej decyzji approve/reject", () => {
    const r = evaluateSubmission(strongJournalist) as unknown as Record<string, unknown>;
    expect("decision" in r).toBe(false);
    expect("approved" in r).toBe(false);
    expect("status" in r).toBe(false);
  });

  it("każde zgłoszenie ma niepuste uzasadnienie", () => {
    for (const fx of [strongJournalist, weakGmail, photographerNoPortfolio, influencerWithSocials]) {
      const r = evaluateSubmission(fx);
      expect(r.explanation.length).toBeGreaterThan(0);
      expect(Array.isArray(getVerificationFlags(fx))).toBe(true);
    }
  });
});
