/**
 * Decision flow — łączy decyzję PR managera z realną akredytacją i QR passem.
 *
 * CZYSTA logika (bez Supabase) — w pełni testowalna w vitest. Orkiestrację zapisów
 * (DB + e-mail + audyt) robi `verificationService.ts`.
 *
 * Zakres:
 *  - statusy decyzji: approved / approved_limited / rejected / waitlisted,
 *  - access levels (10) z domyślnymi strefami dostępu,
 *  - generator tokenu QR (NIE incremental, payload = sam token, bez danych osobowych),
 *  - predykaty: czy decyzja tworzy QR, czy jest ograniczona, czy check-in zablokowany.
 */

// ─────────────────────────────────────────────────────────────
// Statusy decyzji
// ─────────────────────────────────────────────────────────────

/** Statusy będące decyzją człowieka (NIGDY automatyczne). */
export type ApprovalStatus = "approved" | "approved_limited" | "rejected" | "waitlisted";

/** Pełny zbiór statusów zgłoszenia (z `pending` i `expired`). */
export type SubmissionStatus = "pending" | ApprovalStatus | "expired";

export const APPROVAL_STATUSES: { value: ApprovalStatus; label: string; cls: string; createsPass: boolean }[] = [
  { value: "approved", label: "Zatwierdzone", cls: "bg-green-600 hover:bg-green-600 text-white", createsPass: true },
  { value: "approved_limited", label: "Zatwierdzone (ograniczone)", cls: "bg-emerald-600 hover:bg-emerald-600 text-white", createsPass: true },
  { value: "waitlisted", label: "Lista rezerwowa", cls: "bg-amber-500 hover:bg-amber-500 text-white", createsPass: false },
  { value: "rejected", label: "Odrzucone", cls: "bg-destructive hover:bg-destructive text-white", createsPass: false },
];

const APPROVAL_STATUS_VALUES: ApprovalStatus[] = APPROVAL_STATUSES.map((s) => s.value);

export function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return typeof value === "string" && (APPROVAL_STATUS_VALUES as string[]).includes(value);
}

/** Czy dany status decyzji tworzy akredytację + QR pass. */
export function statusCreatesPass(status: ApprovalStatus): boolean {
  return status === "approved" || status === "approved_limited";
}

/** Czy status oznacza dostęp ograniczony. */
export function isLimitedStatus(status: ApprovalStatus): boolean {
  return status === "approved_limited";
}

// ─────────────────────────────────────────────────────────────
// Access levels
// ─────────────────────────────────────────────────────────────

export type AccessLevel =
  | "press"
  | "photo"
  | "video"
  | "radio"
  | "podcast"
  | "influencer"
  | "photo_pit"
  | "interview"
  | "backstage_limited"
  | "sponsor_media";

export interface AccessLevelMeta {
  value: AccessLevel;
  label: string;
  /** Domyślne strefy dostępu (trafiają do guests.zones i accreditation_types.access_areas). */
  zones: string[];
  /** Czy poziom z natury ograniczony (sugeruje status approved_limited). */
  limited: boolean;
}

export const ACCESS_LEVELS: AccessLevelMeta[] = [
  { value: "press", label: "Prasa", zones: ["Strefa prasowa"], limited: false },
  { value: "photo", label: "Foto", zones: ["Strefa prasowa", "Strefa foto"], limited: false },
  { value: "video", label: "Wideo / TV", zones: ["Strefa prasowa", "Strefa foto"], limited: false },
  { value: "radio", label: "Radio", zones: ["Strefa prasowa"], limited: false },
  { value: "podcast", label: "Podcast", zones: ["Strefa prasowa"], limited: false },
  { value: "influencer", label: "Influencer / Twórca", zones: ["Strefa prasowa"], limited: false },
  { value: "photo_pit", label: "Photo pit (pod sceną)", zones: ["Strefa prasowa", "Strefa foto", "Photo pit"], limited: true },
  { value: "interview", label: "Strefa wywiadów", zones: ["Strefa prasowa", "Strefa wywiadów"], limited: false },
  { value: "backstage_limited", label: "Backstage (ograniczony)", zones: ["Strefa prasowa", "Backstage (ograniczony)"], limited: true },
  { value: "sponsor_media", label: "Media sponsora", zones: ["Strefa prasowa", "Strefa sponsora"], limited: false },
];

const ACCESS_LEVEL_MAP: Record<AccessLevel, AccessLevelMeta> = Object.fromEntries(
  ACCESS_LEVELS.map((a) => [a.value, a]),
) as Record<AccessLevel, AccessLevelMeta>;

