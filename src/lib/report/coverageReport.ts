/**
 * Media Coverage Report — czysta logika budowy raportu (bez Supabase, bez jsPDF).
 *
 * Z surowych danych (submissions, guests/akredytacje, coverage_requests,
 * coverage_items) buduje: funnel, metryki, rankingi (top outlets / publications /
 * missing), rekomendacje. W pełni testowalne w vitest.
 */

import {
  noShowRate as calcNoShow, coverageRate as calcCoverage,
} from "@/lib/crm/mediaCrm";

// ─────────────────────────────────────────────────────────────
// Wejście
// ─────────────────────────────────────────────────────────────

export interface ReportSubmission {
  email: string;
  status: string; // pending/approved/approved_limited/rejected/waitlisted/expired
  media_organization?: string | null;
}

export interface ReportGuest {
  email: string;
  company?: string | null;
  checked_in_at?: string | null;
  status?: string | null;
}

export interface ReportCoverageRequest {
  id: string;
  email: string;
  media_name?: string | null;
  status: string; // coverage_pending/submitted/verified/missing
}

export interface ReportCoverageItem {
  coverage_request_id: string;
  article_url?: string | null;
  gallery_url?: string | null;
  video_url?: string | null;
  social_post_url?: string | null;
  publication_date?: string | null;
  estimated_reach?: number | null;
  sponsor_mentions?: number | null;
  publication_type?: string | null;
  verified_at?: string | null;
}

export interface ReportInput {
  eventTitle: string;
  eventStart?: string | null;
  eventEnd?: string | null;
  eventLocation?: string | null;
  submissions: ReportSubmission[];
  guests: ReportGuest[];
  coverageRequests: ReportCoverageRequest[];
  coverageItems: ReportCoverageItem[];
}

// ─────────────────────────────────────────────────────────────
// Wyjście
// ─────────────────────────────────────────────────────────────

export interface ReportFunnel {
  submissions: number;
  approved: number;
  checkedIn: number;
  coverageSubmitted: number;
  coverageMissing: number;
}

export interface ReportMetrics {
  approvalRate: number;   // approved / submissions
  checkInRate: number;    // checked_in / approved
  noShowRate: number;     // 1 − checked_in/approved
  coverageRate: number;   // coverage_submitted / checked_in
  estimatedReach: number; // suma estimated_reach
  reachVerified: boolean; // true tylko gdy wszystkie itemy zweryfikowane
  sponsorMentions: number;
  publicationsCount: number;
}

export interface OutletRanking {
  outlet: string;
  publications: number;
  reach: number;
  sponsorMentions: number;
}

export interface PublicationRow {
  outlet: string;
  url: string;
  type: string | null;
  reach: number | null;
  sponsorMentions: number | null;
  publicationDate: string | null;
  verified: boolean;
}

export interface MissingCoverageRow {
  name: string;
  outlet: string | null;
  email: string;
  status: string;
}

export type RecommendationKind = "invite_again" | "follow_up" | "deprioritize" | "sponsor_relevant";

export interface Recommendation {
  kind: RecommendationKind;
  label: string;
  outlet: string;
  reason: string;
}

