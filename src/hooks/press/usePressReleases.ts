import { useState, useEffect } from 'react';
import { 
  PressRelease, 
  PressReleaseForm, 
  PressReleasesQueryParams 
} from '@/types/pressRelease';

// Stub: returns empty data. Replace with real Supabase queries when press_releases table exists.
export const usePressReleases = (params?: PressReleasesQueryParams) => {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPressReleases = async () => {
    // TODO: Replace with supabase query when table exists
    setPressReleases([]);
  };

  useEffect(() => {
    fetchPressReleases();
  }, [params?.status, params?.type, params?.eventId]);

  const createPressRelease = async (_form: PressReleaseForm): Promise<PressRelease | null> => null;
  const deletePressRelease = async (id: string): Promise<boolean> => {
    setPressReleases(prev => prev.filter(pr => pr.id !== id));
    return true;
  };
  const sendPressRelease = async (_id: string): Promise<PressRelease | null> => null;
  const schedulePressRelease = async (_id: string, _date: string): Promise<PressRelease | null> => null;

  return { 
    pressReleases, isLoading, error,
    refresh: fetchPressReleases,
    createPressRelease, deletePressRelease,
    sendPressRelease, schedulePressRelease
  };
};
