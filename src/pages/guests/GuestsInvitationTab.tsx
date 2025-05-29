
import React from 'react';
import { GuestsInvitationManager } from "./";

interface GuestsInvitationTabProps {
  guests: any[];
  event: any;
  onInvitationsSent: () => void;
}

const GuestsInvitationTab: React.FC<GuestsInvitationTabProps> = ({
  guests,
  event,
  onInvitationsSent
}) => {
  return (
    <GuestsInvitationManager
      guests={guests}
      event={event}
      onInvitationsSent={onInvitationsSent}
    />
  );
};

export default GuestsInvitationTab;
