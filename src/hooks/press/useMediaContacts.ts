import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';
import { 
  MediaContact,
  MediaContactForm,
  MediaContactsQueryParams
} from '@/types/pressRelease';
import { toast } from '@/hooks/use-toast';

export function useMediaContacts(params: MediaContactsQueryParams = {}, options = {}) {
  const {
    data: mediaContacts,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['media-contacts', params],
    () => mockPressReleaseService.getMediaContacts(params),
    options
  );

  const createMutation = useApiMutation(
    ['media-contacts', 'create'],
    (form: MediaContactForm) => mockPressReleaseService.createMediaContact(form),
    {
      onSuccess: () => {
        toast({
          title: 'Kontakt utworzony',
          description: 'Kontakt medialny został utworzony pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się utworzyć kontaktu medialnego.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['media-contacts', 'update'],
    ({ id, data }: { id: string; data: Partial<MediaContactForm> }) => 
      mockPressReleaseService.updateMediaContact(id, data),
    {
      onSuccess: () => {
        toast({
          title: 'Kontakt zaktualizowany',
          description: 'Kontakt medialny został zaktualizowany pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaktualizować kontaktu medialnego.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['media-contacts', 'delete'],
    (id: string) => mockPressReleaseService.deleteMediaContact(id),
    {
      onSuccess: () => {
        toast({
          title: 'Kontakt usunięty',
          description: 'Kontakt medialny został usunięty pomyślnie.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się usunąć kontaktu medialnego.',
          variant: 'destructive',
        });
      },
    }
  );

  const importMutation = useApiMutation(
    ['media-contacts', 'import'],
    (file: File) => mockPressReleaseService.importMediaContacts(file),
    {
      onSuccess: (data) => {
        toast({
          title: 'Import zakończony',
          description: `Zaimportowano pomyślnie ${data.successful} kontaktów. Nie udało się zaimportować ${data.failed} kontaktów.`,
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zaimportować kontaktów medialnych.',
          variant: 'destructive',
        });
      },
    }
  );

  const createMediaContact = useCallback((form: MediaContactForm) => {
    createMutation.mutate(form);
  }, [createMutation]);

  const updateMediaContact = useCallback((id: string, data: Partial<MediaContactForm>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deleteMediaContact = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const importMediaContacts = useCallback((file: File) => {
    importMutation.mutate(file);
  }, [importMutation]);

  return {
    mediaContacts,
    isLoading,
    isError,
    error,
    refetch,
    createMediaContact,
    updateMediaContact,
    deleteMediaContact,
    importMediaContacts,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isImporting: importMutation.isLoading,
  };
}
