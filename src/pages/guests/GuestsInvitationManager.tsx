import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest, Event } from '@/types';
import { FileImage, Mail, Users, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import InvitationGenerator from '@/components/invitations/InvitationGenerator';
import EnhancedBulkEmailSender from '@/components/invitations/EnhancedBulkEmailSender';
interface GeneratedInvitation {
  guestId: string;
  guestName: string;
  qrCodeDataUrl: string;
  invitationHtml: string;
}

interface GuestsInvitationManagerProps {
  guests: Guest[];
  event: Event;
  onInvitationsSent: () => void;
}

const GuestsInvitationManager: React.FC<GuestsInvitationManagerProps> = ({
  guests,
  event,
  onInvitationsSent
}) => {
  const [generatedInvitations, setGeneratedInvitations] = useState<GeneratedInvitation[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const handleInvitationsGenerated = (invitations: GeneratedInvitation[]) => {
    setGeneratedInvitations(invitations);
    setActiveTab('preview');
    toast.success('Zaproszenia zostały wygenerowane!');
  };

  const handleSendEmails = () => {
    if (generatedInvitations.length === 0) {
      toast.error('Najpierw wygeneruj zaproszenia');
      return;
    }
    setShowEmailDialog(true);
  };

  const handleEmailSent = () => {
    setShowEmailDialog(false);
    onInvitationsSent();
    toast.success('Zaproszenia zostały wysłane!');
  };

  const downloadAllInvitations = () => {
    if (generatedInvitations.length === 0) {
      toast.error('Brak zaproszeń do pobrania');
      return;
    }

    // Generuj plik ZIP z wszystkimi zaproszeniami (symulacja)
    generatedInvitations.forEach((invitation, index) => {
      setTimeout(() => {
        const blob = new Blob([invitation.invitationHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zaproszenie-${invitation.guestName.replace(/\s+/g, '-')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 100); // Opóźnienie aby nie zablokować przeglądarki
    });

    toast.success(`Pobieranie ${generatedInvitations.length} zaproszeń rozpoczęte`);
  };

  const confirmedGuests = guests.filter(g => g.status === 'confirmed');
  const invitedGuests = guests.filter(g => g.status === 'invited');

  return (
    <div className="space-y-6">
      {/* Podsumowanie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manager zaproszeń - {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
              <div className="text-sm text-muted-foreground">Wszyscy goście</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{confirmedGuests.length}</div>
              <div className="text-sm text-muted-foreground">Potwierdzeni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{invitedGuests.length}</div>
              <div className="text-sm text-muted-foreground">Zaproszeni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{generatedInvitations.length}</div>
              <div className="text-sm text-muted-foreground">Wygenerowane</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Główne funkcje */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Generuj
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Podgląd
            {generatedInvitations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {generatedInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Wyślij
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <InvitationGenerator
            guests={guests}
            event={event}
            onInvitationsGenerated={handleInvitationsGenerated}
          />
        </TabsContent>

        <TabsContent value="preview">
          {generatedInvitations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Podgląd wygenerowanych zaproszeń</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">
                    {generatedInvitations.length} zaproszeń gotowych
                  </Badge>
                  <Button onClick={downloadAllInvitations} variant="outline" className="gap-2">
                    <FileImage className="h-4 w-4" />
                    Pobierz wszystkie
                  </Button>
                </div>

                {/* Przykładowy podgląd pierwszego zaproszenia */}
                {generatedInvitations[0] && (
                  <div className="border rounded-lg p-4 bg-muted">
                    <h4 className="font-medium mb-2">Przykład zaproszenia:</h4>
                    <div 
                      className="max-h-96 overflow-y-auto border rounded bg-white p-4"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(generatedInvitations[0].invitationHtml, {
                          ALLOWED_TAGS: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'br', 'span', 'img', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
                          ALLOWED_ATTR: ['class', 'src', 'alt', 'title', 'width', 'height'],
                          ALLOW_DATA_ATTR: false,
                          ALLOW_UNKNOWN_PROTOCOLS: false
                        })
                      }}
                    />
                  </div>
                )}

                {/* Lista wszystkich zaproszeń */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="font-medium">Lista wygenerowanych zaproszeń:</h4>
                  {generatedInvitations.map((invitation, index) => (
                    <div key={invitation.guestId} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{invitation.guestName}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([invitation.invitationHtml], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `zaproszenie-${invitation.guestName.replace(/\s+/g, '-')}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Pobierz
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                Brak wygenerowanych zaproszeń. Przejdź do zakładki "Generuj" aby utworzyć zaproszenia.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Wysyłka zaproszeń</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedInvitations.length > 0 ? (
                <div className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Gotowe do wysłania {generatedInvitations.length} zaproszeń z unikalnym QR kodem dla każdego gościa.
                      System wyśle emaile w batchach po 100 sztuk z 2-sekundowymi przerwami.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={handleSendEmails} className="gap-2">
                      <Mail className="h-4 w-4" />
                      Wyślij wszystkie zaproszenia
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Najpierw wygeneruj zaproszenia w zakładce "Generuj".
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog wysyłki emaili */}
      <EnhancedBulkEmailSender
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        guests={guests}
        invitations={generatedInvitations}
        event={event}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
};

export default GuestsInvitationManager;
