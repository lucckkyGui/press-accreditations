import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import PageContent from '@/components/layout/PageContent';
import { Map, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const ZONES = ['VIP', 'Backstage', 'Press', 'General', 'Artist Lounge'];

const ZONE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  VIP: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-100' },
  Backstage: { bg: 'bg-violet-500', border: 'border-violet-400', text: 'text-violet-100' },
  Press: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-100' },
  General: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-100' },
  'Artist Lounge': { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-100' },
};

const ZoneHeatmap = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [zoneStats, setZoneStats] = useState<Record<string, number>>({});
  const [maxCapacity] = useState<Record<string, number>>({
    VIP: 50, Backstage: 30, Press: 40, General: 500, 'Artist Lounge': 20,
  });

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEvent(data[0].id);
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const loadStats = async () => {
      const { data } = await supabase
        .from('zone_presence')
        .select('zone_name')
        .eq('event_id', selectedEvent)
        .eq('is_inside', true);
      const stats: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        stats[p.zone_name] = (stats[p.zone_name] || 0) + 1;
      });
      setZoneStats(stats);
    };
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const getOccupancyPercent = (zone: string) => {
    const count = zoneStats[zone] || 0;
    const cap = maxCapacity[zone] || 100;
    return Math.min((count / cap) * 100, 100);
  };

  const getOccupancyLevel = (percent: number) => {
    if (percent >= 90) return { label: 'Krytyczny', color: 'bg-red-500', pulse: true };
    if (percent >= 70) return { label: 'Wysoki', color: 'bg-orange-500', pulse: false };
    if (percent >= 40) return { label: 'Średni', color: 'bg-yellow-500', pulse: false };
    return { label: 'Niski', color: 'bg-green-500', pulse: false };
  };

  const totalInside = Object.values(zoneStats).reduce((a, b) => a + b, 0);
  const totalCapacity = Object.values(maxCapacity).reduce((a, b) => a + b, 0);

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" />
              Heatmapa stref
            </h1>
            <p className="text-muted-foreground">
              Wizualizacja zagęszczenia w strefach w czasie rzeczywistym
            </p>
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Wybierz wydarzenie" />
            </SelectTrigger>
            <SelectContent>
              {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalInside}</p>
                <p className="text-sm text-muted-foreground">Osób w strefach</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{Math.round((totalInside / totalCapacity) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Łączne obłożenie</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {ZONES.filter(z => getOccupancyPercent(z) >= 90).length}
                </p>
                <p className="text-sm text-muted-foreground">Strefy krytyczne</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ZONES.map(zone => {
            const count = zoneStats[zone] || 0;
            const cap = maxCapacity[zone] || 100;
            const percent = getOccupancyPercent(zone);
            const level = getOccupancyLevel(percent);
            const colors = ZONE_COLORS[zone];

            return (
              <Card key={zone} className="overflow-hidden relative">
                {/* Background heat indicator */}
                <div
                  className={`absolute inset-0 opacity-[0.07] transition-all duration-1000 ${colors.bg}`}
                  style={{ height: `${percent}%`, top: `${100 - percent}%` }}
                />
                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{zone}</span>
                    <Badge className={`${level.color} text-white border-0 ${level.pulse ? 'animate-pulse' : ''}`}>
                      {level.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="text-center">
                    <p className="text-5xl font-bold tracking-tighter">{count}</p>
                    <p className="text-sm text-muted-foreground">/ {cap} maks.</p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-orange-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-center text-sm font-medium">{Math.round(percent)}% pojemności</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6 justify-center">
              <span className="text-sm text-muted-foreground font-medium">Legenda:</span>
              {[
                { label: 'Niski (<40%)', color: 'bg-green-500' },
                { label: 'Średni (40-70%)', color: 'bg-yellow-500' },
                { label: 'Wysoki (70-90%)', color: 'bg-orange-500' },
                { label: 'Krytyczny (>90%)', color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default ZoneHeatmap;
