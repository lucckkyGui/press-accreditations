
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest } from '@/types';
import { BulkEmailRequest, EmailDeliveryStats } from '@/types/guest/guest';
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEmailSenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGuests: Guest[];
  eventId: string;
  onEmailSent: () => void;
}

const BulkEmailSender: React.FC<BulkEmailSenderProps> = ({
  open,
  onOpenChange,
  selectedGuests,
  eventId,
  onEmailSent
}) => {
  const [subject, setSubject] = useState('Zaproszenie na wydarzenie');
  const [customMessage, setCustomMessage] = useState('');
  const [templateId, setTemplateId] = useState('default');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [deliveryStats, setDeliveryStats] = useState<EmailDeliveryStats | null>(null);

  const emailTemplates = [
    { id: 'default', name: 'Standardowe zaproszenie', preview: 'Witamy! Zapraszamy na wydarzenie...' },
    { id: 'vip', name: 'Zaproszenie VIP', preview: 'Ekskluzywne zaproszenie dla VIP...' },
    { id: 'press', name: 'Akredytacja prasowa', preview: 'Zaproszenie dla mediów...' },
    { id: 'custom', name: 'Własny szablon', preview: 'Dostosowany szablon...' }
  ];

  const handleSendEmails = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Nie wybrano żadnych gości');
      return;
    }

    setIsSending(true);
    setSendingProgress(0);

    try {
      const emailRequest: BulkEmailRequest = {
        eventId,
        guestIds: selectedGuests.map(g => g.id),
        templateId,
        subject,
        customMessage
      };

      // Symulacja wysyłania (w rzeczywistej aplikacji byłoby to API call)
      const batchSize = 50; // Wysyłamy po 50 emaili na raz
      const totalBatches = Math.ceil(selectedGuests.length / batchSize);

      for (let batch = 0; batch < totalBatches; batch++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja opóźnienia
        
        const progress = ((batch + 1) / totalBatches) * 100;
        setSendingProgress(progress);
      }

      // Symulacja statystyk dostawy
      const stats: EmailDeliveryStats = {
        sent: selectedGuests.length,
        delivered: Math.floor(selectedGuests.length * 0.95), // 95% dostarczonych
        opened: Math.floor(selectedGuests.length * 0.65), // 65% otwartych
        clicked: Math.floor(selectedGuests.length * 0.25), // 25% kliknięć
        failed: Math.floor(selectedGuests.length * 0.02), // 2% niepowodzeń
        bounced: Math.floor(selectedGuests.length * 0.03) // 3% odbić
      };

      setDeliveryStats(stats);
      toast.success(`Wysłano ${selectedGuests.length} zaproszeń!`);
      onEmailSent();

    } catch (error) {
      toast.error('Wystąpił błąd podczas wysyłania zaproszeń');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSubject('Zaproszenie na wydarzenie');
    setCustomMessage('');
    setTemplateId('default');
    setSendingProgress(0);
    setDeliveryStats(null);
    setIsSending(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Wyślij zaproszenia
          </DialogTitle>
          <DialogDescription>
            Wyślij spersonalizowane zaproszenia z unikalnym QR kodem do {selectedGuests.length} wybranych gości
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Podsumowanie odbiorców */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Odbiorcy:</span>
                </div>
                <Badge variant="secondary">
                  {selectedGuests.length} {selectedGuests.length === 1 ? 'gość' : 'gości'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Wybór szablonu */}
          <div className="space-y-2">
            <Label htmlFor="template">Szablon emaila</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz szablon" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.preview}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temat */}
          <div className="space-y-2">
            <Label htmlFor="subject">Temat wiadomości</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Wprowadź temat wiadomości"
            />
          </div>

          {/* Dodatkowa wiadomość */}
          <div className="space-y-2">
            <Label htmlFor="message">Dodatkowa wiadomość (opcjonalnie)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Dodaj własną wiadomość, która zostanie dołączona do zaproszenia..."
              rows={4}
            />
          </div>

          {/* Informacja o QR kodach */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Każde zaproszenie będzie zawierało unikalny QR kod dla danego gościa. 
              QR kod umożliwi szybkie sprawdzenie obecności podczas wydarzenia.
            </AlertDescription>
          </Alert>

          {/* Progress bar podczas wysyłania */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Postęp wysyłania:</span>
                <span className="text-sm font-medium">{Math.round(sendingProgress)}%</span>
              </div>
              <Progress value={sendingProgress} className="w-full" />
            </div>
          )}

          {/* Statystyki dostawy */}
          {deliveryStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Statystyki wysyłki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{deliveryStats.sent}</div>
                    <div className="text-xs text-muted-foreground">Wysłane</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</div>
                    <div className="text-xs text-muted-foreground">Dostarczone</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{deliveryStats.opened}</div>
                    <div className="text-xs text-muted-foreground">Otwarte</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{deliveryStats.clicked}</div>
                    <div className="text-xs text-muted-foreground">Kliknięte</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{deliveryStats.failed}</div>
                    <div className="text-xs text-muted-foreground">Niepowodzenia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{deliveryStats.bounced}</div>
                    <div className="text-xs text-muted-foreground">Odbicia</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Przyciski akcji */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {deliveryStats ? 'Zamknij' : 'Anuluj'}
            </Button>
            {!deliveryStats && (
              <Button
                onClick={handleSendEmails}
                disabled={isSending || !subject.trim() || selectedGuests.length === 0}
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
                    Wyślij zaproszenia
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmailSender;
