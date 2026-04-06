import React, { useState, useCallback } from 'react';
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderedZones, setOrderedZones] = useState<AccessZone[]>(zones);

  // Keep in sync with prop changes
  React.useEffect(() => {
    setOrderedZones(zones);
  }, [zones]);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    setOrderedZones(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orderedZones.map((zone, index) => (
        <div
          key={zone.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`cursor-grab active:cursor-grabbing transition-opacity ${
            dragIndex === index ? 'opacity-50' : ''
          }`}
        >
          <ZoneCard
            zone={zone}
            onEdit={onEditZone}
            onDelete={onDeleteZone}
          />
        </div>
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
