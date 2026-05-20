
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { QrCode, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { Guest, Event } from '@/types';
import { toast } from 'sonner';
import CameraPreview from './CameraPreview';
import { guestScannerService, QrCheckInStatus } from '@/services/scanner/guestScannerService';

interface EnhancedQRScannerProps {
  event: Event;
  onGuestCheckedIn?: (guest: Guest) => void;
}

interface ScanResult {
  guest: Guest | null;
  status: QrCheckInStatus;
  message: string;
  timestamp: Date;
}

const EnhancedQRScanner: React.FC<EnhancedQRScannerProps> = ({
  event,
  onGuestCheckedIn
}) => {
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleQrCodeDetected = useCallback(async (qrCode: string) => {
    setScanning(false);
    
    try {
      const result = await guestScannerService.verifyAndCheckIn(qrCode, event.id);

      setLastScanResult({
        guest: result.guest || null,
        status: result.status,
        message: result.message,
        timestamp: new Date(),
      });

      if (result.success && result.guest) {
        toast.success(`Zarejestrowano: ${result.guest.firstName} ${result.guest.lastName}`);
        onGuestCheckedIn?.(result.guest);
        return;
      }

      if (result.status === 'duplicate') {
        toast.warning(result.message);
        return;
      }

      toast.error(result.message);
    } catch (error) {
      setLastScanResult({
        guest: null,
        status: 'invalid',
        message: 'Wystąpił błąd podczas przetwarzania kodu',
        timestamp: new Date()
      });
      toast.error('Wystąpił błąd podczas przetwarzania kodu');
    }
  }, [event.id, onGuestCheckedIn]);

  // Dodaj wynik do historii
  React.useEffect(() => {
    if (lastScanResult) {
      setScanHistory(prev => [lastScanResult, ...prev.slice(0, 9)]); // Zachowaj ostatnie 10
    }
  }, [lastScanResult]);

  const startScanning = () => {
    setScanning(true);
    setCameraActive(true);
    setLastScanResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
    setCameraActive(false);
  };

  const getStatusIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'duplicate':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Zarejestrowany</Badge>;
      case 'duplicate':
        return <Badge variant="secondary">Już zarejestrowany</Badge>;
      case 'wrong_event':
        return <Badge variant="destructive">Złe wydarzenie</Badge>;
      case 'expired':
        return <Badge variant="destructive">Wygasłe</Badge>;
      case 'unauthorized':
        return <Badge variant="destructive">Brak uprawnień</Badge>;
      default:
        return <Badge variant="destructive">Błąd</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Skaner QR - {event.name}
          </CardTitle>
          <CardDescription>
            Skanuj kody QR gości aby zarejestrować ich obecność na wydarzeniu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informacje o wydarzeniu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.location || 'Brak lokalizacji'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {event.startDate.toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>

          {/* Kamera/Scanner */}
          {!scanning && !lastScanResult ? (
            <div className="text-center py-8">
              <Button onClick={startScanning} size="lg" className="gap-2">
                <QrCode className="h-5 w-5" />
                Rozpocznij skanowanie
              </Button>
            </div>
          ) : scanning ? (
            <div className="space-y-4">
              <CameraPreview
                scanning={scanning}
                cameraActive={cameraActive}
                onStartScanning={startScanning}
                onStopScanning={stopScanning}
                onQrCodeDetected={handleQrCodeDetected}
              />
              <div className="text-center">
                <Button variant="outline" onClick={stopScanning}>
                  Zatrzymaj skanowanie
                </Button>
              </div>
            </div>
          ) : null}

          {/* Wynik ostatniego skanu */}
          {lastScanResult && (
            <Alert className={lastScanResult.status === 'success' ? 'border-green-500' : 'border-red-500'}>
              <div className="flex items-start gap-3">
                {getStatusIcon(lastScanResult.status)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lastScanResult.message}</span>
                    {getStatusBadge(lastScanResult.status)}
                  </div>
                  {lastScanResult.guest && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Imię: </span>
                        {lastScanResult.guest.firstName} {lastScanResult.guest.lastName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        {lastScanResult.guest.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Strefa: </span>
                        <Badge variant="outline">{lastScanResult.guest.ticketType}</Badge>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {lastScanResult.timestamp.toLocaleTimeString('pl-PL')}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {/* Przycisk kontynuacji */}
          {lastScanResult && (
            <div className="text-center">
              <Button onClick={startScanning} className="gap-2">
                <QrCode className="h-4 w-4" />
                Skanuj kolejny kod
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historia skanów */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historia skanów</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {scanHistory.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium text-sm">
                        {result.guest ? `${result.guest.firstName} ${result.guest.lastName}` : 'Nieznany gość'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString('pl-PL')}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedQRScanner;
