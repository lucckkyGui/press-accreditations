
import { Guest } from ".";

export type NotificationType = "reminder" | "update" | "cancellation" | "custom";
export type NotificationStatus = "scheduled" | "sent" | "failed";

export interface Notification {
  id: string;
  eventId: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: Date;
  status: NotificationStatus;
  sentAt?: Date;
  recipients?: Guest[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  isDefault?: boolean;
  lastUsed?: Date;
}
