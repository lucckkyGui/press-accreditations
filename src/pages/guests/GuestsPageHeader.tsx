
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload } from 'lucide-react';
import { Event } from "@/types";

interface GuestsPageHeaderProps {
  selectedEvent: Event | null;
  onImportClick: () => void;
  onCreateClick: () => void;
}

const GuestsPageHeader: React.FC<GuestsPageHeaderProps> = ({
  selectedEvent,
  onImportClick,
  onCreateClick
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Goście</h1>
      <div className="space-x-2">
        <Button onClick={onImportClick} disabled={!selectedEvent}>
          <Upload className="mr-2 h-4 w-4" />
          Importuj
        </Button>
        <Button onClick={onCreateClick} disabled={!selectedEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj gościa
        </Button>
      </div>
    </div>
  );
};

export default GuestsPageHeader;
