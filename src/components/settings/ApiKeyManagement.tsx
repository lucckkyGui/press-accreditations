import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Key, Plus, Trash2, Copy, Globe, Bell, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const WEBHOOK_EVENT_TYPES = [
  { value: 'guest.checked_in', label: 'Gość zameldowany' },
  { value: 'guest.created', label: 'Nowy gość dodany' },
  { value: 'guest.updated', label: 'Gość zaktualizowany' },
  { value: 'guest.deleted', label: 'Gość usunięty' },
  { value: 'event.updated', label: 'Wydarzenie zaktualizowane' },
];

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pk_';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ApiKeyManagement() {
  const queryClient = useQueryClient();
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newWebhookDialog, setNewWebhookDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [keyEventId, setKeyEventId] = useState<string>('all');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEventId, setWebhookEventId] = useState<string>('all');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['guest.checked_in']);

  const { data: apiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('api_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhook-subscriptions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('webhook_subscriptions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: events } = useQuery({
    queryKey: ['events-for-api'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      return data || [];
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const key = generateApiKey();
      const keyHash = await hashKey(key);
      const prefix = key.substring(0, 8);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase as any).from('api_keys').insert({
        user_id: user.id,
        name: keyName,
        key_hash: keyHash,
        key_prefix: prefix,
        event_id: keyEventId === 'all' ? null : keyEventId,
        permissions: ['read'],
      });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      setGeneratedKey(key);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Klucz API utworzony');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('api_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Klucz API usunięty');
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const secret = generateWebhookSecret();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase as any).from('webhook_subscriptions').insert({
        user_id: user.id,
        url: webhookUrl,
        secret,
        event_id: webhookEventId === 'all' ? null : webhookEventId,
        events: webhookEvents,
      });
      if (error) throw error;
      return secret;
    },
    onSuccess: (secret) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success(`Webhook utworzony. Secret: ${secret}`, { duration: 10000 });
      setNewWebhookDialog(false);
      setWebhookUrl('');
      setWebhookEvents(['guest.checked_in']);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('webhook_subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook usunięty');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka');
  };

  const baseUrl = `https://ajotwgirccdjntuotxzy.supabase.co/functions/v1/public-api`;

  return (
    <Tabs defaultValue="keys" className="space-y-4">
      <TabsList>
        <TabsTrigger value="keys" className="gap-2">
          <Key className="h-4 w-4" /> Klucze API
        </TabsTrigger>
        <TabsTrigger value="webhooks" className="gap-2">
          <Bell className="h-4 w-4" /> Webhooks
        </TabsTrigger>
        <TabsTrigger value="docs" className="gap-2">
          <Globe className="h-4 w-4" /> Dokumentacja
        </TabsTrigger>
      </TabsList>

      {/* API Keys Tab */}
      <TabsContent value="keys" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Klucze API</h3>
            <p className="text-sm text-muted-foreground">Zarządzaj kluczami do publicznego API</p>
          </div>
          <Dialog open={newKeyDialog} onOpenChange={(open) => { setNewKeyDialog(open); if (!open) { setGeneratedKey(null); setKeyName(''); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nowy klucz</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{generatedKey ? 'Klucz wygenerowany' : 'Utwórz klucz API'}</DialogTitle>
              </DialogHeader>
              {generatedKey ? (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-md font-mono text-sm break-all flex items-center gap-2">
                    <span className="flex-1">{generatedKey}</span>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(generatedKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Zapisz ten klucz — nie będzie już widoczny!</span>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => { setNewKeyDialog(false); setGeneratedKey(null); setKeyName(''); }}>Zamknij</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nazwa</Label>
                    <Input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="np. CRM Integration" />
                  </div>
                  <div className="space-y-2">
                    <Label>Wydarzenie (opcjonalnie)</Label>
                    <Select value={keyEventId} onValueChange={setKeyEventId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
                        {events?.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => createKeyMutation.mutate()} disabled={!keyName || createKeyMutation.isPending}>
                      Generuj klucz
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {keysLoading ? (
          <p className="text-muted-foreground">Ładowanie...</p>
        ) : (apiKeys || []).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak kluczy API. Utwórz pierwszy klucz.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(apiKeys || []).map((key: Error) => (
              <Card key={key.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{key.key_prefix}••••••••</p>
                    <p className="text-xs text-muted-foreground">
                      Utworzony: {new Date(key.created_at).toLocaleDateString('pl')}
                      {key.last_used_at && ` · Ostatnio użyty: ${new Date(key.last_used_at).toLocaleDateString('pl')}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteKeyMutation.mutate(key.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Webhooks Tab */}
      <TabsContent value="webhooks" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Webhooks</h3>
            <p className="text-sm text-muted-foreground">Otrzymuj powiadomienia o zdarzeniach w czasie rzeczywistym</p>
          </div>
          <Dialog open={newWebhookDialog} onOpenChange={setNewWebhookDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nowy webhook</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label>Wydarzenie (opcjonalnie)</Label>
                  <Select value={webhookEventId} onValueChange={setWebhookEventId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
                      {events?.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zdarzenia</Label>
                  <div className="space-y-2">
                    {WEBHOOK_EVENT_TYPES.map(evt => (
                      <div key={evt.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={webhookEvents.includes(evt.value)}
                          onCheckedChange={(checked) => {
                            setWebhookEvents(prev =>
                              checked ? [...prev, evt.value] : prev.filter(e => e !== evt.value)
                            );
                          }}
                        />
                        <span className="text-sm">{evt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => createWebhookMutation.mutate()} disabled={!webhookUrl || webhookEvents.length === 0 || createWebhookMutation.isPending}>
                    Utwórz webhook
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {webhooksLoading ? (
          <p className="text-muted-foreground">Ładowanie...</p>
        ) : (webhooks || []).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak webhooków. Dodaj pierwszy webhook.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(webhooks || []).map((wh: Error) => (
              <Card key={wh.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">{wh.url}</span>
                      <Badge variant={wh.is_active ? 'default' : 'destructive'}>
                        {wh.is_active ? 'Aktywny' : 'Wyłączony'}
                      </Badge>
                      {wh.failure_count > 0 && (
                        <Badge variant="outline" className="text-destructive">{wh.failure_count} błędów</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wh.events?.map((evt: string) => (
                        <Badge key={evt} variant="secondary" className="text-xs">{evt}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {wh.last_triggered_at ? `Ostatnio: ${new Date(wh.last_triggered_at).toLocaleString('pl')}` : 'Nigdy nie wywołany'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteWebhookMutation.mutate(wh.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Docs Tab */}
      <TabsContent value="docs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dokumentacja API</CardTitle>
            <CardDescription>Jak korzystać z publicznego API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Base URL</h4>
              <div className="p-3 bg-muted rounded-md font-mono text-sm flex items-center gap-2">
                <span className="flex-1">{baseUrl}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(baseUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Autoryzacja</h4>
              <p className="text-sm text-muted-foreground mb-2">Dodaj nagłówek <code className="bg-muted px-1 rounded">x-api-key</code> do każdego żądania:</p>
              <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto">{`curl ${baseUrl}/events \\
  -H "x-api-key: pk_your_api_key_here"`}</pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Endpointy</h4>
              <div className="space-y-3">
                {[
                  { method: 'GET', path: '/events', desc: 'Lista wydarzeń' },
                  { method: 'GET', path: '/guests?event_id=UUID', desc: 'Lista gości' },
                  { method: 'GET', path: '/stats?event_id=UUID', desc: 'Zagregowane statystyki' },
                  { method: 'GET', path: '/zones?event_id=UUID', desc: 'Obecność w strefach' },
                  { method: 'GET', path: '/access-logs?event_id=UUID', desc: 'Logi dostępu RFID' },
                  { method: 'GET', path: '/emails?event_id=UUID', desc: 'Kampanie email' },
                ].map(ep => (
                  <div key={ep.path} className="flex items-center gap-3 p-2 border rounded-md">
                    <Badge variant="outline" className="font-mono">{ep.method}</Badge>
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-sm text-muted-foreground">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Webhooks</h4>
              <p className="text-sm text-muted-foreground">
                Każdy webhook otrzymuje payload JSON z nagłówkiem <code className="bg-muted px-1 rounded">X-Webhook-Signature</code> (HMAC-SHA256).
                Po 10 kolejnych błędach webhook jest automatycznie wyłączany.
              </p>
              <pre className="p-3 bg-muted rounded-md text-sm mt-2 overflow-x-auto">{`{
  "event": "guest.checked_in",
  "event_id": "uuid",
  "timestamp": "2026-02-10T12:00:00Z",
  "data": { ... }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
