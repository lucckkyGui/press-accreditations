import type { EventAnalyticsData } from './useEventAnalytics';

export function getMockEventAnalytics(eventId: string, eventTitle?: string): EventAnalyticsData & { isDemo: true } {
  return {
    isDemo: true as const,
    event: {
      id: eventId,
      title: eventTitle || 'Gala Noworoczna 2026',
      location: 'Centrum Kongresowe, Warszawa',
      startDate: '2026-01-15T18:00:00+00:00',
      endDate: '2026-01-16T02:00:00+00:00',
      maxGuests: 200,
    },
    guests: {
      total: 187,
      checkedIn: 142,
      confirmed: 18,
      invited: 15,
      declined: 12,
      byZone: [
        { zone: 'vip', total: 45, checkedIn: 38 },
        { zone: 'press', total: 32, checkedIn: 27 },
        { zone: 'general', total: 78, checkedIn: 58 },
        { zone: 'staff', total: 20, checkedIn: 12 },
        { zone: 'backstage', total: 12, checkedIn: 7 },
      ],
    },
    emails: {
      sent: 175,
      opened: 134,
      failed: 8,
      pending: 4,
    },
    checkIns: {
      byHour: [
        { hour: '17:00', count: 5 },
        { hour: '18:00', count: 34 },
        { hour: '19:00', count: 48 },
        { hour: '20:00', count: 27 },
        { hour: '21:00', count: 16 },
        { hour: '22:00', count: 8 },
        { hour: '23:00', count: 4 },
      ],
      peakHour: '19:00',
      peakCount: 48,
      avgDurationMinutes: 156,
    },
    zones: {
      entries: [
        { zone: 'vip', entryCount: 112, exitCount: 98, avgDuration: 45 },
        { zone: 'press', entryCount: 87, exitCount: 82, avgDuration: 32 },
        { zone: 'general', entryCount: 234, exitCount: 218, avgDuration: 68 },
        { zone: 'staff', entryCount: 56, exitCount: 54, avgDuration: 120 },
        { zone: 'backstage', entryCount: 34, exitCount: 30, avgDuration: 25 },
      ],
    },
  };
}
