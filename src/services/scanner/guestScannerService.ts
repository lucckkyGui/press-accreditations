import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Guest, GuestEmailStatus, GuestStatus, GuestTicketType } from "@/types";

export type QrCheckInStatus =
  | "success"
  | "duplicate"
  | "invalid"
  | "wrong_event"
  | "expired"
  | "revoked"
  | "unauthorized";

export type ScannerDeviceInfo = Record<string, Json>;

export interface ScanResult {
  success: boolean;
  status: QrCheckInStatus;
  guest?: Guest;
  message: string;
  alreadyCheckedIn?: boolean;
  checkInTime?: string;
  scanTime?: string;
  /** Poziom dostępu akredytacji (z payloadu RPC). */
  accessLevel?: string;
  /** Powód cofnięcia — pokazywany tylko staff/admin (status revoked). */
  revocationReason?: string;
}

/** Wynik manualnego wyszukania akredytacji (fallback). */
export interface ManualSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  accessLevel: string | null;
  status: string;
  qrCode: string;
  checkedInAt: string | null;
}

interface RpcGuest {
  id?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  company?: unknown;
  phone?: unknown;
  ticketType?: unknown;
  zones?: unknown;
  status?: unknown;
  emailStatus?: unknown;
  qrCode?: unknown;
  invitationSentAt?: unknown;
  invitationOpenedAt?: unknown;
  checkedInAt?: unknown;
}

interface ProcessQrCheckInResponse {
  success?: unknown;
  status?: unknown;
  guest?: unknown;
  message?: unknown;
  checkedInAt?: unknown;
  scanTime?: unknown;
}

