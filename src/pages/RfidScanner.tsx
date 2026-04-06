import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Radio, Shield, Users, ArrowRightLeft, XCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import { rfidService, RfidScanResult } from '@/services/rfid/rfidService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

const ZONES = ['VIP', 'Backstage', 'Press', 'General', 'Artist Lounge'];

const DEMO_ZONE_STATS: Record<string, number> = { VIP: 23, Backstage: 12, Press: 18, General: 247, 'Artist Lounge': 8 };

const DEMO_SCANS = [
  { id: '1', action: 'entry', zone_name: 'VIP', created_at: new Date(Date.now() - 15000).toISOString(), guest_name: 'Anna Kowalska', rfid_code: 'RFID-0041' },
  { id: '2', action: 'entry', zone_name: 'General', created_at: new Date(Date.now() - 45000).toISOString(), guest_name: 'Marek Nowak', rfid_code: 'RFID-0042' },
  { id: '3', action: 'exit', zone_name: 'Backstage', created_at: new Date(Date.now() - 90000).toISOString(), guest_name: 'Katarzyna Wiśniewska', rfid_code: 'RFID-0043' },
  { id: '4', action: 'entry', zone_name: 'Press', created_at: new Date(Date.now() - 120000).toISOString(), guest_name: 'Tomasz Zieliński', rfid_code: 'RFID-0044' },
  { id: '5', action: 'denied', zone_name: 'VIP', created_at: new Date(Date.now() - 180000).toISOString(), guest_name: 'Piotr Kamiński', rfid_code: 'RFID-0045' },
  { id: '6', action: 'entry', zone_name: 'Artist Lounge', created_at: new Date(Date.now() - 240000).toISOString(), guest_name: 'Maria Lewandowska', rfid_code: 'RFID-0046' },
];

const DEMO_PRESENCE = [
  { id: 'p1', zone_name: 'VIP', guest_name: 'Anna Kowalska', entered_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'p2', zone_name: 'VIP', guest_name: 'Aleksandra Dąbrowska', entered_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'p3', zone_name: 'Backstage', guest_name: 'Jan Wójcik', entered_at: new Date(Date.now() - 900000).toISOString() },
  { id: 'p4', zone_name: 'Press', guest_name: 'Tomasz Zieliński', entered_at: new Date(Date.now() - 1200000).toISOString() },
  { id: 'p5', zone_name: 'General', guest_name: 'Marek Nowak', entered_at: new Date(Date.now() - 400000).toISOString() },
  { id: 'p6', zone_name: 'Artist Lounge', guest_name: 'Maria Lewandowska', entered_at: new Date(Date.now() - 500000).toISOString() },
];

