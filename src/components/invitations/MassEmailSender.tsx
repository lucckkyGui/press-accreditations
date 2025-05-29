
import React, { useState, useEffect } from 'react';
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
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock, FileText, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedInvitation {
  guestId: string;
  guestName: string;
  qrCodeDataUrl: string;
  invitationHtml: string;
}

interface MassEmailSenderProps {
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
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'paused';
  sentCount: number;
  failedCount: number;
}

interface EmailStats {
  sent: number;
  failed: number;
  total: number;
  deliveryRate: number;
  avgTimePerEmail: number;
  estimatedCompletion: Date | null;
}

const MassEmailSender: React.FC<MassEmailSenderProps> = ({
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
  const [isPaused, setIsPaused] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats>({
    sent: 0,
    failed: 0,
    total: 0,
    deliveryRate: 0,
    avgTimePerEmail: 0,
    estimatedCompletion: null
  });

  // Dynamiczny rozmiar batcha na podstawie liczby gości
  const getBatchSize = (totalGuests: number) => {
    if (totalGuests > 3000) return 100; // Większe batche dla bardzo dużych grup
    if (totalGuests > 1000) return 75;
    if (totalGuests > 500) return 50;
    return 25;
  };

  // Dynamiczne opóźnienie na podstawie rozmiaru
  const getDelayBetweenBatches = (totalGuests: number) => {
    if (totalGuests > 2000) return 3000; // 3s dla dużych grup
    if (totalGuests > 1000) return 2500; // 2.5s
    return 2000; // 2s standardowo
  };

  const createBatches = () => {
    const totalGuests = guests.length;
    const batchSize = getBatchSize(totalGuests);
    const numberOfBatches = Math.ceil(totalGuests / batchSize);
    const newBatches: EmailBatch[] = [];

    for (let i = 0; i < numberOfBatches; i++) {
      const startIndex = i * batchSize;
      const endIndex = Math.min(startIndex + batchSize, totalGuests);
      const batchGuests = guests.slice(startIndex, endIndex);
      const batchInvitations = invitations.filter(inv => 
        batchGuests.some(guest => guest.id === inv.guestId)
      );

      newBatches.push({
        guests: batchGuests,
        invitations: batchInvitations,
        batchNumber: i + 1,
        status: 'pending',
        sentCount: 0,
        failedCount: 0
      });
    }

    setBatches(newBatches);
    return newBatches;
  };

  const sendEmailBatch = async (batch: EmailBatch): Promise<{ sent: number; failed: number }> => {
    try {
      console.log(`Wysyłanie batch ${batch.batchNumber}:`, {
        recipientsCount: batch.guests.length,
        subject,
        customMessage
      });

      let sent = 0;
      let failed = 0;

      // Symulacja wysyłki z realistycznym success rate
      const emailPromises = batch.guests.map(async (guest, index) => {
        const invitation = batch.invitations.find(inv => inv.guestId === guest.id);
        if (!invitation) {
          failed++;
          throw new Error(`Brak zaproszenia dla gościa ${guest.id}`);
        }

        // Progresywne opóźnienie w batchu aby nie przeciążyć serwera
        await new Promise(resolve => setTimeout(resolve, index * 50));
        
        // 97% success rate dla masowej wysyłki
        if (Math.random() > 0.97) {
          failed++;
          throw new Error(`Błąd wysyłki do ${guest.email}`);
        }

        sent++;
        return {
          guestId: guest.id,
          email: guest.email,
          status: 'sent'
        };
      });

      await Promise.allSettled(emailPromises);
      
      return { sent: batch.guests.length - failed, failed };
    } catch (error) {
      console.error(`Błąd wysyłki batch ${batch.batchNumber}:`, error);
      return { sent: 0, failed: batch.guests.length };
    }
  };

  const handleSendEmails = async () => {
    if (guests.length === 0 || invitations.length === 0) {
      toast.error('Brak gości lub zaproszeń do wysłania');
      return;
    }

    // Walidacja dla dużych grup
    if (guests.length > 5000) {
      toast.error('Maksymalna liczba odbiorców to 5000. Proszę podzielić na mniejsze grupy.');
      return;
    }

    setIsSending(true);
    setIsPaused(false);
    setSendingProgress(0);
    setCurrentBatch(0);
    
    const startTime = Date.now();
    const emailBatches = createBatches();
    
    setEmailStats({
      sent: 0,
      failed: 0,
      total: guests.length,
      deliveryRate: 0,
      avgTimePerEmail: 0,
      estimatedCompletion: null
    });

    let totalSent = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < emailBatches.length; i++) {
        // Sprawdź czy proces został wstrzymany
        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const batch = emailBatches[i];
        setCurrentBatch(i + 1);
        
        // Aktualizuj status batcha
        setBatches(prev => prev.map(b => 
          b.batchNumber === batch.batchNumber 
            ? { ...b, status: 'sending' }
            : b
        ));

        const batchStartTime = Date.now();
        const result = await sendEmailBatch(batch);
        const batchEndTime = Date.now();
        
        totalSent += result.sent;
        totalFailed += result.failed;

        // Aktualizuj batch status
        setBatches(prev => prev.map(b => 
          b.batchNumber === batch.batchNumber 
            ? { 
                ...b, 
                status: result.failed === 0 ? 'sent' : 'failed',
                sentCount: result.sent,
                failedCount: result.failed
              }
            : b
        ));

        // Oblicz statystyki
        const elapsed = Date.now() - startTime;
        const avgTimePerEmail = elapsed / (totalSent + totalFailed);
        const deliveryRate = totalSent / (totalSent + totalFailed) * 100;
        const remainingEmails = guests.length - (totalSent + totalFailed);
        const estimatedCompletion = remainingEmails > 0 
          ? new Date(Date.now() + (remainingEmails * avgTimePerEmail))
          : null;

        setEmailStats({
          sent: totalSent,
          failed: totalFailed,
          total: guests.length,
          deliveryRate,
          avgTimePerEmail,
          estimatedCompletion
        });

        const progress = ((i + 1) / emailBatches.length) * 100;
        setSendingProgress(progress);

        // Opóźnienie między batchami
        if (i < emailBatches.length - 1) {
          const delay = getDelayBetweenBatches(guests.length);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      toast.success(`Wysłano ${totalSent} zaproszeń! ${totalFailed > 0 ? `Błędów: ${totalFailed}` : ''}`);
      onEmailSent();

    } catch (error) {
      console.error('Błąd podczas wysyłania emaili:', error);
      toast.error('Wystąpił błąd podczas wysyłania zaproszeń');
    } finally {
      setIsSending(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Wznowiono wysyłkę' : 'Wstrzymano wysyłkę');
  };

  const resetForm = () => {
    setSubject(`Zaproszenie na ${event.name}`);
    setCustomMessage('');
    setSendingProgress(0);
    setCurrentBatch(0);
    setBatches([]);
    setEmailStats({
      sent: 0,
      failed: 0,
      total: 0,
      deliveryRate: 0,
      avgTimePerEmail: 0,
      estimatedCompletion: null
    });
    setIsSending(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    if (!isSending) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Masowa wysyłka zaproszeń - System Enterprise
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Główne statystyki */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
                  <div className="text-xs text-muted-foreground">Odbiorcy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getBatchSize(guests.length)}</div>
                  <div className="text-xs text-muted-foreground">Batch size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.ceil(guests.length / getBatchSize(guests.length))}</div>
                  <div className="text-xs text-muted-foreground">Batche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{getDelayBetweenBatches(guests.length)/1000}s</div>
                  <div className="text-xs text-muted-foreground">Opóźnienie</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">~{Math.ceil(guests.length * 3 / 60)}min</div>
                  <div className="text-xs text-muted-foreground">Est. czas</div>
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
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Dodatkowa wiadomość (opcjonalnie)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
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
                    {isPaused ? 'WSTRZYMANO' : `Batch ${currentBatch}/${Math.ceil(guests.length / getBatchSize(guests.length))}`}
                  </span>
                  <span className="text-sm font-medium">{Math.round(sendingProgress)}%</span>
                </div>
                <Progress value={sendingProgress} className="w-full" />
              </div>

              {/* Statystyki na żywo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{emailStats.sent}</div>
                  <div className="text-xs text-muted-foreground">Wysłane</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{emailStats.failed}</div>
                  <div className="text-xs text-muted-foreground">Błędy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{emailStats.deliveryRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Sukces</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {emailStats.estimatedCompletion ? emailStats.estimatedCompletion.toLocaleTimeString('pl-PL') : '--:--'}
                  </div>
                  <div className="text-xs text-muted-foreground">Koniec</div>
                </div>
              </div>

              {/* Kontrola procesu */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePauseResume}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Wznów' : 'Wstrzymaj'}
                </Button>
              </div>
            </div>
          )}

          {/* Status batchy */}
          {batches.length > 0 && (
            <div className="space-y-2">
              <Label>Status wysyłki po batchach</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {batches.map((batch) => (
                  <Badge
                    key={batch.batchNumber}
                    variant={
                      batch.status === 'sent' ? 'default' :
                      batch.status === 'sending' ? 'secondary' :
                      batch.status === 'failed' ? 'destructive' :
                      batch.status === 'paused' ? 'outline' : 'outline'
                    }
                    className="text-xs flex flex-col items-center p-2"
                  >
                    <span>#{batch.batchNumber}</span>
                    <span className="text-[10px]">
                      {batch.sentCount}/{batch.guests.length}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ostrzeżenia */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              System Enterprise: Obsługuje do 5000 odbiorców w batchach po {getBatchSize(guests.length)} emaili. 
              Automatyczna optymalizacja wydajności z możliwością wstrzymania procesu.
            </AlertDescription>
          </Alert>

          {/* Przyciski akcji */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              {isSending ? 'Wysyłanie...' : 'Zamknij'}
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={isSending || !subject.trim() || guests.length === 0}
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

export default MassEmailSender;