export interface CoverageReport {
  event: { title: string; start: string | null; end: string | null; location: string | null };
  funnel: ReportFunnel;
  metrics: ReportMetrics;
  topOutlets: OutletRanking[];
  topPublications: PublicationRow[];
  allPublications: PublicationRow[];
  missingCoverage: MissingCoverageRow[];
  recommendations: Recommendation[];
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Helpery
// ─────────────────────────────────────────────────────────────

const APPROVED_STATUSES = new Set(["approved", "approved_limited"]);
const normEmail = (e: string | null | undefined) => (e ?? "").trim().toLowerCase();

function pct(a: number, b: number): number {
  if (b <= 0) return 0;
  return Math.round((a / b) * 100);
}

function firstUrl(item: ReportCoverageItem): string | null {
  return item.article_url || item.video_url || item.gallery_url || item.social_post_url || null;
}

// ─────────────────────────────────────────────────────────────
// Budowa raportu
// ─────────────────────────────────────────────────────────────

export function buildCoverageReport(input: ReportInput, now: Date = new Date()): CoverageReport {
  const submissions = input.submissions ?? [];
  const guests = input.guests ?? [];
  const requests = input.coverageRequests ?? [];
  const items = input.coverageItems ?? [];

  // ── Funnel ──
  const submissionsCount = submissions.length;
  const approvedCount = submissions.filter((s) => APPROVED_STATUSES.has(s.status)).length;
  const checkedInCount = guests.filter((g) => !!g.checked_in_at && g.status !== "revoked").length;
  const coverageSubmitted = requests.filter((r) => r.status === "coverage_submitted" || r.status === "coverage_verified").length;
  const coverageMissing = requests.filter((r) => r.status === "coverage_missing").length;

  const funnel: ReportFunnel = {
    submissions: submissionsCount,
    approved: approvedCount,
    checkedIn: checkedInCount,
    coverageSubmitted,
    coverageMissing,
  };

  // ── Metryki ──
  const estimatedReach = items.reduce((sum, it) => sum + (it.estimated_reach ?? 0), 0);
  const sponsorMentions = items.reduce((sum, it) => sum + (it.sponsor_mentions ?? 0), 0);
  const reachVerified = items.length > 0 && items.every((it) => !!it.verified_at);

  const metrics: ReportMetrics = {
    approvalRate: pct(approvedCount, submissionsCount),
    checkInRate: pct(checkedInCount, approvedCount),
    noShowRate: calcNoShow({ approved: approvedCount, checkedIn: checkedInCount, coverageSubmitted }),
    coverageRate: calcCoverage({ approved: approvedCount, checkedIn: checkedInCount, coverageSubmitted }),
    estimatedReach,
    reachVerified,
    sponsorMentions,
    publicationsCount: items.length,
  };

  // ── Mapowanie request → outlet/nazwa ──
  const reqById = new Map(requests.map((r) => [r.id, r]));
  const guestByEmail = new Map(guests.map((g) => [normEmail(g.email), g]));

  const outletForRequest = (r: ReportCoverageRequest | undefined): string => {
    if (!r) return "—";
    if (r.media_name?.trim()) return r.media_name.trim();
    const g = guestByEmail.get(normEmail(r.email));
    return g?.company?.trim() || "—";
  };

  // ── Publikacje ──
  const allPublications: PublicationRow[] = items.map((it) => {
    const r = reqById.get(it.coverage_request_id);
    return {
      outlet: outletForRequest(r),
      url: firstUrl(it) ?? "",
      type: it.publication_type ?? null,
      reach: it.estimated_reach ?? null,
      sponsorMentions: it.sponsor_mentions ?? null,
      publicationDate: it.publication_date ?? null,
      verified: !!it.verified_at,
    };
  });

  const topPublications = [...allPublications]
    .sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))
    .slice(0, 10);

  // ── Top outlets ──
  const outletMap = new Map<string, OutletRanking>();
  for (const p of allPublications) {
    const key = p.outlet;
    const cur = outletMap.get(key) ?? { outlet: key, publications: 0, reach: 0, sponsorMentions: 0 };
    cur.publications += 1;
    cur.reach += p.reach ?? 0;
    cur.sponsorMentions += p.sponsorMentions ?? 0;
    outletMap.set(key, cur);
  }
  const topOutlets = [...outletMap.values()].sort((a, b) => b.reach - a.reach).slice(0, 10);

  // ── Missing coverage ──
  const missingCoverage: MissingCoverageRow[] = requests
    .filter((r) => r.status === "coverage_missing" || r.status === "coverage_pending")
    .map((r) => {
      const g = guestByEmail.get(normEmail(r.email));
      const name = [g?.company].filter(Boolean).join(" ");
      return {
        name: r.media_name || name || r.email,
        outlet: r.media_name ?? g?.company ?? null,
        email: r.email,
        status: r.status,
      };
    });

  // ── Rekomendacje ──
  const recommendations = buildRecommendations({ topOutlets, missingCoverage, guests, requests });

  return {
    event: {
      title: input.eventTitle,
      start: input.eventStart ?? null,
      end: input.eventEnd ?? null,
      location: input.eventLocation ?? null,
    },
    funnel,
    metrics,
    topOutlets,
    topPublications,
    allPublications,
    missingCoverage,
    recommendations,
    generatedAt: now.toISOString(),
  };
}

