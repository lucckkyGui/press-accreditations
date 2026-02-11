import type { EventAnalyticsData } from './useEventAnalytics';

const demoDatasets: Array<Omit<EventAnalyticsData & { isDemo: true }, 'event'>> = [
  {
    isDemo: true as const,
    guests: {
      total: 187, checkedIn: 142, confirmed: 18, invited: 15, declined: 12,
      byZone: [
        { zone: 'vip', total: 45, checkedIn: 38 },
        { zone: 'press', total: 32, checkedIn: 27 },
        { zone: 'general', total: 78, checkedIn: 58 },
        { zone: 'staff', total: 20, checkedIn: 12 },
        { zone: 'backstage', total: 12, checkedIn: 7 },
      ],
    },
    emails: { sent: 175, opened: 134, failed: 8, pending: 4 },
    checkIns: {
      byHour: [
        { hour: '17:00', count: 5 }, { hour: '18:00', count: 34 },
        { hour: '19:00', count: 48 }, { hour: '20:00', count: 27 },
        { hour: '21:00', count: 16 }, { hour: '22:00', count: 8 },
        { hour: '23:00', count: 4 },
      ],
      peakHour: '19:00', peakCount: 48, avgDurationMinutes: 156,
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
  },
  {
    isDemo: true as const,
    guests: {
      total: 312, checkedIn: 278, confirmed: 14, invited: 8, declined: 12,
      byZone: [
        { zone: 'vip', total: 60, checkedIn: 55 },
        { zone: 'press', total: 48, checkedIn: 44 },
        { zone: 'general', total: 150, checkedIn: 135 },
        { zone: 'staff', total: 34, checkedIn: 28 },
        { zone: 'backstage', total: 20, checkedIn: 16 },
      ],
    },
    emails: { sent: 298, opened: 245, failed: 12, pending: 2 },
    checkIns: {
      byHour: [
        { hour: '09:00', count: 12 }, { hour: '10:00', count: 67 },
        { hour: '11:00', count: 85 }, { hour: '12:00', count: 52 },
        { hour: '13:00', count: 34 }, { hour: '14:00', count: 18 },
        { hour: '15:00', count: 10 },
      ],
      peakHour: '11:00', peakCount: 85, avgDurationMinutes: 210,
    },
    zones: {
      entries: [
        { zone: 'vip', entryCount: 180, exitCount: 165, avgDuration: 55 },
        { zone: 'press', entryCount: 142, exitCount: 138, avgDuration: 40 },
        { zone: 'general', entryCount: 410, exitCount: 385, avgDuration: 90 },
        { zone: 'staff', entryCount: 98, exitCount: 92, avgDuration: 145 },
        { zone: 'backstage', entryCount: 52, exitCount: 48, avgDuration: 30 },
      ],
    },
  },
];

// Simple hash to pick a consistent dataset index per eventId
function hashIndex(id: string, max: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h) % max;
}

export function getMockEventAnalytics(eventId: string, eventTitle?: string): EventAnalyticsData & { isDemo: true } {
  const idx = hashIndex(eventId, demoDatasets.length);
  const dataset = demoDatasets[idx];
  return {
    ...dataset,
    event: {
      id: eventId,
      title: eventTitle || 'Wydarzenie demo',
      location: idx === 0 ? 'Centrum Kongresowe, Warszawa' : 'Hala Expo, Kraków',
      startDate: idx === 0 ? '2026-01-15T18:00:00+00:00' : '2026-03-22T09:00:00+00:00',
      endDate: idx === 0 ? '2026-01-16T02:00:00+00:00' : '2026-03-22T17:00:00+00:00',
      maxGuests: idx === 0 ? 200 : 350,
    },
  };
}
