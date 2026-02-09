import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Radio, Ban, Search } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import { rfidService, WristbandAssignment } from '@/services/rfid/rfidService';
import { supabase } from '@/integrations/supabase/client';

const WristbandManagement = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [wristbands, setWristbands] = useState<WristbandAssignment[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRfid, setNewRfid] = useState('');
  const [newGuestId, setNewGuestId] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEvent(data[0].id);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const load = async () => {
      const [wb, g] = await Promise.all([
        rfidService.getWristbands(selectedEvent),
        supabase.from('guests').select('id, first_name, last_name, company').eq('event_id', selectedEvent)
      ]);
      setWristbands(wb);
      setGuests(g.data || []);
    };
    load();
  }, [selectedEvent]);

  const handleAssign = async () => {
    if (!newRfid || !newGuestId) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }
    try {
      await rfidService.assignWristband(selectedEvent, newGuestId, newRfid);
      toast.success('Opaska przypisana');
      setDialogOpen(false);
      setNewRfid('');
      setNewGuestId('');
      const wb = await rfidService.getWristbands(selectedEvent);
      setWristbands(wb);
    } catch (err: any) {
      toast.error('Błąd', { description: err.message });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await rfidService.deactivateWristband(id, 'Dezaktywacja manualna');
      toast.success('Opaska dezaktywowana');
      const wb = await rfidService.getWristbands(selectedEvent);
      setWristbands(wb);
    } catch (err: any) {
      toast.error('Błąd', { description: err.message });
    }
  };

  const assignedGuestIds = new Set(wristbands.map(w => w.guest_id));
  const unassignedGuests = guests.filter(g => !assignedGuestIds.has(g.id));

  const filtered = wristbands.filter(w =>
    !search || w.guest_name?.toLowerCase().includes(search.toLowerCase()) || w.rfid_code.includes(search)
  );

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary" />
              Zarządzanie opaski RFID
            </h1>
            <p className="text-muted-foreground">Przypisuj opaski do gości i zarządzaj dostępem</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Przypisz opaskę</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Przypisz opaskę RFID</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Kod RFID opaski</Label>
                  <Input value={newRfid} onChange={e => setNewRfid(e.target.value)} placeholder="Zeskanuj lub wpisz kod..." />
                </div>
                <div>
                  <Label>Gość</Label>
                  <Select value={newGuestId} onValueChange={setNewGuestId}>
                    <SelectTrigger><SelectValue placeholder="Wybierz gościa" /></SelectTrigger>
                    <SelectContent>
                      {unassignedGuests.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.first_name} {g.last_name} {g.company ? `(${g.company})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssign} className="w-full">Przypisz</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger><SelectValue placeholder="Wybierz wydarzenie" /></SelectTrigger>
            <SelectContent>
              {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Szukaj po nazwie lub kodzie..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{wristbands.length}</p>
            <p className="text-sm text-muted-foreground">Łącznie opasek</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-green-600">{wristbands.filter(w => w.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Aktywne</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-destructive">{wristbands.filter(w => !w.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Dezaktywowane</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Przypisane opaski</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Brak przypisanych opasek. Kliknij "Przypisz opaskę" aby rozpocząć.</p>
              )}
              {filtered.map(w => (
                <div key={w.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Radio className={`h-5 w-5 ${w.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">{w.guest_name}</p>
                      {w.guest_company && <p className="text-xs text-muted-foreground">{w.guest_company}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-sm bg-background px-2 py-1 rounded">{w.rfid_code}</code>
                    <Badge variant={w.is_active ? 'default' : 'secondary'}>
                      {w.is_active ? 'Aktywna' : 'Nieaktywna'}
                    </Badge>
                    {w.is_active && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeactivate(w.id)}>
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default WristbandManagement;
