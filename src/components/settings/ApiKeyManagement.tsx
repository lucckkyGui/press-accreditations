import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPABASE_URL, supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Key, Plus, Trash2, Copy, Globe, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Webhooki usunięte z UI (R2/R3): tabela webhook_subscriptions nie istnieje na bazie,
// a webhook-dispatcher nie jest wpięty w żadne zdarzenie — subskrypcje nigdy by się
// nie odpaliły. Kod dispatchera zostaje w supabase/functions (uśpiony).

function generateApiKey(): string {
  return `pk_${generateSecureToken(32)}`;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSecureToken(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export default function ApiKeyManagement() {
  const queryClient = useQueryClient();
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [keyEventId, setKeyEventId] = useState<string>('all');

  const { data: apiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
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

      const { error } = await supabase.from('api_keys').insert({
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
    onError: (e: any) => toast.error(e.message),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Klucz API usunięty');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka');
  };

  const baseUrl = `${SUPABASE_URL}/functions/v1/public-api`;

  return (
    <Tabs defaultValue="keys" className="space-y-4">
      <TabsList>
        <TabsTrigger value="keys" className="gap-2">
          <Key className="h-4 w-4" /> Klucze API
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
            <DialogContent aria-describedby={undefined}>
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
            {(apiKeys || []).map((key: any) => (
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
