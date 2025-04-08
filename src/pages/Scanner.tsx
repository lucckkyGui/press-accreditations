
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Guest } from "@/types";
import QRScanner from "@/components/scanner/QRScanner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Cloud, CloudOff, Wifi, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScanEntry {
  id: string;
  guest: Guest;
  timestamp: Date;
  successful: boolean;
  synced: boolean;
}

const Scanner = () => {
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingScans, setPendingScans] = useState<ScanEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Nasłuchiwanie zmian stanu połączenia
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Połączono z internetem. Dane będą synchronizowane automatycznie.", {
        duration: 3000,
      });
      
      // Automatyczna synchronizacja po powrocie online
      if (pendingScans.length > 0) {
        syncPendingScans();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Brak połączenia z internetem. Tryb offline aktywny.", {
        duration: 5000,
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Ładowanie historii z localStorage przy inicjalizacji
    loadScanHistory();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Nowa funkcja ładująca historię skanowania z localStorage
  const loadScanHistory = () => {
    try {
      const savedHistory = localStorage.getItem('scanHistory');
      const savedPendingScans = localStorage.getItem('pendingScans');
      const savedStats = localStorage.getItem('scanStats');
      const savedLastSync = localStorage.getItem('lastSyncTime');
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Konwersja stringów dat na obiekty Date
        const formattedHistory = parsedHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setScanHistory(formattedHistory);
      }
      
      if (savedPendingScans) {
        const parsedPending = JSON.parse(savedPendingScans);
        // Konwersja stringów dat na obiekty Date
        const formattedPending = parsedPending.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setPendingScans(formattedPending);
      }
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      
      if (savedLastSync) {
        setLastSyncTime(new Date(JSON.parse(savedLastSync)));
      }
    } catch (error) {
      console.error("Błąd podczas ładowania danych z localStorage:", error);
      toast.error("Wystąpił błąd podczas ładowania zapisanych danych.");
    }
  };
  
  const handleScanSuccess = (guest: Guest) => {
    // Symulacja losowego sukcesu/porażki dla MVP
    const successful = Math.random() > 0.1;
    
    const newScanEntry: ScanEntry = {
      id: Date.now().toString(),
      guest,
      timestamp: new Date(),
      successful,
      synced: isOnline
    };
    
    // Aktualizuj historię skanowań
    const updatedHistory = [newScanEntry, ...scanHistory];
    setScanHistory(updatedHistory);
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    
    // Aktualizuj statystyki
    const updatedStats = {
      total: stats.total + 1,
      successful: successful ? stats.successful + 1 : stats.successful,
      failed: !successful ? stats.failed + 1 : stats.failed
    };
    setStats(updatedStats);
    localStorage.setItem('scanStats', JSON.stringify(updatedStats));
    
    if (successful) {
      toast.success(`${guest.firstName} ${guest.lastName} zeskanowany pomyślnie`);
    } else {
      toast.error(`Odmowa wejścia dla ${guest.firstName} ${guest.lastName}`);
    }
    
    // Jeśli offline, dodaj do kolejki oczekujących
    if (!isOnline) {
      const updatedPendingScans = [...pendingScans, newScanEntry];
      setPendingScans(updatedPendingScans);
      localStorage.setItem('pendingScans', JSON.stringify(updatedPendingScans));
    }
  };
  
  const syncPendingScans = async () => {
    if (pendingScans.length === 0) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Symulacja procesu synchronizacji z opóźnieniem
    const totalItems = pendingScans.length;
    let processedItems = 0;
    
    for (const scan of pendingScans) {
      // Symulacja czasu przetwarzania dla każdego wpisu
      await new Promise(resolve => setTimeout(resolve, 400));
      processedItems++;
      setSyncProgress(Math.floor((processedItems / totalItems) * 100));
      
      // Aktualizacja statusu synchronizacji dla tego skanu
      setScanHistory(prev => 
        prev.map(item => 
          item.id === scan.id ? { ...item, synced: true } : item
        )
      );
    }
    
    // Po zakończeniu synchronizacji
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem('lastSyncTime', JSON.stringify(now.toISOString()));
    
    // Wyczyść kolejkę po synchronizacji
    setPendingScans([]);
    localStorage.removeItem('pendingScans');
    
    // Zapisz zaktualizowaną historię
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory.map(item => ({
      ...item,
      synced: true
    }))));
    
    toast.success(`Zsynchronizowano ${totalItems} skanów pomyślnie`);
    setIsSyncing(false);
    setSyncProgress(100);
  };
  
  const clearHistory = () => {
    setScanHistory([]);
    setStats({
      total: 0,
      successful: 0,
      failed: 0
    });
    setPendingScans([]);
    setLastSyncTime(null);
    
    // Wyczyść dane w localStorage
    localStorage.removeItem('scanHistory');
    localStorage.removeItem('pendingScans');
    localStorage.removeItem('scanStats');
    localStorage.removeItem('lastSyncTime');
    
    toast.info("Historia skanowań została wyczyszczona");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skaner QR</h1>
            <p className="text-muted-foreground">
              Skanuj kody QR gości, aby zweryfikować ich dostęp do wydarzenia.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Wifi className="text-green-500 h-4 w-4 mr-2" />
                <span className="text-sm text-green-700">Online</span>
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <WifiOff className="text-amber-500 h-4 w-4 mr-2" />
                <span className="text-sm text-amber-700">Offline</span>
              </div>
            )}
            
            {pendingScans.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                {pendingScans.length} oczekujących
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <QRScanner onScanSuccess={handleScanSuccess} />
            
            {pendingScans.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <CloudOff className="h-4 w-4 mr-2 text-amber-500" />
                    Dane offline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>{pendingScans.length} skanów do synchronizacji</span>
                    {lastSyncTime && (
                      <span className="text-xs text-muted-foreground">
                        Ostatnia synchronizacja: {lastSyncTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  {isSyncing ? (
                    <div className="space-y-2">
                      <Progress value={syncProgress} className="h-2" />
                      <div className="text-xs text-center text-muted-foreground">
                        Synchronizacja: {syncProgress}%
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={syncPendingScans}
                      disabled={!isOnline || isSyncing}
                      className="w-full gap-2"
                    >
                      <Cloud className="h-4 w-4" />
                      {isOnline ? "Synchronizuj dane" : "Połącz z internetem, aby synchronizować"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Karta statusu synchronizacji */}
            {isOnline && lastSyncTime && (
              <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span>Wszystkie dane zsynchronizowane</span>
                </div>
                <span className="text-xs">
                  {lastSyncTime.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-center text-2xl">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center text-sm text-muted-foreground">
                  Łącznie skanów
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-center text-2xl text-green-600">{stats.successful}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center text-sm text-muted-foreground">
                  Wejścia zatwierdzone
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-center text-2xl text-red-600">{stats.failed}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center text-sm text-muted-foreground">
                  Wejścia odrzucone
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle>Historia skanowań</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Wyczyść
                </Button>
              </CardHeader>
              <CardContent>
                {scanHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Brak historii skanowań
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {scanHistory.map((entry) => (
                        <div 
                          key={entry.id}
                          className={`p-3 rounded-md flex justify-between items-start border ${
                            entry.successful ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div>
                            <div className="font-medium flex items-center">
                              {entry.guest.firstName} {entry.guest.lastName}
                              <Badge 
                                className={`ml-2 ${
                                  entry.guest.zone === "vip" ? "bg-amber-500" :
                                  entry.guest.zone === "press" ? "bg-blue-500" :
                                  entry.guest.zone === "staff" ? "bg-purple-500" :
                                  "bg-green-500"
                                }`}
                              >
                                {entry.guest.zone}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.guest.company}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={entry.successful ? "default" : "destructive"}>
                                {entry.successful ? "Zatwierdzone" : "Odrzucone"}
                              </Badge>
                              
                              {!entry.synced && (
                                <span className="flex items-center text-xs text-amber-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Niezsynch.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Scanner;
