
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Users } from 'lucide-react';
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
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase">Zarządzanie</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-7 w-7 text-primary/60" />
            Goście
          </h1>
          {limits.maxGuests < Infinity && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-0 text-xs">
                {guestCount} / {limits.maxGuests}
              </Badge>
              <span className="text-sm text-muted-foreground">plan {tierName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onImportClick} disabled={!selectedEvent || atLimit} className="rounded-xl gap-2">
            <Upload className="h-4 w-4" />
            Importuj
          </Button>
          <Button onClick={onCreateClick} disabled={!selectedEvent || atLimit} className="rounded-xl gap-2 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all">
            <Plus className="h-4 w-4" />
            Dodaj gościa
          </Button>
        </div>
      </div>
      {atLimit && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>
            Osiągnięto limit {limits.maxGuests} gości dla planu {tierName}. Ulepsz plan, aby dodać więcej gości.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GuestsPageHeader;
