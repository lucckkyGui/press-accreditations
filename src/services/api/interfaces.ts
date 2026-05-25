
import { 
  ApiResponse 
} from '@/types/api/apiResponse';
import { DashboardStats } from '@/types/dashboard/stats';
import { 
  EventDB,
  EventsQueryParams,
  EventStats
} from '@/types/event/event';
import { 
  GuestDB, 
  GuestsQueryParams 
} from '@/types/guest/guest'; 
import { 
  NotificationDB, 
  NotificationsQueryParams 
} from '@/types/notification/notification';
import { ScanEntryDB } from '@/types/scan/scan';
import { EmailIntegrationConfig } from '@/types/user/user';

export interface AuthService {
  login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>>;
  register(email: string, password: string, userData: any): Promise<ApiResponse>;
  logout(): Promise<ApiResponse>;
  getCurrentUser(): Promise<ApiResponse<any>>;
  resetPassword(email: string): Promise<ApiResponse>;
  updateProfile(userData: any): Promise<ApiResponse>;
}

export interface EventService {
  getEvents(params?: EventsQueryParams): Promise<ApiResponse<EventDB[]>>;
  getEvent(id: string): Promise<ApiResponse<EventDB>>;
  createEvent(event: Partial<EventDB>): Promise<ApiResponse<EventDB>>;
  updateEvent(id: string, event: Partial<EventDB>): Promise<ApiResponse<EventDB>>;
  deleteEvent(id: string): Promise<ApiResponse>;
  publishEvent(id: string): Promise<ApiResponse>;
  unpublishEvent(id: string): Promise<ApiResponse>;
  getEventStats(id: string): Promise<ApiResponse<EventStats>>;
  duplicateEvent(id: string): Promise<ApiResponse<EventDB>>;
}

export interface GuestService {
  getGuests(params?: GuestsQueryParams): Promise<ApiResponse<GuestDB[]>>;
  getGuest(id: string): Promise<ApiResponse<GuestDB>>;
  createGuest(guest: Partial<GuestDB>): Promise<ApiResponse<GuestDB>>;
  createBulkGuests(guests: Partial<GuestDB>[]): Promise<ApiResponse<{ successful: number; failed: number }>>;
  updateGuest(id: string, guest: Partial<GuestDB>): Promise<ApiResponse<GuestDB>>;
  deleteGuest(id: string): Promise<ApiResponse>;
  checkInGuest(id: string): Promise<ApiResponse<GuestDB>>;
  sendInvitation(id: string): Promise<ApiResponse>;
  sendBulkInvitations(ids: string[]): Promise<ApiResponse<{ successful: number; failed: number }>>;
  importGuests(file: File, eventId: string): Promise<ApiResponse<{ successful: number; failed: number }>>;
}

export interface NotificationService {
  getNotifications(params?: NotificationsQueryParams): Promise<ApiResponse<NotificationDB[]>>;
  getNotification(id: string): Promise<ApiResponse<NotificationDB>>;
  createNotification(notification: Partial<NotificationDB>): Promise<ApiResponse<NotificationDB>>;
  updateNotification(id: string, notification: Partial<NotificationDB>): Promise<ApiResponse<NotificationDB>>;
  deleteNotification(id: string): Promise<ApiResponse>;
  sendNotification(id: string): Promise<ApiResponse>;
  scheduleNotification(id: string, date: Date): Promise<ApiResponse>;
  cancelScheduledNotification(id: string): Promise<ApiResponse>;
  getNotificationTemplates(): Promise<ApiResponse<any[]>>;
  createNotificationTemplate(template: any): Promise<ApiResponse<any>>;
  updateNotificationTemplate(id: string, template: any): Promise<ApiResponse<any>>;
  deleteNotificationTemplate(id: string): Promise<ApiResponse>;
}

export interface ScannerService {
  scanCode(code: string, eventId: string): Promise<ApiResponse<{ guest: GuestDB; scanEntry: ScanEntryDB }>>;
  getScanHistory(eventId?: string, params?: { limit?: number; offset?: number }): Promise<ApiResponse<ScanEntryDB[]>>;
  syncOfflineScans(scans: Partial<ScanEntryDB>[]): Promise<ApiResponse<{ successful: number; failed: number }>>;
}

export interface DashboardService {
  getStats(): Promise<ApiResponse<DashboardStats>>;
  getRecentActivity(limit?: number): Promise<ApiResponse<any[]>>;
  getEventStatsByTimeRange(timeRange: "today" | "week" | "month" | "year"): Promise<ApiResponse<any>>;
}

export interface EmailService {
  testConnection(config: EmailIntegrationConfig): Promise<ApiResponse>;
  getEmailConfiguration(): Promise<ApiResponse<EmailIntegrationConfig>>;
  updateEmailConfiguration(config: EmailIntegrationConfig): Promise<ApiResponse>;
  sendTestEmail(to: string): Promise<ApiResponse>;
  getEmailTemplates(): Promise<ApiResponse<any[]>>;
  updateEmailTemplate(id: string, template: any): Promise<ApiResponse>;
}

export interface InvitationService {
  getInvitationTemplates(): Promise<ApiResponse<any[]>>;
  createInvitationTemplate(template: any): Promise<ApiResponse<any>>;
  updateInvitationTemplate(id: string, template: any): Promise<ApiResponse<any>>;
  deleteInvitationTemplate(id: string): Promise<ApiResponse>;
  previewInvitation(templateId: string, guestData: Partial<GuestDB>): Promise<ApiResponse<string>>;
}

export interface SettingsService {
  getOrganizationSettings(): Promise<ApiResponse<any>>;
  updateOrganizationSettings(settings: any): Promise<ApiResponse>;
  getProfile(): Promise<ApiResponse<any>>;
  updateProfile(profile: any): Promise<ApiResponse>;
  exportData(type: "events" | "guests" | "all", format: "csv" | "json", filters?: any): Promise<ApiResponse<Blob>>;
  importData(type: "events" | "guests", file: File): Promise<ApiResponse<{ successful: number; failed: number }>>;
}
