/**
 * Media Verification Engine — scoring i ostrzeżenia dla zgłoszeń medialnych.
 *
 * Cel produktowy: PR manager ocenia zgłoszenie w < 60 s. System SUGERUJE,
 * WYJAŚNIA i FLAGUJE ryzyko — NIGDY nie podejmuje automatycznej decyzji
 * approve/reject. Ostateczną decyzję zawsze podejmuje człowiek.
 *
 * Pure TS — w pełni testowalne w vitest, bez zależności od Supabase.
 *
 * UWAGA: Edge function `supabase/functions/landing-page-register/index.ts`
 * implementuje równoległą (zsynchronizowaną logicznie) kopię tych reguł, bo
 * Deno nie importuje z `src/`. Każda zmiana wag/reguł MUSI być odzwierciedlona
 * w obu miejscach. Backend jest źródłem prawdy.
 */

import {
  isValidEmail,
  isDisposableEmail,
  isValidUrl,
  splitLinks,
} from "./submissionValidation";
import { type SubmissionData, type MediaRole, MEDIA_ROLE_VALUES } from "./types";

// ─────────────────────────────────────────────────────────────
// Typy
// ─────────────────────────────────────────────────────────────

export type VerificationRiskLevel = "low" | "medium" | "high";

/** 4-stopniowy pasek jakości zgłoszenia (band). */
export type VerificationBand = "strong" | "acceptable" | "needs_review" | "weak";

export type FlagSeverity = "high" | "medium" | "low";

/** Pojedyncze ostrzeżenie/sygnał dla weryfikatora. */
export interface VerificationFlag {
  code: string;
  severity: FlagSeverity;
  message: string;
}

/** Pojedynczy wkład do wyniku (dodatni = atut, ujemny = ryzyko). */
export interface ScoreContribution {
  code: string;
  label: string;
  points: number;
}

/** Pełny wynik analizy zgłoszenia. */
export interface VerificationResult {
  /** Wynik 0–100 (po przycięciu). */
  score: number;
  band: VerificationBand;
  riskLevel: VerificationRiskLevel;
  flags: VerificationFlag[];
  /** Rozbicie wyniku (do wyświetlenia „dlaczego taki wynik"). */
  contributions: ScoreContribution[];
  /** Czytelne dla człowieka uzasadnienie (PL). */
  explanation: string;
  /** true gdy wynik < 60 → wymaga ręcznej weryfikacji. */
  needsManualReview: boolean;
}

/** Kontekst spoza samych danych formularza (np. flaga duplikatu z backendu). */
export interface VerificationContext {
  /** Miękka flaga możliwego duplikatu (ustawiana przez edge function). */
  possibleDuplicate?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Stałe / progi (jedno miejsce do kalibracji)
// ─────────────────────────────────────────────────────────────

/** Próg „kompletnego" opisu relacji (znaki). */
const COVERAGE_MIN_LENGTH = 40;

/** Próg ręcznej weryfikacji — poniżej tego status = needs_review. */
export const REVIEW_THRESHOLD = 60;

/** Progi pasków jakości. */
export const BAND_THRESHOLDS = {
  strong: 80,
  acceptable: 60,
  needs_review: 40,
} as const;

/** Wagi punktowe (atuty). */
const POINTS = {
  businessEmail: 15,
  mediaOrganization: 10,
  publicationLinks: 15,
  publicationLinksRich: 15, // dodatkowo przy 3+ linkach
  portfolioPrimary: 15, // foto/wideo — portfolio jest kluczowe
  portfolioSecondary: 10, // pozostałe role — strona autora
  socialInfluencer: 10,
  socialSecondary: 5,
  coverageDescription: 10,
  previousAccreditation: 5,
  formCompleteness: 10,
} as const;

/** Kary punktowe (ryzyka). */
const PENALTIES = {
  disposableEmail: -50,
  journalistNoOrganization: -25,
  noEvidencePhotographer: -25,
  noEvidenceJournalist: -20,
  noEvidenceVideo: -20,
  noEvidenceInfluencer: -20,
  noEvidenceOther: -15,
  freeEmailNoEvidence: -20,
  possibleDuplicate: -10,
} as const;

/** Próg kompletności formularza (udział wypełnionych pól). */
const COMPLETENESS_RATIO = 0.75;
const COMPLETENESS_FIELDS: (keyof SubmissionData)[] = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "role",
  "media_organization",
  "coverage_description",
  "requested_access",
];

