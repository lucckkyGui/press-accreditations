
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types";
import { GuestDB, GuestsQueryParams } from "@/types/guest/guest";
import { ApiResponse } from "@/types/api/apiResponse";
import { mapDbGuestToGuest } from "./guestMapper";

/**
 * Service for querying guests
 */
export const guestQueryService = {
  /**
   * Get guests for an event with optional filtering
   */
  async getGuests(params?: GuestsQueryParams): Promise<ApiResponse<Guest[]>> {
    try {
      let query = supabase
        .from('guests')
        .select('*', { count: 'exact' });

      if (params) {
        if (params.eventId) {
          query = query.eq('event_id', params.eventId);
        }

        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        }

        if (params.ticketType && params.ticketType !== 'all') {
          query = query.eq('ticket_type', params.ticketType);
        }

        if (params.zone && params.zone !== 'all') {
          query = query.contains('zones', [params.zone]);
        }

        if (params.emailStatus && params.emailStatus !== 'all') {
          query = query.eq('email_status', params.emailStatus);
        }

        if (params.search) {
          // Przecinek/nawiasy sterują składnią .or() PostgREST, a %_\ wzorcem ilike —
          // bez escapowania wyszukanie „Kowalski, Jan" psuło filtr (idiom jak w eventService).
          const sanitized = params.search.replace(/[%_\\]/g, "\\$&").replace(/[,()]/g, " ").slice(0, 100);
          query = query.or(`first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,company.ilike.%${sanitized}%`);
        }

        // Handle pagination
        if (params.page !== undefined && params.pageSize !== undefined) {
          const start = params.page * params.pageSize;
          const end = start + params.pageSize - 1;
          query = query.range(start, end);
        }
      }

      const { data, error, count: totalCount } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const page = params?.page || 0;
      const pageSize = params?.pageSize || 50;

      return {
        data: data.map((item: any) => mapDbGuestToGuest(item)),
        pagination: {
          total: totalCount || data.length,
          page,
          pageSize,
          totalPages: Math.ceil((totalCount || data.length) / pageSize)
        }
      };
    } catch (error: any) {
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
      return { error: { message: error.message, code: 'FETCH_GUEST_ERROR' } };
    }
  }
};
