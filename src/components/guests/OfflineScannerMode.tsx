
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Guest, Event } from '@/types';
import { ScanEntry } from '@/types/scanner';
import { Wifi, WifiOff, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OfflineScannerModeProps {
  event: Event;
  onGuestScanned: (guest: Guest) => void;
}

const OfflineScannerMode: React.FC<OfflineScannerModeProps> = ({
  event,
  onGuestScanned
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineScans, setOfflineScans] = useState<ScanEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [cachedGuests, setCachedGuests] = useState<Guest[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Połączenie internetowe przywrócone');
      syncOfflineScans();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Brak połączenia - przechodzę w tryb offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data
  useEffect(() => {
    loadCachedData();
  }, [event.id]);

  const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(`guests_${event.id}`);
      const scans = localStorage.getItem(`offline_scans_${event.id}`);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check expiry
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setCachedGuests(parsed.data);
        } else {
          // Expired — clear it
          localStorage.removeItem(`guests_${event.id}`);
        }
      }
      
      if (scans) {
        const parsed = JSON.parse(scans);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setOfflineScans(parsed.data);
        } else {
          localStorage.removeItem(`offline_scans_${event.id}`);
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const saveCachedData = (guests: Guest[]) => {
    try {
      const cache = {
        data: guests,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRY_MS,
      };
      localStorage.setItem(`guests_${event.id}`, JSON.stringify(cache));
      setCachedGuests(guests);
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  };

  const saveOfflineScan = (scan: ScanEntry) => {
    try {
      const updatedScans = [...offlineScans, scan];
      const cache = { data: updatedScans, timestamp: Date.now(), expiresAt: Date.now() + CACHE_EXPIRY_MS };
      localStorage.setItem(`offline_scans_${event.id}`, JSON.stringify(cache));
      setOfflineScans(updatedScans);
    } catch (error) {
      console.error('Error saving offline scan:', error);
    }
  };

  const handleOfflineScan = (qrCode: string) => {
    try {
      const guestData = JSON.parse(qrCode);
      const guest = cachedGuests.find(g => g.id === guestData.guestId);
      
      if (!guest) {
        toast.error('Gość nie znaleziony w cache offline');
        return;
      }

      if (guestData.eventId !== event.id) {
        toast.error('QR kod należy do innego wydarzenia');
        return;
      }

      // Sprawdź czy już skanowano offline
      const alreadyScanned = offlineScans.some(s => s.guest.id === guest.id);
      if (alreadyScanned) {
        toast.warning('Gość już został zeskanowany offline');
        return;
      }

      const scanEntry: ScanEntry = {
        id: `offline_${Date.now()}_${guest.id}`,
        guest: { ...guest, status: 'checked-in', checkedInAt: new Date() },
        timestamp: new Date(),
        successful: true,
        synced: false
      };

      saveOfflineScan(scanEntry);
      onGuestScanned(scanEntry.guest);
      toast.success(`Offline scan: ${guest.firstName} ${guest.lastName}`);

    } catch (error) {
      console.error('Error processing offline scan:', error);
      toast.error('Błąd podczas skanowania offline');
    }
  };

  const syncOfflineScans = async () => {
    if (offlineScans.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < offlineScans.length; i += batchSize) {
        batches.push(offlineScans.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Symulacja synku z API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mark as synced
        const syncedIds = batch.map(scan => scan.id);
        setOfflineScans(prev => prev.map(scan => 
          syncedIds.includes(scan.id) ? { ...scan, synced: true } : scan
        ));
        
        const progress = ((batchIndex + 1) / batches.length) * 100;
        setSyncProgress(progress);
      }

      // Clear synced scans from localStorage
      const unsyncedScans = offlineScans.filter(scan => !scan.synced);
      localStorage.setItem(`offline_scans_${event.id}`, JSON.stringify(unsyncedScans));
      setOfflineScans(unsyncedScans);

      toast.success(`Zsynchronizowano ${offlineScans.length} skanów offline`);

    } catch (error) {
      console.error('Error syncing offline scans:', error);
      toast.error('Błąd podczas synchronizacji');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const downloadGuestsForOffline = async () => {
    try {
      // W rzeczywistej aplikacji pobierałoby z API
      const mockGuests: Guest[] = [
        {
          id: 'guest-1',
          firstName: 'Jan',
          lastName: 'Kowalski',
          email: 'jan@example.com',
          ticketType: 'uczestnik',
          zones: [],
          status: 'confirmed',
          qrCode: JSON.stringify({ guestId: 'guest-1', eventId: event.id })
        },
        // ... więcej gości
      ];
      
      saveCachedData(mockGuests);
      toast.success(`Pobrano ${mockGuests.length} gości do cache offline`);
      
    } catch (error) {
      console.error('Error downloading guests:', error);
      toast.error('Błąd podczas pobierania gości');
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem(`guests_${event.id}`);
    localStorage.removeItem(`offline_scans_${event.id}`);
    setCachedGuests([]);
    setOfflineScans([]);
    toast.success('Wyczyszczono dane offline');
  };

  return (
    <div className="space-y-4">
      {/* Status connection */}
      <Alert className={isOnline ? 'border-green-500' : 'border-orange-500'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <AlertDescription>
            {isOnline ? 'Online - wszystkie funkcje dostępne' : 'Offline - używam danych z cache'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Offline cache management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Zarządzanie cache offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cachedGuests.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Gości w cache
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {offlineScans.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Skanów offline
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {offlineScans.filter(s => s.synced).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Zsynchronizowanych
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={downloadGuestsForOffline}
              disabled={!isOnline}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Pobierz gości
            </Button>
            
            <Button
              onClick={syncOfflineScans}
              disabled={!isOnline || offlineScans.length === 0 || isSyncing}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Synchronizuj
            </Button>
            
            <Button
              onClick={clearOfflineData}
              variant="destructive"
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Wyczyść cache
            </Button>
          </div>

          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Synchronizacja w toku...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline scans list */}
      {offlineScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Skany offline ({offlineScans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offlineScans.map((scan) => (
                <div key={scan.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">
                      {scan.guest.firstName} {scan.guest.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scan.timestamp.toLocaleString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.synced ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineScannerMode;