/**
 * Domeny darmowych skrzynek (nie-służbowych). Współdzielone z edge function —
 * utrzymywać w synchronizacji. Lista celowo zachowawcza (lepiej nie ukarać
 * niż błędnie ukarać legalną redakcję).
 */
export const FREE_EMAIL_DOMAINS: string[] = [
  // globalne
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "gmx.com",
  "gmx.net",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "mail.com",
  // PL
  "wp.pl",
  "o2.pl",
  "onet.pl",
  "onet.eu",
  "op.pl",
  "interia.pl",
  "interia.eu",
  "poczta.onet.pl",
  "poczta.fm",
  "gazeta.pl",
  "tlen.pl",
  "vp.pl",
  "go2.pl",
  "buziaczek.pl",
];

// ─────────────────────────────────────────────────────────────
// Helpery
// ─────────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nonEmptyStr(value: unknown): boolean {
  return str(value).length > 0;
}

function emailDomain(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain || null;
}

export function isFreeEmail(email: unknown): boolean {
  const domain = emailDomain(email);
  return domain ? FREE_EMAIL_DOMAINS.includes(domain) : false;
}

/** E-mail służbowy/medialny = poprawny, nie-tymczasowy i nie z darmowej domeny. */
export function isBusinessEmail(email: unknown): boolean {
  if (!isValidEmail(email)) return false;
  if (isDisposableEmail(email)) return false;
  return !isFreeEmail(email);
}

/** Liczba poprawnych (http/https) linków w polu publication_links. */
export function countValidLinks(value: unknown): number {
  return splitLinks(value).filter((l) => isValidUrl(l)).length;
}

function normalizeRole(role: unknown): MediaRole {
  return typeof role === "string" && (MEDIA_ROLE_VALUES as string[]).includes(role)
    ? (role as MediaRole)
    : "other";
}

/** Czy zgłoszenie zawiera materiał dowodowy właściwy dla danej roli. */
function hasRoleEvidence(submission: SubmissionData, role: MediaRole): boolean {
  const links = countValidLinks(submission.publication_links);
  const portfolio = isValidUrl(submission.portfolio_url);
  const social = nonEmptyStr(submission.social_media);
  const coverageOk = str(submission.coverage_description).length >= COVERAGE_MIN_LENGTH;

  switch (role) {
    case "journalist":
      return links >= 1;
    case "photographer":
      return portfolio || links >= 1;
    case "video":
      return coverageOk || portfolio || links >= 1;
    case "influencer":
      return social;
    case "radio":
    case "podcast":
      return coverageOk || links >= 1 || social;
    default:
      return portfolio || links >= 1 || social || coverageOk;
  }
}

function completenessRatio(submission: SubmissionData): number {
  const filled = COMPLETENESS_FIELDS.filter((key) => {
    const v = submission[key];
    if (typeof v === "boolean") return true; // pole zaznaczone/odznaczone = wypełnione
    return nonEmptyStr(v);
  }).length;
  return filled / COMPLETENESS_FIELDS.length;
}

// ─────────────────────────────────────────────────────────────
// Rdzeń analizy
// ─────────────────────────────────────────────────────────────

interface Analysis {
  contributions: ScoreContribution[];
  flags: VerificationFlag[];
}

/**
 * Jedno przejście po danych — produkuje rozbicie punktów ORAZ ostrzeżenia.
 * `calculateVerificationScore` i `getVerificationFlags` delegują tutaj, aby
 * reguły żyły w jednym miejscu.
 */
