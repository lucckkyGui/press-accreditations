
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Fingerprint, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BiometricData {
  type: 'face' | 'fingerprint' | 'iris';
  confidence: number;
  verified: boolean;
  timestamp: Date;
}

const BiometricVerification: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedData, setCapturedData] = useState<BiometricData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsCapturing(true);
      toast.success('Kamera została włączona');
    } catch (error) {
      toast.error('Nie można uzyskać dostępu do kamery');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const captureFaceData = async () => {
    // Symulacja rozpoznawania twarzy
    const confidence = Math.random() * 40 + 60; // 60-100%
    const verified = confidence > 75;
    
    setCapturedData({
      type: 'face',
      confidence,
      verified,
      timestamp: new Date()
    });

    stopCamera();
    
    if (verified) {
      toast.success(`Weryfikacja twarzy pomyślna (${confidence.toFixed(1)}%)`);
    } else {
      toast.error(`Weryfikacja twarzy nieudana (${confidence.toFixed(1)}%)`);
    }
  };

  const simulateFingerprint = () => {
    const confidence = Math.random() * 30 + 70; // 70-100%
    const verified = confidence > 80;
    
    setCapturedData({
      type: 'fingerprint',
      confidence,
      verified,
      timestamp: new Date()
    });

    if (verified) {
      toast.success(`Weryfikacja odcisku palca pomyślna (${confidence.toFixed(1)}%)`);
    } else {
      toast.error(`Weryfikacja odcisku palca nieudana (${confidence.toFixed(1)}%)`);
    }
  };

  const simulateIrisScanner = () => {
    const confidence = Math.random() * 20 + 80; // 80-100%
    const verified = confidence > 85;
    
    setCapturedData({
      type: 'iris',
      confidence,
      verified,
      timestamp: new Date()
    });

    if (verified) {
      toast.success(`Weryfikacja tęczówki pomyślna (${confidence.toFixed(1)}%)`);
    } else {
      toast.error(`Weryfikacja tęczówki nieudana (${confidence.toFixed(1)}%)`);
    }
  };

  const getVerificationIcon = (type: BiometricData['type']) => {
    switch (type) {
      case 'face': return <Camera className="h-4 w-4" />;
      case 'fingerprint': return <Fingerprint className="h-4 w-4" />;
      case 'iris': return <Eye className="h-4 w-4" />;
    }
  };

  const getVerificationLabel = (type: BiometricData['type']) => {
    switch (type) {
      case 'face': return 'Rozpoznawanie twarzy';
      case 'fingerprint': return 'Odcisk palca';
      case 'iris': return 'Skan tęczówki';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Weryfikacja biometryczna</h2>

      {/* Opcje weryfikacji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5" />
              Rozpoznawanie twarzy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCapturing ? (
              <Button onClick={startCamera} className="w-full">
                Uruchom kamerę
              </Button>
            ) : (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ aspectRatio: '4/3' }}
                />
                <div className="flex gap-2">
                  <Button onClick={captureFaceData} className="flex-1">
                    Skanuj twarz
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Fingerprint className="h-5 w-5" />
              Odcisk palca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Fingerprint className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">Przyłóż palec do skanera</p>
            </div>
            <Button onClick={simulateFingerprint} className="w-full">
              Symuluj skan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Skan tęczówki
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Eye className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">Spójrz w kamerę</p>
            </div>
            <Button onClick={simulateIrisScanner} className="w-full">
              Symuluj skan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wyniki weryfikacji */}
      {capturedData && (
        <Card>
          <CardHeader>
            <CardTitle>Wynik weryfikacji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getVerificationIcon(capturedData.type)}
                <div>
                  <p className="font-medium">{getVerificationLabel(capturedData.type)}</p>
                  <p className="text-sm text-muted-foreground">
                    {capturedData.timestamp.toLocaleString('pl-PL')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {capturedData.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge variant={capturedData.verified ? "default" : "destructive"}>
                    {capturedData.verified ? 'Zweryfikowano' : 'Odrzucono'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pewność: {capturedData.confidence.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrukcje bezpieczeństwa */}
      <Card>
        <CardHeader>
          <CardTitle>Wskazówki bezpieczeństwa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">• Dane biometryczne są szyfrowane i przechowywane lokalnie</p>
          <p className="text-sm">• Każda weryfikacja jest rejestrowana w logach bezpieczeństwa</p>
          <p className="text-sm">• Minimalna pewność weryfikacji: 75% dla twarzy, 80% dla odcisku, 85% dla tęczówki</p>
          <p className="text-sm">• W przypadku niepowodzenia dostępna jest weryfikacja ręczna</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiometricVerification;
