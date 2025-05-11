
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { AccreditationService } from '@/services/accreditation/accreditationService';
import { 
  Accreditation, 
  AccreditationForm, 
  AccreditationsQueryParams,
  CheckInData
} from '@/types/accreditation';
import { toast } from '@/hooks/use-toast';

export function useAccreditations(params: AccreditationsQueryParams = {}, options = {}) {
  const {
    data: accreditations,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['accreditations', params],
    () => AccreditationService.getAccreditations(params),
    options
  );

  const createMutation = useApiMutation(
    ['accreditations', 'create'],
    (form: AccreditationForm) => AccreditationService.createAccreditation(form),
    {
      onSuccess: () => {
        toast({
          title: 'Akredytacja utworzona',
          description: 'Akredytacja została utworzona pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się utworzyć akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const checkInMutation = useApiMutation(
    ['accreditations', 'check-in'],
    (checkInData: CheckInData) => AccreditationService.checkInAccreditation(checkInData),
    {
      onSuccess: () => {
        toast({
          title: 'Check-in pomyślny',
          description: 'Akredytacja została zarejestrowana pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zarejestrować check-in.',
          variant: 'destructive',
        });
      },
    }
  );

  const revokeMutation = useApiMutation(
    ['accreditations', 'revoke'],
    ({ id, reason }: { id: string; reason: string }) => 
      AccreditationService.revokeAccreditation(id, reason),
    {
      onSuccess: () => {
        toast({
          title: 'Akredytacja unieważniona',
          description: 'Akredytacja została unieważniona pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się unieważnić akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const createAccreditation = useCallback((form: AccreditationForm) => {
    createMutation.mutate(form);
  }, [createMutation]);

  const checkInAccreditation = useCallback((data: CheckInData) => {
    checkInMutation.mutate(data);
  }, [checkInMutation]);

  const revokeAccreditation = useCallback((id: string, reason: string) => {
    revokeMutation.mutate({ id, reason });
  }, [revokeMutation]);

  return {
    accreditations,
    isLoading,
    isError,
    error,
    refetch,
    createAccreditation,
    checkInAccreditation,
    revokeAccreditation,
    isSubmitting: createMutation.isLoading,
    isCheckingIn: checkInMutation.isLoading,
    isRevoking: revokeMutation.isLoading,
  };
}
