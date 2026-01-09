import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DocumentSubmission {
  id: string;
  eventId: string;
  userId: string;
  title: string;
  description: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  reviewerId: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  version: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export function useDocumentSubmissions(eventId?: string) {
  const { user, isOrganizer } = useAuth();
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('document_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: DocumentSubmission[] = (data || []).map(d => ({
        id: d.id,
        eventId: d.event_id,
        userId: d.user_id,
        title: d.title,
        description: d.description,
        filePath: d.file_path,
        fileName: d.file_name,
        fileType: d.file_type,
        fileSize: d.file_size,
        status: d.status as DocumentSubmission['status'],
        reviewerId: d.reviewer_id,
        reviewNotes: d.review_notes,
        reviewedAt: d.reviewed_at,
        version: d.version || 1,
        parentId: d.parent_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));

      setSubmissions(mapped);
    } catch (error) {
      console.error('Error fetching document submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const createSubmission = async (
    eventId: string,
    title: string,
    filePath: string,
    fileName: string,
    fileType: string,
    fileSize?: number,
    description?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('document_submissions')
        .insert({
          event_id: eventId,
          user_id: user.id,
          title,
          description: description || null,
          file_path: filePath,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Dokument został przesłany');
      await fetchSubmissions();
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      toast.error('Nie udało się przesłać dokumentu');
      return null;
    }
  };

  const updateSubmissionStatus = async (
    submissionId: string,
    status: DocumentSubmission['status'],
    reviewNotes?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('document_submissions')
        .update({
          status,
          reviewer_id: user.id,
          review_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success(`Status dokumentu zmieniony na: ${status}`);
      await fetchSubmissions();
      return true;
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.error('Nie udało się zmienić statusu');
      return false;
    }
  };

  const getSubmissionComments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(c => ({
        id: c.id,
        documentId: c.document_id,
        userId: c.user_id,
        content: c.content,
        createdAt: c.created_at
      })) as DocumentComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (documentId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      toast.success('Dodano komentarz');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Nie udało się dodać komentarza');
      return false;
    }
  };

  return {
    submissions,
    isLoading,
    createSubmission,
    updateSubmissionStatus,
    getSubmissionComments,
    addComment,
    refetch: fetchSubmissions
  };
}
