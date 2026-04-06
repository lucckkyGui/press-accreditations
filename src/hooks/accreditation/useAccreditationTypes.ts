
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { AccreditationTypeService } from '@/services/accreditation/accreditationTypeService';
import { 
  AccreditationType, 
  AccreditationTypeForm, 
  AccreditationTypesQueryParams 
} from '@/types/accreditation';
import { toast } from '@/hooks/use-toast';

export function useAccreditationTypes(params: AccreditationTypesQueryParams = {}, options = {}) {
  const {
    data: types,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['accreditation-types', params],
    () => AccreditationTypeService.getAccreditationTypes(params),
    options
  );

  const createMutation = useApiMutation(
    ['accreditation-types', 'create'],
    (form: AccreditationTypeForm) => AccreditationTypeService.createAccreditationType(form),
    {
      onSuccess: () => {
        toast({
          title: 'Typ akredytacji utworzony',
          description: 'Typ akredytacji został utworzony pomyślnie.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się utworzyć typu akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['accreditation-types', 'update'],
    ({ id, updates }: { id: string; updates: Partial<AccreditationTypeForm> }) => 
      AccreditationTypeService.updateAccreditationType(id, updates),
    {
      onSuccess: () => {
        toast({
          title: 'Typ akredytacji zaktualizowany',
          description: 'Typ akredytacji został zaktualizowany pomyślnie.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować typu akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['accreditation-types', 'delete'],
    (id: string) => AccreditationTypeService.deleteAccreditationType(id),
    {
      onSuccess: () => {
        toast({
          title: 'Typ akredytacji usunięty',
          description: 'Typ akredytacji został usunięty pomyślnie.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się usunąć typu akredytacji.',
          variant: 'destructive',
        });
      },
    }
  );

  const createAccreditationType = useCallback((form: AccreditationTypeForm) => {
    createMutation.mutate(form);
  }, [createMutation]);

  const updateAccreditationType = useCallback((id: string, updates: Partial<AccreditationTypeForm>) => {
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const deleteAccreditationType = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    types,
    isLoading,
    isError,
    error,
    refetch,
    createAccreditationType,
    updateAccreditationType,
    deleteAccreditationType,
    isSubmitting: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
