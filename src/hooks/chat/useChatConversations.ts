import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ChatConversation {
  id: string;
  eventId: string;
  title: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

export function useChatConversations(eventId?: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
  }, [user, eventId]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: ChatConversation[] = (data || []).map(c => ({
        id: c.id,
        eventId: c.event_id,
        title: c.title,
        createdBy: c.created_by,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));

      setConversations(mapped);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Nie udało się pobrać konwersacji');
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (eventId: string, title?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          event_id: eventId,
          title: title || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newConversation: ChatConversation = {
        id: data.id,
        eventId: data.event_id,
        title: data.title,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setConversations(prev => [newConversation, ...prev]);
      toast.success('Utworzono nową konwersację');
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Nie udało się utworzyć konwersacji');
      return null;
    }
  };

  return {
    conversations,
    isLoading,
    createConversation,
    refetch: fetchConversations
  };
}
