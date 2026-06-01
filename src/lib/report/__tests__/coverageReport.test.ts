import { describe, it, expect } from "vitest";
import {
  buildCoverageReport, buildPublicationsCsv,
  type ReportInput, type ReportCoverageRequest, type ReportCoverageItem,
} from "../coverageReport";

function makeInput(over: Partial<ReportInput> = {}): ReportInput {
  return {
    eventTitle: "Festiwal Łódź 2026",
    eventStart: "2026-06-01T10:00:00Z",
    eventEnd: "2026-06-03T22:00:00Z",
    eventLocation: "Łódź",
    submissions: [],
    guests: [],
    coverageRequests: [],
    coverageItems: [],
    ...over,
  };
}

function genCoverage(n: number, opts: { sponsorMentions?: number; reach?: number; verified?: boolean } = {}) {
  const requests: ReportCoverageRequest[] = [];
  const items: ReportCoverageItem[] = [];
  for (let i = 0; i < n; i++) {
    const id = `req-${i}`;
    requests.push({ id, email: `dz${i}@medium${i % 5}.pl`, media_name: `Medium ${i % 5}`, status: "coverage_verified" });
    items.push({
      coverage_request_id: id,
      article_url: `https://medium${i % 5}.pl/artykul-${i}`,
      estimated_reach: opts.reach ?? 1000 + i,
      sponsor_mentions: opts.sponsorMentions ?? 0,
      publication_type: "artykuł",
      verified_at: opts.verified === false ? null : "2026-06-05T10:00:00Z",
    });
  }
  return { requests, items };
}

describe("coverageReport — 0 coverage items", () => {
  it("pusty raport: zerowe metryki, brak publikacji", () => {
    const r = buildCoverageReport(makeInput());
    expect(r.funnel.submissions).toBe(0);
    expect(r.metrics.estimatedReach).toBe(0);
    expect(r.metrics.sponsorMentions).toBe(0);
    expect(r.metrics.publicationsCount).toBe(0);
    expect(r.metrics.reachVerified).toBe(false);
    expect(r.topPublications).toHaveLength(0);
    expect(r.allPublications).toHaveLength(0);
  });
});

describe("coverageReport — 10 coverage items", () => {
  it("liczy funnel, zasięg i publikacje", () => {
    const { requests, items } = genCoverage(10, { reach: 5000, sponsorMentions: 2 });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.funnel.coverageSubmitted).toBe(10);
    expect(r.metrics.publicationsCount).toBe(10);
    expect(r.metrics.estimatedReach).toBe(50000);
    expect(r.metrics.sponsorMentions).toBe(20);
    expect(r.topPublications.length).toBeLessThanOrEqual(10);
    expect(r.topOutlets.length).toBeLessThanOrEqual(10);
  });
});

describe("coverageReport — 100 coverage items", () => {
  it("agreguje 100 publikacji i ogranicza topy do 10", () => {
    const { requests, items } = genCoverage(100, { reach: 1000, sponsorMentions: 1 });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.metrics.publicationsCount).toBe(100);
    expect(r.metrics.sponsorMentions).toBe(100);
    expect(r.topPublications).toHaveLength(10);
    expect(r.topOutlets.length).toBe(5); // 5 unikalnych mediów (i % 5)
    expect(r.allPublications).toHaveLength(100);
  });
});

describe("coverageReport — sponsor mentions", () => {
  it("brak wzmianek → 0 i brak rekomendacji sponsor_relevant", () => {
    const { requests, items } = genCoverage(5, { sponsorMentions: 0 });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.metrics.sponsorMentions).toBe(0);
    expect(r.recommendations.some((x) => x.kind === "sponsor_relevant")).toBe(false);
  });
  it("wiele wzmianek → sponsor_relevant w rekomendacjach", () => {
    const { requests, items } = genCoverage(5, { sponsorMentions: 4 });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.metrics.sponsorMentions).toBe(20);
    expect(r.recommendations.some((x) => x.kind === "sponsor_relevant")).toBe(true);
  });
});

