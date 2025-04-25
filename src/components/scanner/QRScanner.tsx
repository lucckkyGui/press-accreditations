
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { Guest } from "@/types";
import ScannerSettings from "./ScannerSettings";
import ScanResultDisplay from "./ScanResultDisplay";
import CameraPreview from "./CameraPreview";

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
      console.log(`Playing ${success ? 'success' : 'error'} sound`);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setCameraActive(true);
    
    // Symulacja skanowania dla MVP
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
