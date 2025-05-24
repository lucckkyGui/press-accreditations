
import { useGuestQuery } from './useGuestQuery';
import { useGuestMutations } from './useGuestMutations';
import { useBulkGuestMutations } from './useBulkGuestMutations';

/**
 * Main hook that combines all guest-related hooks
 */
export const useGuests = (eventId?: string) => {
  const {
    guests,
    pagination,
    queryParams,
    setQueryParams,
    isGuestsLoading,
    isGuestsError,
    refetchGuests
  } = useGuestQuery(eventId);

  const {
    createGuest,
    createGuests,
    updateGuest,
    deleteGuest,
    isCreating,
    isCreatingBulk,
    isUpdating,
    isDeleting
  } = useGuestMutations(refetchGuests);

  const {
    deleteGuests,
    updateGuestsStatus,
    updateGuestsZone,
    sendInvitations,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingZone,
    isSendingInvitations
  } = useBulkGuestMutations(refetchGuests);

  return {
    // Guest querying
    guests,
    pagination,
    queryParams,
    setQueryParams,
    isGuestsLoading,
    isGuestsError,
    
    // Single guest mutations
    createGuest,
    createGuests,
    updateGuest,
    deleteGuest,
    
    // Bulk guest mutations
    deleteGuests,
    updateGuestsStatus,
    updateGuestsZone,
    sendInvitations,
    
    // Loading states
    isCreating,
    isCreatingBulk,
    isUpdating,
    isDeleting,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingZone,
    isSendingInvitations
  };
};
