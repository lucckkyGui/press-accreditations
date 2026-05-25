
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface TicketFiltersProps {
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  onSearch,
  onSortChange,
  onPriceRangeChange,
}) => {
  const [minPrice, setMinPrice] = React.useState<string>('');
  const [maxPrice, setMaxPrice] = React.useState<string>('');

  const handlePriceChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    onPriceRangeChange(min, max);
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj wydarzenia..."
              className="pl-8"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <Select onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sortuj według" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Cena: od najniższej</SelectItem>
              <SelectItem value="price-desc">Cena: od najwyższej</SelectItem>
              <SelectItem value="date-asc">Data: od najwcześniejszej</SelectItem>
              <SelectItem value="date-desc">Data: od najpóźniejszej</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <Label htmlFor="min-price">Cena od</Label>
          <Input
            id="min-price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0 PLN"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Label htmlFor="max-price">Cena do</Label>
          <Input
            id="max-price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max PLN"
          />
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handlePriceChange}
        >
          <Filter className="h-4 w-4" />
          Filtruj
        </Button>
      </div>
    </div>
  );
};

export default TicketFilters;
