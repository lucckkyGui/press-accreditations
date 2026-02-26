
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuestStatus, GuestZone } from "@/types";
import { Search, Filter } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          type="text"
          placeholder="Szukaj gościa..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="h-11 rounded-xl border-border/60">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
            <SelectValue placeholder="Wszystkie statusy" />
          </div>
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
        <SelectTrigger className="h-11 rounded-xl border-border/60">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
            <SelectValue placeholder="Wszystkie strefy" />
          </div>
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
