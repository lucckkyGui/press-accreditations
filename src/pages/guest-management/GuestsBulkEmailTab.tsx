
import React from 'react';
import BulkEmailSender from "@/components/guests/BulkEmailSender";

interface GuestsBulkEmailTabProps {
  guests: any[];
  selectedEvent: any;
  onEmailSent: () => void;
  onTabChange: (tab: string) => void;
}

const GuestsBulkEmailTab: React.FC<GuestsBulkEmailTabProps> = ({
  guests,
  selectedEvent,
  onEmailSent,
  onTabChange
}) => {
  return (
    <BulkEmailSender
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onTabChange('guests');
        }
      }}
      selectedGuests={guests}
      eventId={selectedEvent?.id || ''}
      onEmailSent={onEmailSent}
    />
  );
};

export default GuestsBulkEmailTab;
