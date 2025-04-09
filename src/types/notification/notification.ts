
import { NotificationType, NotificationStatus } from '@/types/notifications';
import { GuestStatus, GuestZone } from '@/types';
import { PaginationParams, FilterParams } from '../api/apiResponse';

/**
 * Typy związane z powiadomieniami
 */

// Rozszerzenie typu Notification o dodatkowe pola potrzebne w Supabase
export interface NotificationDB {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  eventId?: string;
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
