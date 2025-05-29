
import { Guest, GuestStatus, GuestZone, GuestEmailStatus } from "@/types";
import { PaginationParams, FilterParams } from "../api/apiResponse";

/**
 * Typy związane z gośćmi
 */

// Rozszerzenie typu Guest o dodatkowe pola potrzebne w Supabase
export interface GuestDB {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pesel?: string;
  company?: string;
  phone?: string;
  zone: string;
  status: string;
  email_status?: string;
  qr_code: string;
  event_id: string;
  invitation_sent_at?: string;
  invitation_opened_at?: string;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  custom_field_values?: Record<string, any>;
}

export interface GuestsQueryParams extends PaginationParams, FilterParams {
  status?: GuestStatus | "all";
  zone?: GuestZone | "all";
  eventId?: string;
  emailStatus?: GuestEmailStatus | "all";
  ticketTypeId?: string;
  tags?: string[];
}

export interface BulkEmailRequest {
  eventId: string;
  guestIds: string[];
  templateId?: string;
  subject: string;
  customMessage?: string;
}

export interface EmailDeliveryStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  bounced: number;
}
