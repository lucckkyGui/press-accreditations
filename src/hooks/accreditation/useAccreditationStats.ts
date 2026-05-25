
import { useApiQuery } from '@/hooks/useApi';
import { AccreditationService } from '@/services/accreditation/accreditationService';
import { AccreditationStats } from '@/types/accreditation';

export function useAccreditationStats(eventId: string, options = {}) {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['accreditation-stats', eventId],
    () => AccreditationService.getAccreditationStats(eventId),
    options
  );

  return {
    stats,
    isLoading,
    isError,
    error,
    refetch
  };
}
