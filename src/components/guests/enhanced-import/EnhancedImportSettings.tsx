
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestZone } from '@/types';

interface EnhancedImportSettingsProps {
  defaultZone: GuestZone;
  onDefaultZoneChange: (zone: GuestZone) => void;
}

const EnhancedImportSettings: React.FC<EnhancedImportSettingsProps> = ({
  defaultZone,
  onDefaultZoneChange
}) => {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">Domyślna strefa dostępu</Label>
      <Select value={defaultZone} onValueChange={(value: GuestZone) => onDefaultZoneChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Wybierz strefę dostępu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="general">Ogólna</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
          <SelectItem value="press">Press</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnhancedImportSettings;
