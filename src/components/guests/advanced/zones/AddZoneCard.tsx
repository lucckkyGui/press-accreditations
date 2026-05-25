
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccessZone } from '@/types/zones';

interface AddZoneCardProps {
  newZone: Partial<AccessZone>;
  onZoneChange: (zone: Partial<AccessZone>) => void;
  onAdd: () => void;
  onCancel: () => void;
}

const AddZoneCard: React.FC<AddZoneCardProps> = ({ 
  newZone, 
  onZoneChange, 
  onAdd, 
  onCancel 
}) => {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Nowa strefa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Nazwa strefy"
          value={newZone.name || ''}
          onChange={(e) => onZoneChange({ ...newZone, name: e.target.value })}
        />
        <Input
          placeholder="Opis"
          value={newZone.description || ''}
          onChange={(e) => onZoneChange({ ...newZone, description: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm">Kolor:</label>
          <input
            type="color"
            value={newZone.color || '#6366F1'}
            onChange={(e) => onZoneChange({ ...newZone, color: e.target.value })}
            className="w-12 h-8 rounded border"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onAdd} className="flex-1">
            Dodaj
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddZoneCard;
