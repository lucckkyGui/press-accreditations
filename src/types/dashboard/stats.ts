
/**
 * Typy związane ze statystykami dashboardu
 */

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
