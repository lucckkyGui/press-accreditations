import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types";

export interface ScanResult {
  success: boolean;
  guest?: Guest;
  message: string;
  alreadyCheckedIn?: boolean;
  checkInTime?: string;
}

export const guestScannerService = {
  /**
   * Verify guest by QR code and check them in
   */
  async verifyAndCheckIn(qrCode: string, eventId?: string): Promise<ScanResult> {
    try {
      // Find guest by QR code
      let query = supabase
        .from('guests')
        .select('*')
        .eq('qr_code', qrCode);
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data: guests, error } = await query;

      if (error) {
        console.error('Error finding guest:', error);
        return {
          success: false,
          message: 'Błąd podczas weryfikacji kodu QR',
        };
      }

      if (!guests || guests.length === 0) {
        return {
          success: false,
          message: 'Nie znaleziono gościa z tym kodem QR',
        };
      }

      const guestData = guests[0];

      // Check if already checked in
      if (guestData.checked_in_at) {
        const guest: Guest = {
          id: guestData.id,
          firstName: guestData.first_name,
          lastName: guestData.last_name,
          email: guestData.email,
          company: guestData.company || undefined,
          ticketType: ((guestData as any).ticket_type || 'uczestnik') as any,
          zones: ((guestData as any).zones || []) as string[],
          status: guestData.status as Guest['status'],
          qrCode: guestData.qr_code,
          phone: guestData.phone || undefined,
          checkedInAt: new Date(guestData.checked_in_at),
          invitationSentAt: guestData.invitation_sent_at ? new Date(guestData.invitation_sent_at) : undefined,
          invitationOpenedAt: guestData.invitation_opened_at ? new Date(guestData.invitation_opened_at) : undefined,
        };

        return {
          success: true,
          guest,
          message: 'Gość już został zarejestrowany',
          alreadyCheckedIn: true,
          checkInTime: guestData.checked_in_at,
        };
      }

      // Check in the guest
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('guests')
        .update({ 
          checked_in_at: now,
          status: 'checked-in'
        })
        .eq('id', guestData.id);

      if (updateError) {
        console.error('Error checking in guest:', updateError);
        return {
          success: false,
          message: 'Błąd podczas rejestracji gościa',
        };
      }

      const guest: Guest = {
        id: guestData.id,
        firstName: guestData.first_name,
        lastName: guestData.last_name,
        email: guestData.email,
        company: guestData.company || undefined,
        ticketType: ((guestData as any).ticket_type || 'uczestnik') as any,
        zones: ((guestData as any).zones || []) as string[],
        status: 'checked-in',
        qrCode: guestData.qr_code,
        phone: guestData.phone || undefined,
        checkedInAt: new Date(now),
        invitationSentAt: guestData.invitation_sent_at ? new Date(guestData.invitation_sent_at) : undefined,
        invitationOpenedAt: guestData.invitation_opened_at ? new Date(guestData.invitation_opened_at) : undefined,
      };

      return {
        success: true,
        guest,
        message: `Zarejestrowano: ${guest.firstName} ${guest.lastName}`,
        alreadyCheckedIn: false,
        checkInTime: now,
      };
    } catch (error) {
      console.error('Scanner error:', error);
      return {
        success: false,
        message: 'Wystąpił nieoczekiwany błąd',
      };
    }
  },

  /**
   * Get guest by QR code without checking in
   */
  async getGuestByQrCode(qrCode: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      company: data.company || undefined,
      ticketType: ((data as any).ticket_type || 'uczestnik') as any,
      zones: ((data as any).zones || []) as string[],
      status: data.status as Guest['status'],
      qrCode: data.qr_code,
      phone: data.phone || undefined,
      checkedInAt: data.checked_in_at ? new Date(data.checked_in_at) : undefined,
      invitationSentAt: data.invitation_sent_at ? new Date(data.invitation_sent_at) : undefined,
      invitationOpenedAt: data.invitation_opened_at ? new Date(data.invitation_opened_at) : undefined,
    };
  },

  /**
   * Undo check-in
   */
  async undoCheckIn(guestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('guests')
      .update({ 
        checked_in_at: null,
        status: 'confirmed'
      })
      .eq('id', guestId);

    return !error;
  },

  /**
   * Get check-in statistics for an event
   */
  async getCheckInStats(eventId: string): Promise<{
    total: number;
    checkedIn: number;
    pending: number;
    percentage: number;
  }> {
    const { data: guests, error } = await supabase
      .from('guests')
      .select('id, checked_in_at')
      .eq('event_id', eventId);

    if (error || !guests) {
      return { total: 0, checkedIn: 0, pending: 0, percentage: 0 };
    }

    const total = guests.length;
    const checkedIn = guests.filter(g => g.checked_in_at).length;
    const pending = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, checkedIn, pending, percentage };
  }
};
