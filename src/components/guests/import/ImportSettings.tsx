
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestTicketType, TICKET_TYPE_LABELS } from '@/types';

interface ImportSettingsProps {
  defaultTicketType: GuestTicketType;
  onDefaultTicketTypeChange: (type: GuestTicketType) => void;
}

const ImportSettings: React.FC<ImportSettingsProps> = ({
  defaultTicketType,
  onDefaultTicketTypeChange
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Domyślny typ biletu</label>
      <Select value={defaultTicketType} onValueChange={(value: GuestTicketType) => onDefaultTicketTypeChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Wybierz typ biletu" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TICKET_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Ten typ biletu zostanie przypisany do wszystkich gości, którzy nie mają określonego typu w pliku CSV
      </p>
    </div>
  );
};

export default ImportSettings;
