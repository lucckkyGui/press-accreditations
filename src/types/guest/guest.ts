
import { Guest, GuestStatus, GuestZone, GuestEmailStatus } from "@/types";
import { PaginationParams, FilterParams } from "../api/apiResponse";

/**
 * Typy związane z gośćmi
 */

// Rozszerzenie typu Guest o dodatkowe pola potrzebne w Supabase
export interface GuestDB extends Omit<Guest, "invitationSentAt" | "invitationOpenedAt" | "checkedInAt"> {
  eventId: string;
  invitationSentAt?: string;
  invitationOpenedAt?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
  customFieldValues?: Record<string, any>;
  notes?: string;
  plusOneCount?: number;
  plusOneNames?: string[];
  ticketTypeId?: string;
  invitationId?: string;
  createdBy?: string;
  updatedBy?: string;
  tags?: string[];
}

export interface GuestsQueryParams extends PaginationParams, FilterParams {
  status?: GuestStatus | "all";
  zone?: GuestZone | "all";
  eventId?: string;
  emailStatus?: GuestEmailStatus | "all";
  ticketTypeId?: string;
  tags?: string[];
}
