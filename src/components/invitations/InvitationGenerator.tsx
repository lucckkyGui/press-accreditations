
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Guest, Event } from '@/types';
import { FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { qrToDataURL } from '@/utils/qrDataUrl';
import DOMPurify from 'dompurify';

interface InvitationGeneratorProps {
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

const InvitationGenerator: React.FC<InvitationGeneratorProps> = ({
  guests,
  event,
  onInvitationsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (data: string): Promise<string> => {
    return qrToDataURL(data, 200);
  };

  const generateInvitation = async (guest: Guest): Promise<GeneratedInvitation> => {
    // Generuj QR kod z danymi gościa i wydarzenia
    const qrData = JSON.stringify({
      guestId: guest.id,
      eventId: event.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      timestamp: new Date().toISOString()
    });

    const qrCodeDataUrl = await generateQRCode(qrData);

    // Zastąp placeholdery w szablonie - użyj DOMPurify do sanityzacji
    const rawHtml = invitationTemplate
      .replace(/{{eventName}}/g, DOMPurify.sanitize(event.name))
      .replace(/{{guestName}}/g, DOMPurify.sanitize(`${guest.firstName} ${guest.lastName}`))
      .replace(/{{eventDate}}/g, event.startDate.toLocaleDateString('pl-PL'))
      .replace(/{{eventLocation}}/g, DOMPurify.sanitize(event.location || 'Do ustalenia'))
      .replace(/{{qrCodeUrl}}/g, qrCodeDataUrl);

    // Sanityzuj cały HTML aby zapobiec XSS
    const invitationHtml = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['style'],
      ADD_ATTR: ['style']
    });

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

    setIsGenerating(true);
    setProgress(0);

    try {
      const generatedInvitations: GeneratedInvitation[] = [];
      const batchSize = 50; // Przetwarzaj po 50 na raz
      const totalBatches = Math.ceil(guests.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, guests.length);
        const batchGuests = guests.slice(batchStart, batchEnd);

        // Przetwarzaj batch równolegle
        const batchPromises = batchGuests.map(generateInvitation);
        const batchResults = await Promise.all(batchPromises);
        
        generatedInvitations.push(...batchResults);

        // Aktualizuj progress
        const newProgress = ((batchIndex + 1) / totalBatches) * 100;
        setProgress(newProgress);

        // Małe opóźnienie aby nie blokować UI
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onInvitationsGenerated(generatedInvitations);
      toast.success(`Wygenerowano ${generatedInvitations.length} zaproszeń!`);

    } catch (error) {
      toast.error('Wystąpił błąd podczas generowania zaproszeń');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadInvitation = (invitation: GeneratedInvitation) => {
    const blob = new Blob([invitation.invitationHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zaproszenie-${invitation.guestName.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Generator Zaproszeń z QR Kodami
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Badge variant="secondary">
              {guests.length} {guests.length === 1 ? 'gość' : 'gości'}
            </Badge>
          </div>
          <div>
            <Badge variant="outline">
              Wydarzenie: {event.name}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Szablon zaproszenia (HTML)</Label>
          <Textarea
            id="template"
            value={invitationTemplate}
            onChange={(e) => setInvitationTemplate(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="Wprowadź szablon HTML..."
          />
          <p className="text-xs text-muted-foreground">
            Dostępne zmienne: {'{'}{'}'} eventName{'}'}{'}'}, {'{'}{'}'} guestName{'}'}{'}'}, {'{'}{'}'} eventDate{'}'}{'}'}, {'{'}{'}'} eventLocation{'}'}{'}'}, {'{'}{'}'} qrCodeUrl{'}'}{'}'}
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Generowanie zaproszeń:</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateInvitations}
            disabled={isGenerating || guests.length === 0}
            className="flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isGenerating ? 'Generowanie...' : 'Generuj zaproszenia'}
          </Button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default InvitationGenerator;
