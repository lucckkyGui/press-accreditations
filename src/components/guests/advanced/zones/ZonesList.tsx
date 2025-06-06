
import React from 'react';
import { AccessZone } from '@/types/zones';
import ZoneCard from './ZoneCard';
import AddZoneCard from './AddZoneCard';

interface ZonesListProps {
  zones: AccessZone[];
  showAddZone: boolean;
  newZone: Partial<AccessZone>;
  onZoneChange: (zone: Partial<AccessZone>) => void;
  onAddZone: () => void;
  onCancelAdd: () => void;
  onEditZone: (zoneId: string) => void;
  onDeleteZone: (zoneId: string) => void;
}

const ZonesList: React.FC<ZonesListProps> = ({
  zones,
  showAddZone,
  newZone,
  onZoneChange,
  onAddZone,
  onCancelAdd,
  onEditZone,
  onDeleteZone
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          onEdit={onEditZone}
          onDelete={onDeleteZone}
        />
      ))}

      {showAddZone && (
        <AddZoneCard
          newZone={newZone}
          onZoneChange={onZoneChange}
          onAdd={onAddZone}
          onCancel={onCancelAdd}
        />
      )}
    </div>
  );
};

export default ZonesList;
