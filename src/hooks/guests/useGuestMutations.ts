
import { useApiMutation } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { Guest } from '@/types';
import { toast } from 'sonner';

/**
 * Hook for guest mutation operations (create, update, delete)
 */
export const useGuestMutations = (refetchGuests: () => void) => {
  // Mutation for creating a guest
  const {
    mutateAsync: createGuest,
    isLoading: isCreating
  } = useApiMutation(
    ['guests', 'create'],
    (guest: Partial<Guest> & { eventId: string }) => guestService.createGuest(guest),
    {
      onSuccess: () => {
        toast.success('Guest added successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to add guest');
        console.error('Error creating guest:', err);
      }
    }
  );

  // Mutation for bulk creating guests
  const {
    mutateAsync: createGuests,
    isLoading: isCreatingBulk
  } = useApiMutation(
    ['guests', 'createBulk'],
    (guests: Array<Partial<Guest> & { eventId: string }>) => guestService.createGuests(guests),
    {
      onSuccess: (response) => {
        const count = (response && typeof response === 'object' && 'length' in response)
          ? (response as any).length
          : Array.isArray(response)
            ? response.length
            : 0;
        toast.success(`${count} guests added successfully!`);
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to bulk add guests');
        console.error('Error bulk creating guests:', err);
      }
    }
  );

  // Mutation for updating a guest
  const {
    mutateAsync: updateGuest,
    isLoading: isUpdating
  } = useApiMutation(
    ['guests', 'update'],
    ({ id, guest }: { id: string; guest: Partial<Guest> }) => guestService.updateGuest(id, guest),
    {
      onSuccess: () => {
        toast.success('Guest updated successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to update guest');
        console.error('Error updating guest:', err);
      }
    }
  );

  // Mutation for deleting a guest
  const {
    mutateAsync: deleteGuest,
    isLoading: isDeleting
  } = useApiMutation(
    ['guests', 'delete'],
    (id: string) => guestService.deleteGuest(id),
    {
      onSuccess: () => {
        toast.success('Guest deleted successfully!');
        refetchGuests();
      },
      onError: (err) => {
        toast.error('Failed to delete guest');
        console.error('Error deleting guest:', err);
      }
    }
  );

  return {
    createGuest,
    createGuests,
    updateGuest,
    deleteGuest,
    isCreating,
    isCreatingBulk,
    isUpdating,
    isDeleting
  };
};
