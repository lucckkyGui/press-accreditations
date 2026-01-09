import { supabase } from "@/integrations/supabase/client";

export interface SendEmailRequest {
  guestIds: string[];
  eventId: string;
  subject?: string;
  customMessage?: string;
  templateId?: string;
}

export interface EmailResult {
  guestId: string;
  email: string;
  success: boolean;
  error?: string;
}

export interface SendEmailResponse {
  message: string;
  results: EmailResult[];
  stats: {
    total: number;
    success: number;
    failed: number;
  };
}

export const resendEmailService = {
  /**
   * Send invitation emails via Resend
   */
  async sendInvitations(request: SendEmailRequest): Promise<SendEmailResponse> {
    const { data, error } = await supabase.functions.invoke('send-invitation-emails', {
      body: request,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send emails');
    }

    return data as SendEmailResponse;
  },

  /**
   * Send single invitation
   */
  async sendSingleInvitation(guestId: string, eventId: string, subject?: string, message?: string): Promise<EmailResult> {
    const response = await this.sendInvitations({
      guestIds: [guestId],
      eventId,
      subject,
      customMessage: message,
    });

    return response.results[0];
  },

  /**
   * Send bulk invitations with progress callback
   */
  async sendBulkInvitations(
    guestIds: string[], 
    eventId: string, 
    options?: {
      subject?: string;
      customMessage?: string;
      templateId?: string;
      onProgress?: (progress: number) => void;
    }
  ): Promise<SendEmailResponse> {
    // For large batches, split into chunks
    const BATCH_SIZE = 50;
    const batches = [];
    
    for (let i = 0; i < guestIds.length; i += BATCH_SIZE) {
      batches.push(guestIds.slice(i, i + BATCH_SIZE));
    }

    const allResults: EmailResult[] = [];
    let processedCount = 0;

    for (const batch of batches) {
      const response = await this.sendInvitations({
        guestIds: batch,
        eventId,
        subject: options?.subject,
        customMessage: options?.customMessage,
        templateId: options?.templateId,
      });

      allResults.push(...response.results);
      processedCount += batch.length;

      if (options?.onProgress) {
        options.onProgress(Math.round((processedCount / guestIds.length) * 100));
      }
    }

    return {
      message: `Wysłano ${allResults.filter(r => r.success).length} z ${allResults.length} emaili`,
      results: allResults,
      stats: {
        total: allResults.length,
        success: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length,
      }
    };
  }
};
