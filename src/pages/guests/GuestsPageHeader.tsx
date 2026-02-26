
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload } from 'lucide-react';
import { Event } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { STRIPE_TIERS } from "@/config/stripe";

interface GuestsPageHeaderProps {
  selectedEvent: Event | null;
  onImportClick: () => void;
  onCreateClick: () => void;
  guestCount?: number;
}

const GuestsPageHeader: React.FC<GuestsPageHeaderProps> = ({
  selectedEvent,
  onImportClick,
  onCreateClick,
  guestCount = 0
}) => {
  const { limits, isWithinGuestLimit, currentTier } = useFeatureAccess();
  const atLimit = !isWithinGuestLimit(guestCount);
  const tierName = currentTier === 'free' ? 'Darmowy' : STRIPE_TIERS[currentTier].name;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Goście</h1>
          {limits.maxGuests < Infinity && (
            <p className="text-sm text-muted-foreground">
              {guestCount} / {limits.maxGuests} gości (plan {tierName})
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button onClick={onImportClick} disabled={!selectedEvent || atLimit}>
            <Upload className="mr-2 h-4 w-4" />
            Importuj
          </Button>
          <Button onClick={onCreateClick} disabled={!selectedEvent || atLimit}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj gościa
          </Button>
        </div>
      </div>
      {atLimit && (
        <Alert variant="destructive">
          <AlertDescription>
            Osiągnięto limit {limits.maxGuests} gości dla planu {tierName}. Ulepsz plan, aby dodać więcej gości.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GuestsPageHeader;