const RfidScanner = () => {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedZone, setSelectedZone] = useState('VIP');
  const [events, setEvents] = useState<any[]>([]);
  const [lastScan, setLastScan] = useState<RfidScanResult | null>(null);
  const [scanBuffer, setScanBuffer] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [zoneStats, setZoneStats] = useState<Record<string, number>>({});
  const [zonePresence, setZonePresence] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferTimeoutRef = useRef<NodeJS.Timeout>();

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      if (data && data.length > 0) {
        setEvents(data);
        setSelectedEvent(data[0].id);
      } else {
        setIsDemo(true);
        setEvents([{ id: 'demo', title: 'Festiwal Muzyczny 2026 — Demo' }]);
        setSelectedEvent('demo');
        setZoneStats(DEMO_ZONE_STATS);
        setRecentScans(DEMO_SCANS);
        setZonePresence(DEMO_PRESENCE);
      }
    };
    loadEvents();
  }, []);

  // Load zone data when event changes
  useEffect(() => {
    if (!selectedEvent || isDemo) return;
    const loadData = async () => {
      const [stats, logs, presence] = await Promise.all([
        rfidService.getZoneStats(selectedEvent),
        rfidService.getAccessLogs(selectedEvent, 20),
        rfidService.getZonePresence(selectedEvent),
      ]);

      const hasData = Object.keys(stats).length > 0 || logs.length > 0 || presence.length > 0;
      if (!hasData) {
        setIsDemo(true);
        setZoneStats(DEMO_ZONE_STATS);
        setRecentScans(DEMO_SCANS);
        setZonePresence(DEMO_PRESENCE);
        return;
      }

      setZoneStats(stats);
      setRecentScans(logs);
      setZonePresence(presence);
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [selectedEvent, isDemo]);

  // USB RFID reader handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isListening || !selectedEvent || isDemo) return;
    if (e.key === 'Enter' && scanBuffer.length > 0) {
      e.preventDefault();
      processScan(scanBuffer);
      setScanBuffer('');
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
      return;
    }
    if (e.key.length === 1) {
      setScanBuffer(prev => {
        const next = prev + e.key;
        if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
        bufferTimeoutRef.current = setTimeout(() => setScanBuffer(''), 500);
        return next;
      });
    }
  }, [isListening, selectedEvent, scanBuffer, isDemo]);

  useEffect(() => {
    if (isListening) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isListening, handleKeyDown]);

  const processScan = async (rfidCode: string) => {
    if (isDemo) { toast.info('Tryb demo — skanowanie niedostępne'); return; }
    try {
      const result = await rfidService.processRfidScan(rfidCode, selectedEvent, selectedZone, user?.id);
      setLastScan(result);
      if (result.success) {
        toast.success(`${result.action === 'entry' ? '🟢 Wejście' : '🔴 Wyjście'}: ${result.guest_name}`, { description: result.message });
      } else {
        toast.error('⛔ Odmowa dostępu', { description: result.reason });
      }
      const [stats, logs, presence] = await Promise.all([
        rfidService.getZoneStats(selectedEvent),
        rfidService.getAccessLogs(selectedEvent, 20),
        rfidService.getZonePresence(selectedEvent),
      ]);
      setZoneStats(stats);
      setRecentScans(logs);
      setZonePresence(presence);
      const maxCapacity: Record<string, number> = { VIP: 50, Backstage: 30, Press: 40, General: 500, 'Artist Lounge': 20 };
      rfidService.checkZoneCapacityAlerts(selectedEvent, stats, maxCapacity).catch(() => {});
    } catch (err: unknown) {
      toast.error('Błąd skanowania', { description: err.message });
    }
  };

  const handleManualScan = () => {
    if (inputRef.current?.value) {
      processScan(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'entry': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exit': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      case 'denied': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'entry': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Wejście</Badge>;
      case 'exit': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Wyjście</Badge>;
      case 'denied': return <Badge variant="destructive">Odmowa</Badge>;
      default: return null;
    }
  };

  const totalInside = Object.values(zoneStats).reduce((a, b) => a + b, 0);

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary" />
              Skaner RFID — Anti-Passback
              {isDemo && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-600 border border-amber-500/30">
                  DEMO
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              System kontroli dostępu oparty na opaskach RFID z zabezpieczeniem przed przekazywaniem
            </p>
          </div>
          <Button
            size="lg"
            variant={isListening ? 'destructive' : 'default'}
            onClick={() => setIsListening(!isListening)}
            className="min-w-[200px]"
          >
            <Radio className={`h-5 w-5 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
            {isListening ? 'Zatrzymaj nasłuch' : 'Uruchom czytnik'}
          </Button>
        </div>

        {/* Config bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger><SelectValue placeholder="Wybierz wydarzenie" /></SelectTrigger>
            <SelectContent>
              {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger><SelectValue placeholder="Wybierz strefę" /></SelectTrigger>
            <SelectContent>
              {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input ref={inputRef} placeholder="Ręczne wpisanie kodu RFID" onKeyDown={e => e.key === 'Enter' && handleManualScan()} />
            <Button onClick={handleManualScan} variant="outline">Skanuj</Button>
          </div>
        </div>

        {/* Status indicator */}
        {isListening && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Nasłuchiwanie czytnika USB RFID aktywne</span>
              <span className="text-muted-foreground ml-2">Strefa: <strong>{selectedZone}</strong></span>
              {scanBuffer && <span className="ml-auto font-mono text-sm text-muted-foreground">Buffer: {scanBuffer}</span>}
            </CardContent>
          </Card>
        )}

        {/* Last scan result */}
        {lastScan && (
          <Card className={`border-2 ${lastScan.success
            ? lastScan.action === 'entry' ? 'border-green-500 bg-green-500/5' : 'border-blue-500 bg-blue-500/5'
            : 'border-destructive bg-destructive/5'}`}>
            <CardContent className="py-6 flex items-center gap-4">
              {lastScan.success ? (
                lastScan.action === 'entry'
                  ? <CheckCircle className="h-12 w-12 text-green-500" />
                  : <ArrowRightLeft className="h-12 w-12 text-blue-500" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
              <div>
                <p className="text-2xl font-bold">{lastScan.guest_name || 'Nieznany'}</p>
                <p className="text-lg">{lastScan.message || lastScan.reason}</p>
                {lastScan.company && <p className="text-muted-foreground">{lastScan.company}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-bold">{totalInside}</p>
              <p className="text-sm text-muted-foreground">Łącznie w strefach</p>
            </CardContent>
          </Card>
          {ZONES.map(zone => (
            <Card key={zone} className={selectedZone === zone ? 'ring-2 ring-primary' : ''}>
              <CardContent className="py-4 text-center">
                <p className="text-3xl font-bold">{zoneStats[zone] || 0}</p>
                <p className="text-sm text-muted-foreground">{zone}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList>
            <TabsTrigger value="logs">
              <Clock className="h-4 w-4 mr-2" />Historia skanów
            </TabsTrigger>
            <TabsTrigger value="presence">
              <Users className="h-4 w-4 mr-2" />Kto jest w strefie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card>
              <CardHeader><CardTitle>Ostatnie skany</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentScans.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">Brak skanów. Uruchom czytnik i zeskanuj opaskę.</p>
                  )}
                  {recentScans.map((scan: any) => (
                    <div key={scan.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getActionIcon(scan.action)}
                        <div>
                          <p className="font-medium">{scan.guest_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{scan.rfid_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{scan.zone_name}</Badge>
                        {getActionBadge(scan.action)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(scan.created_at).toLocaleTimeString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presence">
            <Card>
              <CardHeader><CardTitle>Osoby aktualnie w strefach</CardTitle></CardHeader>
              <CardContent>
                {ZONES.map(zone => {
                  const inZone = zonePresence.filter((p: any) => p.zone_name === zone);
                  if (inZone.length === 0) return null;
                  return (
                    <div key={zone} className="mb-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> {zone}
                        <Badge variant="secondary">{inZone.length}</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {inZone.map((p: any) => (
                          <div key={p.id} className="px-3 py-2 bg-muted/50 rounded-md text-sm">
                            <p className="font-medium">{p.guest_name}</p>
                            <p className="text-xs text-muted-foreground">
                              od {new Date(p.entered_at).toLocaleTimeString('pl-PL')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {zonePresence.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Brak osób w strefach</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
};

export default RfidScanner;
