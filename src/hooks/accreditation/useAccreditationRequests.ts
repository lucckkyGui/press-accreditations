
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { AccreditationRequestService } from '@/services/accreditation/accreditationRequestService';
import { 
  AccreditationRequest, 
  AccreditationRequestForm, 
  AccreditationRequestsQueryParams 
} from '@/types/accreditation';
import { toast } from '@/hooks/use-toast';

export function useAccreditationRequests(params: AccreditationRequestsQueryParams = {}, options = {}) {
  const {
    data: requests,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['accreditation-requests', params],
    () => AccreditationRequestService.getAccreditationRequests(params),
    options
  );

  const createMutation = useApiMutation(
    ['accreditation-requests', 'create'],
    (form: AccreditationRequestForm) => AccreditationRequestService.createAccreditationRequest(form),
    {
      onSuccess: () => {
        toast({
          title: 'Wniosek wysłany',
          description: 'Twój wniosek o akredytację został wysłany pomyślnie.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się wysłać wniosku o akredytację.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateStatusMutation = useApiMutation(
    ['accreditation-requests', 'update'],
    ({ id, status, notes }: { id: string; status: 'approved' | 'rejected'; notes?: string }) => 
      AccreditationRequestService.updateAccreditationRequestStatus(id, status, notes),
    {
      onSuccess: (data) => {
        const statusText = data?.status === 'approved' ? 'zatwierdzony' : 'odrzucony';
        toast({
          title: `Wniosek ${statusText}`,
          description: `Wniosek o akredytację został ${statusText}.`,
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować statusu wniosku.',
          variant: 'destructive',
        });
      },
    }
  );

  const createAccreditationRequest = useCallback((form: AccreditationRequestForm) => {
    createMutation.mutate(form);
  }, [createMutation]);

  const updateRequestStatus = useCallback((id: string, status: 'approved' | 'rejected', notes?: string) => {
    updateStatusMutation.mutate({ id, status, notes });
  }, [updateStatusMutation]);

  return {
    requests,
    isLoading,
    isError,
    error,
    refetch,
    createAccreditationRequest,
    updateRequestStatus,
    isSubmitting: createMutation.isLoading,
    isUpdating: updateStatusMutation.isLoading,
  };
}
