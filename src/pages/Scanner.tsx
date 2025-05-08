import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Guest } from "@/types";
import { ScanEntry } from "@/types/scanner";
import QRScanner from "@/components/scanner/QRScanner";
import { toast } from "sonner";
import OfflineIndicator from "@/components/scanner/OfflineIndicator";
import StatsCards from "@/components/scanner/StatsCards";
import ScanHistoryList from "@/components/scanner/ScanHistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  
  // Obserwowanie pendingScans by automatycznie synchronizować po powrocie online
  useEffect(() => {
    if (isOnline && pendingScans.length > 0 && !isSyncing) {
      syncPendingScans();
    }
  }, [isOnline, pendingScans.length]);
  
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
  
  const handleExportData = (format: "csv" | "pdf") => {
    if (format === "csv") {
      // Logika eksportu już jest w StatsCards
      return;
    } else if (format === "pdf") {
      toast.info("Eksport do PDF będzie dostępny wkrótce");
      // TODO: Implementacja eksportu do PDF
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <MainLayout>
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Skaner QR</h1>
            <p className="text-muted-foreground">
              Skanuj kody QR gości, aby zweryfikować ich dostęp do wydarzenia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Scanner and Stats */}
            <div className="lg:col-span-4 space-y-6">
              {/* Scanner Card */}
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-semibold">Skaner QR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <QRScanner onScanSuccess={handleScanSuccess} />
                    <OfflineIndicator 
                      isOnline={isOnline}
                      pendingScans={pendingScans.length}
                      isSyncing={isSyncing}
                      syncProgress={syncProgress}
                      lastSyncTime={lastSyncTime}
                      onSyncClick={syncPendingScans}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <StatsCards 
                total={stats.total}
                successful={stats.successful}
                failed={stats.failed}
                onExportData={handleExportData}
                scanHistory={scanHistory}
              />
            </div>

            {/* Right Column - Scan History */}
            <div className="lg:col-span-8">
              <ScanHistoryList 
                scanHistory={scanHistory}
                onClearHistory={clearHistory}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default Scanner;
