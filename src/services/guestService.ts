
import { supabase } from "@/integrations/supabase/client";
import { Guest, GuestStatus, GuestZone } from "@/types";
import { GuestDB, GuestsQueryParams } from "@/types/guest/guest";
import { ApiResponse } from "@/types/api/apiResponse";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for managing guests with Supabase
 */
export const guestService = {
  /**
   * Get guests for an event with optional filtering
   */
  async getGuests(params?: GuestsQueryParams): Promise<ApiResponse<Guest[]>> {
    try {
      let query = supabase
        .from('guests')
        .select('*');

      if (params) {
        if (params.eventId) {
          query = query.eq('event_id', params.eventId);
        }

        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }

        if (params.zone && params.zone !== 'all') {
          query = query.eq('zone', params.zone);
        }

        if (params.emailStatus && params.emailStatus !== 'all') {
          query = query.eq('email_status', params.emailStatus);
        }

        if (params.search) {
          query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%,company.ilike.%${params.search}%`);
        }

        // Handle pagination
        if (params.page !== undefined && params.pageSize !== undefined) {
          const start = params.page * params.pageSize;
          const end = start + params.pageSize - 1;
          query = query.range(start, end);
        }
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data.map(mapDbGuestToGuest),
        pagination: count ? {
          total: count,
          page: params?.page || 0,
          pageSize: params?.pageSize || 10
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching guests:', error);
      return { error: { message: error.message, code: 'FETCH_GUESTS_ERROR' } };
    }
  },

  /**
   * Get a single guest by ID
   */
  async getGuestById(id: string): Promise<ApiResponse<Guest>> {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: mapDbGuestToGuest(data) };
    } catch (error) {
      console.error(`Error fetching guest with ID ${id}:`, error);
      return { error: { message: error.message, code: 'FETCH_GUEST_ERROR' } };
    }
  },

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

      return { data: mapDbGuestToGuest(data) };
    } catch (error) {
      console.error('Error creating guest:', error);
      return { error: { message: error.message, code: 'CREATE_GUEST_ERROR' } };
    }
  },

  /**
   * Bulk create guests
   */
  async createGuests(guests: Array<Partial<Guest> & { eventId: string }>): Promise<ApiResponse<Guest[]>> {
    try {
      const guestsToInsert = guests.map(guest => ({
        first_name: guest.firstName,
        last_name: guest.lastName,
        email: guest.email,
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

      return { data: data.map(mapDbGuestToGuest) };
    } catch (error) {
      console.error('Error bulk creating guests:', error);
      return { error: { message: error.message, code: 'BULK_CREATE_GUESTS_ERROR' } };
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
  },

  /**
   * Send invitation to guests
   */
  async sendInvitations(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('guests')
        .update({ 
          invitation_sent_at: now,
          email_status: 'sent'
        })
        .in('id', ids);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error(`Error sending invitations:`, error);
      return { error: { message: error.message, code: 'SEND_INVITATIONS_ERROR' } };
    }
  }
};

/**
 * Map database guest to our frontend Guest type
 */
function mapDbGuestToGuest(dbGuest: GuestDB): Guest {
  return {
    id: dbGuest.id,
    firstName: dbGuest.first_name,
    lastName: dbGuest.last_name,
    email: dbGuest.email,
    company: dbGuest.company,
    phone: dbGuest.phone,
    zone: dbGuest.zone as GuestZone, 
    status: dbGuest.status as GuestStatus,
    emailStatus: dbGuest.email_status,
    qrCode: dbGuest.qr_code,
    invitationSentAt: dbGuest.invitationSentAt ? new Date(dbGuest.invitationSentAt) : undefined,
    invitationOpenedAt: dbGuest.invitationOpenedAt ? new Date(dbGuest.invitationOpenedAt) : undefined,
    checkedInAt: dbGuest.checkedInAt ? new Date(dbGuest.checkedInAt) : undefined
  };
}
