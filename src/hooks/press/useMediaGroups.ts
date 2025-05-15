
import { useState, useEffect } from 'react';
import { 
  MediaGroup, 
  MediaGroupForm, 
  MediaGroupsQueryParams 
} from '@/types/pressRelease';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';

export const useMediaGroups = (params?: MediaGroupsQueryParams) => {
  const [mediaGroups, setMediaGroups] = useState<MediaGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMediaGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockPressReleaseService.getMediaGroups(params);
      
      if (response.error) {
        setError(response.error.message);
      } else if (response.data) {
        setMediaGroups(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas pobierania grup mediów');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMediaGroups();
  }, [params?.search]);
  
  const createMediaGroup = async (form: MediaGroupForm): Promise<MediaGroup | null> => {
    try {
      const response = await mockPressReleaseService.createMediaGroup(form);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        fetchMediaGroups();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas tworzenia grupy mediów');
      return null;
    }
  };
  
  const updateMediaGroup = async (id: string, form: Partial<MediaGroupForm>): Promise<MediaGroup | null> => {
    try {
      const response = await mockPressReleaseService.updateMediaGroup(id, form);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        setMediaGroups(prev => 
          prev.map(group => group.id === id ? response.data : group)
        );
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas aktualizacji grupy mediów');
      return null;
    }
  };
  
  const deleteMediaGroup = async (id: string): Promise<boolean> => {
    try {
      const response = await mockPressReleaseService.deleteMediaGroup(id);
      
      if (response.error) {
        setError(response.error.message);
        return false;
      } else {
        setMediaGroups(prev => prev.filter(group => group.id !== id));
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas usuwania grupy mediów');
      return false;
    }
  };
  
  return { 
    mediaGroups,
    isLoading,
    error,
    refresh: fetchMediaGroups,
    createMediaGroup,
    updateMediaGroup,
    deleteMediaGroup
  };
};