const CHECK_IN_STATUSES = new Set<QrCheckInStatus>([
  "success",
  "duplicate",
  "invalid",
  "wrong_event",
  "expired",
  "revoked",
  "unauthorized",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const asDate = (value: unknown): Date | undefined => {
  const dateValue = asString(value);
  if (!dateValue) return undefined;

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeStatus = (status: unknown): QrCheckInStatus => {
  if (typeof status === "string" && CHECK_IN_STATUSES.has(status as QrCheckInStatus)) {
    return status as QrCheckInStatus;
  }

  return "invalid";
};

const mapRpcGuest = (guest: unknown): Guest | undefined => {
  if (!isRecord(guest)) return undefined;

  const candidate = guest as RpcGuest;
  const id = asString(candidate.id);
  const firstName = asString(candidate.firstName);
  const lastName = asString(candidate.lastName);
  const email = asString(candidate.email);
  const qrCode = asString(candidate.qrCode);

  if (!id || !firstName || !lastName || !email || !qrCode) {
    return undefined;
  }

  return {
    id,
    firstName,
    lastName,
    email,
    company: asString(candidate.company),
    phone: asString(candidate.phone),
    ticketType: (asString(candidate.ticketType) || "uczestnik") as GuestTicketType,
    zones: asStringArray(candidate.zones),
    status: (asString(candidate.status) || "invited") as GuestStatus,
    emailStatus: asString(candidate.emailStatus) as GuestEmailStatus | undefined,
    qrCode,
    invitationSentAt: asDate(candidate.invitationSentAt),
    invitationOpenedAt: asDate(candidate.invitationOpenedAt),
    checkedInAt: asDate(candidate.checkedInAt),
  };
};

const normalizeRpcResponse = (payload: Json | null): ScanResult => {
  if (!isRecord(payload)) {
    return {
      success: false,
      status: "invalid",
      message: "Nieprawidłowa odpowiedź systemu check-in",
    };
  }

  const response = payload as ProcessQrCheckInResponse & {
    accessLevel?: unknown; revocationReason?: unknown; guest?: { accessLevel?: unknown } | unknown;
  };
  const status = normalizeStatus(response.status);
  const guest = mapRpcGuest(response.guest);
  const checkInTime = asString(response.checkedInAt);
  const guestRecord = isRecord(response.guest) ? response.guest : undefined;

  return {
    success: response.success === true && status === "success",
    status,
    guest,
    message: asString(response.message) || "Nie udało się przetworzyć kodu QR",
    alreadyCheckedIn: status === "duplicate",
    accessLevel: asString(response.accessLevel) ?? asString(guestRecord?.accessLevel),
    revocationReason: status === "revoked" ? asString(response.revocationReason) : undefined,
    checkInTime,
    scanTime: asString(response.scanTime),
  };
};

const getDefaultDeviceInfo = (): ScannerDeviceInfo => {
  if (typeof navigator === "undefined") {
    return { source: "server" };
  }

  return {
    source: "browser",
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    online: navigator.onLine,
  };
};

const mapDbGuestToGuest = (data: Record<string, unknown>): Guest => ({
  id: String(data.id),
  firstName: String(data.first_name),
  lastName: String(data.last_name),
  email: String(data.email),
  company: asString(data.company),
  phone: asString(data.phone),
  ticketType: (asString(data.ticket_type) || "uczestnik") as GuestTicketType,
  zones: asStringArray(data.zones),
  status: (asString(data.status) || "invited") as GuestStatus,
  emailStatus: asString(data.email_status) as GuestEmailStatus | undefined,
  qrCode: String(data.qr_code),
  invitationSentAt: asDate(data.invitation_sent_at),
  invitationOpenedAt: asDate(data.invitation_opened_at),
  checkedInAt: asDate(data.checked_in_at),
});

export const guestScannerService = {
  /**
   * Verify guest by QR code and check them in through the atomic Supabase RPC.
   */
  async verifyAndCheckIn(
    qrCode: string,
    eventId?: string,
    deviceInfo: ScannerDeviceInfo = getDefaultDeviceInfo()
  ): Promise<ScanResult> {
    if (!eventId) {
      return {
        success: false,
        status: "invalid",
        message: "Wybierz wydarzenie przed rozpoczęciem skanowania",
      };
    }

    const scannedAt = new Date().toISOString();
    const { data, error } = await supabase.rpc("process_qr_check_in", {
      _qr_code: qrCode,
      _event_id: eventId,
      _device_info: deviceInfo,
      _client_scan_id: crypto.randomUUID(),
      _scanned_at: scannedAt,
    });

    if (error) {
      return {
        success: false,
        status: "invalid",
        message: "Błąd podczas rejestracji gościa",
      };
    }

    return normalizeRpcResponse(data);
  },

  /**
   * Manualne wyszukanie akredytacji (fallback) po nazwisku / e-mailu / medium.
   * Scoped do wydarzenia. RLS pilnuje, że organizator widzi tylko swoje.
   */
  async searchAccreditations(eventId: string, term: string): Promise<ManualSearchResult[]> {
    const q = term.trim();
    if (!eventId || q.length < 2) return [];
    const safe = q.replace(/[%,()]/g, " ");
    // access_level dodane migracją (Tydzień 4/5) — typy Supabase nie zregenerowane,
    // stąd `(supabase as any)` (ustalony wzorzec w repo).
    const { data, error } = await (supabase as any)
      .from("guests")
      .select("id, first_name, last_name, email, company, access_level, status, qr_code, checked_in_at")
      .eq("event_id", eventId)
      .or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%`)
      .order("last_name", { ascending: true })
      .limit(20);

    if (error || !Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((row) => {
      const r = row;
      return {
        id: String(r.id),
        firstName: String(r.first_name ?? ""),
        lastName: String(r.last_name ?? ""),
        email: String(r.email ?? ""),
        company: asString(r.company) ?? null,
        accessLevel: asString(r.access_level) ?? null,
        status: String(r.status ?? ""),
        qrCode: String(r.qr_code ?? ""),
        checkedInAt: asString(r.checked_in_at) ?? null,
      };
    });
  },

  /**
   * Get guest by QR code without checking in.
   */
  async getGuestByQrCode(qrCode: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (error || !data || !isRecord(data)) {
      return null;
    }

    return mapDbGuestToGuest(data);
  },

  /**
   * Undo check-in. This remains an explicit organizer action outside the scan flow.
   */
  async undoCheckIn(guestId: string): Promise<boolean> {
    const { error } = await supabase
      .from("guests")
      .update({
        checked_in_at: null,
        status: "confirmed",
      })
      .eq("id", guestId);

    return !error;
  },

  /**
   * Get check-in statistics for an event.
   */
  async getCheckInStats(eventId: string): Promise<{
    total: number;
    checkedIn: number;
    pending: number;
    percentage: number;
  }> {
    const { data: guests, error } = await supabase
      .from("guests")
      .select("id, checked_in_at")
      .eq("event_id", eventId);

    if (error || !guests) {
      return { total: 0, checkedIn: 0, pending: 0, percentage: 0 };
    }

    const total = guests.length;
    const checkedIn = guests.filter((guest) => guest.checked_in_at).length;
    const pending = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, checkedIn, pending, percentage };
  },
};
