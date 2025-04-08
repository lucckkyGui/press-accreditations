
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw, UserCheck2, UserX2 } from "lucide-react";
import { Guest } from "@/types";

interface QRScannerProps {
  onScanSuccess?: (guest: Guest) => void;
}

const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [lastScannedGuest, setLastScannedGuest] = useState<Guest | null>(null);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);

  const startScanning = () => {
    setScanning(true);
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
      if (onScanSuccess) onScanSuccess(guest);
    } else {
      setScanResult("error");
    }
  };

  const resetScan = () => {
    setLastScannedGuest(null);
    setScanResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Skaner QR
        </CardTitle>
        <CardDescription>Zeskanuj kod QR gościa, aby sprawdzić jego dostęp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !lastScannedGuest ? (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              Kliknij przycisk poniżej, aby rozpocząć skanowanie kodu QR
            </p>
            <Button onClick={startScanning}>Rozpocznij skanowanie</Button>
          </div>
        ) : scanning ? (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-primary rounded-lg">
            <div className="relative">
              <QrCode className="h-16 w-16 text-primary mb-4 animate-pulse-slow" />
              <div className="absolute top-0 left-0 right-0 bottom-0 border-t-4 border-primary animate-spin rounded-full" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}></div>
            </div>
            <p className="text-center mb-4">Skanowanie kodu QR...</p>
            <Button variant="outline" onClick={() => setScanning(false)}>Anuluj</Button>
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
                  onClick={resetScan}
                  className="gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Skanuj ponownie
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
