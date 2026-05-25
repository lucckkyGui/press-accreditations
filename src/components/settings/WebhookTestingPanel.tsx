import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, CheckCircle, XCircle, Loader2, Clock, Globe } from 'lucide-react';

interface WebhookTestResult {
  status: number;
  duration: number;
  body: string;
  success: boolean;
  timestamp: string;
}

const WebhookTestingPanel: React.FC = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState(JSON.stringify({
    event: 'guest.checked_in',
    data: {
      guest_id: 'test-uuid',
      event_id: 'test-event-uuid',
      name: 'Jan Kowalski',
      checked_in_at: new Date().toISOString(),
    }
  }, null, 2));
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<WebhookTestResult[]>([]);

  const handleTest = async () => {
    if (!url) {
      toast.error('Podaj URL webhooka');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Nieprawidłowy URL');
      return;
    }

    setTesting(true);
    const start = performance.now();

    try {
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        toast.error('Nieprawidłowy JSON w payload');
        setTesting(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify(parsedPayload) : undefined,
      });

      const duration = Math.round(performance.now() - start);
      let body = '';
      try {
        body = await response.text();
      } catch {
        body = '[nie można odczytać odpowiedzi]';
      }

      const result: WebhookTestResult = {
        status: response.status,
        duration,
        body: body.slice(0, 500),
        success: response.ok,
        timestamp: new Date().toLocaleTimeString('pl-PL'),
      };

      setResults(prev => [result, ...prev.slice(0, 9)]);
      toast.success(`Webhook odpowiedział: ${response.status} (${duration}ms)`);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setResults(prev => [{
        status: 0,
        duration,
        body: `Błąd: ${errMsg}`,
        success: false,
        timestamp: new Date().toLocaleTimeString('pl-PL'),
      }, ...prev.slice(0, 9)]);
      toast.error(`Webhook niedostępny: ${errMsg}`);
    } finally {
      setTesting(false);
    }
  };

  const eventTemplates = [
    { label: 'guest.checked_in', payload: { event: 'guest.checked_in', data: { guest_id: 'uuid', name: 'Jan Kowalski' } } },
    { label: 'guest.created', payload: { event: 'guest.created', data: { guest_id: 'uuid', email: 'jan@test.pl' } } },
    { label: 'event.updated', payload: { event: 'event.updated', data: { event_id: 'uuid', title: 'Testowe Wydarzenie' } } },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Testowanie Webhooków
        </CardTitle>
        <CardDescription>
          Wyślij testowy payload do zewnętrznego endpointu i sprawdź odpowiedź
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="https://example.com/webhook"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">Wyślij</span>
          </Button>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Szablony zdarzeń</Label>
          <div className="flex flex-wrap gap-1.5">
            {eventTemplates.map(t => (
              <Button
                key={t.label}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPayload(JSON.stringify(t.payload, null, 2))}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Payload (JSON)</Label>
          <Textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            className="font-mono text-xs min-h-[120px]"
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Historia testów</Label>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded border bg-muted/30">
                  {r.success ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <Badge variant={r.success ? 'default' : 'destructive'} className="text-[10px]">
                    {r.status || 'ERR'}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> {r.duration}ms
                  </span>
                  <span className="text-muted-foreground truncate flex-1">{r.body.slice(0, 60)}</span>
                  <span className="text-muted-foreground shrink-0">{r.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookTestingPanel;
