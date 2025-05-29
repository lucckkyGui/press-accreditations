
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestStatus, GuestZone } from "@/types";

interface GuestsFiltersProps {
  search: string;
  statusFilter: GuestStatus | 'all';
  zoneFilter: GuestZone | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: GuestStatus | 'all') => void;
  onZoneFilterChange: (zone: GuestZone | 'all') => void;
}

const GuestsFilters: React.FC<GuestsFiltersProps> = ({
  search,
  statusFilter,
  zoneFilter,
  onSearchChange,
  onStatusFilterChange,
  onZoneFilterChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Input
        type="text"
        placeholder="Szukaj gościa..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Wszystkie statusy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie statusy</SelectItem>
          <SelectItem value="invited">Zaproszony</SelectItem>
          <SelectItem value="confirmed">Potwierdzony</SelectItem>
          <SelectItem value="declined">Odrzucony</SelectItem>
          <SelectItem value="checked-in">Obecny</SelectItem>
        </SelectContent>
      </Select>

      <Select value={zoneFilter} onValueChange={onZoneFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Wszystkie strefy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie strefy</SelectItem>
          <SelectItem value="general">Ogólna</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
          <SelectItem value="press">Press</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GuestsFilters;
