
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestZone } from '@/types';

interface ImportSettingsProps {
  defaultZone: GuestZone;
  onDefaultZoneChange: (zone: GuestZone) => void;
}

const ImportSettings: React.FC<ImportSettingsProps> = ({
  defaultZone,
  onDefaultZoneChange
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Domyślna strefa dostępu</label>
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
      <p className="text-xs text-muted-foreground">
        Ta strefa zostanie przypisana do wszystkich gości, którzy nie mają określonej strefy w pliku CSV
      </p>
    </div>
  );
};

export default ImportSettings;
