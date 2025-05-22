
import { PaginationParams, FilterParams } from '../api/apiResponse';
import { Event } from '@/types';

/**
 * Typy związane z wydarzeniami
 */

// Rozszerzenie typu Event o dodatkowe pola potrzebne w Supabase
export interface EventDB {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  organizer_id: string;
  is_published?: boolean;
  image_url?: string;
  category?: string;
  max_guests?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  capacity?: number;
  mapUrl?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price?: number;
  capacity?: number;
  available?: number;
  color?: string;
}

export interface EventSettings {
  requiresApproval?: boolean;
  allowGuests?: boolean;
  maxGuestsPerInvitation?: number;
  autoCheckin?: boolean;
  customFields?: CustomField[];
  notificationSettings?: {
    sendReminders?: boolean;
    reminderHours?: number[];
  };
  checkInSettings?: {
    allowMultipleCheckins?: boolean;
    requireIdentification?: boolean;
    requireConfirmation?: boolean;
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "checkbox" | "date";
  required: boolean;
  options?: string[]; // dla typu select
  placeholder?: string;
  defaultValue?: any;
}

export interface EventStats {
  totalGuests: number;
  checkedIn: number;
  confirmed: number;
  invited: number;
  declined: number;
  checkInRate: number;
  confirmationRate: number;
}

export interface EventsQueryParams extends PaginationParams, FilterParams {
  status?: "upcoming" | "past" | "all";
  published?: boolean;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  organizerId?: string;
}
