
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, AlertCircle } from "lucide-react";
import { Guest } from "@/types";
import ScannerSettings from "./ScannerSettings";
import ScanResultDisplay from "./ScanResultDisplay";
import CameraPreview from "./CameraPreview";
import { toast } from "sonner";
import "./QRScanner.css";
import { useI18n } from "@/hooks/useI18n";
import { playSound, isAudioSupported } from "@/utils/soundEffects";
import { guestScannerService, ScanResult } from "@/services/scanner/guestScannerService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRScannerProps {
  onScanSuccess?: (guest: Guest) => void;
  eventId?: string;
}

const QRScanner = ({ onScanSuccess, eventId }: QRScannerProps) => {
  const { t } = useI18n();
  const [scanning, setScanning] = useState(false);
  const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    
    if (settings.playSound && isAudioSupported()) {
      playSound(success ? "success" : "error").catch(() => {});
    }
  };

  const startScanning = () => {
    setScanning(true);
    setCameraActive(true);
    if (settings.playSound && isAudioSupported()) {
      playSound("scan").catch(() => {});
    }
  };

  const handleQrCodeDetected = async (qrCode: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Use the real scanner service to verify and check in
      const result: ScanResult = await guestScannerService.verifyAndCheckIn(qrCode, eventId);
      
      if (result.success && result.guest) {
        setScanning(false);
        setLastScannedGuest(result.guest);
        
        if (result.alreadyCheckedIn) {
          setScanResult("error");
          setErrorMessage(`${result.guest.firstName} ${result.guest.lastName} już został zarejestrowany o ${new Date(result.checkInTime!).toLocaleTimeString('pl-PL')}`);
          performFeedback(false);
        } else {
          setScanResult("success");
          performFeedback(true);
          toast.success(result.message);
          if (onScanSuccess) onScanSuccess(result.guest);
        }
      } else {
        setScanResult("error");
        setErrorMessage(result.message);
        performFeedback(false);
        toast.error(result.message);
        setScanning(false);
      }
      
      if (settings.autoScan) {
        setTimeout(() => {
          resetScan();
          startScanning();
        }, 3000);
      }
    } catch (error) {
      setScanResult("error");
      setErrorMessage("Błąd podczas przetwarzania kodu QR");
      performFeedback(false);
      toast.error(t("common.error"));
      setScanning(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    setLastScannedGuest(null);
    setScanResult(null);
    setCameraActive(false);
    setErrorMessage(null);
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
            {t("scanner.title")}
          </CardTitle>
          <CardDescription>{t("scanner.subtitle")}</CardDescription>
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
