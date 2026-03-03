export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          denial_reason: string | null
          device_info: string | null
          event_id: string
          id: string
          scanned_by: string | null
          wristband_id: string
          zone_name: string
        }
        Insert: {
          action: string
          created_at?: string
          denial_reason?: string | null
          device_info?: string | null
          event_id: string
          id?: string
          scanned_by?: string | null
          wristband_id: string
          zone_name: string
        }
        Update: {
          action?: string
          created_at?: string
          denial_reason?: string | null
          device_info?: string | null
          event_id?: string
          id?: string
          scanned_by?: string | null
          wristband_id?: string
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_wristband_id_fkey"
            columns: ["wristband_id"]
            isOneToOne: false
            referencedRelation: "wristbands"
            referencedColumns: ["id"]
          },
        ]
      }
      accreditation_requests: {
        Row: {
          approval_date: string | null
          approval_notes: string | null
          approved_by: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          event_id: string
          id: string
          media_name: string
          media_type: string
          request_notes: string | null
          status: string
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_notes?: string | null
          approved_by?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          media_name: string
          media_type: string
          request_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_notes?: string | null
          approved_by?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          media_name?: string
          media_type?: string
          request_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditation_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      accreditation_types: {
        Row: {
          access_areas: string[] | null
          created_at: string | null
          created_by: string
          description: string | null
          event_id: string
          id: string
          max_requests: number | null
          name: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          access_areas?: string[] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          event_id: string
          id?: string
          max_requests?: number | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          access_areas?: string[] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          event_id?: string
          id?: string
          max_requests?: number | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditation_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      accreditations: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string | null
          event_id: string
          id: string
          is_checked_in: boolean | null
          qr_code: string
          request_id: string | null
          revocation_reason: string | null
          revoked: boolean | null
          type_id: string
          updated_at: string | null
          user_id: string
          validity_end: string
          validity_start: string
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_checked_in?: boolean | null
          qr_code: string
          request_id?: string | null
          revocation_reason?: string | null
          revoked?: boolean | null
          type_id: string
          updated_at?: string | null
          user_id: string
          validity_end: string
          validity_start: string
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_checked_in?: boolean | null
          qr_code?: string
          request_id?: string | null
          revocation_reason?: string | null
          revoked?: boolean | null
          type_id?: string
          updated_at?: string | null
          user_id?: string
          validity_end?: string
          validity_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "accreditations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "accreditation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "accreditation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_submissions: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          parent_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          parent_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          parent_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_submissions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string | null
          event_id: string
          failed_count: number | null
          id: string
          name: string
          opened_count: number | null
          sent_count: number | null
          started_at: string | null
          status: string
          total_recipients: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          event_id: string
          failed_count?: number | null
          id?: string
          name: string
          opened_count?: number | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          event_id?: string
          failed_count?: number | null
          id?: string
          name?: string
          opened_count?: number | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          attempts: number | null
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          invitation_id: string
          last_attempt_at: string | null
          max_attempts: number | null
          priority: number | null
          recipient_email: string
          scheduled_for: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          invitation_id: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          priority?: number | null
          recipient_email: string
          scheduled_for?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          invitation_id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          priority?: number | null
          recipient_email?: string
          scheduled_for?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          max_guests: number | null
          organizer_id: string | null
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_guests?: number | null
          organizer_id?: string | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_guests?: number | null
          organizer_id?: string | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          checked_in_at: string | null
          company: string | null
          created_at: string | null
          email: string
          email_status: string | null
          event_id: string
          first_name: string
          id: string
          invitation_opened_at: string | null
          invitation_sent_at: string | null
          last_name: string
          phone: string | null
          qr_code: string
          status: string
          ticket_type: string
          updated_at: string | null
          zones: string[] | null
        }
        Insert: {
          checked_in_at?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          email_status?: string | null
          event_id: string
          first_name: string
          id?: string
          invitation_opened_at?: string | null
          invitation_sent_at?: string | null
          last_name: string
          phone?: string | null
          qr_code: string
          status: string
          ticket_type?: string
          updated_at?: string | null
          zones?: string[] | null
        }
        Update: {
          checked_in_at?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          email_status?: string | null
          event_id?: string
          first_name?: string
          id?: string
          invitation_opened_at?: string | null
          invitation_sent_at?: string | null
          last_name?: string
          phone?: string | null
          qr_code?: string
          status?: string
          ticket_type?: string
          updated_at?: string | null
          zones?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          event_id: string
          generated_at: string | null
          guest_id: string
          id: string
          is_used: boolean | null
          metadata: Json | null
          opened_at: string | null
          qr_code_data: string
          sent_at: string | null
          template_id: string | null
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          generated_at?: string | null
          guest_id: string
          id?: string
          is_used?: boolean | null
          metadata?: Json | null
          opened_at?: string | null
          qr_code_data: string
          sent_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          generated_at?: string | null
          guest_id?: string
          id?: string
          is_used?: boolean | null
          metadata?: Json | null
          opened_at?: string | null
          qr_code_data?: string
          sent_at?: string | null
          template_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invitation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      media_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          registration_id: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          registration_id: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          registration_id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_documents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "media_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_registrations: {
        Row: {
          coverage_description: string | null
          created_at: string
          event_id: string
          id: string
          job_title: string
          media_organization: string
          previous_accreditation: boolean | null
          rejection_reason: string | null
          reviewer_id: string | null
          social_media: Json | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          coverage_description?: string | null
          created_at?: string
          event_id: string
          id?: string
          job_title: string
          media_organization: string
          previous_accreditation?: boolean | null
          rejection_reason?: string | null
          reviewer_id?: string | null
          social_media?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          coverage_description?: string | null
          created_at?: string
          event_id?: string
          id?: string
          job_title?: string
          media_organization?: string
          previous_accreditation?: boolean | null
          rejection_reason?: string | null
          reviewer_id?: string | null
          social_media?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          event_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wristbands: {
        Row: {
          assigned_at: string
          created_at: string
          deactivated_at: string | null
          deactivation_reason: string | null
          event_id: string
          guest_id: string
          id: string
          is_active: boolean
          rfid_code: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          event_id: string
          guest_id: string
          id?: string
          is_active?: boolean
          rfid_code: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          event_id?: string
          guest_id?: string
          id?: string
          is_active?: boolean
          rfid_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wristbands_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wristbands_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_presence: {
        Row: {
          entered_at: string
          event_id: string
          exited_at: string | null
          id: string
          is_inside: boolean
          wristband_id: string
          zone_name: string
        }
        Insert: {
          entered_at?: string
          event_id: string
          exited_at?: string | null
          id?: string
          is_inside?: boolean
          wristband_id: string
          zone_name: string
        }
        Update: {
          entered_at?: string
          event_id?: string
          exited_at?: string | null
          id?: string
          is_inside?: boolean
          wristband_id?: string
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_presence_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_presence_wristband_id_fkey"
            columns: ["wristband_id"]
            isOneToOne: false
            referencedRelation: "wristbands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_event_organizer: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      process_rfid_scan: {
        Args: {
          _device_info?: string
          _event_id: string
          _rfid_code: string
          _scanned_by?: string
          _zone_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "organizer" | "staff" | "guest"
      user_role: "admin" | "organizer" | "staff" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "organizer", "staff", "guest"],
      user_role: ["admin", "organizer", "staff", "guest"],
    },
  },
} as const
