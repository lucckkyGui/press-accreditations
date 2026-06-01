/**
 * Media CRM + Coverage — czysta logika (bez Supabase).
 *
 * Normalizacja i deduplikacja (outlet po nazwie/domenie, contact po e-mailu),
 * quality rating, wskaźniki (no-show rate, coverage rate), statusy coverage,
 * token secure-linku. W pełni testowalne w vitest.
 */

// ─────────────────────────────────────────────────────────────
// Normalizacja / deduplikacja
// ─────────────────────────────────────────────────────────────

/** Normalizuje e-mail do klucza deduplikacji (lower + trim). */
export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Wyciąga domenę z e-maila (część po @). */
export function emailDomain(email: string | null | undefined): string | null {
  const e = normalizeEmail(email);
  const at = e.indexOf("@");
  return at >= 0 && at < e.length - 1 ? e.slice(at + 1) : null;
}

/**
 * Normalizuje nazwę medium do klucza deduplikacji:
 * lower, usuwa akcenty, sufiksy prawne (sp. z o.o., ltd…), znaki niealfanumeryczne,
 * zwija whitespace. „Gazeta Wyborcza Sp. z o.o." == „gazeta wyborcza".
 */
export function normalizeOutletName(name: string | null | undefined): string {
  const base = (name ?? "")
    .replace(/[Łł]/g, "l")
    .replace(/[Øø]/g, "o")
    .replace(/[Đđ]/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  return base
    .replace(/\b(sp\.?\s*z\.?\s*o\.?\s*o\.?|s\.?a\.?|ltd\.?|llc|inc\.?|gmbh|co\.?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Normalizuje domenę WWW: usuwa protokół, www., ścieżkę, lower. */
export function normalizeDomain(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim().toLowerCase();
  if (!raw) return null;
  const noProto = raw.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const host = noProto.split(/[/?#]/)[0];
  return host || null;
}

/**
 * Klucz deduplikacji medium. Preferuje domenę (gdy jest), inaczej znormalizowaną
 * nazwę. Dwa media z tą samą domeną LUB tą samą znormalizowaną nazwą = duplikat.
 */
export function outletDedupKey(params: { name?: string | null; domain?: string | null; website?: string | null }): {
  normalizedName: string;
  domain: string | null;
} {
  const domain = normalizeDomain(params.domain ?? params.website ?? null);
  return { normalizedName: normalizeOutletName(params.name), domain };
}

// ─────────────────────────────────────────────────────────────
// Quality rating
// ─────────────────────────────────────────────────────────────

export type QualityRating = 1 | 2 | 3 | 4 | 5;

export const QUALITY_LABEL: Record<QualityRating, string> = {
  5: "Top",
  4: "Good",
  3: "OK",
  2: "Weak",
  1: "No-show / brak coverage",
};

export function qualityLabel(rating: number | null | undefined): string {
  if (rating == null) return "—";
  const r = Math.max(1, Math.min(5, Math.round(rating))) as QualityRating;
  return QUALITY_LABEL[r];
}

export function isValidQualityRating(rating: unknown): rating is QualityRating {
  return typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// ─────────────────────────────────────────────────────────────
// Wskaźniki (rates)
// ─────────────────────────────────────────────────────────────

/** Zaokrąglony procent a/b w 0–100 (b=0 → 0). */
function pct(a: number, b: number): number {
  if (b <= 0) return 0;
  return Math.round((a / b) * 100);
}

export interface ContactStats {
  approved: number;
  checkedIn: number;
  coverageSubmitted: number;
}

/** No-show rate = 1 − checked_in/approved (procent nieobecnych zaakceptowanych). */
export function noShowRate(stats: ContactStats): number {
  if (stats.approved <= 0) return 0;
  return Math.max(0, Math.min(100, 100 - pct(stats.checkedIn, stats.approved)));
}

/** Show rate = checked_in / approved. */
export function showRate(stats: ContactStats): number {
  return pct(stats.checkedIn, stats.approved);
}

/** Coverage rate = coverage_submitted / checked_in. */
export function coverageRate(stats: ContactStats): number {
  return pct(stats.coverageSubmitted, stats.checkedIn);
}

/**
 * Sugerowany quality rating na podstawie zachowania:
 *  - 0 check-inów przy ≥1 approved → 1 (no-show),
 *  - przyszedł, brak coverage → 2,
 *  - coverage <50% → 3, <100% → 4, =100% (i ≥1) → 5.
 * Sugestia — PR manager może nadpisać.
 */
export function suggestQualityRating(stats: ContactStats): QualityRating {
  if (stats.approved > 0 && stats.checkedIn === 0) return 1;
  if (stats.checkedIn > 0 && stats.coverageSubmitted === 0) return 2;
  const rate = coverageRate(stats);
  if (rate >= 100 && stats.coverageSubmitted > 0) return 5;
  if (rate >= 50) return 4;
  return 3;
}

// ─────────────────────────────────────────────────────────────
// Coverage statuses
// ─────────────────────────────────────────────────────────────

export type CoverageStatus =
  | "coverage_pending"
  | "coverage_submitted"
  | "coverage_verified"
  | "coverage_missing";

export const COVERAGE_STATUS_META: Record<CoverageStatus, { label: string; tone: "neutral" | "info" | "ok" | "bad" }> = {
  coverage_pending:   { label: "Oczekuje",     tone: "neutral" },
  coverage_submitted: { label: "Dostarczono",  tone: "info" },
  coverage_verified:  { label: "Zweryfikowano", tone: "ok" },
  coverage_missing:   { label: "Brak",          tone: "bad" },
};

export const COVERAGE_STATUSES: CoverageStatus[] = [
  "coverage_pending", "coverage_submitted", "coverage_verified", "coverage_missing",
];

export function isCoverageStatus(v: unknown): v is CoverageStatus {
  return typeof v === "string" && (COVERAGE_STATUSES as string[]).includes(v);
}

/** Dozwolone przejścia statusu coverage (PR manager / submit przez link). */
export function canTransitionCoverage(from: CoverageStatus, to: CoverageStatus): boolean {
  if (from === to) return true;
  const allowed: Record<CoverageStatus, CoverageStatus[]> = {
    coverage_pending:   ["coverage_submitted", "coverage_missing"],
    coverage_submitted: ["coverage_verified", "coverage_pending", "coverage_missing"],
    coverage_verified:  ["coverage_submitted"], // cofnięcie weryfikacji
    coverage_missing:   ["coverage_pending", "coverage_submitted"],
  };
  return allowed[from].includes(to);
}

// ─────────────────────────────────────────────────────────────
// Secure token (link do formularza coverage bez logowania)
// ─────────────────────────────────────────────────────────────

const TOKEN_PREFIX = "CVG";
const BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0, value = 0, out = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

/** Generuje secure token coverage (`CVG-` + 160 bitów Base32). Niezgadywalny. */
export function generateCoverageToken(): string {
  const bytes = new Uint8Array(20);
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return `${TOKEN_PREFIX}-${encodeBase32(bytes)}`;
}

export function isValidCoverageTokenFormat(token: unknown): boolean {
  return typeof token === "string" && new RegExp(`^${TOKEN_PREFIX}-[${BASE32}]{16,}$`).test(token);
}

/** Czy token wygasł (null = bez wygaśnięcia). */
export function isTokenExpired(expiresAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < now.getTime();
}

// ─────────────────────────────────────────────────────────────
// Reminder schedule (24h / 72h / 7d po evencie)
// ─────────────────────────────────────────────────────────────

export type ReminderStage = "24h" | "72h" | "7d";

export const REMINDER_OFFSETS_HOURS: Record<ReminderStage, number> = {
  "24h": 24,
  "72h": 72,
  "7d": 168,
};

export const REMINDER_STAGES: ReminderStage[] = ["24h", "72h", "7d"];

/**
 * Który etap remindera jest należny dla danego eventu, biorąc pod uwagę już wysłane.
 * Zwraca najpóźniejszy „dojrzały" i jeszcze niewysłany etap, albo null.
 */
export function dueReminderStage(
  eventEnd: string | null | undefined,
  sentStages: string[],
  now: Date = new Date(),
): ReminderStage | null {
  if (!eventEnd) return null;
  const end = new Date(eventEnd);
  if (Number.isNaN(end.getTime())) return null;
  const hoursSince = (now.getTime() - end.getTime()) / 3_600_000;
  if (hoursSince < 0) return null;

  let due: ReminderStage | null = null;
  for (const stage of REMINDER_STAGES) {
    if (hoursSince >= REMINDER_OFFSETS_HOURS[stage] && !sentStages.includes(stage)) {
      due = stage; // bierz najpóźniejszy dojrzały niewysłany
    }
  }
  return due;
}
