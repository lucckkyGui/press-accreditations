import { supabase } from "@/integrations/supabase/client";

export interface RfidScanResult {
  success: boolean;
  action: 'entry' | 'exit' | 'denied';
  guest_name?: string;
  company?: string;
  zone?: string;
  message?: string;
  reason?: string;
}

export interface WristbandAssignment {
  id: string;
  event_id: string;
  guest_id: string;
  rfid_code: string;
  assigned_at: string;
  is_active: boolean;
  guest_name?: string;
  guest_company?: string;
}

export interface ZonePresenceEntry {
  id: string;
  wristband_id: string;
  zone_name: string;
  entered_at: string;
  is_inside: boolean;
  guest_name?: string;
}

export const rfidService = {
  async processRfidScan(
    rfidCode: string,
    eventId: string,
    zoneName: string,
    scannedBy?: string
  ): Promise<RfidScanResult> {
    const { data, error } = await supabase.rpc('process_rfid_scan', {
      _rfid_code: rfidCode,
      _event_id: eventId,
      _zone_name: zoneName,
      _scanned_by: scannedBy || null,
      _device_info: navigator.userAgent
    });

    if (error) throw error;
    return data as unknown as RfidScanResult;
  },

  async assignWristband(eventId: string, guestId: string, rfidCode: string) {
    const { data, error } = await supabase
      .from('wristbands' as any)
      .insert({ event_id: eventId, guest_id: guestId, rfid_code: rfidCode })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getWristbands(eventId: string): Promise<WristbandAssignment[]> {
    const { data, error } = await supabase
      .from('wristbands' as any)
      .select('*, guests(first_name, last_name, company)')
      .eq('event_id', eventId)
      .order('assigned_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((w: any) => ({
      id: w.id,
      event_id: w.event_id,
      guest_id: w.guest_id,
      rfid_code: w.rfid_code,
      assigned_at: w.assigned_at,
      is_active: w.is_active,
      guest_name: w.guests ? `${w.guests.first_name} ${w.guests.last_name}` : 'Nieznany',
      guest_company: w.guests?.company
    }));
  },

  async deactivateWristband(wristbandId: string, reason: string) {
    const { error } = await supabase
      .from('wristbands' as any)
      .update({ is_active: false, deactivated_at: new Date().toISOString(), deactivation_reason: reason })
      .eq('id', wristbandId);
    if (error) throw error;
  },

  async getZonePresence(eventId: string): Promise<ZonePresenceEntry[]> {
    const { data, error } = await supabase
      .from('zone_presence' as any)
      .select('*, wristbands(rfid_code, guests(first_name, last_name))')
      .eq('event_id', eventId)
      .eq('is_inside', true);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      wristband_id: p.wristband_id,
      zone_name: p.zone_name,
      entered_at: p.entered_at,
      is_inside: p.is_inside,
      guest_name: p.wristbands?.guests 
        ? `${p.wristbands.guests.first_name} ${p.wristbands.guests.last_name}` 
        : 'Nieznany'
    }));
  },

  async getAccessLogs(eventId: string, limit = 50) {
    const { data, error } = await supabase
      .from('access_logs' as any)
      .select('*, wristbands(rfid_code, guests(first_name, last_name))')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      zone_name: l.zone_name,
      action: l.action,
      denial_reason: l.denial_reason,
      created_at: l.created_at,
      guest_name: l.wristbands?.guests
        ? `${l.wristbands.guests.first_name} ${l.wristbands.guests.last_name}`
        : 'Nieznany',
      rfid_code: l.wristbands?.rfid_code
    }));
  },

  async getZoneStats(eventId: string) {
    const { data, error } = await supabase
      .from('zone_presence' as any)
      .select('zone_name')
      .eq('event_id', eventId)
      .eq('is_inside', true);
    if (error) throw error;
    
    const stats: Record<string, number> = {};
    (data || []).forEach((p: any) => {
      stats[p.zone_name] = (stats[p.zone_name] || 0) + 1;
    });
    return stats;
  }
};
