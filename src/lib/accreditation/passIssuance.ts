/**
 * Wydawanie QR pass (przepustki) dla zatwierdzonego zgłoszenia medialnego.
 *
 * Krok workflow: approval → ACCREDITATION / QR PASS → check-in.
 *
 * Ten moduł to CZYSTA logika (bez Supabase) — buduje payloady wpisów i decyduje,
 * czy przepustkę należy wydać. Zapisy do bazy robi `verificationService.issuePressPass`.
 *
 * Dlaczego wpis w `guests`: istniejący check-in (RPC `process_qr_check_in` oraz
 * tryb offline) wyszukuje uczestnika po `guests.qr_code`. Wydanie przepustki musi
 * więc utworzyć skanowalny wpis w `guests` — wtedy cały łańcuch działa end-to-end
 * bez zmian w skanerze. Wpis w `accreditations` to formalny rekord przepustki/badge.
 */

/** Typ biletu nadawany akredytacji prasowej (kolumna tekstowa w `guests`). */
export const PRESS_TICKET_TYPE = "press";

/** Status wpisu gościa po wydaniu przepustki (przed check-inem). */
export const PRESS_GUEST_STATUS = "confirmed";

/** Domyślna nazwa kategorii akredytacji tworzonej przy pierwszym wydaniu passu. */
export const DEFAULT_PRESS_TYPE_NAME = "Prasa";

/** Domyślna strefa dostępu, gdy zgłoszenie nie precyzuje wnioskowanego dostępu. */
export const DEFAULT_PRESS_ACCESS_AREA = "Strefa prasowa";

/** Maksymalna liczba stref wyciąganych z pola `requested_access` (sanity cap). */
const MAX_ZONES = 12;
const MAX_ZONE_LENGTH = 80;

/** Podzbiór zgłoszenia potrzebny do wydania przepustki. */
export interface PassIssuanceSubmission {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  media_organization?: string | null;
  requested_access?: string | null;
  status?: string | null;
  guest_id?: string | null;
  pass_qr_code?: string | null;
}

/** Payload wpisu do `guests` (skanowalna encja check-inu). */
export interface GuestPassInsert {
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  ticket_type: string;
  zones: string[];
  status: string;
  qr_code: string;
}

/**
 * Payload wpisu do `accreditations` (formalny rekord przepustki).
 * Kształt zgodny z realnym schematem bazy: `type` (tekst), `accreditation_request_id`,
 * `issued_at`/`expires_at`. Token QR i stan check-inu żyją na `guests`.
 */
export interface AccreditationPassInsert {
  event_id: string;
  user_id: string;
  guest_id: string | null;
  accreditation_request_id: string | null;
  type: string;
  status: string;
  issued_at: string;
  expires_at: string;
}

/**
 * Rozbija pole `requested_access` na listę stref dostępu.
 * Rozdziela po przecinkach i nowych liniach, przycina, usuwa duplikaty.
 * Zwraca domyślną strefę prasową, gdy brak danych.
 */
export function parseAccessZones(requestedAccess: string | null | undefined): string[] {
  const raw = (requestedAccess ?? "").trim();
  if (!raw) return [DEFAULT_PRESS_ACCESS_AREA];

  const seen = new Set<string>();
  const zones: string[] = [];
  for (const part of raw.split(/[\n,;]+/)) {
    const zone = part.trim().slice(0, MAX_ZONE_LENGTH);
    const key = zone.toLowerCase();
    if (zone && !seen.has(key)) {
      seen.add(key);
      zones.push(zone);
      if (zones.length >= MAX_ZONES) break;
    }
  }
  return zones.length > 0 ? zones : [DEFAULT_PRESS_ACCESS_AREA];
}

/**
 * Czy przepustka została już wydana (idempotencja — nie wydawaj drugi raz).
 * Wystarczy obecność kodu QR lub powiązanego gościa.
 */
export function isPassAlreadyIssued(submission: PassIssuanceSubmission): boolean {
  return Boolean(submission.pass_qr_code) || Boolean(submission.guest_id);
}

/**
 * Czy zgłoszenie kwalifikuje się do wydania przepustki.
 * Tylko po ludzkiej decyzji approve i tylko gdy jeszcze nie wydano.
 */
export function canIssuePass(submission: PassIssuanceSubmission): boolean {
  return submission.status === "approved" && !isPassAlreadyIssued(submission);
}

/** Buduje payload wpisu gościa (przepustka skanowalna w check-inie). */
export function buildGuestPassInsert(
  submission: PassIssuanceSubmission,
  eventId: string,
  qrCode: string,
): GuestPassInsert {
  return {
    event_id: eventId,
    first_name: (submission.first_name ?? "").trim(),
    last_name: (submission.last_name ?? "").trim(),
    email: (submission.email ?? "").trim(),
    phone: submission.phone?.trim() || null,
    company: submission.media_organization?.trim() || null,
    ticket_type: PRESS_TICKET_TYPE,
    zones: parseAccessZones(submission.requested_access),
    status: PRESS_GUEST_STATUS,
    qr_code: qrCode,
  };
}

/**
 * Wyznacza okno ważności przepustki na podstawie dat wydarzenia.
 * Fallback: start = teraz, koniec = teraz + 1 dzień, gdy brak/niepoprawne daty.
 * Gdy koniec wypada przed startem — koryguje do start + 1 dzień.
 */
export function computeValidity(
  eventStart: string | null | undefined,
  eventEnd: string | null | undefined,
  now: Date = new Date(),
): { validity_start: string; validity_end: string } {
  const DAY_MS = 24 * 60 * 60 * 1000;

  const parse = (v: string | null | undefined): Date | null => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const start = parse(eventStart) ?? now;
  let end = parse(eventEnd);
  if (!end || end.getTime() < start.getTime()) {
    end = new Date(start.getTime() + DAY_MS);
  }

  return {
    validity_start: start.toISOString(),
    validity_end: end.toISOString(),
  };
}

/** Buduje payload formalnego wpisu akredytacji (zgodny ze schematem bazy). */
export function buildAccreditationPassInsert(params: {
  eventId: string;
  userId: string;
  guestId: string | null;
  requestId: string | null;
  type: string;
  issuedAt: string;
  expiresAt: string;
}): AccreditationPassInsert {
  return {
    event_id: params.eventId,
    user_id: params.userId,
    guest_id: params.guestId,
    accreditation_request_id: params.requestId,
    type: params.type,
    status: "issued",
    issued_at: params.issuedAt,
    expires_at: params.expiresAt,
  };
}
