
import { supabase } from "@/integrations/supabase/client";
import { ApiResponse } from "@/types/api/apiResponse";
import QRCode from 'qrcode';

export interface InvitationData {
  id: string;
  guest_id: string;
  event_id: string;
  qr_code_data: string;
  template_id?: string;
  generated_at: string;
  sent_at?: string;
  opened_at?: string;
  is_used: boolean;
  used_at?: string;
  metadata: Record<string, any>;
}

export interface CreateInvitationRequest {
  guest_id: string;
  event_id: string;
  template_id?: string;
  metadata?: Record<string, any>;
}

export const invitationService = {
  /**
   * Generate QR code data for invitation
   */
  async generateQRCode(invitationId: string): Promise<string> {
    const qrData = {
      type: 'invitation',
      id: invitationId,
      timestamp: Date.now()
    };
    
    try {
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      return qrCodeString;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  },

  /**
   * Create invitation with QR code
   */
  async createInvitation(request: CreateInvitationRequest): Promise<ApiResponse<InvitationData>> {
    try {
      // Generate unique QR code data
      const qrCodeData = `invitation_${request.guest_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          guest_id: request.guest_id,
          event_id: request.event_id,
          qr_code_data: qrCodeData,
          template_id: request.template_id,
          metadata: request.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      return { data: data as InvitationData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to create invitation', 
          code: 'CREATE_INVITATION_ERROR' 
        } 
      };
    }
  },

  /**
   * Create invitations in bulk
   */
  async createBulkInvitations(requests: CreateInvitationRequest[]): Promise<ApiResponse<InvitationData[]>> {
    try {
      const invitationsData = requests.map(request => ({
        guest_id: request.guest_id,
        event_id: request.event_id,
        qr_code_data: `invitation_${request.guest_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        template_id: request.template_id,
        metadata: request.metadata || {}
      }));

      const { data, error } = await supabase
        .from('invitations')
        .insert(invitationsData)
        .select();

      if (error) throw error;

      return { data: data as InvitationData[] };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to create bulk invitations', 
          code: 'CREATE_BULK_INVITATIONS_ERROR' 
        } 
      };
    }
  },

  /**
   * Get invitation by QR code
   */
  async getInvitationByQR(qrCodeData: string): Promise<ApiResponse<InvitationData>> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          guest:guests(*),
          event:events(*)
        `)
        .eq('qr_code_data', qrCodeData)
        .single();

      if (error) throw error;

      return { data: data as InvitationData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Invitation not found', 
          code: 'INVITATION_NOT_FOUND' 
        } 
      };
    }
  },

  /**
   * Mark invitation as used (check-in)
   */
  async useInvitation(invitationId: string): Promise<ApiResponse<InvitationData>> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;

      return { data: data as InvitationData };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to use invitation', 
          code: 'USE_INVITATION_ERROR' 
        } 
      };
    }
  },

  /**
   * Get invitations for event
   */
  async getEventInvitations(eventId: string): Promise<ApiResponse<InvitationData[]>> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          guest:guests(*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as InvitationData[] };
    } catch (error) {
      return { 
        error: { 
          message: error.message || 'Failed to get invitations', 
          code: 'GET_INVITATIONS_ERROR' 
        } 
      };
    }
  }
};
