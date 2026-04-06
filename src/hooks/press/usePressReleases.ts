
import { useState, useEffect } from 'react';
import { 
  PressRelease, 
  PressReleaseForm, 
  PressReleasesQueryParams 
} from '@/types/pressRelease';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';

export const usePressReleases = (params?: PressReleasesQueryParams) => {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPressReleases = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockPressReleaseService.getPressReleases(params);
      
      if (response.error) {
        setError(response.error.message);
      } else if (response.data) {
        setPressReleases(response.data);
      }
    } catch (err: unknown) {
      setError(err.message || 'Błąd podczas pobierania komunikatów prasowych');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPressReleases();
  }, [params?.status, params?.type, params?.eventId]);
  
  const createPressRelease = async (form: PressReleaseForm): Promise<PressRelease | null> => {
    try {
      const response = await mockPressReleaseService.createPressRelease(form);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        fetchPressReleases();
        return response.data;
      }
    } catch (err: unknown) {
      setError(err.message || 'Błąd podczas tworzenia komunikatu prasowego');
      return null;
    }
  };
  
  const deletePressRelease = async (id: string): Promise<boolean> => {
    try {
      const response = await mockPressReleaseService.deletePressRelease(id);
      
      if (response.error) {
        setError(response.error.message);
        return false;
      } else {
        setPressReleases(prev => prev.filter(pr => pr.id !== id));
        return true;
      }
    } catch (err: unknown) {
      setError(err.message || 'Błąd podczas usuwania komunikatu prasowego');
      return false;
    }
  };
  
  const sendPressRelease = async (id: string): Promise<PressRelease | null> => {
    try {
      const response = await mockPressReleaseService.sendPressRelease(id);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        setPressReleases(prev => 
          prev.map(pr => pr.id === id ? response.data : pr)
        );
        return response.data;
      }
    } catch (err: unknown) {
      setError(err.message || 'Błąd podczas wysyłania komunikatu prasowego');
      return null;
    }
  };
  
  const schedulePressRelease = async (id: string, date: string): Promise<PressRelease | null> => {
    try {
      const response = await mockPressReleaseService.schedulePressRelease(id, date);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        setPressReleases(prev => 
          prev.map(pr => pr.id === id ? response.data : pr)
        );
        return response.data;
      }
    } catch (err: unknown) {
      setError(err.message || 'Błąd podczas planowania komunikatu prasowego');
      return null;
    }
  };
  
  return { 
    pressReleases,
    isLoading,
    error,
    refresh: fetchPressReleases,
    createPressRelease,
    deletePressRelease,
    sendPressRelease,
    schedulePressRelease
  };
};
