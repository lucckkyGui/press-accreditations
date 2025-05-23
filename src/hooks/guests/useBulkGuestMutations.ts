
import { useApiMutation } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { GuestStatus, GuestZone } from '@/types';
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
        console.error('Error bulk deleting guests:', err);
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
        console.error('Error updating guest status:', err);
      }
    }
  );

  // Mutation for updating guests zone in bulk
  const {
    mutateAsync: updateGuestsZone,
    isLoading: isUpdatingZone
  } = useApiMutation(
    ['guests', 'updateZone'],
    ({ ids, zone }: { ids: string[]; zone: GuestZone }) => 
      guestService.updateGuestsZone(ids, zone),
    {
      onSuccess: () => {
        toast.success('Guest zone updated successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to update guest zone');
        console.error('Error updating guest zone:', err);
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
        console.error('Error sending invitations:', err);
      }
    }
  );

  return {
    deleteGuests,
    updateGuestsStatus,
    updateGuestsZone,
    sendInvitations,
    isDeletingBulk,
    isUpdatingStatus,
    isUpdatingZone,
    isSendingInvitations
  };
};
