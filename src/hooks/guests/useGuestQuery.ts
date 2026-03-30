
import { useApiQuery } from '@/hooks/useApi';
import { guestService } from '@/services/guestService';
import { Guest } from '@/types';
import { GuestsQueryParams } from '@/types/guest/guest';
import { toast } from 'sonner';
import { useState } from 'react';

/**
 * Hook for querying guests data
 */
export const useGuestQuery = (eventId?: string, initialQueryParams?: Partial<GuestsQueryParams>) => {
  const [queryParams, setQueryParams] = useState<GuestsQueryParams>({
    page: 0,
    pageSize: 50,
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

  // Handle the response data properly with better type safety
  const guests: Guest[] = Array.isArray(guestsResponse) 
    ? guestsResponse 
    : (guestsResponse && typeof guestsResponse === 'object' && 'data' in guestsResponse)
      ? (guestsResponse as any).data || []
      : [];
  
  const pagination = (guestsResponse && typeof guestsResponse === 'object' && 'pagination' in guestsResponse)
    ? (guestsResponse as any).pagination
    : undefined;

  return {
    guests,
    pagination,
    queryParams,
    setQueryParams,
    isGuestsLoading,
    isGuestsError,
    refetchGuests
  };
};
