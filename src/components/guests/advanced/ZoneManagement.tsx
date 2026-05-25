
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ZoneTabs from './zones/ZoneTabs';
import { useZoneManagement } from './zones/useZoneManagement';

const ZoneManagement: React.FC = () => {
  const {
    zones,
    showAddZone,
    newZone,
    setShowAddZone,
    setNewZone,
    handleAddZone,
    handleDeleteZone,
    handleEditZone
  } = useZoneManagement();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie strefami dostępu</h2>
        <Button onClick={() => setShowAddZone(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj strefę
        </Button>
      </div>

      <ZoneTabs
        zones={zones}
        showAddZone={showAddZone}
        newZone={newZone}
        onZoneChange={setNewZone}
        onAddZone={handleAddZone}
        onCancelAdd={() => setShowAddZone(false)}
        onEditZone={handleEditZone}
        onDeleteZone={handleDeleteZone}
      />
    </div>
  );
};

export default ZoneManagement;