const REC_LABEL: Record<RecommendationKind, string> = {
  invite_again: "Zaproś ponownie",
  follow_up: "Follow-up",
  deprioritize: "Despriorytetyzuj",
  sponsor_relevant: "Istotne dla sponsora",
};

function buildRecommendations(params: {
  topOutlets: OutletRanking[];
  missingCoverage: MissingCoverageRow[];
  guests: ReportGuest[];
  requests: ReportCoverageRequest[];
}): Recommendation[] {
  const recs: Recommendation[] = [];

  // invite_again + sponsor_relevant: outlety z największym zasięgiem / wzmiankami sponsora
  for (const o of params.topOutlets.slice(0, 5)) {
    if (o.sponsorMentions > 0) {
      recs.push({ kind: "sponsor_relevant", label: REC_LABEL.sponsor_relevant, outlet: o.outlet,
        reason: `${o.sponsorMentions} wzmianek sponsora, zasięg ${o.reach.toLocaleString("pl-PL")}` });
    }
    if (o.reach > 0) {
      recs.push({ kind: "invite_again", label: REC_LABEL.invite_again, outlet: o.outlet,
        reason: `Dostarczył(a) ${o.publications} publikacji, zasięg ${o.reach.toLocaleString("pl-PL")}` });
    }
  }

  // follow_up: missing/pending coverage
  for (const m of params.missingCoverage.slice(0, 10)) {
    recs.push({ kind: "follow_up", label: REC_LABEL.follow_up, outlet: m.outlet ?? m.name,
      reason: m.status === "coverage_missing" ? "Brak dostarczonej publikacji" : "Coverage wciąż oczekuje" });
  }

  // deprioritize: no-show (approved-checked-in można policzyć z guests; tu uproszczone — brak check-inu)
  const checkedInEmails = new Set(params.guests.filter((g) => g.checked_in_at).map((g) => normEmail(g.email)));
  const noShows = params.guests.filter((g) => !g.checked_in_at && g.status !== "revoked");
  void checkedInEmails;
  for (const g of noShows.slice(0, 5)) {
    recs.push({ kind: "deprioritize", label: REC_LABEL.deprioritize, outlet: g.company ?? g.email,
      reason: "Akredytacja przyznana, brak check-inu (no-show)" });
  }

  // Deduplikacja po (kind, outlet)
  const seen = new Set<string>();
  return recs.filter((r) => {
    const k = `${r.kind}::${r.outlet}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─────────────────────────────────────────────────────────────
// CSV export (czysta funkcja)
// ─────────────────────────────────────────────────────────────

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Buduje CSV wszystkich publikacji (BOM dla Excela + polskie znaki). */
export function buildPublicationsCsv(report: CoverageReport): string {
  const header = ["Medium", "URL", "Typ", "Zasięg (est.)", "Wzmianki sponsora", "Data publikacji", "Zweryfikowane"];
  const rows = report.allPublications.map((p) => [
    p.outlet, p.url, p.type ?? "", p.reach ?? "", p.sponsorMentions ?? "",
    p.publicationDate ?? "", p.verified ? "tak" : "nie",
  ]);
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
  return "﻿" + lines.join("\r\n");
}
