
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail, CheckCheck, UserPlus, Trash2 } from 'lucide-react';
import { Guest, GuestStatus, GuestZone } from "@/types";

interface GuestsBulkActionsProps {
  selectedGuests: Guest[];
  onBulkEmail: () => void;
  onBulkStatusUpdate: (status: GuestStatus) => void;
  onBulkZoneUpdate: (zone: GuestZone) => void;
  onBulkDelete: () => void;
}

const GuestsBulkActions: React.FC<GuestsBulkActionsProps> = ({
  selectedGuests,
  onBulkEmail,
  onBulkStatusUpdate,
  onBulkZoneUpdate,
  onBulkDelete
}) => {
  const hasSelectedGuests = selectedGuests.length > 0;

  return (
    <div className="mb-4">
      <Button variant="outline" size="sm" onClick={onBulkEmail} disabled={!hasSelectedGuests}>
        <Mail className="mr-2 h-4 w-4" />
        Wyślij email
      </Button>
      <Button variant="outline" size="sm" onClick={() => onBulkStatusUpdate('confirmed')} disabled={!hasSelectedGuests}>
        <CheckCheck className="mr-2 h-4 w-4" />
        Potwierdź
      </Button>
      <Button variant="outline" size="sm" onClick={() => onBulkZoneUpdate('vip')} disabled={!hasSelectedGuests}>
        <UserPlus className="mr-2 h-4 w-4" />
        Ustaw VIP
      </Button>
      <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={!hasSelectedGuests}>
        <Trash2 className="mr-2 h-4 w-4" />
        Usuń
      </Button>
    </div>
  );
};

export default GuestsBulkActions;
