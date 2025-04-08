
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Guest } from "@/types";
import QRScanner from "@/components/scanner/QRScanner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";

interface ScanEntry {
  id: string;
  guest: Guest;
  timestamp: Date;
  successful: boolean;
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
  
  useEffect(() => {
    // Nasłuchiwanie zmian stanu połączenia
    const handleOnline = () => {
      setIsOnline(true);
      // W rzeczywistej aplikacji tutaj byłaby synchronizacja z serwerem
      toast.success("Połączono z internetem. Synchronizacja danych...");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Brak połączenia z internetem. Tryb offline aktywny.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleScanSuccess = (guest: Guest) => {
    // Symulacja losowego sukcesu/porażki dla MVP
    const successful = Math.random() > 0.1;
    
    const newScanEntry: ScanEntry = {
      id: Date.now().toString(),
      guest,
      timestamp: new Date(),
      successful
    };
    
    setScanHistory(prev => [newScanEntry, ...prev]);
    
    setStats(prev => ({
      total: prev.total + 1,
      successful: successful ? prev.successful + 1 : prev.successful,
      failed: !successful ? prev.failed + 1 : prev.failed
    }));
    
    if (successful) {
      toast.success(`${guest.firstName} ${guest.lastName} zeskanowany pomyślnie`);
    } else {
      toast.error(`Odmowa wejścia dla ${guest.firstName} ${guest.lastName}`);
    }
    
    // Jeśli offline, dodaj do kolejki oczekujących
    if (!isOnline) {
      setPendingScans(prev => [...prev, newScanEntry]);
      localStorage.setItem('pendingScans', JSON.stringify([...pendingScans, newScanEntry]));
    }
  };
  
  const syncPendingScans = () => {
    // W rzeczywistej aplikacji tutaj byłaby synchronizacja z serwerem
    toast.success(`Zsynchronizowano ${pendingScans.length} skanów`);
    setPendingScans([]);
    localStorage.removeItem('pendingScans');
  };
  
  const clearHistory = () => {
    setScanHistory([]);
    setStats({
      total: 0,
      successful: 0,
      failed: 0
    });
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
          
          <div className="flex items-center">
            {isOnline ? (
              <div className="flex items-center">
                <Wifi className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center">
                <WifiOff className="text-amber-500 h-5 w-5 mr-2" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            
            {!isOnline && pendingScans.length > 0 && (
              <Badge variant="outline" className="ml-3 bg-amber-50">
                {pendingScans.length} oczekujących
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <QRScanner onScanSuccess={handleScanSuccess} />
            
            {!isOnline && pendingScans.length > 0 && (
              <div className="mt-4">
                <Button 
                  onClick={syncPendingScans}
                  disabled={!isOnline}
                  className="w-full"
                >
                  Synchronizuj ({pendingScans.length})
                </Button>
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
                            <Badge variant={entry.successful ? "default" : "destructive"}>
                              {entry.successful ? "Zatwierdzone" : "Odrzucone"}
                            </Badge>
                            {!isOnline && (
                              <div className="text-xs mt-1 text-amber-600">
                                (Tryb offline)
                              </div>
                            )}
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
