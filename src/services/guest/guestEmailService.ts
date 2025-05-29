
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
  },

  /**
   * Send bulk email invitations
   */
  async sendBulkInvitations(request: BulkEmailRequest): Promise<ApiResponse<void>> {
    try {
      console.log('Sending bulk invitations:', request);
      
      // Tutaj będzie integracja z rzeczywistym dostawcą email
      // Na razie symulujemy wysyłkę
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('guests')
        .update({ 
          invitation_sent_at: now,
          email_status: 'sent'
        })
        .in('id', request.guestIds);

      if (error) throw error;

      return { data: undefined };
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      return { error: { message: error.message, code: 'SEND_BULK_INVITATIONS_ERROR' } };
    }
  }
};
