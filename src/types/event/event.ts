
import { PaginationParams, FilterParams } from '../api/apiResponse';
import { Event } from '@/types';

/**
 * Typy związane z wydarzeniami
 */

// Rozszerzenie typu Event o dodatkowe pola potrzebne w Supabase
export interface EventDB extends Omit<Event, "startDate"> {
  startDate: string; // format ISO dla bazy danych
  endDate?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  settings?: EventSettings;
  venue?: Venue;
  ticketTypes?: TicketType[];
  attendanceStats?: EventStats;
  isActive?: boolean;
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
