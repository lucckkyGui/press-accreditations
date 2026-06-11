
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest, Event } from '@/types';
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedInvitation {
  guestId: string;
  guestName: string;
  qrCodeDataUrl: string;
  invitationHtml: string;
}

interface EnhancedBulkEmailSenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  invitations: GeneratedInvitation[];
  event: Event;
  onEmailSent: () => void;
}

interface EmailBatch {
  guests: Guest[];
  invitations: GeneratedInvitation[];
  batchNumber: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
}

const EnhancedBulkEmailSender: React.FC<EnhancedBulkEmailSenderProps> = ({
  open,
  onOpenChange,
  guests,
  invitations,
  event,
  onEmailSent
}) => {
  const [subject, setSubject] = useState(`Zaproszenie na ${event.name}`);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [emailStats, setEmailStats] = useState({
    sent: 0,
    failed: 0,
    total: 0
  });

  const BATCH_SIZE = 100; // Wysyłaj po 100 emaili na raz
  const DELAY_BETWEEN_BATCHES = 2000; // 2 sekundy przerwy między batchami

  const createBatches = () => {
    const totalGuests = guests.length;
    const numberOfBatches = Math.ceil(totalGuests / BATCH_SIZE);
    const newBatches: EmailBatch[] = [];

    for (let i = 0; i < numberOfBatches; i++) {
      const startIndex = i * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, totalGuests);
      const batchGuests = guests.slice(startIndex, endIndex);
      const batchInvitations = invitations.filter(inv => 
        batchGuests.some(guest => guest.id === inv.guestId)
      );

      newBatches.push({
        guests: batchGuests,
        invitations: batchInvitations,
        batchNumber: i + 1,
        status: 'pending'
      });
    }

    setBatches(newBatches);
    return newBatches;
  };

  // Realna wysyłka przez edge fn send-guest-invitation (Resend, wynik per gość).
  // Zwraca uczciwe liczniki z payloadu — nie sam status HTTP.
  const sendEmailBatch = async (batch: EmailBatch): Promise<{ sent: number; failed: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-guest-invitation', {
        body: {
          event_id: event.id,
          guest_ids: batch.guests.map((g) => g.id),
          subject,
          custom_message: customMessage || null,
        },
      });
      if (error) return { sent: 0, failed: batch.guests.length };
      const resp = data as { success?: boolean; error?: string; sent?: number; failed?: number } | null;
      if (!resp || (resp.success === false && (resp.sent ?? 0) === 0)) {
        if (resp?.error) toast.error(`Wysyłka niemożliwa: ${resp.error}`);
        return { sent: 0, failed: batch.guests.length };
      }
      return { sent: resp.sent ?? 0, failed: resp.failed ?? 0 };
    } catch {
      return { sent: 0, failed: batch.guests.length };
    }
  };

  const handleSendEmails = async () => {
    if (guests.length === 0 || invitations.length === 0) {
      toast.error('Brak gości lub zaproszeń do wysłania');
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setCurrentBatch(0);
    setEmailStats({ sent: 0, failed: 0, total: guests.length });

    const emailBatches = createBatches();
    let totalSent = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < emailBatches.length; i++) {
        const batch = emailBatches[i];
        setCurrentBatch(i + 1);
        
        // Aktualizuj status batcha
        setBatches(prev => prev.map(b => 
          b.batchNumber === batch.batchNumber 
            ? { ...b, status: 'sending' }
            : b
        ));

        const result = await sendEmailBatch(batch);
        totalSent += result.sent;
        totalFailed += result.failed;
        setBatches(prev => prev.map(b =>
          b.batchNumber === batch.batchNumber
            ? { ...b, status: result.failed === 0 ? 'sent' : 'failed' }
            : b
        ));

        // Aktualizuj statystyki i progress
        setEmailStats({
          sent: totalSent,
          failed: totalFailed,
          total: guests.length
        });

        const progress = ((i + 1) / emailBatches.length) * 100;
        setSendingProgress(progress);

        // Przerwa między batchami (poza ostatnim)
        if (i < emailBatches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      if (totalSent === 0) {
        toast.error(`Nie wysłano żadnego zaproszenia (błędów: ${totalFailed})`);
      } else if (totalFailed > 0) {
        toast.warning(`Wysłano ${totalSent}, nieudane: ${totalFailed}`);
      } else {
        toast.success(`Wysłano ${totalSent} zaproszeń`);
      }
      if (totalSent > 0) onEmailSent();

    } catch (error) {
      toast.error('Wystąpił błąd podczas wysyłania zaproszeń');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSubject(`Zaproszenie na ${event.name}`);
    setCustomMessage('');
    setSendingProgress(0);
    setCurrentBatch(0);
    setBatches([]);
    setEmailStats({ sent: 0, failed: 0, total: 0 });
    setIsSending(false);
  };

  const handleClose = () => {
    if (!isSending) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Wysyłka zaproszeń z QR kodami
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Podsumowanie */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
                  <div className="text-xs text-muted-foreground">Odbiorcy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{invitations.length}</div>
                  <div className="text-xs text-muted-foreground">Zaproszenia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.ceil(guests.length / BATCH_SIZE)}</div>
                  <div className="text-xs text-muted-foreground">Batche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{BATCH_SIZE}</div>
                  <div className="text-xs text-muted-foreground">Na batch</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Konfiguracja emaila */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Temat wiadomości</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Wprowadź temat wiadomości"
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Dodatkowa wiadomość (opcjonalnie)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Dodaj własną wiadomość..."
                rows={3}
                disabled={isSending}
              />
            </div>
          </div>

          {/* Progress wysyłania */}
          {isSending && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Wysyłanie batch {currentBatch} z {Math.ceil(guests.length / BATCH_SIZE)}
                  </span>
                  <span className="text-sm font-medium">{Math.round(sendingProgress)}%</span>
                </div>
                <Progress value={sendingProgress} className="w-full" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{emailStats.sent}</div>
                  <div className="text-xs text-muted-foreground">Wysłane</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{emailStats.failed}</div>
                  <div className="text-xs text-muted-foreground">Błędy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{emailStats.total}</div>
                  <div className="text-xs text-muted-foreground">Łącznie</div>
                </div>
              </div>
            </div>
          )}

          {/* Status batchy */}
          {batches.length > 0 && (
            <div className="space-y-2">
              <Label>Status wysyłki po batchach</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {batches.map((batch) => (
                  <Badge
                    key={batch.batchNumber}
                    variant={
                      batch.status === 'sent' ? 'default' :
                      batch.status === 'sending' ? 'secondary' :
                      batch.status === 'failed' ? 'destructive' : 'outline'
                    }
                    className="text-xs"
                  >
                    #{batch.batchNumber} ({batch.guests.length})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Informacja o QR kodach */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Każde zaproszenie zawiera unikalny QR kod dla danego gościa. 
              System obsługuje masową wysyłkę w batchach po {BATCH_SIZE} emaili z opóźnieniem {DELAY_BETWEEN_BATCHES/1000}s między batchami.
            </AlertDescription>
          </Alert>

          {/* Przyciski akcji */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              {isSending ? 'Wysyłanie...' : 'Zamknij'}
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={isSending || !subject.trim() || guests.length === 0 || invitations.length === 0}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Wyślij {guests.length} zaproszeń
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBulkEmailSender;
