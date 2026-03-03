
import { useGuestQuery } from './useGuestQuery';
import { useGuestMutations } from './useGuestMutations';
import { useBulkGuestMutations } from './useBulkGuestMutations';
import { GuestsQueryParams } from '@/types/guest/guest';

/**
 * Main hook that combines all guest-related hooks
 */
export const useGuests = (eventId?: string, initialQueryParams?: Partial<GuestsQueryParams>) => {
  const {
    guests,
    pagination,
    queryParams,
    setQueryParams,
    isGuestsLoading,
    isGuestsError,
    refetchGuests
  } = useGuestQuery(eventId, initialQueryParams);

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
    updateGuestsTicketType,
    sendInvitations,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingTicketType,
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
    updateGuestsTicketType,
    sendInvitations,
    
    // Loading states
    isCreating,
    isCreatingBulk,
    isUpdating,
    isDeleting,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingTicketType,
    isSendingInvitations
  };
};
