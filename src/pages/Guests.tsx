
import React from 'react';
import { useGuestsPage } from "./guests";
import GuestsPageHeader from "./guests/GuestsPageHeader";
import GuestsTabs from "./guests/GuestsTabs";
import GuestsDialogs from "./guests/GuestsDialogs";

const Guests = () => {
  const guestsPageProps = useGuestsPage();

  if (!guestsPageProps.selectedEvent) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Wybierz wydarzenie aby zarządzać gośćmi</p>
      </div>
    );
  }

  return (
    <div>
      <GuestsPageHeader
        selectedEvent={guestsPageProps.selectedEvent}
        onImportClick={() => guestsPageProps.setShowImportDialog(true)}
        onCreateClick={guestsPageProps.handleCreateGuest}
      />

      <GuestsTabs {...guestsPageProps} />
      <GuestsDialogs {...guestsPageProps} />
    </div>
  );
};

export default Guests;
