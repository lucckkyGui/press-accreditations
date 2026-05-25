
import { useApiMutation } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { GuestStatus, GuestTicketType } from '@/types';
import { toast } from 'sonner';

/**
 * Hook for bulk guest operations (delete, update status/zone, send invitations)
 */
export const useBulkGuestMutations = (refetchGuests: () => void) => {
  // Mutation for bulk deleting guests
  const {
    mutateAsync: deleteGuests,
    isLoading: isDeletingBulk
  } = useApiMutation(
    ['guests', 'deleteBulk'],
    (ids: string[]) => guestService.deleteGuests(ids),
    {
      onSuccess: () => {
        toast.success('Guests deleted successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to delete guests');
      }
    }
  );

  // Mutation for updating guests status in bulk
  const {
    mutateAsync: updateGuestsStatus,
    isLoading: isUpdatingStatus
  } = useApiMutation(
    ['guests', 'updateStatus'],
    ({ ids, status }: { ids: string[]; status: GuestStatus }) => 
      guestService.updateGuestsStatus(ids, status),
    {
      onSuccess: () => {
        toast.success('Guest status updated successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to update guest status');
      }
    }
  );

  // Mutation for updating guests ticket type in bulk
  const {
    mutateAsync: updateGuestsTicketType,
    isLoading: isUpdatingTicketType
  } = useApiMutation(
    ['guests', 'updateTicketType'],
    ({ ids, ticketType }: { ids: string[]; ticketType: GuestTicketType }) => 
      guestService.updateGuestsTicketType(ids, ticketType),
    {
      onSuccess: () => {
        toast.success('Guest ticket type updated successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to update guest ticket type');
      }
    }
  );

  // Mutation for sending invitations
  const {
    mutateAsync: sendInvitations,
    isLoading: isSendingInvitations
  } = useApiMutation(
    ['guests', 'sendInvitations'],
    (ids: string[]) => guestService.sendInvitations(ids),
    {
      onSuccess: () => {
        toast.success('Invitations sent successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to send invitations');
      }
    }
  );

  return {
    deleteGuests,
    updateGuestsStatus,
    updateGuestsTicketType,
    sendInvitations,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingTicketType,
    isSendingInvitations
  };
};
