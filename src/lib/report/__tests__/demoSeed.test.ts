import { describe, it, expect } from "vitest";
import {
  buildCoverageReport,
  type ReportSubmission, type ReportGuest, type ReportCoverageRequest, type ReportCoverageItem,
} from "../coverageReport";

/**
 * Weryfikuje, że dataset demo (Tydzień 8) daje raport o oczekiwanych liczbach.
 * Rozkład wg specyfikacji:
 *   50 submissions (30 approved, 5 approved_limited, 10 rejected, 5 waitlisted),
 *   25 checked-in, 18 coverage submitted/verified, 7 missing,
 *   sponsor mentions (5 publikacji ×3), 10 top publications (wysoki zasięg).
 */
function buildDemoDataset() {
  const submissions: ReportSubmission[] = [];
  const guests: ReportGuest[] = [];
  const coverageRequests: ReportCoverageRequest[] = [];
  const coverageItems: ReportCoverageItem[] = [];

  for (let i = 1; i <= 50; i++) {
    const email = `dz${i}@medium${i % 10}.pl`;
    const status = i <= 30 ? "approved" : i <= 35 ? "approved_limited" : i <= 45 ? "rejected" : "waitlisted";
    submissions.push({ email, status, media_organization: `Medium ${i % 10}` });

    if (status.startsWith("approved")) {
      const checked = i <= 25;
      guests.push({ email, company: `Medium ${i % 10}`, checked_in_at: checked ? "2026-06-01T12:00:00Z" : null, status: checked ? "checked-in" : "confirmed" });

      if (checked) {
        const covStatus = i <= 18 ? (i <= 10 ? "coverage_verified" : "coverage_submitted") : "coverage_missing";
        const reqId = `req-${i}`;
        coverageRequests.push({ id: reqId, email, media_name: `Medium ${i % 10}`, status: covStatus });
        if (covStatus !== "coverage_missing") {
          coverageItems.push({
            coverage_request_id: reqId,
            article_url: `https://medium${i % 10}.pl/relacja-${i}`,
            estimated_reach: i <= 10 ? 200000 - i * 15000 : 15000 + i * 500,
            sponsor_mentions: i <= 5 ? 3 : 0,
            publication_type: "artykuł",
            verified_at: covStatus === "coverage_verified" ? "2026-06-04T00:00:00Z" : null,
          });
        }
      }
    }
  }

  return { submissions, guests, coverageRequests, coverageItems };
}

describe("demo seed — Media Coverage Report", () => {
  const ds = buildDemoDataset();
  const report = buildCoverageReport({
    eventTitle: "Demo Press Festival 2026",
    eventStart: "2026-06-01T10:00:00Z",
    eventEnd: "2026-06-03T22:00:00Z",
    eventLocation: "Łódź",
    ...ds,
  });

  it("funnel zgodny ze specyfikacją seeda", () => {
    expect(report.funnel.submissions).toBe(50);
    expect(report.funnel.approved).toBe(35); // 30 + 5 limited
    expect(report.funnel.checkedIn).toBe(25);
    expect(report.funnel.coverageSubmitted).toBe(18); // verified + submitted
    expect(report.funnel.coverageMissing).toBe(7);
  });

  it("metryki demo", () => {
    expect(report.metrics.approvalRate).toBe(70); // 35/50
    expect(report.metrics.checkInRate).toBe(71);  // 25/35
    expect(report.metrics.coverageRate).toBe(72); // 18/25
    expect(report.metrics.sponsorMentions).toBe(15); // 5 × 3
    expect(report.metrics.publicationsCount).toBe(18);
  });

  it("top publications i missing coverage obecne", () => {
    expect(report.topPublications.length).toBe(10);
    expect(report.missingCoverage.length).toBe(7);
    expect(report.recommendations.some((r) => r.kind === "sponsor_relevant")).toBe(true);
    expect(report.recommendations.some((r) => r.kind === "follow_up")).toBe(true);
  });
});