function analyze(submission: SubmissionData, context: VerificationContext = {}): Analysis {
  const contributions: ScoreContribution[] = [];
  const flags: VerificationFlag[] = [];

  const role = normalizeRole(submission.role);
  const email = submission.email;
  const links = countValidLinks(submission.publication_links);
  const portfolio = isValidUrl(submission.portfolio_url);
  const social = nonEmptyStr(submission.social_media);
  const org = nonEmptyStr(submission.media_organization);
  const coverageLen = str(submission.coverage_description).length;
  const coverageOk = coverageLen >= COVERAGE_MIN_LENGTH;
  const disposable = isDisposableEmail(email);
  const free = isFreeEmail(email);
  const business = isBusinessEmail(email);
  const evidence = hasRoleEvidence(submission, role);

  // ── Atuty (punkty dodatnie) ────────────────────────────────
  if (business) {
    contributions.push({ code: "business_email", label: "E-mail w domenie służbowej / medialnej", points: POINTS.businessEmail });
  }
  if (org) {
    contributions.push({ code: "media_organization", label: "Podana redakcja / medium", points: POINTS.mediaOrganization });
  }
  if (links >= 1) {
    contributions.push({ code: "publication_links", label: "Linki do publikacji", points: POINTS.publicationLinks });
  }
  if (links >= 3) {
    contributions.push({ code: "publication_links_rich", label: "Bogate portfolio publikacji (3+ linki)", points: POINTS.publicationLinksRich });
  }
  if (portfolio) {
    if (role === "photographer" || role === "video") {
      contributions.push({ code: "portfolio_primary", label: "Portfolio (kluczowe dla foto / wideo)", points: POINTS.portfolioPrimary });
    } else {
      contributions.push({ code: "portfolio_secondary", label: "Portfolio / strona autora", points: POINTS.portfolioSecondary });
    }
  }
  if (social) {
    if (role === "influencer") {
      contributions.push({ code: "social_influencer", label: "Profile social media (influencer)", points: POINTS.socialInfluencer });
    } else {
      contributions.push({ code: "social_secondary", label: "Profile social media", points: POINTS.socialSecondary });
    }
  }
  if (coverageOk) {
    contributions.push({ code: "coverage_description", label: "Opisana planowana relacja", points: POINTS.coverageDescription });
  }
  if (submission.previous_accreditation === true) {
    contributions.push({ code: "previous_accreditation", label: "Wcześniejsza akredytacja", points: POINTS.previousAccreditation });
  }
  if (completenessRatio(submission) >= COMPLETENESS_RATIO) {
    contributions.push({ code: "form_completeness", label: "Kompletnie wypełniony formularz", points: POINTS.formCompleteness });
  }

  // ── Ryzyka (punkty ujemne + ostrzeżenia) ───────────────────
  if (disposable) {
    contributions.push({ code: "disposable_email", label: "Adres e-mail tymczasowy / jednorazowy", points: PENALTIES.disposableEmail });
    flags.push({ code: "disposable_email", severity: "high", message: "Adres e-mail tymczasowy / jednorazowy — wysokie ryzyko." });
  }

  if (role === "journalist" && !org) {
    contributions.push({ code: "journalist_no_organization", label: "Dziennikarz bez podanej redakcji", points: PENALTIES.journalistNoOrganization });
    flags.push({ code: "journalist_no_organization", severity: "high", message: "Dziennikarz bez podanej redakcji / medium." });
  }

  if (!evidence) {
    const evidencePenalty: Record<MediaRole, { code: string; points: number; message: string }> = {
      journalist: { code: "no_publication_links", points: PENALTIES.noEvidenceJournalist, message: "Brak linków do publikacji." },
      photographer: { code: "photographer_no_portfolio", points: PENALTIES.noEvidencePhotographer, message: "Fotoreporter bez portfolio i bez linków do publikacji." },
      video: { code: "no_coverage_evidence", points: PENALTIES.noEvidenceVideo, message: "Brak opisu relacji wideo i materiałów." },
      influencer: { code: "influencer_no_social", points: PENALTIES.noEvidenceInfluencer, message: "Influencer bez podanych profili social media." },
      radio: { code: "no_media_evidence", points: PENALTIES.noEvidenceOther, message: "Brak materiałów potwierdzających działalność medialną." },
      podcast: { code: "no_media_evidence", points: PENALTIES.noEvidenceOther, message: "Brak materiałów potwierdzających działalność medialną." },
      other: { code: "no_media_evidence", points: PENALTIES.noEvidenceOther, message: "Brak materiałów potwierdzających działalność medialną." },
    };
    const e = evidencePenalty[role];
    contributions.push({ code: e.code, label: e.message, points: e.points });
    flags.push({ code: e.code, severity: "high", message: e.message });
  }

  if (free && !evidence) {
    contributions.push({ code: "free_email_no_evidence", label: "Darmowy e-mail bez potwierdzenia publikacji", points: PENALTIES.freeEmailNoEvidence });
    flags.push({ code: "free_email_no_evidence", severity: "medium", message: "Darmowy adres e-mail bez linków do publikacji — zweryfikuj wiarygodność." });
  } else if (free) {
    // Darmowy e-mail, ale są materiały — tylko sygnał informacyjny.
    flags.push({ code: "free_email", severity: "low", message: "Darmowy adres e-mail (zweryfikuj powiązanie z redakcją)." });
  }

  if (context.possibleDuplicate) {
    contributions.push({ code: "possible_duplicate", label: "Możliwy duplikat zgłoszenia", points: PENALTIES.possibleDuplicate });
    flags.push({ code: "possible_duplicate", severity: "medium", message: "Możliwy duplikat — podobne zgłoszenie już istnieje." });
  }

  // ── Sygnały niskiej wagi (bez wpływu na punkty) ────────────
  if (coverageLen > 0 && !coverageOk) {
    flags.push({ code: "sparse_coverage", severity: "low", message: "Pobieżny opis planowanej relacji." });
  }

  return { contributions, flags };
}

