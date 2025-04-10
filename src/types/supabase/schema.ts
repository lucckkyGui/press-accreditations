
/**
 * TypeScript definitions for Supabase Schema
 * These types represent the database schema and can be used with the Supabase client
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          plan_type: string
          plan_expires_at: string | null
          contact_email: string | null
          logo_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan_type?: string
          plan_expires_at?: string | null
          contact_email?: string | null
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan_type?: string
          plan_expires_at?: string | null
          contact_email?: string | null
          logo_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: "admin" | "organizer" | "staff" | "guest"
          organization_id: string | null
          avatar_url: string | null
          last_active: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: "admin" | "organizer" | "staff" | "guest"
          organization_id?: string | null
          avatar_url?: string | null
          last_active?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: "admin" | "organizer" | "staff" | "guest"
          organization_id?: string | null
          avatar_url?: string | null
          last_active?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          start_date: string
          end_date: string | null
          organization_id: string
          created_by: string
          is_published: boolean
          venue: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          start_date: string
          end_date?: string | null
          organization_id: string
          created_by: string
          is_published?: boolean
          venue?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          start_date?: string
          end_date?: string | null
          organization_id?: string
          created_by?: string
          is_published?: boolean
          venue?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          capacity: number | null
          color: string | null
          event_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          capacity?: number | null
          color?: string | null
          event_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          capacity?: number | null
          color?: string | null
          event_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          company: string | null
          phone: string | null
          zone: "vip" | "press" | "staff" | "general"
          status: "invited" | "confirmed" | "declined" | "checked-in"
          email_status: "sent" | "opened" | "failed" | "unknown" | null
          qr_code: string
          invitation_sent_at: string | null
          invitation_opened_at: string | null
          checked_in_at: string | null
          event_id: string
          notes: string | null
          tags: string[] | null
          custom_field_values: Json
          ticket_type_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          company?: string | null
          phone?: string | null
          zone: "vip" | "press" | "staff" | "general"
          status: "invited" | "confirmed" | "declined" | "checked-in"
          email_status?: "sent" | "opened" | "failed" | "unknown" | null
          qr_code: string
          invitation_sent_at?: string | null
          invitation_opened_at?: string | null
          checked_in_at?: string | null
          event_id: string
          notes?: string | null
          tags?: string[] | null
          custom_field_values?: Json
          ticket_type_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          company?: string | null
          phone?: string | null
          zone?: "vip" | "press" | "staff" | "general"
          status?: "invited" | "confirmed" | "declined" | "checked-in"
          email_status?: "sent" | "opened" | "failed" | "unknown" | null
          qr_code?: string
          invitation_sent_at?: string | null
          invitation_opened_at?: string | null
          checked_in_at?: string | null
          event_id?: string
          notes?: string | null
          tags?: string[] | null
          custom_field_values?: Json
          ticket_type_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      scans: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          timestamp: string
          scanned_by: string
          location: string | null
          device_info: Json
          verification_method: "qr" | "manual" | "face" | "id" | null
          scan_result: "success" | "duplicate" | "expired" | "invalid" | null
          created_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          event_id: string
          timestamp?: string
          scanned_by: string
          location?: string | null
          device_info?: Json
          verification_method?: "qr" | "manual" | "face" | "id" | null
          scan_result?: "success" | "duplicate" | "expired" | "invalid" | null
          created_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          event_id?: string
          timestamp?: string
          scanned_by?: string
          location?: string | null
          device_info?: Json
          verification_method?: "qr" | "manual" | "face" | "id" | null
          scan_result?: "success" | "duplicate" | "expired" | "invalid" | null
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          type: "invitation" | "reminder" | "confirmation" | "custom"
          subject: string
          content: string
          organization_id: string
          is_default: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          type: "invitation" | "reminder" | "confirmation" | "custom"
          subject: string
          content: string
          organization_id: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: "invitation" | "reminder" | "confirmation" | "custom"
          subject?: string
          content?: string
          organization_id?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: "reminder" | "update" | "cancellation" | "custom"
          status: "scheduled" | "sent" | "failed"
          scheduled_for: string
          sent_at: string | null
          event_id: string | null
          organization_id: string
          template_id: string | null
          created_by: string
          recipient_filter: Json
          delivery_stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: "reminder" | "update" | "cancellation" | "custom"
          status: "scheduled" | "sent" | "failed"
          scheduled_for: string
          sent_at?: string | null
          event_id?: string | null
          organization_id: string
          template_id?: string | null
          created_by: string
          recipient_filter?: Json
          delivery_stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: "reminder" | "update" | "cancellation" | "custom"
          status?: "scheduled" | "sent" | "failed"
          scheduled_for?: string
          sent_at?: string | null
          event_id?: string | null
          organization_id?: string
          template_id?: string | null
          created_by?: string
          recipient_filter?: Json
          delivery_stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
