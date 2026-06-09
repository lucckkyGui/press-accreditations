
import { supabase } from "@/integrations/supabase/client";
import { BulkEmailRequest } from "@/types/guest/guest";
import { ApiResponse } from "@/types/api/apiResponse";

/**
 * Service for guest email operations
 */
export const guestEmailService = {
  /**
   * Send invitation to guests
   */
  async sendInvitations(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ email_status: 'sent' })
        .in('id', ids);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      return { error: { message: error.message, code: 'SEND_INVITATIONS_ERROR' } };
    }
  },

  /**
   * Send bulk email invitations
   */
  async sendBulkInvitations(request: BulkEmailRequest): Promise<ApiResponse<void>> {
    try {
      // Tutaj będzie integracja z rzeczywistym dostawcą email
      // Na razie symulujemy wysyłkę
      const { error } = await supabase
        .from('guests')
        .update({ email_status: 'sent' })
        .in('id', request.guestIds);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      return { error: { message: error.message, code: 'SEND_BULK_INVITATIONS_ERROR' } };
    }
  }
};