// ─────────────────────────────────────────────────────────────
// Publiczne API (nazwy zgodne ze specyfikacją zadania)
// ─────────────────────────────────────────────────────────────

/** Wynik 0–100 (po przycięciu). */
export function calculateVerificationScore(
  submission: SubmissionData,
  context: VerificationContext = {},
): number {
  const { contributions } = analyze(submission, context);
  const raw = contributions.reduce((sum, c) => sum + c.points, 0);
  return clamp(raw, 0, 100);
}

/** Lista ostrzeżeń/sygnałów (z severity). */
export function getVerificationFlags(
  submission: SubmissionData,
  context: VerificationContext = {},
): VerificationFlag[] {
  return analyze(submission, context).flags;
}

/**
 * Poziom ryzyka na podstawie wyniku i ostrzeżeń.
 * Reguły: high flag → high; niski wynik → high/medium; medium flag → medium.
 */
export function getRiskLevel(score: number, flags: VerificationFlag[]): VerificationRiskLevel {
  if (flags.some((f) => f.severity === "high")) return "high";
  if (score < BAND_THRESHOLDS.needs_review) return "high";
  if (flags.some((f) => f.severity === "medium")) return "medium";
  if (score < REVIEW_THRESHOLD) return "medium";
  return "low";
}

/** Pasek jakości (band) na podstawie wyniku. */
export function getScoreBand(score: number): VerificationBand {
  if (score >= BAND_THRESHOLDS.strong) return "strong";
  if (score >= BAND_THRESHOLDS.acceptable) return "acceptable";
  if (score >= BAND_THRESHOLDS.needs_review) return "needs_review";
  return "weak";
}

/** Czy zgłoszenie wymaga ręcznej weryfikacji (wynik < 60). */
export function needsManualReview(score: number): boolean {
  return score < REVIEW_THRESHOLD;
}

