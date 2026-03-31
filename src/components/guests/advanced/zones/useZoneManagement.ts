
import { useState } from 'react';
import { AccessZone } from '@/types/zones';
import { toast } from 'sonner';

export const useZoneManagement = () => {
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

  const handleEditZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setNewZone({ ...zone });
      setShowAddZone(true);
      setZones(zones.filter(z => z.id !== zoneId));
    }
  };

  return {
    zones,
    showAddZone,
    newZone,
    setShowAddZone,
    setNewZone,
    handleAddZone,
    handleDeleteZone,
    handleEditZone
  };
};
