
import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { MediaRegistrationService } from '@/services/press/mediaRegistrationService';
import { 
  MediaDocument, 
  MediaDocumentForm, 
  MediaDocumentUpdateForm,
  MediaDocumentQueryParams 
} from '@/types/pressRelease';
import { toast } from '@/hooks/use-toast';

export function useMediaDocuments(params: MediaDocumentQueryParams = {}, options = {}) {
  const {
    data: documents,
    isLoading,
    isError,
    error,
    refetch
  } = useApiQuery(
    ['mediaDocuments', params],
    () => MediaRegistrationService.getMediaDocuments(params),
    options
  );

  const uploadMutation = useApiMutation(
    ['mediaDocuments', 'upload'],
    (form: MediaDocumentForm) => MediaRegistrationService.uploadMediaDocument(form),
    {
      onSuccess: () => {
        toast({
          title: 'Document uploaded',
          description: 'Your document has been uploaded successfully.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to upload document.',
          variant: 'destructive',
        });
      },
    }
  );

  const updateMutation = useApiMutation(
    ['mediaDocuments', 'update'],
    ({ id, data }: { id: string; data: MediaDocumentUpdateForm }) =>
      MediaRegistrationService.updateMediaDocument(id, data),
    {
      onSuccess: (data) => {
        toast({
          title: 'Document updated',
          description: `The document status has been updated to "${data?.status || 'pending'}".`,
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update document.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteMutation = useApiMutation(
    ['mediaDocuments', 'delete'],
    (id: string) => MediaRegistrationService.deleteMediaDocument(id),
    {
      onSuccess: () => {
        toast({
          title: 'Document deleted',
          description: 'The document has been deleted successfully.',
        });
        refetch();
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete document.',
          variant: 'destructive',
        });
      },
    }
  );

  const uploadDocument = useCallback(
    (form: MediaDocumentForm) => {
      uploadMutation.mutate(form);
    },
    [uploadMutation]
  );

  const updateDocument = useCallback(
    (id: string, data: MediaDocumentUpdateForm) => {
      updateMutation.mutate({ id, data });
    },
    [updateMutation]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const getDocumentUrl = useCallback(
    async (filePath: string): Promise<string> => {
      return await MediaRegistrationService.getDocumentUrl(filePath);
    },
    []
  );

  return {
    documents,
    isLoading,
    isError,
    error,
    refetch,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocumentUrl,
    isUploading: uploadMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