const BAND_LABEL: Record<VerificationBand, string> = {
  strong: "silne zgłoszenie",
  acceptable: "akceptowalne",
  needs_review: "do weryfikacji",
  weak: "słabe / wymaga uwagi",
};

/** Buduje czytelne uzasadnienie wyniku (PL). */
export function buildExplanation(
  score: number,
  band: VerificationBand,
  contributions: ScoreContribution[],
  flags: VerificationFlag[],
): string {
  const positives = contributions.filter((c) => c.points > 0);
  const negatives = contributions.filter((c) => c.points < 0);

  const parts: string[] = [`Wynik ${score}/100 (${BAND_LABEL[band]}).`];

  if (positives.length > 0) {
    parts.push(
      "Atuty: " + positives.map((c) => `${c.label} (+${c.points})`).join(", ") + ".",
    );
  }
  if (negatives.length > 0) {
    parts.push(
      "Ryzyka: " + negatives.map((c) => `${c.label} (${c.points})`).join(", ") + ".",
    );
  }
  if (positives.length === 0 && negatives.length === 0) {
    parts.push("Brak wyraźnych sygnałów — zgłoszenie minimalne.");
  }

  const highFlags = flags.filter((f) => f.severity === "high");
  if (highFlags.length > 0) {
    parts.push("Wymaga uwagi: " + highFlags.map((f) => f.message).join(" "));
  }

  parts.push("Decyzję podejmuje weryfikator — system jedynie sugeruje.");
  return parts.join(" ");
}

/** Pełna analiza zgłoszenia — używana przez UI i (zmirrorowana) przez edge function. */
export function evaluateSubmission(
  submission: SubmissionData,
  context: VerificationContext = {},
): VerificationResult {
  const { contributions, flags } = analyze(submission, context);
  const score = clamp(
    contributions.reduce((sum, c) => sum + c.points, 0),
    0,
    100,
  );
  const band = getScoreBand(score);
  const riskLevel = getRiskLevel(score, flags);
  const explanation = buildExplanation(score, band, contributions, flags);
  return {
    score,
    band,
    riskLevel,
    flags,
    contributions,
    explanation,
    needsManualReview: needsManualReview(score),
  };
}

// ─────────────────────────────────────────────────────────────
// Ręczne nadpisanie (manual override) przez PR managera
// ─────────────────────────────────────────────────────────────

export interface ManualOverrideInput {
  /** Nowy wynik (0–100). Pominięty → zachowaj wyliczony. */
  score?: number;
  /** Nowy poziom ryzyka. Pominięty → zachowaj wyliczony. */
  riskLevel?: VerificationRiskLevel;
  /** Notatka PR managera. */
  notes?: string;
  /** Identyfikator osoby nadpisującej (auth uid). */
  overriddenBy: string;
  /** Czas nadpisania (ISO). Domyślnie now(). */
  overriddenAt?: string;
}

export interface OverriddenVerification extends VerificationResult {
  overridden: true;
  overriddenBy: string;
  overriddenAt: string;
  notes?: string;
  /** Pierwotnie wyliczony wynik (zachowany do audytu). */
  computed: VerificationResult;
}

/**
 * Nakłada ręczne nadpisanie weryfikatora na wyliczony wynik.
 * Zachowuje pierwotne wyliczenie pod `computed` (audyt). Czysta funkcja.
 */
export function applyManualOverride(
  base: VerificationResult,
  input: ManualOverrideInput,
): OverriddenVerification {
  const score = input.score != null ? clamp(Math.round(input.score), 0, 100) : base.score;
  const riskLevel = input.riskLevel ?? base.riskLevel;
  const band = getScoreBand(score);
  return {
    ...base,
    score,
    band,
    riskLevel,
    needsManualReview: needsManualReview(score),
    overridden: true,
    overriddenBy: input.overriddenBy,
    overriddenAt: input.overriddenAt ?? new Date().toISOString(),
    notes: input.notes,
    computed: base,
  };
}
