
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type FilterOption = {
  id: string;
  label: string;
  type: "select" | "text" | "date";
  options?: { value: string; label: string }[];
};

export type FilterValues = Record<string, string | Date | null>;

type AdvancedFiltersProps = {
  filterOptions: FilterOption[];
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filterOptions,
  onFilterChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  const handleFilterChange = (filterId: string, value: string | Date | null) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value,
    };

    if (value === null || value === "") {
      delete newFilters[filterId];
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              Zaawansowane filtry <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {filterOptions.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={filter.id}>{filter.label}</Label>
                  {filter.type === "select" && (
                    <Select
                      value={activeFilters[filter.id] as string || ""}
                      onValueChange={(value) => handleFilterChange(filter.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === "text" && (
                    <Input
                      id={filter.id}
                      value={activeFilters[filter.id] as string || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder="Wpisz tekst..."
                    />
                  )}
                  {filter.type === "date" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {activeFilters[filter.id]
                            ? format(activeFilters[filter.id] as Date, "dd.MM.yyyy", { locale: pl })
                            : "Wybierz datę"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={activeFilters[filter.id] as Date || undefined}
                          onSelect={(date) => handleFilterChange(filter.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Wyczyść wszystkie
                </Button>
                <Button size="sm" onClick={() => setIsOpen(false)}>
                  Zastosuj
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Aktywne filtry */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(activeFilters).map((filterId) => {
              const filter = filterOptions.find((f) => f.id === filterId);
              if (!filter) return null;

              let displayValue: string;
              if (filter.type === "select") {
                displayValue = filter.options?.find(
                  (o) => o.value === activeFilters[filterId]
                )?.label || String(activeFilters[filterId]);
              } else if (filter.type === "date" && activeFilters[filterId]) {
                displayValue = format(activeFilters[filterId] as Date, "dd.MM.yyyy", { locale: pl });
              } else {
                displayValue = String(activeFilters[filterId]);
              }

              return (
                <div
                  key={filterId}
                  className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  <span className="font-medium">{filter.label}:</span>
                  <span>{displayValue}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full p-0"
                    onClick={() => clearFilter(filterId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}

            {Object.keys(activeFilters).length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={clearAllFilters}
              >
                Wyczyść wszystkie
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
