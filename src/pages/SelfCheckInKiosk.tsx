import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rfidService, RfidScanResult } from '@/services/rfid/rfidService';
import { CheckCircle, XCircle, Radio, QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Demo scan cycle for when no real event exists
const DEMO_RESULTS: RfidScanResult[] = [
  { success: true, action: 'entry', guest_name: 'Anna Kowalska', company: 'MediaTech Sp. z o.o.', message: 'Witamy na wydarzeniu! Strefa: General' },
  { success: true, action: 'entry', guest_name: 'Marek Nowak', company: 'Event Pro', message: 'Witamy na wydarzeniu! Strefa: VIP' },
  { success: false, action: 'denied', reason: 'Opaska nieaktywna — skontaktuj się z obsługą' },
  { success: true, action: 'entry', guest_name: 'Katarzyna Wiśniewska', message: 'Witamy na wydarzeniu! Strefa: General' },
];

const SelfCheckInKiosk = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastResult, setLastResult] = useState<RfidScanResult | null>(null);
  const [idle, setIdle] = useState(true);
  const [clock, setClock] = useState(new Date());
  const [isDemo, setIsDemo] = useState(false);
  const bufferTimeoutRef = useRef<NodeJS.Timeout>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const demoIndexRef = useRef(0);
  const demoIntervalRef = useRef<NodeJS.Timeout>();

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load events
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      if (data && data.length > 0) {
        setEvents(data);
        setSelectedEvent(data[0].id);
        setEventTitle(data[0].title);
      } else {
        setIsDemo(true);
        setSelectedEvent('demo');
        setEventTitle('Festiwal Muzyczny 2026 — Demo');
      }
    };
    load();
  }, []);

  // Demo auto-cycle
  useEffect(() => {
    if (!isDemo) return;
    const cycle = () => {
      const result = DEMO_RESULTS[demoIndexRef.current % DEMO_RESULTS.length];
      demoIndexRef.current++;
      setIdle(false);
      setLastResult(result);
      setTimeout(() => {
        setLastResult(null);
        setIdle(true);
      }, 4000);
    };
    // First scan after 2s
    const initial = setTimeout(cycle, 2000);
    demoIntervalRef.current = setInterval(cycle, 7000);
    return () => {
      clearTimeout(initial);
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [isDemo]);

  const processScan = useCallback(async (code: string) => {
    if (!selectedEvent || isDemo) return;
    setIdle(false);
    try {
      const result = await rfidService.processRfidScan(code, selectedEvent, 'General');
      setLastResult(result);
    } catch {
      setLastResult({ success: false, action: 'denied', reason: 'Błąd systemu' });
    }
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setLastResult(null);
      setIdle(true);
    }, 5000);
  }, [selectedEvent, isDemo]);

  // Keyboard listener for RFID/barcode
  useEffect(() => {
    if (isDemo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBuffer, processScan, isDemo]);

  return (
    <div className="min-h-screen bg-background flex flex-col select-none cursor-default">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wyjdź
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-muted-foreground">{eventTitle}</h2>
          {isDemo && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-600 border border-amber-500/30">
              DEMO
            </span>
          )}
        </div>
        <span className="text-lg font-mono text-muted-foreground">
          {clock.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {idle && !lastResult && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="mx-auto w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio className="h-20 w-20 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-4">Przyłóż opaskę</h1>
              <p className="text-2xl text-muted-foreground">
                Zbliż opaskę RFID do czytnika aby się zarejestrować
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <QrCode className="h-6 w-6" />
              <span className="text-lg">lub zeskanuj kod QR</span>
            </div>
          </div>
        )}

        {lastResult && lastResult.success && (
          <div className="text-center space-y-8 animate-in zoom-in-50 duration-300">
            <div className="mx-auto w-48 h-48 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-28 w-28 text-green-500" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-green-600 mb-2">Witamy!</h1>
              <p className="text-4xl font-semibold mb-2">{lastResult.guest_name}</p>
              {lastResult.company && (
                <p className="text-2xl text-muted-foreground">{lastResult.company}</p>
              )}
              <p className="text-xl text-muted-foreground mt-4">{lastResult.message}</p>
            </div>
          </div>
        )}

        {lastResult && !lastResult.success && (
          <div className="text-center space-y-8 animate-in zoom-in-50 duration-300">
            <div className="mx-auto w-48 h-48 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-28 w-28 text-destructive" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-destructive mb-2">Odmowa</h1>
              <p className="text-2xl text-muted-foreground">{lastResult.reason}</p>
              <p className="text-xl text-muted-foreground mt-4">Skontaktuj się z obsługą</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-8 py-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Self Check-In Kiosk • {isDemo ? 'Tryb demonstracyjny' : 'System aktywny'}
        </p>
      </div>
    </div>
  );
};

export default SelfCheckInKiosk;
