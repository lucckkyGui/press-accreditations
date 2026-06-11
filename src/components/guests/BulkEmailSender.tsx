
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEmailSenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGuests: Guest[];
  eventId: string;
  onEmailSent: () => void;
}

// Kształt UCZCIWEJ odpowiedzi edge function send-guest-invitation (per gość + podsumowanie).
interface GuestInviteResult {
  guest_id: string;
  email: string | null;
  ok: boolean;
  status_code?: number;
  detail?: string;
}

interface SendInvitationResponse {
  success: boolean;
  error?: string;
  sent: number;
  failed: number;
  results: GuestInviteResult[];
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
  const [result, setResult] = useState<SendInvitationResponse | null>(null);

  // D3 (known-limitation): selektor zostaje w UI, ale serwer na razie używa jednego
  // wbudowanego szablonu — template_id jest przekazywany, lecz ignorowany.
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
    if (!eventId) {
      toast.error('Brak wydarzenia — nie można wysłać zaproszeń');
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-guest-invitation', {
        body: {
          event_id: eventId,
          guest_ids: selectedGuests.map((g) => g.id),
          subject,
          custom_message: customMessage,
          template_id: templateId,
        },
      });
      if (error) throw error;

      const resp = data as SendInvitationResponse;
      setResult(resp);

      // Funkcja może zwrócić 200 z success=false (np. brak RESEND_API_KEY) —
      // sent=0 i failed=0 NIE jest wtedy sukcesem.
      if (resp.success === false && resp.sent === 0) {
        toast.error(`Wysyłka niemożliwa: ${resp.error ?? "błąd konfiguracji"}`);
      } else if (resp.failed === 0) {
        toast.success(`Wysłano ${resp.sent} ${resp.sent === 1 ? 'zaproszenie' : 'zaproszeń'}`);
      } else if (resp.sent === 0) {
        toast.error(`Nie wysłano żadnego zaproszenia (${resp.failed} ${resp.failed === 1 ? 'błąd' : 'błędów'})`);
      } else {
        toast.warning(`Wysłano ${resp.sent}, nieudane: ${resp.failed}`);
      }

      onEmailSent();
    } catch (error) {
      toast.error(`Błąd wysyłki zaproszeń: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSubject('Zaproszenie na wydarzenie');
    setCustomMessage('');
    setTemplateId('default');
    setResult(null);
    setIsSending(false);
  };

  const handleClose = () => {
    if (isSending) return;
    resetForm();
    onOpenChange(false);
  };

  const failures = result?.results.filter((r) => !r.ok) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Wyślij zaproszenia
          </DialogTitle>
          <DialogDescription>
            Wyślij spersonalizowane zaproszenia z unikalnym QR pass do {selectedGuests.length} wybranych gości
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

          {/* Informacja o QR pass */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Każde zaproszenie zawiera link do personalnego QR pass gościa.
              QR umożliwia szybkie sprawdzenie obecności podczas wydarzenia.
            </AlertDescription>
          </Alert>

          {/* Wynik wysyłki (REALNY — z odpowiedzi funkcji) */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {result.failed === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Wynik wysyłki
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.sent}</div>
                    <div className="text-xs text-muted-foreground">Wysłane</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                    <div className="text-xs text-muted-foreground">Nieudane</div>
                  </div>
                </div>

                {failures.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Nieudane wysyłki</Label>
                    {failures.map((f) => (
                      <div
                        key={f.guest_id}
                        className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2 text-xs"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-medium break-all">{f.email ?? '(brak e-maila)'}</div>
                          <div className="text-muted-foreground break-words">
                            {f.status_code ? `HTTP ${f.status_code}: ` : ''}{f.detail ?? 'Nieznany błąd'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Przyciski akcji */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              {result ? 'Zamknij' : 'Anuluj'}
            </Button>
            {!result && (
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
