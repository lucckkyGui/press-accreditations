/**
 * Czysta klasyfikacja wyniku check-inu akredytacji prasowej.
 *
 * Mirror logiki decyzyjnej RPC `process_qr_check_in` (Tydzień 5) — w pełni
 * testowalny bez Supabase. Używany przez:
 *  - test matrix (100+ QR),
 *  - tryb offline (lokalny manifest) do spójnej klasyfikacji.
 *
 * Backend (RPC) pozostaje źródłem prawdy dla online check-inu. Każda zmiana
 * kolejności/reguł MUSI być odzwierciedlona w obu miejscach.
 */

/** 7 statusów wyniku check-inu (P0). */
export type CheckInStatus =
  | "success"
  | "duplicate"
  | "invalid"
  | "wrong_event"
  | "expired"
  | "revoked"
  | "unauthorized";

/** Kolejność oceny statusów (od najwyższego priorytetu). */
export const CHECK_IN_STATUS_ORDER: CheckInStatus[] = [
  "unauthorized", "invalid", "wrong_event", "revoked", "expired", "duplicate", "success",
];

/** Czy status oznacza wpuszczenie. */
export function isAdmit(status: CheckInStatus): boolean {
  return status === "success";
}

/** Minimalny rekord akredytacji potrzebny do klasyfikacji (z manifestu/bazy). */
export interface CheckInGuest {
  id: string;
  event_id: string;
  status: string | null;
  qr_code: string;
  checked_in_at: string | null;
  revocation_reason?: string | null;
}

export interface CheckInContext {
  /** Wydarzenie wybrane przez staff w skanerze. */
  eventId: string;
  /** Czy skanujący ma uprawnienia (organizer/admin). */
  hasPermission: boolean;
  /** Koniec wydarzenia (ISO) — do detekcji expired. */
  eventEnd?: string | null;
  /** Czas skanu (do porównania z eventEnd). Domyślnie now(). */
  now?: Date;
}

export interface CheckInDecision {
  status: CheckInStatus;
  message: string;
  /** true tylko dla success. */
  admit: boolean;
  /** Czy ta decyzja zmienia stan (czyli należy zapisać check-in). */
  mutates: boolean;
}

const STATUS_REVOKED = "revoked";

const MESSAGES: Record<CheckInStatus, string> = {
  success: "Akredytacja potwierdzona — wejście dozwolone",
  duplicate: "Akredytacja była już zeskanowana",
  invalid: "Nie znaleziono akredytacji z tym kodem QR",
  wrong_event: "Kod QR jest dla innego wydarzenia",
  expired: "Wydarzenie już się zakończyło",
  revoked: "Akredytacja została cofnięta",
  unauthorized: "Brak uprawnień do skanowania tego wydarzenia",
};

function decision(status: CheckInStatus, message?: string, mutates = false): CheckInDecision {
  return { status, message: message ?? MESSAGES[status], admit: status === "success", mutates };
}

/**
 * Wyodrębnia token QR z surowego payloadu (string lub JSON {qrCode}).
 * Zwraca pusty string dla pustego wejścia.
 */
export function extractToken(rawPayload: string): string {
  const trimmed = (rawPayload ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const code = parsed.qrCode ?? parsed.qr_code;
      if (typeof code === "string" && code.trim()) return code.trim();
    } catch {
      // plain token
    }
  }
  return trimmed;
}

/**
 * Klasyfikuje wynik check-inu. Kolejność reguł identyczna z RPC:
 * unauthorized → invalid(empty) → invalid(not found) → wrong_event → revoked →
 * expired → duplicate → success.
 */
export function classifyCheckIn(
  guest: CheckInGuest | null | undefined,
  ctx: CheckInContext,
  rawPayload: string,
): CheckInDecision {
  if (!ctx.hasPermission) return decision("unauthorized");

  const token = extractToken(rawPayload);
  if (!token) return decision("invalid", "Kod QR jest pusty");

  if (!guest) return decision("invalid");

  if (guest.event_id !== ctx.eventId) return decision("wrong_event");

  if (guest.status === STATUS_REVOKED) {
    const reason = guest.revocation_reason?.trim();
    return decision("revoked", reason ? `Akredytacja cofnięta: ${reason}` : MESSAGES.revoked);
  }

  const now = ctx.now ?? new Date();
  if (ctx.eventEnd) {
    const end = new Date(ctx.eventEnd);
    if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
      return decision("expired");
    }
  }

  // Duplicate NIE nadpisuje pierwszego check-inu.
  if (guest.checked_in_at) return decision("duplicate");

  return decision("success", MESSAGES.success, true);
}
