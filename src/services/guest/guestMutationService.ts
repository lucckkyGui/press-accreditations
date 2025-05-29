
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types";
import { GuestDB } from "@/types/guest/guest";
import { ApiResponse } from "@/types/api/apiResponse";
import { v4 as uuidv4 } from "uuid";
import { mapDbGuestToGuest } from "./guestMapper";

/**
 * Service for guest mutations (create, update, delete)
 */
export const guestMutationService = {
  /**
   * Create a new guest
   */
  async createGuest(guest: Partial<Guest> & { eventId: string }): Promise<ApiResponse<Guest>> {
    try {
      // Generate a unique QR code
      const qrCode = uuidv4();

      const { data, error } = await supabase
        .from('guests')
        .insert([{
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: guest.email,
          pesel: guest.pesel,
          company: guest.company,
          phone: guest.phone,
          zone: guest.zone || 'general',
          status: guest.status || 'invited',
          qr_code: qrCode,
          event_id: guest.eventId
        }])
        .select()
        .single();

      if (error) throw error;

      return { data: mapDbGuestToGuest(data as GuestDB) };
    } catch (error) {
      console.error('Error creating guest:', error);
      return { error: { message: error.message, code: 'CREATE_GUEST_ERROR' } };
    }
  },

  /**
   * Update an existing guest
   */
  async updateGuest(id: string, guest: Partial<Guest>): Promise<ApiResponse<Guest>> {
    try {
      const updateData: Record<string, any> = {};
      
      if (guest.firstName !== undefined) updateData.first_name = guest.firstName;
      if (guest.lastName !== undefined) updateData.last_name = guest.lastName;
      if (guest.email !== undefined) updateData.email = guest.email;
      if (guest.pesel !== undefined) updateData.pesel = guest.pesel;
      if (guest.company !== undefined) updateData.company = guest.company;
      if (guest.phone !== undefined) updateData.phone = guest.phone;
      if (guest.zone !== undefined) updateData.zone = guest.zone;
      if (guest.status !== undefined) updateData.status = guest.status;
      if (guest.emailStatus !== undefined) updateData.email_status = guest.emailStatus;
      
      const { data, error } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: mapDbGuestToGuest(data) };
    } catch (error) {
      console.error(`Error updating guest with ID ${id}:`, error);
      return { error: { message: error.message, code: 'UPDATE_GUEST_ERROR' } };
    }
  },

  /**
   * Delete a guest
   */
  async deleteGuest(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error(`Error deleting guest with ID ${id}:`, error);
      return { error: { message: error.message, code: 'DELETE_GUEST_ERROR' } };
    }
  }
};
