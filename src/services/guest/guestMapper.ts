
import { Guest, GuestStatus, GuestTicketType } from "@/types";

/**
 * Map database guest to our frontend Guest type
 */
export function mapDbGuestToGuest(dbGuest: any): Guest {
  return {
    id: dbGuest.id,
    firstName: dbGuest.first_name,
    lastName: dbGuest.last_name,
    email: dbGuest.email,
    company: dbGuest.company,
    phone: dbGuest.phone,
    ticketType: (dbGuest.ticket_type || 'uczestnik') as GuestTicketType,
    zones: dbGuest.zones || [],
    status: dbGuest.status as GuestStatus,
    emailStatus: dbGuest.email_status as any,
    qrCode: dbGuest.qr_code,
    invitationSentAt: dbGuest.invitation_sent_at ? new Date(dbGuest.invitation_sent_at) : undefined,
    invitationOpenedAt: dbGuest.invitation_opened_at ? new Date(dbGuest.invitation_opened_at) : undefined,
    checkedInAt: dbGuest.checked_in_at ? new Date(dbGuest.checked_in_at) : undefined
  };
}
