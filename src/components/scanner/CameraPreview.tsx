
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, QrCode, Smartphone } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  scanning: boolean;
  cameraActive: boolean;
  onStartScanning: () => void;
  onStopScanning: () => void;
  onQrCodeDetected?: (qrCode: string) => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  scanning,
  cameraActive,
  onStartScanning,
  onStopScanning,
  onQrCodeDetected,
}) => {
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    // Initialize QR scanner
    if (scanning && !qrScannerRef.current) {
      const qrScanner = new Html5Qrcode(scannerContainerId);
      qrScannerRef.current = qrScanner;
      
      const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };
      
      qrScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR kod wykryty:", decodedText);
          if (onQrCodeDetected) {
            onQrCodeDetected(decodedText);
            qrScanner.stop().catch(error => console.error("Błąd przy zatrzymywaniu skanera:", error));
          }
        },
        (errorMessage) => {
          // Scanning errors are not important - not showing to user
        }
      )
      .then(() => {
        setIsCameraReady(true);
      })
      .catch((err) => {
        console.error("Błąd przy inicjalizacji skanera QR:", err);
        setCameraError("Nie udało się uruchomić kamery. Sprawdź uprawnienia.");
      });
    }

    return () => {
      // Clean up scanner when component unmounts
      if (qrScannerRef.current && scanning) {
        qrScannerRef.current.stop().catch(error => 
          console.error("Błąd przy zatrzymywaniu skanera:", error)
        );
        qrScannerRef.current = null;
        setIsCameraReady(false);
      }
    };
  }, [scanning, onQrCodeDetected]);

  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-primary rounded-lg bg-muted/10">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 scan-focus-area">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-black/90 p-4 text-center">
              <p>{cameraError}</p>
            </div>
          ) : (
            <div id={scannerContainerId} className="w-full h-full">
              <div className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500",
                isCameraReady ? "opacity-100" : "opacity-0"
              )}>
                <div className="scanner-corners">
                  <span></span>
                </div>
                <div className="scanner-laser"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-center mb-4 animate-fade-in font-medium">
          Skanowanie kodu QR<span className="animate-pulse">...</span>
        </p>
        <Button 
          variant="outline" 
          onClick={onStopScanning} 
          className="gap-2 transition-all hover:bg-destructive hover:text-white"
        >
          <CameraOff className="h-4 w-4" />
          Anuluj
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 hover:border-primary/50 transition-colors">
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
        <div className="bg-primary/10 p-6 rounded-full mb-4">
          <QrCode className="h-16 w-16 text-primary" />
        </div>
      )}
      <p className="text-center text-muted-foreground mb-4">
        Kliknij przycisk poniżej, aby rozpocząć skanowanie kodu QR
      </p>
      <Button 
        onClick={onStartScanning} 
        className="gap-2 pulse-button"
        size="lg"
      >
        <Smartphone className="h-5 w-5" />
        Rozpocznij skanowanie
      </Button>
    </div>
  );
};

export default CameraPreview;
