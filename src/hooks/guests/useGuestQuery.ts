
import { useState } from 'react';
import { useApiQuery } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { GuestsQueryParams } from '@/types/guest/guest';
import { toast } from 'sonner';

/**
 * Hook for querying guests with pagination and filtering
 */
export const useGuestQuery = (eventId?: string) => {
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

  return {
    guests: guestsResponse?.data || [],
    pagination: guestsResponse?.pagination,
    isGuestsLoading,
    isGuestsError,
    queryParams,
    setQueryParams,
    refetchGuests
  };
};
