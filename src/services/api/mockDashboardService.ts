
import { DashboardService } from './interfaces';
import { ApiResponse, DashboardStats } from '@/types/supabase';
import { mockEventStatsService } from './mockEventStatsService';

export class MockDashboardService implements DashboardService {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 800));

    const stats: DashboardStats = {
      totalEvents: 12,
      totalGuests: 1248,
      activeEvents: 3,
      upcomingEvents: 5,
      checkInStats: {
        today: 42,
        weekly: 187,
        monthly: 563,
        yearly: 2157
      },
      recentActivity: [
        {
          id: "1",
          type: "check_in",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          guestId: "g1",
          guestName: "Piotr Nowak",
          eventId: "e1",
          eventName: "Konferencja Prasowa 2025"
        },
        {
          id: "2",
          type: "invitation_opened",
          timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
          guestId: "g2",
          guestName: "Anna Kowalska",
          eventId: "e1",
          eventName: "Konferencja Prasowa 2025"
        },
        {
          id: "3",
          type: "confirmation",
          timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
          guestId: "g3",
          guestName: "Jan Wiśniewski",
          eventId: "e2",
          eventName: "Gala Otwarcia"
        },
        {
          id: "4",
          type: "decline",
          timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
          guestId: "g4",
          guestName: "Marta Zielińska",
          eventId: "e1",
          eventName: "Konferencja Prasowa 2025"
        },
        {
          id: "5",
          type: "invitation_sent",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          guestId: "g5",
          guestName: "Tomasz Kowalczyk",
          eventId: "e3",
          eventName: "Premiera Produktu"
        }
      ]
    };

    return { data: stats };
  }

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<any[]>> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 600));

    const activities = [
      {
        id: "1",
        guestName: "Piotr Nowak",
        action: "Właśnie wszedł na wydarzenie",
        time: "5 min temu",
        zone: "vip",
        eventId: "e1",
        eventName: "Konferencja Prasowa 2025"
      },
      {
        id: "2",
        guestName: "Anna Kowalska",
        action: "Zaproszenie zostało otwarte",
        time: "17 min temu",
        zone: "press",
        eventId: "e1",
        eventName: "Konferencja Prasowa 2025"
      },
      {
        id: "3",
        guestName: "Jan Wiśniewski",
        action: "Potwierdził udział",
        time: "34 min temu",
        eventId: "e2",
        eventName: "Gala Otwarcia"
      },
      {
        id: "4",
        guestName: "Marta Zielińska",
        action: "Wejście zostało odmówione",
        time: "52 min temu",
        zone: "general",
        eventId: "e1",
        eventName: "Konferencja Prasowa 2025"
      },
      {
        id: "5",
        guestName: "Tomasz Kowalczyk",
        action: "Odmówił udziału",
        time: "1h temu",
        eventId: "e3",
        eventName: "Premiera Produktu"
      },
      {
        id: "6",
        guestName: "Aleksandra Maj",
        action: "Zaproszenie zostało wysłane",
        time: "2h temu",
        zone: "vip",
        eventId: "e2",
        eventName: "Gala Otwarcia"
      },
      {
        id: "7",
        guestName: "Michał Lewandowski",
        action: "Potwierdził udział",
        time: "3h temu",
        zone: "press",
        eventId: "e1",
        eventName: "Konferencja Prasowa 2025"
      },
      {
        id: "8",
        guestName: "Karolina Wójcik",
        action: "Zmieniła dane kontaktowe",
        time: "5h temu",
        eventId: "e3",
        eventName: "Premiera Produktu"
      }
    ].slice(0, limit);

    return { data: activities };
  }

  async getEventStatsByTimeRange(timeRange: "today" | "week" | "month" | "year"): Promise<ApiResponse<any>> {
    return mockEventStatsService.getEventStatsByTimeRange(timeRange);
  }
}

export const mockDashboardService = new MockDashboardService();
