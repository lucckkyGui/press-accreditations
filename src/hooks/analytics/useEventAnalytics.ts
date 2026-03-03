import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getMockEventAnalytics } from './mockEventAnalytics';

export interface EventAnalyticsData {
  event: {
    id: string;
    title: string;
    location: string | null;
    startDate: string;
    endDate: string;
    maxGuests: number | null;
  };
  guests: {
    total: number;
    checkedIn: number;
    confirmed: number;
    invited: number;
    declined: number;
    byZone: Array<{ zone: string; total: number; checkedIn: number }>;
  };
  emails: {
    sent: number;
    opened: number;
    failed: number;
    pending: number;
  };
  checkIns: {
    byHour: Array<{ hour: string; count: number }>;
    peakHour: string;
    peakCount: number;
    avgDurationMinutes: number;
  };
  zones: {
    entries: Array<{ zone: string; entryCount: number; exitCount: number; avgDuration: number }>;
  };
}

export function useEventAnalytics(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: async (): Promise<EventAnalyticsData> => {
      if (!eventId) throw new Error('No event ID');

      // Fetch event + guests + access logs in parallel
      const [eventRes, guestsRes, accessLogsRes, zonePresenceRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('guests').select('*').eq('event_id', eventId),
        supabase.from('access_logs').select('*').eq('event_id', eventId).order('created_at', { ascending: true }),
        supabase.from('zone_presence').select('*').eq('event_id', eventId),
      ]);

      const event = eventRes.data;
      const guests = guestsRes.data || [];
      const accessLogs = accessLogsRes.data || [];
      const zonePresence = zonePresenceRes.data || [];

      // Demo mode: if event not found in DB or no guests data
      if (!event) {
        return getMockEventAnalytics(eventId);
      }

      if (guests.length === 0) {
        return getMockEventAnalytics(eventId, event.title);
      }
      // Guest stats
      const checkedIn = guests.filter(g => g.status === 'checked-in').length;
      const confirmed = guests.filter(g => g.status === 'confirmed').length;
      const invited = guests.filter(g => g.status === 'invited').length;
      const declined = guests.filter(g => g.status === 'declined').length;

      // By zone
      const zoneMap = new Map<string, { total: number; checkedIn: number }>();
      guests.forEach(g => {
        const z = (g as any).ticket_type || 'uczestnik';
        const entry = zoneMap.get(z) || { total: 0, checkedIn: 0 };
        entry.total++;
        if (g.status === 'checked-in') entry.checkedIn++;
        zoneMap.set(z, entry);
      });
      const byZone = Array.from(zoneMap.entries()).map(([zone, data]) => ({ zone, ...data }));

      // Email stats
      const emailSent = guests.filter(g => g.invitation_sent_at).length;
      const emailOpened = guests.filter(g => g.invitation_opened_at).length;
      const emailFailed = guests.filter(g => g.email_status === 'failed').length;
      const emailPending = guests.filter(g => !g.invitation_sent_at && g.email_status !== 'failed').length;

      // Check-in by hour
      const hourMap = new Map<string, number>();
      const entries = accessLogs.filter(l => l.action === 'entry');
      entries.forEach(log => {
        const date = new Date(log.created_at);
        const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });

      // Also count guest check-ins by hour
      guests.forEach(g => {
        if (g.checked_in_at) {
          const date = new Date(g.checked_in_at);
          const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
          hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
        }
      });

      const byHour = Array.from(hourMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      let peakHour = '-';
      let peakCount = 0;
      byHour.forEach(h => {
        if (h.count > peakCount) {
          peakCount = h.count;
          peakHour = h.hour;
        }
      });

      // Zone entries/exits
      const zoneEntries = new Map<string, { entryCount: number; exitCount: number; totalDuration: number; sessions: number }>();
      accessLogs.forEach(log => {
        const z = log.zone_name;
        const entry = zoneEntries.get(z) || { entryCount: 0, exitCount: 0, totalDuration: 0, sessions: 0 };
        if (log.action === 'entry') entry.entryCount++;
        if (log.action === 'exit') entry.exitCount++;
        zoneEntries.set(z, entry);
      });

      // Calculate avg duration from zone_presence
      zonePresence.forEach(zp => {
        if (zp.exited_at && zp.entered_at) {
          const duration = (new Date(zp.exited_at).getTime() - new Date(zp.entered_at).getTime()) / 60000;
          const z = zp.zone_name;
          const entry = zoneEntries.get(z) || { entryCount: 0, exitCount: 0, totalDuration: 0, sessions: 0 };
          entry.totalDuration += duration;
          entry.sessions++;
          zoneEntries.set(z, entry);
        }
      });

      const zonesData = Array.from(zoneEntries.entries()).map(([zone, data]) => ({
        zone,
        entryCount: data.entryCount,
        exitCount: data.exitCount,
        avgDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
      }));

      // Avg check-in duration
      let totalDuration = 0;
      let durationCount = 0;
      zonePresence.forEach(zp => {
        if (zp.exited_at && zp.entered_at) {
          totalDuration += (new Date(zp.exited_at).getTime() - new Date(zp.entered_at).getTime()) / 60000;
          durationCount++;
        }
      });

      return {
        event: {
          id: event.id,
          title: event.title,
          location: event.location,
          startDate: event.start_date,
          endDate: event.end_date,
          maxGuests: event.max_guests,
        },
        guests: { total: guests.length, checkedIn, confirmed, invited, declined, byZone },
        emails: { sent: emailSent, opened: emailOpened, failed: emailFailed, pending: emailPending },
        checkIns: {
          byHour,
          peakHour,
          peakCount,
          avgDurationMinutes: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
        },
        zones: { entries: zonesData },
      };
    },
    enabled: !!eventId,
  });
}
