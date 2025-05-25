
import { useApiQuery } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { Guest } from '@/types';
import { GuestsQueryParams } from '@/types/guest/guest';
import { toast } from 'sonner';
import { useState } from 'react';

/**
 * Hook for querying guests data
 */
export const useGuestQuery = (eventId?: string, initialQueryParams?: GuestsQueryParams) => {
  const [queryParams, setQueryParams] = useState<GuestsQueryParams>({
    page: 0,
    pageSize: 10,
    status: 'all',
    zone: 'all',
    eventId,
    ...initialQueryParams
  });

  // Query for fetching guests
  const {
    data: guestsResponse,
    isLoading: isGuestsLoading,
    isError: isGuestsError,
    refetch: refetchGuests
  } = useApiQuery(
    ['guests', eventId, queryParams],
    () => guestService.getGuests({ ...queryParams, eventId }),
    {
      enabled: !!eventId,
      onError: (err) => {
        toast.error('Failed to load guests');
        console.error('Error loading guests:', err);
      }
    }
  );

  // Query for fetching a single guest
  const {
    data: guestResponse,
    isLoading: isGuestLoading,
    isError: isGuestError,
    refetch: refetchGuest
  } = useApiQuery(
    ['guest', eventId],
    () => guestService.getGuestById(eventId!),
    {
      enabled: !!eventId,
      onError: (err) => {
        toast.error('Failed to load guest');
        console.error('Error loading guest:', err);
      }
    }
  );

  return {
    guests: Array.isArray(guestsResponse) ? guestsResponse : guestsResponse?.data || [],
    pagination: guestsResponse?.pagination,
    guest: guestResponse,
    queryParams,
    setQueryParams,
    isGuestsLoading,
    isGuestsError,
    isGuestLoading,
    isGuestError,
    refetchGuests,
    refetchGuest
  };
};
