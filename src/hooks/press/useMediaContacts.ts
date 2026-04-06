
import { useState, useEffect } from 'react';
import { 
  MediaContact, 
  MediaContactForm, 
  MediaContactsQueryParams 
} from '@/types/pressRelease';
import { mockPressReleaseService } from '@/services/press/mockPressReleaseService';

export const useMediaContacts = (params?: MediaContactsQueryParams) => {
  const [mediaContacts, setMediaContacts] = useState<MediaContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMediaContacts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockPressReleaseService.getMediaContacts(params);
      
      if (response.error) {
        setError(response.error.message);
      } else if (response.data) {
        setMediaContacts(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas pobierania kontaktów medialnych');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMediaContacts();
  }, [params?.groupId, params?.search, params?.mediaOutlet]);
  
  const createMediaContact = async (form: MediaContactForm): Promise<MediaContact | null> => {
    try {
      const response = await mockPressReleaseService.createMediaContact(form);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        fetchMediaContacts();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas tworzenia kontaktu medialnego');
      return null;
    }
  };
  
  const updateMediaContact = async (id: string, form: Partial<MediaContactForm>): Promise<MediaContact | null> => {
    try {
      const response = await mockPressReleaseService.updateMediaContact(id, form);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      } else {
        setMediaContacts(prev => 
          prev.map(contact => contact.id === id ? response.data : contact)
        );
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas aktualizacji kontaktu medialnego');
      return null;
    }
  };
  
  const deleteMediaContact = async (id: string): Promise<boolean> => {
    try {
      const response = await mockPressReleaseService.deleteMediaContact(id);
      
      if (response.error) {
        setError(response.error.message);
        return false;
      } else {
        setMediaContacts(prev => prev.filter(contact => contact.id !== id));
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Błąd podczas usuwania kontaktu medialnego');
      return false;
    }
  };
  
  return { 
    mediaContacts,
    isLoading,
    error,
    refresh: fetchMediaContacts,
    createMediaContact,
    updateMediaContact,
    deleteMediaContact
  };
};
