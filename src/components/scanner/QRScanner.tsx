import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { Guest } from "@/types";
import ScannerSettings from "./ScannerSettings";
import ScanResultDisplay from "./ScanResultDisplay";
import CameraPreview from "./CameraPreview";
import { toast } from "sonner";
import "./QRScanner.css";

interface QRScannerProps {
  onScanSuccess?: (guest: Guest) => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [settings, setSettings] = useState({
    autoScan: false,
    hapticFeedback: true,
    playSound: true,
    frontCamera: false,
    flashlight: false,
  });
  
  const performFeedback = (success: boolean) => {
    if (settings.hapticFeedback && navigator.vibrate) {
      if (success) {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate([300]);
      }
    }
    
    if (settings.playSound) {
      // W przyszłości można dodać rzeczywiste dźwięki
      console.log(`Playing ${success ? 'success' : 'error'} sound`);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setCameraActive(true);
  };

  const handleQrCodeDetected = (qrCode: string) => {
    console.log("Wykryto QR kod:", qrCode);
    try {
      // Próbujemy zdekodować dane z QR kodu jako JSON
      let guestData = null;
      
      try {
        guestData = JSON.parse(qrCode);
      } catch (e) {
        // Jeśli parsowanie nie zadziałało, zakładamy że to prosty ciąg znaków (np. id)
        console.log("Nie można sparsować QR kodu jako JSON, próba wyszukania gościa po ID");
      }
      
      // W rzeczywistej aplikacji tutaj byłoby API call do weryfikacji gościa
      // Dla demo tworzymy dane testowe
      const mockGuest: Guest = guestData || {
        id: qrCode || Math.random().toString(36).substr(2, 9),
        firstName: "Anna",
        lastName: "Nowak",
        email: "anna.nowak@example.com",
        company: "XYZ Media",
        zone: "press",
        status: "confirmed",
        qrCode: qrCode,
      };
      
      handleScanResult(mockGuest);
    } catch (error) {
      console.error("Błąd przetwarzania danych z kodu QR:", error);
      toast.error("Nieprawidłowy format kodu QR");
      setScanning(false);
    }
  };

  const handleScanResult = (guest: Guest) => {
    setScanning(false);
    setLastScannedGuest(guest);
    
    // Symulacja weryfikacji dostępu - w rzeczywistej aplikacji byłaby prawdziwa logika
    const hasAccess = Math.random() > 0.2;
    
    if (hasAccess) {
      setScanResult("success");
      performFeedback(true);
      if (onScanSuccess) onScanSuccess(guest);
    } else {
      setScanResult("error");
      performFeedback(false);
    }
    
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

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    const savedSettings = JSON.parse(localStorage.getItem('scannerSettings') || '{}');
    localStorage.setItem('scannerSettings', JSON.stringify({
      ...savedSettings,
      [key]: value
    }));
  };
  
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
    
    return () => {
      setCameraActive(false);
    };
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
        <ScannerSettings settings={settings} onSettingChange={updateSetting} />
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !lastScannedGuest ? (
          <CameraPreview
            scanning={scanning}
            cameraActive={cameraActive}
            onStartScanning={startScanning}
            onStopScanning={() => setScanning(false)}
          />
        ) : scanning ? (
          <CameraPreview
            scanning={scanning}
            cameraActive={cameraActive}
            onStartScanning={startScanning}
            onStopScanning={() => setScanning(false)}
            onQrCodeDetected={handleQrCodeDetected}
          />
        ) : lastScannedGuest && scanResult ? (
          <ScanResultDisplay
            guest={lastScannedGuest}
            scanResult={scanResult}
            onRescan={settings.autoScan ? resetScan : startScanning}
            autoScan={settings.autoScan}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
