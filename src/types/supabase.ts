
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
  avatarUrl?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: NotificationPreferences;
  dashboardLayout?: Record<string, any>;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  frequency?: "immediately" | "daily" | "weekly";
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
  logoUrl?: string;
  contactEmail?: string;
  members?: User[];
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
  scannerSettings?: {
    autoCheckIn?: boolean;
    notifyOnScan?: boolean;
    scanSound?: boolean;
  };
}

export interface EmailIntegrationConfig {
  provider: "sendgrid" | "mailchimp" | "custom";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  enabled: boolean;
  templates?: EmailTemplateConfig[];
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  type: "invitation" | "reminder" | "confirmation" | "custom";
  subject: string;
  content: string;
  isDefault?: boolean;
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

// Rozszerzenie typu Notification o dodatkowe pola potrzebne w Supabase
export interface NotificationDB extends Omit<Notification, "scheduledFor" | "sentAt"> {
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  createdBy: string;
  recipientFilter?: RecipientFilter;
  templateId?: string;
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
}

export interface RecipientFilter {
  eventIds?: string[];
  zones?: GuestZone[];
  statuses?: GuestStatus[];
  tags?: string[];
  customFields?: Record<string, any>;
  excludeGuests?: string[];
}

// Rozszerzenie typu ScanEntry o dodatkowe pola potrzebne w Supabase
export interface ScanEntryDB extends Omit<ScanEntry, "timestamp"> {
  timestamp: string;
  eventId: string;
  scannedBy: string;
  location?: string;
  createdAt: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser?: string;
  };
  verificationMethod?: "qr" | "manual" | "face" | "id";
  scanResult?: "success" | "duplicate" | "expired" | "invalid";
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
  meta?: {
    count?: number;
    totalCount?: number;
    page?: number;
    totalPages?: number;
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
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  organizerId?: string;
}

export interface GuestsQueryParams extends PaginationParams, FilterParams {
  status?: GuestStatus | "all";
  zone?: GuestZone | "all";
  eventId?: string;
  emailStatus?: GuestEmailStatus | "all";
  ticketTypeId?: string;
  tags?: string[];
}

export interface NotificationsQueryParams extends PaginationParams, FilterParams {
  status?: NotificationStatus | "all";
  type?: NotificationType | "all";
  eventId?: string;
  startDate?: string;
  endDate?: string;
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

// Dodatkowe typy do synchronizacji danych offline
export interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  entity: "guest" | "event" | "notification" | "scan";
  entityId: string;
  data: any;
  timestamp: string;
  status: "pending" | "synced" | "failed";
  error?: string;
}

// Interfejs do obsługi zapisywania i odczytywania danych z lokalnego storage
export interface LocalStorageService {
  set(key: string, value: any): void;
  get<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}
