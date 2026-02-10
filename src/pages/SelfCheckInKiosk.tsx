import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rfidService, RfidScanResult } from '@/services/rfid/rfidService';
import { CheckCircle, XCircle, Radio, QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SelfCheckInKiosk = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastResult, setLastResult] = useState<RfidScanResult | null>(null);
  const [idle, setIdle] = useState(true);
  const [clock, setClock] = useState(new Date());
  const bufferTimeoutRef = useRef<NodeJS.Timeout>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load events
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

  const processScan = useCallback(async (code: string) => {
    if (!selectedEvent) return;
    setIdle(false);
    try {
      const result = await rfidService.processRfidScan(code, selectedEvent, 'General');
      setLastResult(result);
    } catch {
      setLastResult({ success: false, action: 'denied', reason: 'Błąd systemu' });
    }
    // Reset to idle after 5 seconds
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setLastResult(null);
      setIdle(true);
    }, 5000);
  }, [selectedEvent]);

  // Keyboard listener for RFID/barcode
  useEffect(() => {
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
  }, [scanBuffer, processScan]);

  // Event selector screen
  if (!selectedEvent && events.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold">Wybierz wydarzenie</h1>
          <div className="grid gap-4 max-w-lg">
            {events.map(e => (
              <button
                key={e.id}
                onClick={() => { setSelectedEvent(e.id); setEventTitle(e.title); }}
                className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card text-card-foreground text-xl font-medium transition-colors"
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <h2 className="text-lg font-semibold text-muted-foreground">{eventTitle}</h2>
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
              <h1 className="text-5xl font-bold tracking-tight text-green-600 mb-2">
                Witamy!
              </h1>
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
              <h1 className="text-5xl font-bold tracking-tight text-destructive mb-2">
                Odmowa
              </h1>
              <p className="text-2xl text-muted-foreground">{lastResult.reason}</p>
              <p className="text-xl text-muted-foreground mt-4">
                Skontaktuj się z obsługą
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-8 py-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Self Check-In Kiosk • System aktywny
        </p>
      </div>
    </div>
  );
};

export default SelfCheckInKiosk;