export const ACCESS_LEVEL_VALUES: AccessLevel[] = ACCESS_LEVELS.map((a) => a.value);

export function isAccessLevel(value: unknown): value is AccessLevel {
  return typeof value === "string" && (ACCESS_LEVEL_VALUES as string[]).includes(value);
}

export function accessLevelLabel(level: string | null | undefined): string {
  return level && isAccessLevel(level) ? ACCESS_LEVEL_MAP[level].label : (level ?? "—");
}

/** Strefy dostępu dla poziomu (fallback: sama „Strefa prasowa"). */
export function accessZonesFor(level: string | null | undefined): string[] {
  return level && isAccessLevel(level) ? [...ACCESS_LEVEL_MAP[level].zones] : ["Strefa prasowa"];
}

/**
 * Sugeruje access level na podstawie roli medialnej zgłoszenia.
 * Czysta heurystyka pod UI — PR manager może zmienić.
 */
export function suggestedAccessLevel(role: string | null | undefined): AccessLevel {
  switch (role) {
    case "photographer": return "photo";
    case "video": return "video";
    case "radio": return "radio";
    case "podcast": return "podcast";
    case "influencer": return "influencer";
    case "journalist": return "press";
    default: return "press";
  }
}

// ─────────────────────────────────────────────────────────────
// Token QR (NIE incremental, bez danych osobowych)
// ─────────────────────────────────────────────────────────────

/** Crockford Base32 (bez I, L, O, U) — czytelny, bez mylących znaków. */
const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_PREFIX = "PA"; // Press Accreditation
const TOKEN_RANDOM_BYTES = 20; // 160 bitów entropii

function getCrypto(): Crypto | null {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  return c && typeof c.getRandomValues === "function" ? c : null;
}

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

/**
 * Generuje unikalny, niezgadywalny token akredytacji.
 * Format: `PA-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (prefiks + Base32 z 160 bitów).
 * NIE jest incremental i NIE zawiera danych osobowych.
 */
export function generateAccreditationToken(): string {
  const bytes = new Uint8Array(TOKEN_RANDOM_BYTES);
  const crypto = getCrypto();
  if (crypto) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback (środowiska bez WebCrypto) — Math.random nie jest kryptograficzny,
    // ale token i tak nie jest incremental. WebCrypto jest dostępny w przeglądarce i Node 22.
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `${TOKEN_PREFIX}-${encodeBase32(bytes)}`;
}

/** Walidacja formatu tokenu (prefiks + Base32). */
export function isValidAccreditationToken(token: unknown): boolean {
  if (typeof token !== "string") return false;
  return new RegExp(`^${TOKEN_PREFIX}-[${BASE32_ALPHABET}]{16,}$`).test(token);
}

/**
 * Payload QR. Celowo zwraca SAM token (string), bez danych osobowych —
 * skaner check-inu dopasowuje token do `guests.qr_code`. Sygnatura jako funkcja,
 * by w przyszłości można było opakować w JSON bez zmiany wywołań.
 */
export function buildQrPayload(token: string): string {
  return token;
}

// ─────────────────────────────────────────────────────────────
// Check-in / revocation
// ─────────────────────────────────────────────────────────────

/** Status gościa oznaczający cofniętą akredytację. */
export const REVOKED_GUEST_STATUS = "revoked";

/** Czy check-in jest zablokowany dla danego statusu gościa (cofnięta akredytacja). */
export function isCheckInBlocked(guestStatus: string | null | undefined): boolean {
  return guestStatus === REVOKED_GUEST_STATUS;
}

// ─────────────────────────────────────────────────────────────
// Walidacja decyzji
// ─────────────────────────────────────────────────────────────

export interface DecisionValidationInput {
  status: ApprovalStatus;
  accessLevel?: string | null;
}

export interface DecisionValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Waliduje decyzję przed zapisem.
 * Reguła P0: status tworzący QR (approved / approved_limited) WYMAGA access level.
 */
export function validateDecision(input: DecisionValidationInput): DecisionValidationResult {
  if (!isApprovalStatus(input.status)) {
    return { ok: false, error: "Nieprawidłowy status decyzji." };
  }
  if (statusCreatesPass(input.status)) {
    if (!input.accessLevel || !isAccessLevel(input.accessLevel)) {
      return { ok: false, error: "Wybierz access level dla akredytacji." };
    }
  }
  return { ok: true };
}
