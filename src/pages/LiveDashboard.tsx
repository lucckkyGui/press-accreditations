import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Radio, TrendingUp, Clock, ArrowRightLeft, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ZONES = ['VIP', 'Backstage', 'Press', 'General', 'Artist Lounge'];

const LiveDashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [zoneStats, setZoneStats] = useState<Record<string, number>>({});
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [guestCount, setGuestCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEvent(data[0].id);
        setEventTitle(data[0].title);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const loadData = async () => {
      const [presenceRes, logsRes, guestsRes] = await Promise.all([
        supabase.from('zone_presence').select('zone_name').eq('event_id', selectedEvent).eq('is_inside', true),
        supabase.from('access_logs').select('*, wristbands(rfid_code, guests(first_name, last_name))').eq('event_id', selectedEvent).order('created_at', { ascending: false }).limit(8),
        supabase.from('guests').select('id, checked_in_at').eq('event_id', selectedEvent),
      ]);

      const stats: Record<string, number> = {};
      (presenceRes.data || []).forEach((p: any) => {
        stats[p.zone_name] = (stats[p.zone_name] || 0) + 1;
      });
      setZoneStats(stats);

      setRecentScans((logsRes.data || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        zone_name: l.zone_name,
        created_at: l.created_at,
        guest_name: l.wristbands?.guests
          ? `${l.wristbands.guests.first_name} ${l.wristbands.guests.last_name}`
          : 'Nieznany',
      })));

      const guests = guestsRes.data || [];
      setGuestCount(guests.length);
      setCheckedInCount(guests.filter((g: any) => g.checked_in_at).length);
    };

    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const totalInside = Object.values(zoneStats).reduce((a, b) => a + b, 0);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'entry': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'exit': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      case 'denied': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  // Event selector
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wyjdź
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/60 text-sm font-medium">LIVE</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{eventTitle}</h1>
        <span className="text-3xl font-mono text-white/80">
          {clock.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Left: Big stats */}
        <div className="col-span-4 flex flex-col gap-6">
          <StatBox
            icon={<Users className="h-8 w-8" />}
            value={totalInside}
            label="W strefach teraz"
            color="text-blue-400"
          />
          <StatBox
            icon={<Radio className="h-8 w-8" />}
            value={guestCount}
            label="Zaproszonych gości"
            color="text-purple-400"
          />
          <StatBox
            icon={<TrendingUp className="h-8 w-8" />}
            value={guestCount > 0 ? `${Math.round((checkedInCount / guestCount) * 100)}%` : '0%'}
            label="Check-in rate"
            color="text-emerald-400"
          />
        </div>

        {/* Center: Zone heatmap */}
        <div className="col-span-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Strefy</h2>
          <div className="flex-1 grid grid-rows-5 gap-3">
            {ZONES.map(zone => {
              const count = zoneStats[zone] || 0;
              const maxEstimate = zone === 'General' ? 500 : zone === 'VIP' ? 50 : 30;
              const percent = Math.min((count / maxEstimate) * 100, 100);
              return (
                <div
                  key={zone}
                  className="relative rounded-xl border border-white/10 overflow-hidden flex items-center justify-between px-6"
                >
                  <div
                    className={`absolute inset-0 transition-all duration-1000 ${
                      percent >= 80 ? 'bg-red-500/20' : percent >= 50 ? 'bg-orange-500/15' : 'bg-emerald-500/10'
                    }`}
                    style={{ width: `${Math.max(percent, 5)}%` }}
                  />
                  <span className="relative text-lg font-semibold">{zone}</span>
                  <span className="relative text-3xl font-bold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent activity */}
        <div className="col-span-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ostatnia aktywność
          </h2>
          <div className="flex-1 space-y-2 overflow-hidden">
            {recentScans.map((scan, i) => (
              <div
                key={scan.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 transition-all duration-500 ${
                  i === 0 ? 'animate-in slide-in-from-top duration-300' : ''
                }`}
              >
                {getActionIcon(scan.action)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{scan.guest_name}</p>
                  <p className="text-xs text-white/40">{scan.zone_name}</p>
                </div>
                <span className="text-xs text-white/40 tabular-nums">
                  {new Date(scan.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {recentScans.length === 0 && (
              <div className="flex items-center justify-center h-full text-white/30">
                Brak aktywności
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-6 flex items-center gap-5">
    <div className={`${color}`}>{icon}</div>
    <div>
      <p className="text-4xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  </div>
);

export default LiveDashboard;
