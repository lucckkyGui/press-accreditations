
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { MediaRegistrationService } from '@/services/press/mediaRegistrationService';
import { 
  MediaRegistration, 
  MediaRegistrationForm, 
  MediaRegistrationUpdateForm,
  MediaRegistrationQueryParams 
} from '@/types/pressRelease';
import { toast } from '@/hooks/use-toast';

export function useMediaRegistrations(params: MediaRegistrationQueryParams = {}, options = {}) {
  const {
    data: registrations,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['mediaRegistrations', params],
    () => MediaRegistrationService.getMediaRegistrations(params),
    options
  );

  const createMutation = useApiMutation(
    ['mediaRegistrations', 'create'],
    (data: MediaRegistrationForm) => MediaRegistrationService.createMediaRegistration(data),
    {
      onSuccess: () => {
        toast({
          title: 'Registration submitted',
          description: 'Your media accreditation request has been submitted successfully.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit registration.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['mediaRegistrations', 'update'],
    ({ id, data }: { id: string; data: MediaRegistrationUpdateForm }) =>
      MediaRegistrationService.updateMediaRegistration(id, data),
    {
      onSuccess: (data) => {
        toast({
          title: 'Registration updated',
          description: `The registration has been updated to "${data?.status || 'pending'}" status.`,
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update registration.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['mediaRegistrations', 'delete'],
    (id: string) => MediaRegistrationService.deleteMediaRegistration(id),
    {
      onSuccess: () => {
        toast({
          title: 'Registration deleted',
          description: 'The media registration has been deleted successfully.',
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete registration.',
          variant: 'destructive',
        });
      },
    }
  );

  const createMediaRegistration = useCallback(
    (data: MediaRegistrationForm) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const updateMediaRegistration = useCallback(
    (id: string, data: MediaRegistrationUpdateForm) => {
      updateMutation.mutate({ id, data });
    },
    [updateMutation]
  );

  const deleteMediaRegistration = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return {
    registrations,
    isLoading,
    isError,
    error,
    refetch,
    createMediaRegistration,
    updateMediaRegistration,
    deleteMediaRegistration,
    isSubmitting: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
