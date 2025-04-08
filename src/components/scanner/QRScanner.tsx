
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw, UserCheck2, UserX2, Camera, Smartphone, CameraOff, Settings2 } from "lucide-react";
import { Guest } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface QRScannerProps {
  onScanSuccess?: (guest: Guest) => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  // Ustawienia skanera
  const [settings, setSettings] = useState({
    autoScan: false,     // Automatyczne skanowanie po rozpoznaniu QR
    hapticFeedback: true, // Wibracja przy skanowaniu
    playSound: true,      // Dźwięk przy skanowaniu
    frontCamera: false,   // Użyj przedniej kamery zamiast tylnej
    flashlight: false,    // Użyj lampy błyskowej (jeśli dostępna)
  });
  
  // Symuluje efekty dźwiękowe/wibracji
  const performFeedback = (success: boolean) => {
    // Wibracja (jeśli urządzenie obsługuje i użytkownik włączył opcję)
    if (settings.hapticFeedback && navigator.vibrate) {
      if (success) {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate([300]);
      }
    }
    
    // W rzeczywistej aplikacji tutaj byśmy dodali dźwięki
    if (settings.playSound) {
      // Odtwarzanie dźwięku
      console.log(`Playing ${success ? 'success' : 'error'} sound`);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setCameraActive(true);
    
    // W rzeczywistej aplikacji tutaj byłby kod do uruchomienia kamery i skanowania QR
    
    // Dla MVP symulujemy skanowanie po 2 sekundach
    setTimeout(() => {
      const mockGuest: Guest = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: "Anna",
        lastName: "Nowak",
        email: "anna.nowak@example.com",
        company: "XYZ Media",
        zone: "press",
        status: "confirmed",
        qrCode: "mock-qr-code",
      };
      
      handleScanResult(mockGuest);
    }, 2000);
  };

  const handleScanResult = (guest: Guest) => {
    setScanning(false);
    setLastScannedGuest(guest);
    
    // Sprawdzamy czy gość ma dostęp (symulacja dla MVP)
    const hasAccess = Math.random() > 0.2;
    
    if (hasAccess) {
      setScanResult("success");
      performFeedback(true);
      if (onScanSuccess) onScanSuccess(guest);
    } else {
      setScanResult("error");
      performFeedback(false);
    }
    
    // Jeśli włączone auto-skanowanie, resetujemy po krótkim czasie
    if (settings.autoScan) {
      setTimeout(() => {
        resetScan();
        startScanning();
      }, 3000);
    }
  };

  const resetScan = () => {
    setLastScannedGuest(null);
    setScanResult(null);
    setCameraActive(false);
  };
  
  // Zatrzymaj skanowanie przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      // W rzeczywistej aplikacji tutaj zatrzymalibyśmy pracę kamery
      setCameraActive(false);
    };
  }, []);
  
  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Zapisujemy ustawienia w localStorage
    const savedSettings = JSON.parse(localStorage.getItem('scannerSettings') || '{}');
    localStorage.setItem('scannerSettings', JSON.stringify({
      ...savedSettings,
      [key]: value
    }));
  };
  
  // Ładowanie ustawień przy inicjalizacji
  useEffect(() => {
    const savedSettings = localStorage.getItem('scannerSettings');
    if (savedSettings) {
      try {
        setSettings(prev => ({
          ...prev,
          ...JSON.parse(savedSettings)
        }));
      } catch (e) {
        console.error('Błąd przy ładowaniu ustawień skanera:', e);
      }
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Skaner QR
          </CardTitle>
          <CardDescription>Zeskanuj kod QR gościa, aby sprawdzić jego dostęp</CardDescription>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Ustawienia skanera</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-scan">Automatyczne skanowanie</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatycznie skanuj następny kod po zakończeniu
                  </p>
                </div>
                <Switch
                  id="auto-scan"
                  checked={settings.autoScan}
                  onCheckedChange={value => updateSetting('autoScan', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="haptic">Wibracja przy skanowaniu</Label>
                  <p className="text-xs text-muted-foreground">
                    Urządzenie zawibruje przy poprawnym/błędnym skanowaniu
                  </p>
                </div>
                <Switch
                  id="haptic" 
                  checked={settings.hapticFeedback}
                  onCheckedChange={value => updateSetting('hapticFeedback', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound">Dźwięki</Label>
                  <p className="text-xs text-muted-foreground">
                    Odtwarzaj dźwięki przy skanowaniu
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.playSound}
                  onCheckedChange={value => updateSetting('playSound', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="front-camera">Przednia kamera</Label>
                  <p className="text-xs text-muted-foreground">
                    Użyj przedniej kamery do skanowania
                  </p>
                </div>
                <Switch
                  id="front-camera"
                  checked={settings.frontCamera} 
                  onCheckedChange={value => updateSetting('frontCamera', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="flashlight">Lampa błyskowa</Label>
                  <p className="text-xs text-muted-foreground">
                    Włącz lampę podczas skanowania (jeśli dostępna)
                  </p>
                </div>
                <Switch
                  id="flashlight"
                  checked={settings.flashlight}
                  onCheckedChange={value => updateSetting('flashlight', value)}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !lastScannedGuest ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            {cameraActive ? (
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <Camera className="h-12 w-12 text-white opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-opacity-40 rounded-md"></div>
                  <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-red-500 opacity-70 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute animate-ping w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
              </div>
            ) : (
              <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            )}
            <p className="text-center text-muted-foreground mb-4">
              Kliknij przycisk poniżej, aby rozpocząć skanowanie kodu QR
            </p>
            <Button onClick={startScanning} className="gap-2">
              <Smartphone className="h-4 w-4" />
              Rozpocznij skanowanie
            </Button>
          </div>
        ) : scanning ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-primary rounded-lg">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-opacity-40 rounded-md"></div>
                <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-red-500 opacity-70 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
              </div>
            </div>
            <p className="text-center mb-4">Skanowanie kodu QR...</p>
            <Button variant="outline" onClick={() => setScanning(false)} className="gap-2">
              <CameraOff className="h-4 w-4" />
              Anuluj
            </Button>
          </div>
        ) : lastScannedGuest && scanResult ? (
          <>
            <Alert variant={scanResult === "success" ? "default" : "destructive"} className="animate-fade-in">
              <div className="flex items-center gap-3">
                {scanResult === "success" ? (
                  <UserCheck2 className="h-5 w-5" />
                ) : (
                  <UserX2 className="h-5 w-5" />
                )}
                <div>
                  <AlertTitle>
                    {scanResult === "success" 
                      ? "Dostęp przyznany" 
                      : "Brak dostępu"}
                  </AlertTitle>
                  <AlertDescription>
                    {scanResult === "success"
                      ? "Gość może wejść na wydarzenie"
                      : "Gość nie ma dostępu do tego wydarzenia"}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {lastScannedGuest.firstName} {lastScannedGuest.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{lastScannedGuest.email}</p>
                </div>
                <Badge className={`
                  ${lastScannedGuest.zone === "vip" ? "bg-amber-500" :
                    lastScannedGuest.zone === "press" ? "bg-blue-500" :
                    lastScannedGuest.zone === "staff" ? "bg-purple-500" :
                    "bg-green-500"}
                `}>
                  {lastScannedGuest.zone.toUpperCase()}
                </Badge>
              </div>
              
              {lastScannedGuest.company && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Firma:</span> {lastScannedGuest.company}
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={settings.autoScan ? resetScan : startScanning}
                  className="gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {settings.autoScan ? "Anuluj auto-skanowanie" : "Skanuj ponownie"}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
