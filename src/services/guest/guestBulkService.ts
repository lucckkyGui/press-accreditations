
import { supabase } from "@/integrations/supabase/client";
import { Guest, GuestStatus, GuestZone } from "@/types";
import { GuestDB, BulkEmailRequest } from "@/types/guest/guest";
import { ApiResponse } from "@/types/api/apiResponse";
import { v4 as uuidv4 } from "uuid";
import { mapDbGuestToGuest } from "./guestMapper";

/**
 * Service for bulk guest operations
 */
export const guestBulkService = {
  /**
   * Bulk create guests
   */
  async createGuests(guests: Array<Partial<Guest> & { eventId: string }>): Promise<ApiResponse<Guest[]>> {
    try {
      const guestsToInsert = guests.map(guest => ({
        first_name: guest.firstName,
        last_name: guest.lastName,
        email: guest.email,
        pesel: guest.pesel,
        company: guest.company,
        phone: guest.phone,
        zone: guest.zone || 'general',
        status: guest.status || 'invited',
        qr_code: uuidv4(),
        event_id: guest.eventId
      }));

      const { data, error } = await supabase
        .from('guests')
        .insert(guestsToInsert)
        .select();

      if (error) throw error;

      return { data: data.map(item => mapDbGuestToGuest(item as GuestDB)) };
    } catch (error) {
      console.error('Error bulk creating guests:', error);
      return { error: { message: error.message, code: 'BULK_CREATE_GUESTS_ERROR' } };
    }
  },

  /**
   * Bulk delete guests
   */
  async deleteGuests(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .in('id', ids);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error(`Error bulk deleting guests:`, error);
      return { error: { message: error.message, code: 'BULK_DELETE_GUESTS_ERROR' } };
    }
  },

  /**
   * Update guest status in bulk
   */
  async updateGuestsStatus(ids: string[], status: GuestStatus): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ status })
        .in('id', ids);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error(`Error updating status for multiple guests:`, error);
      return { error: { message: error.message, code: 'UPDATE_GUESTS_STATUS_ERROR' } };
    }
  },

  /**
   * Update guest zone in bulk
   */
  async updateGuestsZone(ids: string[], zone: GuestZone): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ zone })
        .in('id', ids);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error(`Error updating zone for multiple guests:`, error);
      return { error: { message: error.message, code: 'UPDATE_GUESTS_ZONE_ERROR' } };
    }
  }
};
