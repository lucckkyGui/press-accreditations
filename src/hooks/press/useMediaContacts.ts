import { useState, useEffect } from 'react';
import { 
  MediaContact, 
  MediaContactForm, 
  MediaContactsQueryParams 
} from '@/types/pressRelease';

// Stub: returns empty data. Replace with real Supabase queries when media_contacts table exists.
export const useMediaContacts = (params?: MediaContactsQueryParams) => {
  const [mediaContacts, setMediaContacts] = useState<MediaContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaContacts = async () => {
    setIsLoading(true);
    setMediaContacts([]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMediaContacts();
  }, [params?.groupId, params?.search, params?.mediaOutlet]);

  const createMediaContact = async (form: MediaContactForm): Promise<MediaContact | null> => null;
  const updateMediaContact = async (id: string, form: Partial<MediaContactForm>): Promise<MediaContact | null> => null;
  const deleteMediaContact = async (id: string): Promise<boolean> => {
    setMediaContacts(prev => prev.filter(c => c.id !== id));
    return true;
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
