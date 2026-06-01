import {
  getOrCreateDeviceId,
  localDb,
  type LocalGuest,
  type LocalScanQueueEntry,
  type LocalScanValidationResult,
} from "@/lib/db/localDb";
import type { Guest, GuestEmailStatus, GuestStatus, GuestTicketType } from "@/types";

export interface LocalQrScanRequest {
  eventId: string;
  qrPayload: string;
  deviceId?: string;
}

export interface LocalQrScanResult {
  clientScanId: string;
  status: LocalScanValidationResult;
  message: string;
  qrPayload: string;
  qrCode: string;
  scannedAt: string;
  deviceId: string;
  elapsedMs: number;
  guest: Guest | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const asDate = (value: string | null): Date | undefined => {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const getNow = () => globalThis.performance?.now() ?? Date.now();

export const extractQrCodeFromPayload = (qrPayload: string): string => {
  const trimmedPayload = qrPayload.trim();
  if (!trimmedPayload) {
    return "";
  }

  try {
    const parsedPayload: unknown = JSON.parse(trimmedPayload);
    if (isRecord(parsedPayload)) {
      return asString(parsedPayload.qrCode) ?? asString(parsedPayload.qr_code) ?? trimmedPayload;
    }
  } catch {
    // Plain QR codes are valid input.
  }

  return trimmedPayload;
};

export const mapLocalGuestToGuest = (guest: LocalGuest): Guest => ({
  id: guest.id,
  firstName: guest.first_name,
  lastName: guest.last_name,
  email: guest.email,
  company: guest.company ?? undefined,
  phone: guest.phone ?? undefined,
  ticketType: (guest.ticket_type || "uczestnik") as GuestTicketType,
  zones: guest.zones,
  status: (guest.status || "invited") as GuestStatus,
  emailStatus: guest.email_status as GuestEmailStatus | undefined,
  qrCode: guest.qr_code,
  invitationSentAt: asDate(guest.invitation_sent_at),
  invitationOpenedAt: asDate(guest.invitation_opened_at),
  checkedInAt: asDate(guest.checked_in_at),
});

const getGuestName = (guest: LocalGuest) => `${guest.first_name} ${guest.last_name}`.trim();

const buildMessage = (status: LocalScanValidationResult, guest: LocalGuest | undefined) => {
  switch (status) {
    case "found":
      return guest ? `Zarejestrowano lokalnie: ${getGuestName(guest)}` : "Zarejestrowano lokalnie";
    case "already_checked_in_locally":
      return guest ? `${getGuestName(guest)} jest już oznaczony lokalnie jako obecny` : "Gość jest już oznaczony lokalnie jako obecny";
    case "wrong_event":
      return "Kod QR należy do innego wydarzenia";
    case "revoked":
      return guest ? `Akredytacja cofnięta — odmowa wejścia: ${getGuestName(guest)}` : "Akredytacja została cofnięta — odmowa wejścia";
    case "unknown":
      return "Nie znaleziono kodu QR w pobranym manifeście wydarzenia";
  }
};

const getStatusForGuest = (guest: LocalGuest | undefined, eventId: string): LocalScanValidationResult => {
  if (!guest) {
    return "unknown";
  }

  if (guest.event_id !== eventId) {
    return "wrong_event";
  }

  // Cofnięta akredytacja — check-in zablokowany (spójnie z RPC po stronie serwera).
  if (guest.status === "revoked") {
    return "revoked";
  }

  if (guest.checked_in_at) {
    return "already_checked_in_locally";
  }

  return "found";
};

export const processLocalQrScan = async ({
  eventId,
  qrPayload,
  deviceId,
}: LocalQrScanRequest): Promise<LocalQrScanResult> => {
  const startedAt = getNow();
  const normalizedEventId = eventId.trim();
  const normalizedPayload = qrPayload.trim();
  const qrCode = extractQrCodeFromPayload(normalizedPayload);
  const scanDeviceId = deviceId ?? await getOrCreateDeviceId();
  const clientScanId = crypto.randomUUID();
  const scannedAt = new Date().toISOString();

  return localDb.transaction("rw", localDb.guests, localDb.scanQueue, async () => {
    const localGuest = qrCode
      ? await localDb.guests.where("qr_code").equals(qrCode).first()
      : undefined;
    const validationResult = getStatusForGuest(localGuest, normalizedEventId);

    const queueEntry: LocalScanQueueEntry = {
      clientScanId,
      guestId: localGuest?.id ?? null,
      eventId: normalizedEventId,
      qrPayload: normalizedPayload,
      status: "pending",
      scannedAt,
      deviceId: scanDeviceId,
      validationResult,
      guestName: localGuest ? getGuestName(localGuest) : undefined,
      action: "check-in",
      qrCode: qrCode || undefined,
      retryCount: 0,
    };

    await localDb.scanQueue.put(queueEntry);

    let resultGuest: LocalGuest | undefined = localGuest;
    if (validationResult === "found" && localGuest) {
      resultGuest = {
        ...localGuest,
        checked_in_at: scannedAt,
        status: "checked-in",
        updated_at: scannedAt,
      };
      await localDb.guests.put(resultGuest);
    }

    return {
      clientScanId,
      status: validationResult,
      message: buildMessage(validationResult, resultGuest),
      qrPayload: normalizedPayload,
      qrCode,
      scannedAt,
      deviceId: scanDeviceId,
      elapsedMs: Math.round(getNow() - startedAt),
      guest: resultGuest ? mapLocalGuestToGuest(resultGuest) : null,
    };
  });
};
