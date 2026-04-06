
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { AccreditationService } from '@/services/accreditation/accreditationService';
import { 
  Accreditation, 
  AccreditationForm, 
  AccreditationsQueryParams,
  CheckInData,
  AccessAreaEntry,
  AccreditationStatus
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
      onError: (error: Error) => {
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
      onError: (error: Error) => {
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
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się unieważnić akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  // Fix the updateStatusMutation to use the correct AccreditationStatus type
  const updateStatusMutation = useApiMutation(
    ['accreditations', 'update-status'],
    ({ id, status, notes }: { id: string; status: AccreditationStatus; notes?: string }) => 
      AccreditationService.updateAccreditationStatus(id, status, notes),
    {
      onSuccess: () => {
        toast({
          title: 'Status zaktualizowany',
          description: 'Status akredytacji został zaktualizowany pomyślnie.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować statusu akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const markBadgePrintedMutation = useApiMutation(
    ['accreditations', 'mark-printed'],
    ({ id, badgeNumber }: { id: string; badgeNumber?: string }) => 
      AccreditationService.markBadgePrinted(id, badgeNumber),
    {
      onSuccess: () => {
        toast({
          title: 'Identyfikator wydrukowany',
          description: 'Identyfikator został oznaczony jako wydrukowany.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się oznaczyć identyfikatora jako wydrukowany.',
          variant: 'destructive',
        });
      },
    }
  );

  const recordAccessMutation = useApiMutation(
    ['accreditations', 'record-access'],
    (entry: AccessAreaEntry) => AccreditationService.recordAreaAccess(entry),
    {
      onSuccess: () => {
        toast({
          title: 'Dostęp zarejestrowany',
          description: 'Wejście do strefy zostało zarejestrowane.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zarejestrować wejścia do strefy.',
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

  const updateAccreditationStatus = useCallback((id: string, status: AccreditationStatus, notes?: string) => {
    updateStatusMutation.mutate({ id, status, notes });
  }, [updateStatusMutation]);

  const markBadgePrinted = useCallback((id: string, badgeNumber?: string) => {
    markBadgePrintedMutation.mutate({ id, badgeNumber });
  }, [markBadgePrintedMutation]);

  const recordAreaAccess = useCallback((entry: AccessAreaEntry) => {
    recordAccessMutation.mutate(entry);
  }, [recordAccessMutation]);

  return {
    accreditations,
    isLoading,
    isError,
    error,
    refetch,
    createAccreditation,
    checkInAccreditation,
    revokeAccreditation,
    updateAccreditationStatus,
    markBadgePrinted,
    recordAreaAccess,
    isSubmitting: createMutation.isLoading,
    isCheckingIn: checkInMutation.isLoading,
    isRevoking: revokeMutation.isLoading,
    isUpdatingStatus: updateStatusMutation.isLoading,
    isMarkingPrinted: markBadgePrintedMutation.isLoading,
    isRecordingAccess: recordAccessMutation.isLoading,
  };
}
