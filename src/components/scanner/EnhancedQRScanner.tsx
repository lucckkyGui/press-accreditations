
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, XCircle, Clock, User, MapPin } from 'lucide-react';
import { Guest, Event } from '@/types';
import { toast } from 'sonner';
import CameraPreview from './CameraPreview';

interface EnhancedQRScannerProps {
  event: Event;
  onGuestCheckedIn?: (guest: Guest) => void;
}

interface ScannedGuestData {
  guestId: string;
  eventId: string;
  guestName: string;
  guestEmail: string;
  timestamp: string;
}

interface ScanResult {
  guest: Guest | null;
  status: 'success' | 'invalid' | 'already_checked' | 'wrong_event' | 'expired';
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

  // Symulacja sprawdzenia gościa w bazie danych
  const verifyGuestInDatabase = async (guestData: ScannedGuestData): Promise<Guest | null> => {
    // Tu byłaby prawdziwa integracja z bazą danych
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia API

    // Sprawdź czy event ID się zgadza
    if (guestData.eventId !== event.id) {
      return null;
    }

    // Symulacja sprawdzenia w bazie - zwróć mock guest
    const mockGuest: Guest = {
      id: guestData.guestId,
      firstName: guestData.guestName.split(' ')[0] || 'Jan',
      lastName: guestData.guestName.split(' ')[1] || 'Kowalski',
      email: guestData.guestEmail,
      ticketType: 'uczestnik',
      zones: [],
      status: 'confirmed',
      qrCode: JSON.stringify(guestData),
      company: 'Test Company',
      phone: '+48123456789'
    };

    return mockGuest;
  };

  const handleQrCodeDetected = useCallback(async (qrCode: string) => {
    setScanning(false);
    
    try {
      // Spróbuj zdekodować dane QR
      let guestData: ScannedGuestData;
      try {
        guestData = JSON.parse(qrCode);
      } catch (e) {
        setLastScanResult({
          guest: null,
          status: 'invalid',
          message: 'Nieprawidłowy format kodu QR',
          timestamp: new Date()
        });
        toast.error('Nieprawidłowy format kodu QR');
        return;
      }

      // Sprawdź czy kod zawiera wymagane pola
      if (!guestData.guestId || !guestData.eventId || !guestData.guestName) {
        setLastScanResult({
          guest: null,
          status: 'invalid',
          message: 'Kod QR nie zawiera wymaganych danych',
          timestamp: new Date()
        });
        toast.error('Kod QR nie zawiera wymaganych danych');
        return;
      }

      // Sprawdź czy kod jest dla właściwego wydarzenia
      if (guestData.eventId !== event.id) {
        setLastScanResult({
          guest: null,
          status: 'wrong_event',
          message: 'Kod QR jest dla innego wydarzenia',
          timestamp: new Date()
        });
        toast.error('Kod QR jest dla innego wydarzenia');
        return;
      }

      // Sprawdź gościa w bazie danych
      const guest = await verifyGuestInDatabase(guestData);
      
      if (!guest) {
        setLastScanResult({
          guest: null,
          status: 'invalid',
          message: 'Gość nie znaleziony w bazie danych',
          timestamp: new Date()
        });
        toast.error('Gość nie znaleziony w bazie danych');
        return;
      }

      // Sprawdź czy gość był już zarejestrowany
      if (guest.status === 'checked-in') {
        setLastScanResult({
          guest,
          status: 'already_checked',
          message: 'Gość został już wcześniej zarejestrowany',
          timestamp: new Date()
        });
        toast.warning('Gość został już wcześniej zarejestrowany');
        return;
      }

      // Sprawdź czy wydarzenie nie wygasło
      const now = new Date();
      if (event.endDate && event.endDate < now) {
        setLastScanResult({
          guest,
          status: 'expired',
          message: 'Wydarzenie już się zakończyło',
          timestamp: new Date()
        });
        toast.error('Wydarzenie już się zakończyło');
        return;
      }

      // Sukces - zarejestruj gościa
      const updatedGuest = {
        ...guest,
        status: 'checked-in' as const,
        checkedInAt: new Date()
      };

      setLastScanResult({
        guest: updatedGuest,
        status: 'success',
        message: 'Gość został pomyślnie zarejestrowany',
        timestamp: new Date()
      });

      toast.success(`Zarejestrowano: ${guest.firstName} ${guest.lastName}`);
      
      if (onGuestCheckedIn) {
        onGuestCheckedIn(updatedGuest);
      }

    } catch (error) {
      setLastScanResult({
        guest: null,
        status: 'invalid',
        message: 'Wystąpił błąd podczas przetwarzania kodu',
        timestamp: new Date()
      });
      toast.error('Wystąpił błąd podczas przetwarzania kodu');
    }
  }, [event.id, event.endDate, onGuestCheckedIn]);

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
      case 'already_checked':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Zarejestrowany</Badge>;
      case 'already_checked':
        return <Badge variant="secondary">Już zarejestrowany</Badge>;
      case 'wrong_event':
        return <Badge variant="destructive">Złe wydarzenie</Badge>;
      case 'expired':
        return <Badge variant="destructive">Wygasłe</Badge>;
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
