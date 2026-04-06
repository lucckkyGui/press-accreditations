import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, ScanFace, CheckCircle, XCircle, Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface RecognitionResult {
  success: boolean;
  alreadyCheckedIn?: boolean;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    zone: string;
    status: string;
  };
  confidence?: number;
  message: string;
}

export default function FaceRecognitionCheckIn() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [mode, setMode] = useState<'recognize' | 'enroll'>('recognize');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: events } = useQuery({
    queryKey: ['events-face'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      return data || [];
    },
  });

  const { data: guests } = useQuery({
    queryKey: ['guests-face', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data } = await supabase
        .from('guests')
        .select('id, first_name, last_name, face_photo_url' as any)
        .eq('event_id', selectedEventId)
        .order('last_name');
      return (data as any[]) || [];
    },
    enabled: !!selectedEventId,
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsStreaming(true);
      setCapturedImage(null);
      setResult(null);
    } catch {
      toast.error('Nie można uzyskać dostępu do kamery');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsStreaming(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    setResult(null);
  }, []);

  const processImage = async () => {
    if (!capturedImage || !selectedEventId) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('face-recognition', {
        body: {
          action: mode,
          capturedImageBase64: capturedImage,
          eventId: selectedEventId,
          guestId: mode === 'enroll' ? selectedGuestId : undefined,
        },
      });

      if (error) throw error;

      if (mode === 'enroll') {
        toast.success(data.message || 'Zdjęcie zapisane');
        setCapturedImage(null);
      } else {
        setResult(data as RecognitionResult);
        if (data.success && !data.alreadyCheckedIn) {
          toast.success(data.message);
        } else if (data.success && data.alreadyCheckedIn) {
          toast.info(data.message);
        } else {
          toast.error(data.message);
        }
      }
    } catch (e: Error | unknown) {
      toast.error(e.message || 'Błąd rozpoznawania twarzy');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Event & mode selection */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz wydarzenie..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={mode === 'recognize' ? 'default' : 'outline'}
                onClick={() => setMode('recognize')}
                className="flex-1"
              >
                <ScanFace className="h-4 w-4 mr-2" /> Rozpoznaj
              </Button>
              <Button
                variant={mode === 'enroll' ? 'default' : 'outline'}
                onClick={() => setMode('enroll')}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Zapisz twarz
              </Button>
            </div>
          </div>

          {mode === 'enroll' && (
            <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz gościa do enrollmentu..." />
              </SelectTrigger>
              <SelectContent>
                {guests?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.last_name} {g.first_name}
                    {g.face_photo_url && ' ✅'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Camera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5" />
            {mode === 'recognize' ? 'Rozpoznawanie twarzy' : 'Enrollment — zapis zdjęcia'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}

            {!isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanFace className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            {/* Overlay for face guide */}
            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-full" />
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2">
            {!isStreaming && !capturedImage && (
              <Button onClick={startCamera} disabled={!selectedEventId} className="flex-1">
                <Camera className="h-4 w-4 mr-2" /> Uruchom kamerę
              </Button>
            )}

            {isStreaming && !capturedImage && (
              <>
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" /> Zrób zdjęcie
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Zamknij
                </Button>
              </>
            )}

            {capturedImage && (
              <>
                <Button
                  onClick={processImage}
                  disabled={isProcessing || (mode === 'enroll' && !selectedGuestId)}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ScanFace className="h-4 w-4 mr-2" />
                  )}
                  {mode === 'recognize' ? 'Rozpoznaj' : 'Zapisz twarz'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedImage(null);
                    setResult(null);
                    startCamera();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Ponów
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recognition result */}
      {result && (
        <Card className={result.success ? 'border-primary/50' : 'border-destructive/50'}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="h-8 w-8 text-primary shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-lg">{result.message}</p>

                {result.guest && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Gość:</span>{' '}
                      {result.guest.firstName} {result.guest.lastName}
                    </p>
                    {result.guest.company && (
                      <p>
                        <span className="text-muted-foreground">Firma:</span> {result.guest.company}
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Strefa:</span>{' '}
                      <Badge variant="secondary">{result.guest.zone}</Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={result.alreadyCheckedIn ? 'outline' : 'default'}>
                        {result.guest.status}
                      </Badge>
                    </p>
                  </div>
                )}

                {result.confidence !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Pewność dopasowania: {(result.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled guests count */}
      {mode === 'recognize' && guests && (
        <p className="text-sm text-muted-foreground text-center">
          {guests.filter((g) => g.face_photo_url).length} / {guests.length} gości ma zapisane zdjęcie twarzy
        </p>
      )}
    </div>
  );
}
