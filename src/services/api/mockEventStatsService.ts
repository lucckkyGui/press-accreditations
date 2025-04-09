
import { ApiResponse } from '@/types/api/apiResponse';

export class MockEventStatsService {
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

export const mockEventStatsService = new MockEventStatsService();
