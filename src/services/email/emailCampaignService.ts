
import { supabase } from "@/integrations/supabase/client";
import { ApiResponse } from "@/types/api/apiResponse";

export interface EmailCampaignData {
  id: string;
  event_id: string;
  name: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  opened_count: number;
  status: 'draft' | 'sending' | 'completed' | 'paused' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailQueueData {
  id: string;
  invitation_id: string;
  recipient_email: string;
  subject: string;
  content: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'retry';
  priority: number;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  last_attempt_at?: string;
  error_message?: string;
}

export interface CreateCampaignRequest {
  event_id: string;
  name: string;
  total_recipients: number;
}

export interface AddToEmailQueueRequest {
  invitation_id: string;
  recipient_email: string;
  subject: string;
  content: string;
  priority?: number;
  scheduled_for?: string;
}

export const emailCampaignService = {
  /**
   * Create email campaign
   */
  async createCampaign(request: CreateCampaignRequest): Promise<ApiResponse<EmailCampaignData>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          event_id: request.event_id,
          name: request.name,
          total_recipients: request.total_recipients,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      return { data: data as EmailCampaignData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to create campaign', 
          code: 'CREATE_CAMPAIGN_ERROR' 
        } 
      };
    }
  },

  /**
   * Add emails to queue
   */
  async addToEmailQueue(requests: AddToEmailQueueRequest[]): Promise<ApiResponse<EmailQueueData[]>> {
    try {
      const emailData = requests.map(request => ({
        invitation_id: request.invitation_id,
        recipient_email: request.recipient_email,
        subject: request.subject,
        content: request.content,
        priority: request.priority || 0,
        scheduled_for: request.scheduled_for || new Date().toISOString(),
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('email_queue')
        .insert(emailData)
        .select();

      if (error) throw error;

      return { data: data as EmailQueueData[] };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to add to email queue', 
          code: 'ADD_TO_QUEUE_ERROR' 
        } 
      };
    }
  },

  /**
   * Update campaign status
   */
  async updateCampaignStatus(
    campaignId: string, 
    status: EmailCampaignData['status'],
    stats?: Partial<Pick<EmailCampaignData, 'sent_count' | 'failed_count' | 'opened_count'>>
  ): Promise<ApiResponse<EmailCampaignData>> {
    try {
      const updateData: any = { status };
      
      if (status === 'sending' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (stats) {
        Object.assign(updateData, stats);
      }

      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as EmailCampaignData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to update campaign', 
          code: 'UPDATE_CAMPAIGN_ERROR' 
        } 
      };
    }
  },

  /**
   * Get pending emails from queue
   */
  async getPendingEmails(limit: number = 50): Promise<ApiResponse<EmailQueueData[]>> {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .in('status', ['pending', 'retry'])
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return { data: data as EmailQueueData[] };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to get pending emails', 
          code: 'GET_PENDING_EMAILS_ERROR' 
        } 
      };
    }
  },

  /**
   * Update email status
   */
  async updateEmailStatus(
    emailId: string, 
    status: EmailQueueData['status'],
    errorMessage?: string
  ): Promise<ApiResponse<EmailQueueData>> {
    try {
      const updateData: any = { 
        status,
        last_attempt_at: new Date().toISOString()
      };

      if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage;
      }

      // Increment attempts counter
      const { data: currentData } = await supabase
        .from('email_queue')
        .select('attempts')
        .eq('id', emailId)
        .single();

      if (currentData) {
        updateData.attempts = (currentData.attempts || 0) + 1;
      }

      const { data, error } = await supabase
        .from('email_queue')
        .update(updateData)
        .eq('id', emailId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as EmailQueueData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to update email status', 
          code: 'UPDATE_EMAIL_STATUS_ERROR' 
        } 
      };
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<ApiResponse<EmailCampaignData>> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      return { data: data as EmailCampaignData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to get campaign stats', 
          code: 'GET_CAMPAIGN_STATS_ERROR' 
        } 
      };
    }
  }
};
