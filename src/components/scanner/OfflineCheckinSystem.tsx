
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, Download, Upload, QrCode, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import CheckInSystem from '@/components/checkin/CheckInSystem';

interface OfflineEntry {
  id: string;
  guestId: string;
  guestName: string;
  timestamp: Date;
  action: 'check-in' | 'check-out';
  synced: boolean;
  deviceId: string;
}

const OfflineCheckinSystem: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineEntries, setOfflineEntries] = useState<OfflineEntry[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Monitor connection status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Połączenie z internetem zostało przywrócone');
      autoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Brak połączenia z internetem - przełączono na tryb offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline entries from localStorage
    loadOfflineEntries();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineEntries = () => {
    try {
      const saved = localStorage.getItem('offline-checkin-entries');
      if (saved) {
        const entries = JSON.parse(saved).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setOfflineEntries(entries);
      }
    } catch (error) {
    }
  };

  const saveOfflineEntries = (entries: OfflineEntry[]) => {
    try {
      localStorage.setItem('offline-checkin-entries', JSON.stringify(entries));
    } catch (error) {
    }
  };

  const addOfflineEntry = (guestId: string, guestName: string, action: 'check-in' | 'check-out') => {
    const entry: OfflineEntry = {
      id: Date.now().toString(),
      guestId,
      guestName,
      timestamp: new Date(),
      action,
      synced: false,
      deviceId: 'mobile-scanner-001'
    };

    const updatedEntries = [...offlineEntries, entry];
    setOfflineEntries(updatedEntries);
    saveOfflineEntries(updatedEntries);

    toast.success(`${action === 'check-in' ? 'Check-in' : 'Check-out'} zapisany offline`);

    // Try to sync immediately if online
    if (isOnline) {
      syncEntries();
    }
  };

  const syncEntries = async () => {
    if (offlineEntries.filter(e => !e.synced).length === 0) {
      return;
    }

    setSyncInProgress(true);
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const syncedEntries = offlineEntries.map(entry => ({
        ...entry,
        synced: true
      }));

      setOfflineEntries(syncedEntries);
      saveOfflineEntries(syncedEntries);
      
      toast.success('Wszystkie wpisy zostały zsynchronizowane');
    } catch (error) {
      toast.error('Błąd podczas synchronizacji');
    } finally {
      setSyncInProgress(false);
    }
  };

  const autoSync = () => {
    if (isOnline && offlineEntries.some(e => !e.synced)) {
      syncEntries();
    }
  };

  const clearSyncedEntries = () => {
    const unsyncedEntries = offlineEntries.filter(e => !e.synced);
    setOfflineEntries(unsyncedEntries);
    saveOfflineEntries(unsyncedEntries);
    toast.success('Usunięto zsynchronizowane wpisy');
  };

  const exportOfflineData = () => {
    const dataStr = JSON.stringify(offlineEntries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `offline-checkin-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Dane offline zostały wyeksportowane');
  };

  const unsyncedCount = offlineEntries.filter(e => !e.synced).length;
  const syncedCount = offlineEntries.filter(e => e.synced).length;

  return (
    <div className="space-y-6">
      {/* Status połączenia */}
      <Card className={`border-l-4 ${isOnline ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-500" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-medium">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Wszystkie operacje są synchronizowane na bieżąco'
                    : 'Dane są zapisywane lokalnie i będą zsynchronizowane po przywróceniu połączenia'
                  }
                </p>
              </div>
            </div>
            
            {isOnline && unsyncedCount > 0 && (
              <Button
                onClick={syncEntries}
                disabled={syncInProgress}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {syncInProgress ? 'Synchronizowanie...' : `Sync (${unsyncedCount})`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statystyki offline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łączne wpisy</p>
                <p className="text-2xl font-bold">{offlineEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Niezsynchronizowane</p>
                <p className="text-2xl font-bold">{unsyncedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zsynchronizowane</p>
                <p className="text-2xl font-bold">{syncedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportOfflineData}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              {syncedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSyncedEntries}
                >
                  Wyczyść
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista wpisów offline */}
      {offlineEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wpisy offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offlineEntries.slice(-10).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{entry.guestName}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.timestamp.toLocaleString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.action === 'check-in' ? 'default' : 'secondary'}>
                      {entry.action}
                    </Badge>
                    <Badge variant={entry.synced ? 'default' : 'destructive'}>
                      {entry.synced ? 'Sync' : 'Local'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System check-in */}
      <CheckInSystem />
    </div>
  );
};

export default OfflineCheckinSystem;
