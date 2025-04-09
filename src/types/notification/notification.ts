
import { Notification, NotificationType, NotificationStatus } from "@/types/notifications";
import { GuestZone, GuestStatus } from "@/types";
import { PaginationParams, FilterParams } from "../api/apiResponse";

/**
 * Typy związane z powiadomieniami
 */

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

export interface NotificationsQueryParams extends PaginationParams, FilterParams {
  status?: NotificationStatus | "all";
  type?: NotificationType | "all";
  eventId?: string;
  startDate?: string;
  endDate?: string;
}
