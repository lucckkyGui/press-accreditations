
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';
import { 
  PressRelease, 
  PressReleaseForm, 
  PressReleaseQueryParams 
} from '@/types/pressRelease';
import { toast } from '@/hooks/use-toast';

export function usePressReleases(params: PressReleaseQueryParams = {}, options = {}) {
  const {
    data: pressReleases,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['press-releases', params],
    () => mockPressReleaseService.getPressReleases(params),
    options
  );

  const createMutation = useApiMutation(
    ['press-releases', 'create'],
    (form: PressReleaseForm) => mockPressReleaseService.createPressRelease(form),
    {
      onSuccess: () => {
        toast({
          title: 'Komunikat utworzony',
          description: 'Komunikat prasowy został utworzony pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się utworzyć komunikatu prasowego.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['press-releases', 'update'],
    ({ id, data }: { id: string; data: Partial<PressReleaseForm> }) => 
      mockPressReleaseService.updatePressRelease(id, data),
    {
      onSuccess: () => {
        toast({
          title: 'Komunikat zaktualizowany',
          description: 'Komunikat prasowy został zaktualizowany pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować komunikatu prasowego.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['press-releases', 'delete'],
    (id: string) => mockPressReleaseService.deletePressRelease(id),
    {
      onSuccess: () => {
        toast({
          title: 'Komunikat usunięty',
          description: 'Komunikat prasowy został usunięty pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się usunąć komunikatu prasowego.',
          variant: 'destructive',
        });
      },
    }
  );

  const sendMutation = useApiMutation(
    ['press-releases', 'send'],
    (id: string) => mockPressReleaseService.sendPressRelease(id),
    {
      onSuccess: () => {
        toast({
          title: 'Komunikat wysłany',
          description: 'Komunikat prasowy został wysłany pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się wysłać komunikatu prasowego.',
          variant: 'destructive',
        });
      },
    }
  );

  const scheduleMutation = useApiMutation(
    ['press-releases', 'schedule'],
    ({ id, date }: { id: string; date: string }) => 
      mockPressReleaseService.schedulePressRelease(id, date),
    {
      onSuccess: () => {
        toast({
          title: 'Komunikat zaplanowany',
          description: 'Komunikat prasowy został zaplanowany pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaplanować komunikatu prasowego.',
          variant: 'destructive',
        });
      },
    }
  );

  const createPressRelease = useCallback((form: PressReleaseForm) => {
    createMutation.mutate(form);
  }, [createMutation]);

  const updatePressRelease = useCallback((id: string, data: Partial<PressReleaseForm>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deletePressRelease = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const sendPressRelease = useCallback((id: string) => {
    sendMutation.mutate(id);
  }, [sendMutation]);

  const schedulePressRelease = useCallback((id: string, date: string) => {
    scheduleMutation.mutate({ id, date });
  }, [scheduleMutation]);

  return {
    pressReleases,
    isLoading,
    isError,
    error,
    refetch,
    createPressRelease,
    updatePressRelease,
    deletePressRelease,
    sendPressRelease,
    schedulePressRelease,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isSending: sendMutation.isLoading,
    isScheduling: scheduleMutation.isLoading,
  };
}
