
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventSortOrder } from "@/services/events/mockEventsService";

interface EventFiltersProps {
  searchQuery: string;
  sortOrder: EventSortOrder;
  activeTab: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: EventSortOrder) => void;
  onTabChange: (value: string) => void;
  translations: {
    searchEvents: string;
    sortBy: string;
    dateAsc: string;
    dateDesc: string;
    nameAsc: string;
    nameDesc: string;
    popularity: string;
    allEvents: string;
    featured: string;
  };
}

const EventFilters = ({
  searchQuery,
  sortOrder,
  activeTab,
  onSearchChange,
  onSortChange,
  onTabChange,
  translations
}: EventFiltersProps) => {
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input
          placeholder={translations.searchEvents}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md w-full"
        />
        <div className="flex gap-4 w-full sm:w-auto">
          <Select
            value={sortOrder}
            onValueChange={(value) => onSortChange(value as EventSortOrder)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={translations.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="date-asc">{translations.dateAsc}</SelectItem>
                <SelectItem value="date-desc">{translations.dateDesc}</SelectItem>
                <SelectItem value="name-asc">{translations.nameAsc}</SelectItem>
                <SelectItem value="name-desc">{translations.nameDesc}</SelectItem>
                <SelectItem value="attendees-desc">{translations.popularity}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{translations.allEvents}</TabsTrigger>
          <TabsTrigger value="featured">{translations.featured}</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default EventFilters;
