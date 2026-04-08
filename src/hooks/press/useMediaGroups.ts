import { useCallback } from 'react';
import { MediaGroup, MediaGroupForm, MediaGroupsQueryParams } from '@/types/pressRelease';

// Stub: returns empty data. Replace with real Supabase queries when media_groups table exists.
export function useMediaGroups(params: MediaGroupsQueryParams = {}, options = {}) {
  return {
    mediaGroups: [] as MediaGroup[],
    isLoading: false,
    isError: false,
    error: null,
    createMediaGroup: useCallback((_data: MediaGroupForm) => {}, []),
    updateMediaGroup: useCallback((_id: string, _data: Partial<MediaGroupForm>) => {}, []),
    deleteMediaGroup: useCallback((_id: string) => {}, []),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  };
}
