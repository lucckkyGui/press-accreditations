export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          updated_at: string | null
          zone: string
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
          updated_at?: string | null
          zone: string
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
          updated_at?: string | null
          zone?: string
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
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "organizer" | "staff" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "organizer", "staff", "guest"],
    },
  },
} as const
