
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest, Event } from '@/types';
import { Download, FileImage, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface OptimizedInvitationGeneratorProps {
  guests: Guest[];
  event: Event;
  onInvitationsGenerated: (invitations: GeneratedInvitation[]) => void;
}

interface GeneratedInvitation {
  guestId: string;
  guestName: string;
  qrCodeDataUrl: string;
  invitationHtml: string;
}

interface GenerationStats {
  total: number;
  generated: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
}

const OptimizedInvitationGenerator: React.FC<OptimizedInvitationGeneratorProps> = ({
  guests,
  event,
  onInvitationsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<GenerationStats>({
    total: 0,
    generated: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    estimatedTimeRemaining: 0
  });
  
  const [invitationTemplate, setInvitationTemplate] = useState(`
    <div style="max-width: 600px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: Arial, sans-serif;">
      <h1 style="text-align: center; margin-bottom: 30px; font-size: 2.5rem;">Zaproszenie</h1>
      <div style="background: white; color: #333; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #667eea; margin-bottom: 20px;">{{eventName}}</h2>
        <p style="font-size: 1.2rem; margin-bottom: 15px;">Szanowny/a <strong>{{guestName}}</strong>,</p>
        <p style="margin-bottom: 20px;">Mamy przyjemność zaprosić Państwa na wydarzenie:</p>
        <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p><strong>Data:</strong> {{eventDate}}</p>
          <p><strong>Miejsce:</strong> {{eventLocation}}</p>
        </div>
        <p style="margin-bottom: 30px;">Poniżej znajduje się Państwa unikalny kod QR do weryfikacji przy wejściu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="{{qrCodeUrl}}" alt="QR Code" style="width: 200px; height: 200px;" />
        </div>
        <p style="font-size: 0.9rem; color: #666;">Prosimy o przedstawienie tego kodu przy wejściu na wydarzenie.</p>
      </div>
    </div>
  `);

  // Optymalizacja dla dużych grup - większe batche dla >1000 gości
  const getBatchSize = (totalGuests: number) => {
    if (totalGuests > 2000) return 200;
    if (totalGuests > 1000) return 150;
    if (totalGuests > 500) return 100;
    return 50;
  };

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' // Optymalizacja dla szybkości
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const generateInvitation = async (guest: Guest): Promise<GeneratedInvitation> => {
    const qrData = JSON.stringify({
      guestId: guest.id,
      eventId: event.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      timestamp: new Date().toISOString(),
      version: '1.0' // Dla przyszłej kompatybilności
    });

    const qrCodeDataUrl = await generateQRCode(qrData);

    const invitationHtml = invitationTemplate
      .replace(/{{eventName}}/g, event.name)
      .replace(/{{guestName}}/g, `${guest.firstName} ${guest.lastName}`)
      .replace(/{{eventDate}}/g, event.startDate.toLocaleDateString('pl-PL'))
      .replace(/{{eventLocation}}/g, event.location || 'Do ustalenia')
      .replace(/{{qrCodeUrl}}/g, qrCodeDataUrl);

    return {
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      qrCodeDataUrl,
      invitationHtml
    };
  };

  const handleGenerateInvitations = async () => {
    if (guests.length === 0) {
      toast.error('Brak gości do wygenerowania zaproszeń');
      return;
    }

    // Walidacja dla dużych grup
    if (guests.length > 5000) {
      toast.error('Maksymalna liczba gości to 5000. Proszę podzielić na mniejsze grupy.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    const batchSize = getBatchSize(guests.length);
    const totalBatches = Math.ceil(guests.length / batchSize);
    const startTime = Date.now();

    setStats({
      total: guests.length,
      generated: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
      estimatedTimeRemaining: 0
    });

    try {
      const generatedInvitations: GeneratedInvitation[] = [];
      let totalGenerated = 0;
      let totalFailed = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, guests.length);
        const batchGuests = guests.slice(batchStart, batchEnd);

        // Aktualizuj statystyki przed przetwarzaniem batcha
        const elapsed = Date.now() - startTime;
        const avgTimePerBatch = elapsed / (batchIndex + 1);
        const remainingBatches = totalBatches - batchIndex - 1;
        const estimatedTimeRemaining = Math.round((avgTimePerBatch * remainingBatches) / 1000);

        setStats(prev => ({
          ...prev,
          currentBatch: batchIndex + 1,
          estimatedTimeRemaining
        }));

        // Przetwarzaj batch równolegle z ograniczeniem błędów
        const batchPromises = batchGuests.map(async (guest) => {
          try {
            return await generateInvitation(guest);
          } catch (error) {
            console.error(`Błąd generowania zaproszenia dla ${guest.email}:`, error);
            totalFailed++;
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            generatedInvitations.push(result.value);
            totalGenerated++;
          } else {
            totalFailed++;
          }
        });

        // Aktualizuj progress i statystyki
        const newProgress = ((batchIndex + 1) / totalBatches) * 100;
        setProgress(newProgress);
        
        setStats(prev => ({
          ...prev,
          generated: totalGenerated,
          failed: totalFailed
        }));

        // Opóźnienie między batchami aby nie przeciążyć przeglądarki
        if (batchIndex < totalBatches - 1) {
          const delay = guests.length > 1000 ? 150 : 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      onInvitationsGenerated(generatedInvitations);
      
      if (totalFailed === 0) {
        toast.success(`Wygenerowano wszystkie ${totalGenerated} zaproszeń!`);
      } else {
        toast.warning(`Wygenerowano ${totalGenerated} zaproszeń. Błędów: ${totalFailed}`);
      }

    } catch (error) {
      console.error('Error generating invitations:', error);
      toast.error('Wystąpił błąd podczas generowania zaproszeń');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadAllInvitations = () => {
    const zip = new Blob([JSON.stringify({
      event: event.name,
      generated: new Date().toISOString(),
      invitations: []
    })], { type: 'application/json' });
    
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zaproszenia-${event.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Generator Zaproszeń z QR Kodami - Zoptymalizowany
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statystyki i ostrzeżenia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {guests.length}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Goście</div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {getBatchSize(guests.length)}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Batch size</div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.ceil(guests.length / getBatchSize(guests.length))}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Batche</div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-3 py-1">
              ~{Math.round(guests.length * 0.5 / 60)}min
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Est. czas</div>
          </div>
        </div>

        {/* Ostrzeżenia dla dużych grup */}
        {guests.length > 1000 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Duża grupa gości ({guests.length}). Proces może zająć {Math.round(guests.length * 0.5 / 60)} minut. 
              System zoptymalizuje proces używając batchy po {getBatchSize(guests.length)} zaproszeń.
            </AlertDescription>
          </Alert>
        )}

        {/* Szablon zaproszenia */}
        <div className="space-y-2">
          <Label htmlFor="template">Szablon zaproszenia (HTML)</Label>
          <Textarea
            id="template"
            value={invitationTemplate}
            onChange={(e) => setInvitationTemplate(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Progress generowania */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Generowanie batch {stats.currentBatch}/{stats.totalBatches}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{stats.generated}</div>
                <div className="text-xs text-muted-foreground">Wygenerowane</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Błędy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Łącznie</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{stats.estimatedTimeRemaining}s</div>
                <div className="text-xs text-muted-foreground">Pozostało</div>
              </div>
            </div>

            {stats.failed > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Wykryto {stats.failed} błędów podczas generowania. Sprawdź logi konsoli.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleGenerateInvitations}
            disabled={isGenerating || guests.length === 0}
            className="flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isGenerating ? 'Generowanie...' : `Generuj ${guests.length} zaproszeń`}
          </Button>
          
          {guests.length > 500 && (
            <Button variant="outline" onClick={downloadAllInvitations}>
              <Download className="h-4 w-4 mr-2" />
              Pobierz metadane
            </Button>
          )}
        </div>

        {/* Informacje techniczne */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Każdy QR kod zawiera unikalny identyfikator gościa i wydarzenia</p>
          <p>• System automatycznie optymalizuje rozmiar batchy dla wydajności</p>
          <p>• Zalecany maksymalny rozmiar grupy: 5000 gości</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedInvitationGenerator;
