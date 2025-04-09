
import { DashboardService } from './interfaces';
import { ApiResponse, DashboardStats } from '@/types/supabase';

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
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 700));

    // Generowanie danych w zależności od wybranego zakresu czasu
    let stats;
    
    switch (timeRange) {
      case "today":
        stats = {
          attendanceByTime: [
            { time: '9:00', guests: 0 },
            { time: '10:00', guests: 12 },
            { time: '11:00', guests: 28 },
            { time: '12:00', guests: 35 },
            { time: '13:00', guests: 42 },
            { time: '14:00', guests: 56 },
            { time: '15:00', guests: 72 },
            { time: '16:00', guests: 81 },
            { time: '17:00', guests: 95 },
            { time: '18:00', guests: 110 },
            { time: '19:00', guests: 125 },
            { time: '20:00', guests: 137 },
          ],
          guestsByZone: [
            { zone: 'VIP', count: 35, color: '#8884d8' },
            { zone: 'Press', count: 45, color: '#82ca9d' },
            { zone: 'Staff', count: 28, color: '#ffc658' },
            { zone: 'General', count: 140, color: '#ff8042' },
          ],
          statusDistribution: [
            { name: "Obecni", value: 137, color: "#22c55e" },
            { name: "Potwierdzeni", value: 56, color: "#3b82f6" },
            { name: "Zaproszeni", value: 43, color: "#f59e0b" },
            { name: "Odrzuceni", value: 12, color: "#ef4444" },
          ]
        };
        break;
        
      case "week":
        stats = {
          attendanceByTime: [
            { time: 'Poniedziałek', guests: 87 },
            { time: 'Wtorek', guests: 103 },
            { time: 'Środa', guests: 122 },
            { time: 'Czwartek', guests: 137 },
            { time: 'Piątek', guests: 0 },
            { time: 'Sobota', guests: 0 },
            { time: 'Niedziela', guests: 0 },
          ],
          guestsByZone: [
            { zone: 'VIP', count: 89, color: '#8884d8' },
            { zone: 'Press', count: 112, color: '#82ca9d' },
            { zone: 'Staff', count: 76, color: '#ffc658' },
            { zone: 'General', count: 172, color: '#ff8042' },
          ],
          statusDistribution: [
            { name: "Obecni", value: 187, color: "#22c55e" },
            { name: "Potwierdzeni", value: 104, color: "#3b82f6" },
            { name: "Zaproszeni", value: 112, color: "#f59e0b" },
            { name: "Odrzuceni", value: 46, color: "#ef4444" },
          ]
        };
        break;
        
      case "month":
        stats = {
          attendanceByTime: Array.from({ length: 30 }, (_, i) => ({
            time: `${i + 1}`,
            guests: Math.floor(Math.random() * 50) + 100
          })),
          guestsByZone: [
            { zone: 'VIP', count: 189, color: '#8884d8' },
            { zone: 'Press', count: 176, color: '#82ca9d' },
            { zone: 'Staff', count: 98, color: '#ffc658' },
            { zone: 'General', count: 227, color: '#ff8042' },
          ],
          statusDistribution: [
            { name: "Obecni", value: 423, color: "#22c55e" },
            { name: "Potwierdzeni", value: 154, color: "#3b82f6" },
            { name: "Zaproszeni", value: 87, color: "#f59e0b" },
            { name: "Odrzuceni", value: 62, color: "#ef4444" },
          ],
          responseRates: [
            { day: '1', responseRate: 65, averageResponseTime: 36 },
            { day: '5', responseRate: 68, averageResponseTime: 32 },
            { day: '10', responseRate: 72, averageResponseTime: 28 },
            { day: '15', responseRate: 75, averageResponseTime: 24 },
            { day: '20', responseRate: 78, averageResponseTime: 22 },
            { day: '25', responseRate: 82, averageResponseTime: 18 },
            { day: '30', responseRate: 85, averageResponseTime: 16 },
          ]
        };
        break;
        
      case "year":
        stats = {
          attendanceByTime: [
            { time: 'Styczeń', guests: 245 },
            { time: 'Luty', guests: 378 },
            { time: 'Marzec', guests: 423 },
            { time: 'Kwiecień', guests: 387 },
            { time: 'Maj', guests: 456 },
            { time: 'Czerwiec', guests: 523 },
            { time: 'Lipiec', guests: 462 },
            { time: 'Sierpień', guests: 387 },
            { time: 'Wrzesień', guests: 426 },
            { time: 'Październik', guests: 389 },
            { time: 'Listopad', guests: 412 },
            { time: 'Grudzień', guests: 287 },
          ],
          guestsByZone: [
            { zone: 'VIP', count: 976, color: '#8884d8' },
            { zone: 'Press', count: 1245, color: '#82ca9d' },
            { zone: 'Staff', count: 834, color: '#ffc658' },
            { zone: 'General', count: 1720, color: '#ff8042' },
          ],
          statusDistribution: [
            { name: "Obecni", value: 2157, color: "#22c55e" },
            { name: "Potwierdzeni", value: 876, color: "#3b82f6" },
            { name: "Zaproszeni", value: 1125, color: "#f59e0b" },
            { name: "Odrzuceni", value: 617, color: "#ef4444" },
          ],
          responseRates: [
            { month: 'Styczeń', responseRate: 65, averageResponseTime: 36 },
            { month: 'Luty', responseRate: 68, averageResponseTime: 32 },
            { month: 'Marzec', responseRate: 72, averageResponseTime: 28 },
            { month: 'Kwiecień', responseRate: 75, averageResponseTime: 24 },
            { month: 'Maj', responseRate: 78, averageResponseTime: 22 },
            { month: 'Czerwiec', responseRate: 82, averageResponseTime: 18 },
            { month: 'Lipiec', responseRate: 85, averageResponseTime: 16 },
            { month: 'Sierpień', responseRate: 87, averageResponseTime: 14 },
            { month: 'Wrzesień', responseRate: 88, averageResponseTime: 13 },
            { month: 'Październik', responseRate: 90, averageResponseTime: 12 },
            { month: 'Listopad', responseRate: 92, averageResponseTime: 11 },
            { month: 'Grudzień', responseRate: 93, averageResponseTime: 10 },
          ]
        };
        break;
    }

    return { data: stats };
  }
}

export const mockDashboardService = new MockDashboardService();
