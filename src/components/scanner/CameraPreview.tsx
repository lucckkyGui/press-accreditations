
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, QrCode, Smartphone } from "lucide-react";
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

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
  const { t } = useI18n();
  const qrScannerRef = useRef<Html5QrcodeType | null>(null);
  const scannerContainerId = "qr-reader";
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (scanning && !qrScannerRef.current) {
      import("html5-qrcode").then(({ Html5Qrcode }) => {
        const qrScanner = new Html5Qrcode(scannerContainerId);
        qrScannerRef.current = qrScanner;

        // Bez `qrbox` — html5-qrcode rysuje przy nim ciemną maskę poza oknem (przygaszenie).
        // Dekodowanie działa na pełnej klatce; własny kwadratowy celownik jest tylko prowadnicą.
        const config = {
          fps: 10,
          aspectRatio: 1.0,
        };

        qrScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (onQrCodeDetected) {
              onQrCodeDetected(decodedText);
              qrScanner.stop().catch(() => {});
            }
          },
          () => {}
        )
        .then(() => setIsCameraReady(true))
        .catch(() => setCameraError("Nie udało się uruchomić kamery. Sprawdź uprawnienia."));
      });
    }

    return () => {
      if (qrScannerRef.current) {
        const scanner = qrScannerRef.current;
        qrScannerRef.current = null;
        setIsCameraReady(false);
        try {
          const state = scanner.getState();
          if (state === 2 || state === 3) {
            scanner.stop().catch(() => {});
          }
        } catch {
          // Scanner not in a stoppable state
        }
      }
    };
  }, [scanning, onQrCodeDetected]);

  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-primary rounded-lg bg-muted/10">
        <div className="relative mx-auto mb-4 aspect-square w-full max-w-[min(80vw,360px)] overflow-hidden rounded-lg bg-black">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4 text-center text-white">
              <p>{cameraError}</p>
            </div>
          ) : (
            <>
              {/* Podgląd poza przepływem (absolute) — html5-qrcode wstrzykuje video z inline px
                  z rozdzielczości kamery; `!important` bije inline i zmusza video do wypełnienia
                  kwadratu (object-cover), a `absolute` w `overflow-hidden` przycina je do kontenera
                  i nie rozpycha layoutu. */}
              <div
                id={scannerContainerId}
                className="absolute inset-0 [&_video]:!absolute [&_video]:!inset-0 [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
              />
              {/* Kwadratowy celownik (prowadnica) */}
              <div className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500",
                isCameraReady ? "opacity-100" : "opacity-0",
              )}>
                <div className="relative aspect-square w-2/3">
                  <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-lg border-l-4 border-t-4 border-primary" />
                  <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-lg border-r-4 border-t-4 border-primary" />
                  <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-lg border-b-4 border-l-4 border-primary" />
                  <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-lg border-b-4 border-r-4 border-primary" />
                </div>
              </div>
            </>
          )}
        </div>
        <p className="text-center mb-4 animate-fade-in font-medium">
          {t("pages.scanner.title")}<span className="animate-pulse">...</span>
        </p>
        <Button 
          variant="outline" 
          onClick={onStopScanning} 
          className="gap-2 transition-all hover:bg-destructive hover:text-white"
        >
          <CameraOff className="h-4 w-4" />
          {t("common.cancel")}
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
            <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-destructive opacity-70 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute animate-ping w-4 h-4 bg-destructive rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="bg-primary/10 p-6 rounded-full mb-4">
          <QrCode className="h-16 w-16 text-primary" />
        </div>
      )}
      <p className="text-center text-muted-foreground mb-4">
        {t("pages.scanner.subtitle")}
      </p>
      <Button 
        onClick={onStartScanning} 
        className="gap-2 pulse-button"
        size="lg"
      >
        <Smartphone className="h-5 w-5" />
        {t("pages.scanner.startScanning")}
      </Button>
    </div>
  );
};

export default CameraPreview;