describe("coverageReport — missing coverage > 0", () => {
  it("liczy missing i generuje follow_up", () => {
    const requests: ReportCoverageRequest[] = [
      { id: "a", email: "a@x.pl", media_name: "Medium A", status: "coverage_verified" },
      { id: "b", email: "b@x.pl", media_name: "Medium B", status: "coverage_missing" },
      { id: "c", email: "c@x.pl", media_name: "Medium C", status: "coverage_pending" },
    ];
    const items: ReportCoverageItem[] = [
      { coverage_request_id: "a", article_url: "https://x.pl/a", estimated_reach: 100, verified_at: "2026-06-05T00:00:00Z" },
    ];
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.funnel.coverageMissing).toBe(1);
    expect(r.missingCoverage.length).toBe(2); // missing + pending
    expect(r.recommendations.some((x) => x.kind === "follow_up")).toBe(true);
  });
});

describe("coverageReport — funnel + metryki", () => {
  it("approval/check-in/no-show/coverage rate", () => {
    const submissions = [
      { email: "a@x.pl", status: "approved" }, { email: "b@x.pl", status: "approved_limited" },
      { email: "c@x.pl", status: "rejected" }, { email: "d@x.pl", status: "waitlisted" },
    ];
    const guests = [
      { email: "a@x.pl", company: "A", checked_in_at: "2026-06-01T12:00:00Z" },
      { email: "b@x.pl", company: "B", checked_in_at: null },
    ];
    const requests: ReportCoverageRequest[] = [{ id: "a", email: "a@x.pl", media_name: "A", status: "coverage_submitted" }];
    const r = buildCoverageReport(makeInput({ submissions, guests, coverageRequests: requests }));
    expect(r.funnel).toEqual({ submissions: 4, approved: 2, checkedIn: 1, coverageSubmitted: 1, coverageMissing: 0 });
    expect(r.metrics.approvalRate).toBe(50);   // 2/4
    expect(r.metrics.checkInRate).toBe(50);    // 1/2
    expect(r.metrics.noShowRate).toBe(50);     // 1 − 1/2
    expect(r.metrics.coverageRate).toBe(100);  // 1/1
  });

  it("reachVerified false gdy choć jeden item niezweryfikowany", () => {
    const { requests, items } = genCoverage(3, { verified: false });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(r.metrics.reachVerified).toBe(false);
  });
});

describe("coverageReport — CSV (polskie znaki)", () => {
  it("zawiera BOM, nagłówki i polskie znaki", () => {
    const { requests, items } = genCoverage(2, { reach: 1234 });
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    const csv = buildPublicationsCsv(r);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM
    expect(csv).toContain("Zasięg (est.)");
    expect(csv).toContain("Medium 0");
    expect(csv.split("\r\n").length).toBe(1 + 2); // header + 2 wiersze
  });
  it("escapuje przecinki i cudzysłowy", () => {
    const requests: ReportCoverageRequest[] = [{ id: "a", email: "a@x.pl", media_name: 'Medium, "X"', status: "coverage_verified" }];
    const items: ReportCoverageItem[] = [{ coverage_request_id: "a", article_url: "https://x.pl/a", verified_at: "2026-06-05T00:00:00Z" }];
    const r = buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    const csv = buildPublicationsCsv(r);
    expect(csv).toContain('"Medium, ""X"""');
  });
});

describe("coverageReport — wydajność (60s budget)", () => {
  it("buduje raport dla 100 itemów w <100ms (czysta logika)", () => {
    const { requests, items } = genCoverage(100, { reach: 9999, sponsorMentions: 3 });
    const t0 = performance.now();
    buildCoverageReport(makeInput({ coverageRequests: requests, coverageItems: items }));
    expect(performance.now() - t0).toBeLessThan(100);
  });
});
