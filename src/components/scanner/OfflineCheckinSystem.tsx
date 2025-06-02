
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface OfflineGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  qrCode: string;
  zone: string;
}

interface OfflineScan {
  id: string;
  guestId: string;
  timestamp: Date;
  synced: boolean;
  guestName: string;
}

const OfflineCheckinSystem: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedGuests, setCachedGuests] = useState<OfflineGuest[]>([]);
  const [offlineScans, setOfflineScans] = useState<OfflineScan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Połączenie przywrócone! Dane zostaną zsynchronizowane automatycznie.');
      autoSync();
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

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem('offline_guests');
      const scans = localStorage.getItem('offline_scans');
      
      if (cached) {
        setCachedGuests(JSON.parse(cached));
      }
      
      if (scans) {
        const parsedScans = JSON.parse(scans).map((scan: any) => ({
          ...scan,
          timestamp: new Date(scan.timestamp)
        }));
        setOfflineScans(parsedScans);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
      toast.error('Błąd podczas ładowania danych offline');
    }
  };

  const downloadGuestsForOffline = async () => {
    setIsDownloading(true);
    try {
      // Symulacja pobierania gości z API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGuests: OfflineGuest[] = Array.from({ length: 100 }, (_, i) => ({
        id: `guest-${i + 1}`,
        firstName: `Imię${i + 1}`,
        lastName: `Nazwisko${i + 1}`,
        email: `guest${i + 1}@example.com`,
        qrCode: `qr_code_${i + 1}`,
        zone: ['vip', 'press', 'general', 'staff'][i % 4]
      }));
      
      localStorage.setItem('offline_guests', JSON.stringify(mockGuests));
      setCachedGuests(mockGuests);
      
      toast.success(`Pobrano ${mockGuests.length} gości do cache offline`);
    } catch (error) {
      console.error('Error downloading guests:', error);
      toast.error('Błąd podczas pobierania danych gości');
    } finally {
      setIsDownloading(false);
    }
  };

  const processOfflineScan = (qrCode: string) => {
    const guest = cachedGuests.find(g => g.qrCode === qrCode);
    
    if (!guest) {
      toast.error('Gość nie znaleziony w cache offline');
      return false;
    }

    // Sprawdź czy już skanowano
    const alreadyScanned = offlineScans.some(s => s.guestId === guest.id);
    if (alreadyScanned) {
      toast.warning('Gość już został zeskanowany offline');
      return false;
    }

    const newScan: OfflineScan = {
      id: `offline_${Date.now()}_${guest.id}`,
      guestId: guest.id,
      timestamp: new Date(),
      synced: false,
      guestName: `${guest.firstName} ${guest.lastName}`
    };

    const updatedScans = [...offlineScans, newScan];
    setOfflineScans(updatedScans);
    localStorage.setItem('offline_scans', JSON.stringify(updatedScans));
    
    toast.success(`✅ Offline check-in: ${guest.firstName} ${guest.lastName}`);
    return true;
  };

  const syncOfflineScans = async () => {
    if (offlineScans.length === 0) {
      toast.info('Brak danych do synchronizacji');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const unsyncedScans = offlineScans.filter(scan => !scan.synced);
      const batchSize = 10;
      
      for (let i = 0; i < unsyncedScans.length; i += batchSize) {
        const batch = unsyncedScans.slice(i, i + batchSize);
        
        // Symulacja wysyłki batch'a do API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Oznacz jako zsynchronizowane
        setOfflineScans(prev => prev.map(scan => 
          batch.some(b => b.id === scan.id) ? { ...scan, synced: true } : scan
        ));
        
        const progress = ((i + batch.length) / unsyncedScans.length) * 100;
        setSyncProgress(progress);
      }

      // Usuń zsynchronizowane z localStorage
      const remainingScans = offlineScans.filter(scan => !scan.synced);
      localStorage.setItem('offline_scans', JSON.stringify(remainingScans));
      
      toast.success(`Zsynchronizowano ${unsyncedScans.length} check-inów`);
      
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Błąd podczas synchronizacji');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const autoSync = async () => {
    if (isOnline && offlineScans.some(scan => !scan.synced)) {
      await syncOfflineScans();
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('offline_guests');
    localStorage.removeItem('offline_scans');
    setCachedGuests([]);
    setOfflineScans([]);
    toast.success('Wyczyszczono wszystkie dane offline');
  };

  const getStorageSize = () => {
    const guestsSize = localStorage.getItem('offline_guests')?.length || 0;
    const scansSize = localStorage.getItem('offline_scans')?.length || 0;
    return ((guestsSize + scansSize) / 1024).toFixed(1); // KB
  };

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <Alert className={isOnline ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={isOnline ? 'text-green-800' : 'text-orange-800'}>
            {isOnline 
              ? 'Online - wszystkie funkcje dostępne, dane synchronizują się automatycznie'
              : 'Offline - używam danych z cache, check-iny będą zsynchronizowane po przywróceniu połączenia'
            }
          </AlertDescription>
        </div>
      </Alert>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache gości</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{cachedGuests.length}</div>
            <p className="text-xs text-muted-foreground">Dostępnych offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline check-ins</CardTitle>
            <Smartphone className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{offlineScans.length}</div>
            <p className="text-xs text-muted-foreground">
              {offlineScans.filter(s => !s.synced).length} do synchronizacji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zsynchronizowane</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {offlineScans.filter(s => s.synced).length}
            </div>
            <p className="text-xs text-muted-foreground">Pomyślnie wysłane</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rozmiar cache</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStorageSize()}</div>
            <p className="text-xs text-muted-foreground">KB w localStorage</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie danymi offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={downloadGuestsForOffline}
              disabled={!isOnline || isDownloading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Pobieranie...' : 'Pobierz gości'}
            </Button>

            <Button
              onClick={syncOfflineScans}
              disabled={!isOnline || isSyncing || offlineScans.filter(s => !s.synced).length === 0}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isSyncing ? 'Synchronizacja...' : 'Synchronizuj'}
            </Button>

            <Button
              onClick={clearOfflineData}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
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
              <Clock className="h-5 w-5" />
              Historia check-inów offline ({offlineScans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offlineScans.slice(-10).reverse().map((scan) => (
                <div key={scan.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{scan.guestName}</div>
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
                        <Clock className="h-3 w-3 mr-1" />
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

      {/* Demo scan button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Test offline check-in</h3>
            <Button
              onClick={() => processOfflineScan(`qr_code_${Math.floor(Math.random() * 100) + 1}`)}
              disabled={cachedGuests.length === 0}
              variant="outline"
            >
              Symuluj skanowanie QR
            </Button>
            <p className="text-xs text-muted-foreground">
              {cachedGuests.length === 0 
                ? 'Pobierz gości aby przetestować funkcję'
                : 'Kliknij aby zasymulować skanowanie QR kodu offline'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineCheckinSystem;
