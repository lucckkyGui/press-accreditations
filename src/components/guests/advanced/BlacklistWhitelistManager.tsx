
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface ListEntry {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  reason: string;
  addedBy: string;
  addedAt: Date;
  expiresAt?: Date;
}

const BlacklistWhitelistManager: React.FC = () => {
  const [blacklist, setBlacklist] = useState<ListEntry[]>([
    {
      id: '1',
      guestId: 'guest-123',
      guestName: 'Jan Kowalski',
      guestEmail: 'jan@example.com',
      reason: 'Naruszenie regulaminu podczas poprzedniego wydarzenia',
      addedBy: 'admin@example.com',
      addedAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-12-31')
    }
  ]);

  const [whitelist, setWhitelist] = useState<ListEntry[]>([
    {
      id: '1',
      guestId: 'guest-456',
      guestName: 'Anna Nowak',
      guestEmail: 'anna@example.com',
      reason: 'Stały współpracownik - priorytetowy dostęp',
      addedBy: 'admin@example.com',
      addedAt: new Date('2024-01-10')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState<'blacklist' | 'whitelist' | null>(null);
  const [newEntry, setNewEntry] = useState({
    guestName: '',
    guestEmail: '',
    reason: '',
    expiresAt: ''
  });

  const handleAddToList = (listType: 'blacklist' | 'whitelist') => {
    if (!newEntry.guestName || !newEntry.guestEmail || !newEntry.reason) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    const entry: ListEntry = {
      id: Date.now().toString(),
      guestId: `guest-${Date.now()}`,
      guestName: newEntry.guestName,
      guestEmail: newEntry.guestEmail,
      reason: newEntry.reason,
      addedBy: 'current-user@example.com',
      addedAt: new Date(),
      expiresAt: newEntry.expiresAt ? new Date(newEntry.expiresAt) : undefined
    };

    if (listType === 'blacklist') {
      setBlacklist([...blacklist, entry]);
      toast.success('Dodano do czarnej listy');
    } else {
      setWhitelist([...whitelist, entry]);
      toast.success('Dodano do białej listy');
    }

    setNewEntry({ guestName: '', guestEmail: '', reason: '', expiresAt: '' });
    setShowAddForm(null);
  };

  const handleRemoveFromList = (id: string, listType: 'blacklist' | 'whitelist') => {
    if (listType === 'blacklist') {
      setBlacklist(blacklist.filter(entry => entry.id !== id));
      toast.success('Usunięto z czarnej listy');
    } else {
      setWhitelist(whitelist.filter(entry => entry.id !== id));
      toast.success('Usunięto z białej listy');
    }
  };

  const filterEntries = (entries: ListEntry[]) => {
    return entries.filter(entry =>
      entry.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const ListCard: React.FC<{ 
    entry: ListEntry; 
    listType: 'blacklist' | 'whitelist';
    onRemove: () => void;
  }> = ({ entry, listType, onRemove }) => (
    <Card className={`border-l-4 ${listType === 'blacklist' ? 'border-l-red-500' : 'border-l-green-500'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{entry.guestName}</h4>
              {listType === 'blacklist' ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Blacklisted
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Whitelisted
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{entry.guestEmail}</p>
            <p className="text-sm mb-2">{entry.reason}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Dodano: {entry.addedAt.toLocaleDateString('pl-PL')}</span>
              {entry.expiresAt && (
                <span>Wygasa: {entry.expiresAt.toLocaleDateString('pl-PL')}</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blacklista / Whitelist</h2>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setShowAddForm('blacklist')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj do blacklisty
          </Button>
          <Button 
            variant="default"
            onClick={() => setShowAddForm('whitelist')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj do whitelisty
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Szukaj po nazwisku, emailu lub powodzie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {showAddForm && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>
              Dodaj do {showAddForm === 'blacklist' ? 'czarnej' : 'białej'} listy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Imię i nazwisko"
                value={newEntry.guestName}
                onChange={(e) => setNewEntry({ ...newEntry, guestName: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newEntry.guestEmail}
                onChange={(e) => setNewEntry({ ...newEntry, guestEmail: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Powód dodania do listy"
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Data wygaśnięcia (opcjonalna)"
              value={newEntry.expiresAt}
              onChange={(e) => setNewEntry({ ...newEntry, expiresAt: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={() => handleAddToList(showAddForm)} className="flex-1">
                Dodaj
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(null)}>
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="blacklist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blacklist" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Blacklista ({filterEntries(blacklist).length})
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Whitelist ({filterEntries(whitelist).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blacklist" className="space-y-4">
          {filterEntries(blacklist).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Brak wpisów na czarnej liście</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filterEntries(blacklist).map((entry) => (
                <ListCard
                  key={entry.id}
                  entry={entry}
                  listType="blacklist"
                  onRemove={() => handleRemoveFromList(entry.id, 'blacklist')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-4">
          {filterEntries(whitelist).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Brak wpisów na białej liście</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filterEntries(whitelist).map((entry) => (
                <ListCard
                  key={entry.id}
                  entry={entry}
                  listType="whitelist"
                  onRemove={() => handleRemoveFromList(entry.id, 'whitelist')}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlacklistWhitelistManager;
