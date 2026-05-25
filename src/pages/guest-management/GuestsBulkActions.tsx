
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail, CheckCheck, Ticket, Trash2 } from 'lucide-react';
import { Guest, GuestStatus, GuestTicketType } from "@/types";

interface GuestsBulkActionsProps {
  selectedGuests: Guest[];
  onBulkEmail: () => void;
  onBulkStatusUpdate: (status: GuestStatus) => void;
  onBulkTicketTypeUpdate: (ticketType: GuestTicketType) => void;
  onBulkDelete: () => void;
}

const GuestsBulkActions: React.FC<GuestsBulkActionsProps> = ({
  selectedGuests, onBulkEmail, onBulkStatusUpdate, onBulkTicketTypeUpdate, onBulkDelete
}) => {
  const count = selectedGuests.length;
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
      <span className="text-sm font-medium text-primary mr-1">
        Zaznaczono {count}
      </span>
      <div className="h-4 w-px bg-primary/20" />
      <Button variant="outline" size="sm" onClick={onBulkEmail} className="rounded-lg gap-1.5 h-8 text-xs">
        <Mail className="h-3.5 w-3.5" />
        Wyślij email
      </Button>
      <Button variant="outline" size="sm" onClick={() => onBulkStatusUpdate('confirmed')} className="rounded-lg gap-1.5 h-8 text-xs">
        <CheckCheck className="h-3.5 w-3.5" />
        Potwierdź
      </Button>
      <Button variant="outline" size="sm" onClick={() => onBulkTicketTypeUpdate('media')} className="rounded-lg gap-1.5 h-8 text-xs">
        <Ticket className="h-3.5 w-3.5" />
        Media
      </Button>
      <Button variant="destructive" size="sm" onClick={onBulkDelete} className="rounded-lg gap-1.5 h-8 text-xs ml-auto">
        <Trash2 className="h-3.5 w-3.5" />
        Usuń ({count})
      </Button>
    </div>
  );
};

export default GuestsBulkActions;
