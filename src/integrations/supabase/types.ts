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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          accreditation_type_id: string | null
          company: string | null
          created_at: string | null
          email: string | null
          event_id: string
          first_name: string | null
          id: string
          last_name: string | null
          message: string | null
          phone: string | null
          position: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accreditation_type_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          event_id: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          position?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accreditation_type_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          position?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditation_requests_accreditation_type_id_fkey"
            columns: ["accreditation_type_id"]
            isOneToOne: false
            referencedRelation: "accreditation_types"
            referencedColumns: ["id"]
          },
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
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      accreditations: {
        Row: {
          accreditation_request_id: string | null
          created_at: string
          event_id: string
          expires_at: string | null
          guest_id: string | null
          id: string
          issued_at: string | null
          metadata: Json
          status: string
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accreditation_request_id?: string | null
          created_at?: string
          event_id: string
          expires_at?: string | null
          guest_id?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accreditation_request_id?: string | null
          created_at?: string
          event_id?: string
          expires_at?: string | null
          guest_id?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditations_accreditation_request_id_fkey"
            columns: ["accreditation_request_id"]
            isOneToOne: false
            referencedRelation: "accreditation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accreditations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          event_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string | null
          last_used_at: string | null
          name: string
          permissions: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix?: string | null
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string | null
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      coverage_items: {
        Row: {
          article_url: string | null
          coverage_request_id: string
          created_at: string
          estimated_reach: number | null
          event_id: string
          gallery_url: string | null
          id: string
          notes: string | null
          publication_date: string | null
          publication_type: string | null
          social_post_url: string | null
          sponsor_mentions: number | null
          submitted_by: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          video_url: string | null
        }
        Insert: {
          article_url?: string | null
          coverage_request_id: string
          created_at?: string
          estimated_reach?: number | null
          event_id: string
          gallery_url?: string | null
          id?: string
          notes?: string | null
          publication_date?: string | null
          publication_type?: string | null
          social_post_url?: string | null
          sponsor_mentions?: number | null
          submitted_by?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
        }
        Update: {
          article_url?: string | null
          coverage_request_id?: string
          created_at?: string
          estimated_reach?: number | null
          event_id?: string
          gallery_url?: string | null
          id?: string
          notes?: string | null
          publication_date?: string | null
          publication_type?: string | null
          social_post_url?: string | null
          sponsor_mentions?: number | null
          submitted_by?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coverage_items_coverage_request_id_fkey"
            columns: ["coverage_request_id"]
            isOneToOne: false
            referencedRelation: "coverage_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_requests: {
        Row: {
          contact_id: string | null
          created_at: string
          email: string
          event_id: string
          first_name: string | null
          guest_id: string | null
          id: string
          last_name: string | null
          last_reminder_at: string | null
          media_name: string | null
          organizer_id: string
          reminders_sent: Json
          status: string
          submission_id: string | null
          token: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          email: string
          event_id: string
          first_name?: string | null
          guest_id?: string | null
          id?: string
          last_name?: string | null
          last_reminder_at?: string | null
          media_name?: string | null
          organizer_id: string
          reminders_sent?: Json
          status?: string
          submission_id?: string | null
          token: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          email?: string
          event_id?: string
          first_name?: string | null
          guest_id?: string | null
          id?: string
          last_name?: string | null
          last_reminder_at?: string | null
          media_name?: string | null
          organizer_id?: string
          reminders_sent?: Json
          status?: string
          submission_id?: string | null
          token?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverage_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "media_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_requests_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_requests_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "landing_page_submissions"
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
      email_queue: {
        Row: {
          attempts: number
          body: string
          created_at: string
          error_message: string | null
          event_id: string | null
          guest_id: string | null
          id: string
          metadata: Json
          provider: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_name: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          body: string
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          guest_id?: string | null
          id?: string
          metadata?: Json
          provider?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          body?: string
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          guest_id?: string | null
          id?: string
          metadata?: Json
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invitation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      event_landing_pages: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          event_id: string
          form_config: Json
          id: string
          is_active: boolean
          logo_url: string | null
          primary_color: string
          secondary_color: string
          slug: string
          social_links: Json
          terms_text: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          form_config?: Json
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          slug: string
          social_links?: Json
          terms_text?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          form_config?: Json
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          slug?: string
          social_links?: Json
          terms_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_landing_pages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      guest_check_in_scans: {
        Row: {
          created_at: string
          device_info: Json
          event_id: string
          guest_id: string | null
          id: string
          message: string | null
          qr_code_hash: string
          scan_result: string
          scanned_by: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json
          event_id: string
          guest_id?: string | null
          id?: string
          message?: string | null
          qr_code_hash: string
          scan_result: string
          scanned_by?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json
          event_id?: string
          guest_id?: string | null
          id?: string
          message?: string | null
          qr_code_hash?: string
          scan_result?: string
          scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_check_in_scans_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_check_in_scans_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          access_level: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          company: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string
          email_status: string | null
          event_id: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          qr_code: string | null
          revocation_reason: string | null
          revoked_at: string | null
          status: string | null
          ticket_type: string | null
          updated_at: string | null
          zone: string | null
          zones: string[]
        }
        Insert: {
          access_level?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email: string
          email_status?: string | null
          event_id: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          qr_code?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: string | null
          ticket_type?: string | null
          updated_at?: string | null
          zone?: string | null
          zones?: string[]
        }
        Update: {
          access_level?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string
          email_status?: string | null
          event_id?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          qr_code?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: string | null
          ticket_type?: string | null
          updated_at?: string | null
          zone?: string | null
          zones?: string[]
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
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          event_id: string
          guest_id: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          guest_id?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          guest_id?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
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
      landing_page_submissions: {
        Row: {
          access_level: string | null
          accreditation_id: string | null
          accreditation_type: string | null
          applicant_message: string | null
          consent_data_processing: boolean
          consent_marketing: boolean
          coverage_description: string | null
          created_at: string
          custom_fields: Json
          decided_at: string | null
          decided_by: string | null
          decision_email_sent_at: string | null
          decision_email_status: string | null
          email: string
          event_id: string
          first_name: string
          flags: Json
          guest_id: string | null
          id: string
          job_title: string | null
          landing_page_id: string
          last_name: string
          media_organization: string | null
          media_type: string | null
          pass_issued_at: string | null
          pass_qr_code: string | null
          phone: string | null
          portfolio_url: string | null
          previous_accreditation: boolean
          publication_links: string | null
          requested_access: string | null
          role: string | null
          social_media: string | null
          status: string
          updated_at: string
          verification_explanation: string | null
          verification_flags: Json
          verification_notes: string | null
          verification_overridden_at: string | null
          verification_overridden_by: string | null
          verification_risk_level: string | null
          verification_score: number | null
          verification_status: string | null
        }
        Insert: {
          access_level?: string | null
          accreditation_id?: string | null
          accreditation_type?: string | null
          applicant_message?: string | null
          consent_data_processing?: boolean
          consent_marketing?: boolean
          coverage_description?: string | null
          created_at?: string
          custom_fields?: Json
          decided_at?: string | null
          decided_by?: string | null
          decision_email_sent_at?: string | null
          decision_email_status?: string | null
          email: string
          event_id: string
          first_name: string
          flags?: Json
          guest_id?: string | null
          id?: string
          job_title?: string | null
          landing_page_id: string
          last_name: string
          media_organization?: string | null
          media_type?: string | null
          pass_issued_at?: string | null
          pass_qr_code?: string | null
          phone?: string | null
          portfolio_url?: string | null
          previous_accreditation?: boolean
          publication_links?: string | null
          requested_access?: string | null
          role?: string | null
          social_media?: string | null
          status?: string
          updated_at?: string
          verification_explanation?: string | null
          verification_flags?: Json
          verification_notes?: string | null
          verification_overridden_at?: string | null
          verification_overridden_by?: string | null
          verification_risk_level?: string | null
          verification_score?: number | null
          verification_status?: string | null
        }
        Update: {
          access_level?: string | null
          accreditation_id?: string | null
          accreditation_type?: string | null
          applicant_message?: string | null
          consent_data_processing?: boolean
          consent_marketing?: boolean
          coverage_description?: string | null
          created_at?: string
          custom_fields?: Json
          decided_at?: string | null
          decided_by?: string | null
          decision_email_sent_at?: string | null
          decision_email_status?: string | null
          email?: string
          event_id?: string
          first_name?: string
          flags?: Json
          guest_id?: string | null
          id?: string
          job_title?: string | null
          landing_page_id?: string
          last_name?: string
          media_organization?: string | null
          media_type?: string | null
          pass_issued_at?: string | null
          pass_qr_code?: string | null
          phone?: string | null
          portfolio_url?: string | null
          previous_accreditation?: boolean
          publication_links?: string | null
          requested_access?: string | null
          role?: string | null
          social_media?: string | null
          status?: string
          updated_at?: string
          verification_explanation?: string | null
          verification_flags?: Json
          verification_notes?: string | null
          verification_overridden_at?: string | null
          verification_overridden_by?: string | null
          verification_risk_level?: string | null
          verification_score?: number | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_submissions_accreditation_id_fkey"
            columns: ["accreditation_id"]
            isOneToOne: false
            referencedRelation: "accreditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_submissions_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_submissions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "event_landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      media_contact_outlets: {
        Row: {
          contact_id: string
          created_at: string
          outlet_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          outlet_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          outlet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_contact_outlets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "media_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_contact_outlets_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "media_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      media_contacts: {
        Row: {
          approved_count: number
          checked_in_count: number
          coverage_count: number
          created_at: string
          email: string
          events_count: number
          first_name: string | null
          id: string
          last_name: string | null
          no_show_count: number
          organizer_id: string
          phone: string | null
          pr_notes: string | null
          primary_outlet_id: string | null
          quality_rating: number | null
          role: string | null
          submissions_count: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          approved_count?: number
          checked_in_count?: number
          coverage_count?: number
          created_at?: string
          email: string
          events_count?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          no_show_count?: number
          organizer_id: string
          phone?: string | null
          pr_notes?: string | null
          primary_outlet_id?: string | null
          quality_rating?: number | null
          role?: string | null
          submissions_count?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          approved_count?: number
          checked_in_count?: number
          coverage_count?: number
          created_at?: string
          email?: string
          events_count?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          no_show_count?: number
          organizer_id?: string
          phone?: string | null
          pr_notes?: string | null
          primary_outlet_id?: string | null
          quality_rating?: number | null
          role?: string | null
          submissions_count?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_contacts_primary_outlet_id_fkey"
            columns: ["primary_outlet_id"]
            isOneToOne: false
            referencedRelation: "media_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      media_documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          registration_id: string | null
          review_notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          registration_id?: string | null
          review_notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          registration_id?: string | null
          review_notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      media_outlets: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          media_type: string | null
          name: string
          normalized_name: string
          notes: string | null
          organizer_id: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          media_type?: string | null
          name: string
          normalized_name: string
          notes?: string | null
          organizer_id: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          media_type?: string | null
          name?: string
          normalized_name?: string
          notes?: string | null
          organizer_id?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      media_registrations: {
        Row: {
          coverage_plan: string | null
          created_at: string | null
          event_id: string
          id: string
          job_title: string | null
          media_organization: string | null
          media_type: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          coverage_plan?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          job_title?: string | null
          media_organization?: string | null
          media_type?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          coverage_plan?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          job_title?: string | null
          media_organization?: string | null
          media_type?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          role: string
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
          role?: string
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
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submission_verification_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          event_id: string
          event_type: string
          from_risk: string | null
          from_score: number | null
          from_status: string | null
          id: string
          metadata: Json
          note: string | null
          submission_id: string
          to_risk: string | null
          to_score: number | null
          to_status: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_id: string
          event_type: string
          from_risk?: string | null
          from_score?: number | null
          from_status?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          submission_id: string
          to_risk?: string | null
          to_score?: number | null
          to_status?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_id?: string
          event_type?: string
          from_risk?: string | null
          from_score?: number | null
          from_status?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          submission_id?: string
          to_risk?: string | null
          to_score?: number | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_verification_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_verification_events_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "landing_page_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
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
      process_qr_check_in: {
        Args: {
          _client_scan_id?: string
          _device_info?: Json
          _event_id: string
          _qr_code: string
          _scanned_at?: string
        }
        Returns: Json
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "organizer", "staff", "guest"],
    },
  },
} as const
