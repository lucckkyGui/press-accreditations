
import { Event, Guest, GuestStatus, GuestZone, GuestEmailStatus } from "@/types";
import { Notification, NotificationType, NotificationStatus } from "@/types/notifications";
import { ScanEntry } from "@/types/scanner";

/**
 * Rozszerzone typy danych do integracji z Supabase
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "organizer" | "staff" | "guest";
  createdAt: Date;
  lastActive?: Date;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: "free" | "basic" | "premium" | "enterprise";
  planExpiresAt?: Date;
  settings: OrganizationSettings;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  emailIntegration?: EmailIntegrationConfig;
  defaultTemplates?: Record<string, string>;
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export interface EmailIntegrationConfig {
  provider: "sendgrid" | "mailchimp" | "custom";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  enabled: boolean;
}

// Rozszerzenie typu Event o dodatkowe pola potrzebne w Supabase
export interface EventDB extends Omit<Event, "startDate"> {
  startDate: string; // format ISO dla bazy danych
  endDate?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  settings?: EventSettings;
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
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "checkbox" | "date";
  required: boolean;
  options?: string[]; // dla typu select
}

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
}

// Rozszerzenie typu Notification o dodatkowe pola potrzebne w Supabase
export interface NotificationDB extends Omit<Notification, "scheduledFor" | "sentAt"> {
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  createdBy: string;
}

// Rozszerzenie typu ScanEntry o dodatkowe pola potrzebne w Supabase
export interface ScanEntryDB extends Omit<ScanEntry, "timestamp"> {
  timestamp: string;
  eventId: string;
  scannedBy: string;
  location?: string;
  createdAt: string;
}

/**
 * Interfejsy dla API
 */

// Bazowy interfejs odpowiedzi API
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}

export interface EventsQueryParams extends PaginationParams, FilterParams {
  status?: "upcoming" | "past" | "all";
  published?: boolean;
}

export interface GuestsQueryParams extends PaginationParams, FilterParams {
  status?: GuestStatus | "all";
  zone?: GuestZone | "all";
  eventId?: string;
}

export interface NotificationsQueryParams extends PaginationParams, FilterParams {
  status?: NotificationStatus | "all";
  type?: NotificationType | "all";
  eventId?: string;
}

// Interfejsy dla statystyk i raportów
export interface EventStats {
  totalGuests: number;
  checkedIn: number;
  confirmed: number;
  invited: number;
  declined: number;
  checkInRate: number;
  confirmationRate: number;
}

export interface DashboardStats {
  totalEvents: number;
  totalGuests: number;
  activeEvents: number;
  upcomingEvents: number;
  checkInStats: {
    today: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  recentActivity: Array<{
    id: string;
    type: "check_in" | "invitation_sent" | "invitation_opened" | "confirmation" | "decline";
    timestamp: string;
    guestId?: string;
    guestName?: string;
    eventId?: string;
    eventName?: string;
  }>;
}
