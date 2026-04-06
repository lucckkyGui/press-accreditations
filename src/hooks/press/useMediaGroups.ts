
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';
import { MediaGroup, MediaGroupForm, MediaGroupsQueryParams } from '@/types/pressRelease';
import { toast } from '@/hooks/use-toast';

export function useMediaGroups(params: MediaGroupsQueryParams = {}, options = {}) {
  const {
    data: mediaGroups,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery(
    ['mediaGroups', params],
    () => mockPressReleaseService.getMediaGroups(params),
    options
  );

  const createMutation = useApiMutation(
    ['mediaGroups', 'create'],
    (data: MediaGroupForm) => mockPressReleaseService.createMediaGroup(data),
    {
      onSuccess: () => {
        toast({
          title: 'Grupa utworzona',
          description: 'Grupa mediów została utworzona pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się utworzyć grupy mediów.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['mediaGroups', 'update'],
    ({ id, data }: { id: string; data: Partial<MediaGroupForm> }) =>
      mockPressReleaseService.updateMediaGroup(id, data),
    {
      onSuccess: () => {
        toast({
          title: 'Grupa zaktualizowana',
          description: 'Grupa mediów została zaktualizowana pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować grupy mediów.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['mediaGroups', 'delete'],
    (id: string) => mockPressReleaseService.deleteMediaGroup(id),
    {
      onSuccess: () => {
        toast({
          title: 'Grupa usunięta',
          description: 'Grupa mediów została usunięta pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się usunąć grupy mediów.',
          variant: 'destructive',
        });
      },
    }
  );

  const createMediaGroup = useCallback(
    (data: MediaGroupForm) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const updateMediaGroup = useCallback(
    (id: string, data: Partial<MediaGroupForm>) => {
      updateMutation.mutate({ id, data });
    },
    [updateMutation]
  );

  const deleteMediaGroup = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return {
    mediaGroups,
    isLoading,
    isError,
    error,
    createMediaGroup,
    updateMediaGroup,
    deleteMediaGroup,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
