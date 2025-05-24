
import { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { Guest, GuestStatus, GuestZone } from '@/types';
import { GuestsQueryParams } from '@/types/guest/guest';
import { toast } from 'sonner';

export const useGuests = (eventId?: string) => {
  const [queryParams, setQueryParams] = useState<GuestsQueryParams>({
    page: 0,
    pageSize: 10,
    status: 'all',
    zone: 'all',
    eventId
  });

  // Query for fetching guests
  const {
    data: guestsResponse,
    isLoading: isGuestsLoading,
    isError: isGuestsError,
    refetch: refetchGuests
  } = useApiQuery(
    ['guests', queryParams],
    () => guestService.getGuests(queryParams),
    {
      enabled: !!eventId,
      onError: (err) => {
        toast.error('Failed to load guests');
        console.error('Error loading guests:', err);
      }
    }
  );

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
        toast.success(`${response?.length || 0} guests added successfully!`);
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
    guests: guestsResponse?.data || [],
    pagination: guestsResponse?.pagination,
    isGuestsLoading,
    isGuestsError,
    queryParams,
    setQueryParams,
    createGuest,
    createGuests,
    updateGuest,
    deleteGuest,
    deleteGuests,
    updateGuestsStatus,
    updateGuestsZone,
    sendInvitations,
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
