
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Users, Shield, Settings } from 'lucide-react';
import { AccessZone, TimeRestriction } from '@/types/zones';
import { toast } from 'sonner';

const ZoneManagement: React.FC = () => {
  const [zones, setZones] = useState<AccessZone[]>([
    {
      id: 'vip',
      name: 'VIP',
      description: 'Strefa dla VIP-ów z pełnym dostępem',
      color: '#FFD700',
      permissions: [
        { action: 'enter', allowed: true },
        { action: 'access_vip', allowed: true },
        { action: 'access_backstage', allowed: true }
      ],
      capacity: 50
    },
    {
      id: 'press',
      name: 'Prasa',
      description: 'Strefa dla przedstawicieli mediów',
      color: '#4A90E2',
      permissions: [
        { action: 'enter', allowed: true },
        { action: 'access_media', allowed: true }
      ],
      timeRestrictions: [
        {
          id: 'press-hours',
          startTime: '08:00',
          endTime: '20:00',
          days: [1, 2, 3, 4, 5],
          description: 'Dostęp w godzinach roboczych'
        }
      ],
      capacity: 100
    },
    {
      id: 'general',
      name: 'General',
      description: 'Standardowa strefa dla wszystkich gości',
      color: '#28A745',
      permissions: [
        { action: 'enter', allowed: true }
      ]
    }
  ]);

  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState<Partial<AccessZone>>({
    name: '',
    description: '',
    color: '#6366F1',
    permissions: []
  });

  const handleAddZone = () => {
    if (!newZone.name || !newZone.description) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    const zone: AccessZone = {
      id: newZone.name.toLowerCase().replace(/\s+/g, '-'),
      name: newZone.name,
      description: newZone.description,
      color: newZone.color || '#6366F1',
      permissions: newZone.permissions || []
    };

    setZones([...zones, zone]);
    setNewZone({ name: '', description: '', color: '#6366F1', permissions: [] });
    setShowAddZone(false);
    toast.success('Dodano nową strefę dostępu');
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    toast.success('Usunięto strefę dostępu');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie strefami dostępu</h2>
        <Button onClick={() => setShowAddZone(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj strefę
        </Button>
      </div>

      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones">Strefy</TabsTrigger>
          <TabsTrigger value="restrictions">Ograniczenia</TabsTrigger>
          <TabsTrigger value="analytics">Analityka</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="border-l-4" style={{ borderLeftColor: zone.color }}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{zone.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {zone.permissions.map((perm, idx) => (
                      <Badge key={idx} variant={perm.allowed ? "default" : "secondary"}>
                        {perm.action}
                      </Badge>
                    ))}
                  </div>

                  {zone.timeRestrictions && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{zone.timeRestrictions.length} ograniczeń czasowych</span>
                    </div>
                  )}

                  {zone.capacity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Limit: {zone.capacity} osób</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edytuj
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteZone(zone.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {showAddZone && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Nowa strefa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nazwa strefy"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  />
                  <Input
                    placeholder="Opis"
                    value={newZone.description}
                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Kolor:</label>
                    <input
                      type="color"
                      value={newZone.color}
                      onChange={(e) => setNewZone({ ...newZone, color: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddZone} className="flex-1">
                      Dodaj
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddZone(false)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="restrictions">
          <Card>
            <CardHeader>
              <CardTitle>Ograniczenia czasowe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tutaj możesz skonfigurować ograniczenia czasowe dla poszczególnych stref.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analityka stref</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Statystyki wykorzystania stref i raport dostępu.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZoneManagement;
