import { useState, useEffect } from 'react';
import { 
  PressRelease, 
  PressReleaseForm, 
  PressReleasesQueryParams 
} from '@/types/pressRelease';
import { supabase } from '@/integrations/supabase/client';

export const usePressReleases = (params?: PressReleasesQueryParams) => {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPressReleases = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('press_releases')
        .select('*');

      if (params?.status) query = query.eq('status', params.status);
      if (params?.type) query = query.eq('type', params.type);
      if (params?.eventId) query = query.eq('event_id', params.eventId);

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      setPressReleases(data as PressRelease[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPressReleases();
  }, [params?.status, params?.type, params?.eventId]);

  const createPressRelease = async (form: PressReleaseForm): Promise<PressRelease | null> => {
    const { data, error } = await supabase
      .from('press_releases')
      .insert([form])
      .select()
      .single();
    
    if (error) throw error;
    return data as PressRelease;
  };

  const deletePressRelease = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('press_releases')
      .delete()
      .eq('id', id);
    
    if (error) return false;
    setPressReleases(prev => prev.filter(pr => pr.id !== id));
    return true;
  };

  const sendPressRelease = async (id: string): Promise<PressRelease | null> => {
    const { data, error } = await supabase
      .from('press_releases')
      .update({ status: 'sent' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as PressRelease;
  };

  const schedulePressRelease = async (id: string, date: string): Promise<PressRelease | null> => {
    const { data, error } = await supabase
      .from('press_releases')
      .update({ scheduled_at: date, status: 'scheduled' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as PressRelease;
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
