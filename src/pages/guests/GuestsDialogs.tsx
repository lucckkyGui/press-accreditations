
import React from 'react';
import GuestForm from "@/components/guests/GuestForm";
import EnhancedBulkGuestImport from "@/components/guests/EnhancedBulkGuestImport";
import BulkEmailSender from "@/components/guests/BulkEmailSender";

interface GuestsDialogsProps {
  showFormDialog: boolean;
  setShowFormDialog: (show: boolean) => void;
  showImportDialog: boolean;
  setShowImportDialog: (show: boolean) => void;
  showEmailDialog: boolean;
  setShowEmailDialog: (show: boolean) => void;
  selectedGuest: any;
  selectedEvent: any;
  selectedGuests: any[];
  isLoading: boolean;
  handleSaveGuest: (guest: any) => void;
  handleBulkImport: (guests: any[]) => void;
  handleEmailSent: () => void;
}

const GuestsDialogs: React.FC<GuestsDialogsProps> = ({
  showFormDialog,
  setShowFormDialog,
  showImportDialog,
  setShowImportDialog,
  showEmailDialog,
  setShowEmailDialog,
  selectedGuest,
  selectedEvent,
  selectedGuests,
  isLoading,
  handleSaveGuest,
  handleBulkImport,
  handleEmailSent
}) => {
  return (
    <>
      <GuestForm
        isOpen={showFormDialog}
        onOpenChange={setShowFormDialog}
        guest={selectedGuest}
        eventId={selectedEvent?.id || ''}
        onSubmit={handleSaveGuest}
        onCancel={() => setShowFormDialog(false)}
        isSubmitting={isLoading}
      />

      <EnhancedBulkGuestImport
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleBulkImport}
        eventId={selectedEvent?.id || ''}
        isSubmitting={isLoading}
      />

      <BulkEmailSender
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        selectedGuests={selectedGuests}
        eventId={selectedEvent?.id || ''}
        onEmailSent={handleEmailSent}
      />
    </>
  );
};

export default GuestsDialogs;
