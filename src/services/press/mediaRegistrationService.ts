import { supabase } from "@/integrations/supabase/client";
import { 
  MediaRegistration, 
  MediaRegistrationForm,
  MediaRegistrationUpdateForm,
  MediaRegistrationQueryParams,
  MediaRegistrationStatus,
  SocialMedia,
  MediaDocument,
  MediaDocumentForm,
  MediaDocumentUpdateForm,
  MediaDocumentQueryParams,
  MediaDocumentStatus,
  MediaDocumentType
} from "@/types/pressRelease";
import { ApiResponse } from "@/types/api/apiResponse";
import { v4 as uuidv4 } from 'uuid';

export const MediaRegistrationService = {
  // Media Registration Methods
  async getMediaRegistrations(params: MediaRegistrationQueryParams = {}): Promise<ApiResponse<MediaRegistration[]>> {
    try {
      let query = supabase
        .from('media_registrations')
        .select('*, documents:media_documents(*)');
      
      if (params.eventId) {
        query = query.eq('event_id', params.eventId);
      }
      
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }
      
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      if (params.limit) {
        query = query.limit(params.limit);
      }
      
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const registrations: MediaRegistration[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        eventId: item.event_id,
        mediaOrganization: item.media_organization,
        jobTitle: item.job_title,
        website: item.website,
        socialMedia: item.social_media as SocialMedia,
        previousAccreditation: item.previous_accreditation,
        coverageDescription: item.coverage_description,
        status: item.status as MediaRegistrationStatus,
        reviewerId: item.reviewer_id,
        rejectionReason: item.rejection_reason,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        documents: item.documents ? item.documents.map(doc => ({
          id: doc.id,
          registrationId: doc.registration_id,
          filePath: doc.file_path,
          fileName: doc.file_name,
          fileType: doc.file_type,
          documentType: doc.document_type as MediaDocumentType,
          status: doc.status as MediaDocumentStatus,
          reviewerNotes: doc.reviewer_notes,
          uploadedAt: doc.uploaded_at,
          reviewedAt: doc.reviewed_at
        })) : []
      }));
      
      return { data: registrations };
    } catch (error: any) {
      console.error('Error fetching media registrations:', error);
      return { error: { message: error.message, code: 'FETCH_ERROR' } };
    }
  },
  
  async getMediaRegistration(id: string): Promise<ApiResponse<MediaRegistration>> {
    try {
      const { data, error } = await supabase
        .from('media_registrations')
        .select('*, documents:media_documents(*)')
        .eq('id', id)
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      const registration: MediaRegistration = {
        id: data.id,
        userId: data.user_id,
        eventId: data.event_id,
        mediaOrganization: data.media_organization,
        jobTitle: data.job_title,
        website: data.website,
        socialMedia: data.social_media as SocialMedia,
        previousAccreditation: data.previous_accreditation,
        coverageDescription: data.coverage_description,
        status: data.status as MediaRegistrationStatus,
        reviewerId: data.reviewer_id,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        documents: data.documents ? data.documents.map(doc => ({
          id: doc.id,
          registrationId: doc.registration_id,
          filePath: doc.file_path,
          fileName: doc.file_name,
          fileType: doc.file_type,
          documentType: doc.document_type as MediaDocumentType,
          status: doc.status as MediaDocumentStatus,
          reviewerNotes: doc.reviewer_notes,
          uploadedAt: doc.uploaded_at,
          reviewedAt: doc.reviewed_at
        })) : []
      };
      
      return { data: registration };
    } catch (error: any) {
      console.error('Error fetching media registration:', error);
      return { error: { message: error.message, code: 'FETCH_ERROR' } };
    }
  },
  
  async createMediaRegistration(form: MediaRegistrationForm): Promise<ApiResponse<MediaRegistration>> {
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('media_registrations')
        .insert({
          user_id: user.id,
          event_id: form.eventId,
          media_organization: form.mediaOrganization,
          job_title: form.jobTitle,
          website: form.website,
          social_media: form.socialMedia,
          previous_accreditation: form.previousAccreditation,
          coverage_description: form.coverageDescription,
          status: 'pending' as MediaRegistrationStatus
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      const registration: MediaRegistration = {
        id: data.id,
        userId: data.user_id,
        eventId: data.event_id,
        mediaOrganization: data.media_organization,
        jobTitle: data.job_title,
        website: data.website,
        socialMedia: data.social_media as SocialMedia,
        previousAccreditation: data.previous_accreditation,
        coverageDescription: data.coverage_description,
        status: data.status as MediaRegistrationStatus,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        documents: []
      };
      
      return { data: registration };
    } catch (error: any) {
      console.error('Error creating media registration:', error);
      return { error: { message: error.message, code: 'CREATE_ERROR' } };
    }
  },
  
  async updateMediaRegistration(id: string, form: MediaRegistrationUpdateForm): Promise<ApiResponse<MediaRegistration>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const updateData: Record<string, any> = {};
      
      // Only include fields that are present in the form
      if (form.mediaOrganization) updateData.media_organization = form.mediaOrganization;
      if (form.jobTitle) updateData.job_title = form.jobTitle;
      if (form.website !== undefined) updateData.website = form.website;
      if (form.socialMedia !== undefined) updateData.social_media = form.socialMedia;
      if (form.previousAccreditation !== undefined) updateData.previous_accreditation = form.previousAccreditation;
      if (form.coverageDescription !== undefined) updateData.coverage_description = form.coverageDescription;
      if (form.status) {
        updateData.status = form.status;
        updateData.reviewer_id = user.id; // Set reviewer ID on status change
        if (form.status === 'rejected' && form.rejectionReason) {
          updateData.rejection_reason = form.rejectionReason;
        }
      }
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('media_registrations')
        .update(updateData)
        .eq('id', id)
        .select('*, documents:media_documents(*)')
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      const registration: MediaRegistration = {
        id: data.id,
        userId: data.user_id,
        eventId: data.event_id,
        mediaOrganization: data.media_organization,
        jobTitle: data.job_title,
        website: data.website,
        socialMedia: data.social_media as SocialMedia,
        previousAccreditation: data.previous_accreditation,
        coverageDescription: data.coverage_description,
        status: data.status as MediaRegistrationStatus,
        reviewerId: data.reviewer_id,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        documents: data.documents ? data.documents.map(doc => ({
          id: doc.id,
          registrationId: doc.registration_id,
          filePath: doc.file_path,
          fileName: doc.file_name,
          fileType: doc.file_type,
          documentType: doc.document_type as MediaDocumentType,
          status: doc.status as MediaDocumentStatus,
          reviewerNotes: doc.reviewer_notes,
          uploadedAt: doc.uploaded_at,
          reviewedAt: doc.reviewed_at
        })) : []
      };
      
      return { data: registration };
    } catch (error: any) {
      console.error('Error updating media registration:', error);
      return { error: { message: error.message, code: 'UPDATE_ERROR' } };
    }
  },
  
  async deleteMediaRegistration(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('media_registrations')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      return { data: undefined };
    } catch (error: any) {
      console.error('Error deleting media registration:', error);
      return { error: { message: error.message, code: 'DELETE_ERROR' } };
    }
  },
  
  // Media Document Methods
  async getMediaDocuments(params: MediaDocumentQueryParams = {}): Promise<ApiResponse<MediaDocument[]>> {
    try {
      let query = supabase.from('media_documents').select('*');
      
      if (params.registrationId) {
        query = query.eq('registration_id', params.registrationId);
      }
      
      if (params.documentType) {
        query = query.eq('document_type', params.documentType);
      }
      
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const documents: MediaDocument[] = data.map(item => ({
        id: item.id,
        registrationId: item.registration_id,
        filePath: item.file_path,
        fileName: item.file_name,
        fileType: item.file_type,
        documentType: item.document_type as MediaDocumentType,
        status: item.status as MediaDocumentStatus,
        reviewerNotes: item.reviewer_notes,
        uploadedAt: item.uploaded_at,
        reviewedAt: item.reviewed_at
      }));
      
      return { data: documents };
    } catch (error: any) {
      console.error('Error fetching media documents:', error);
      return { error: { message: error.message, code: 'FETCH_ERROR' } };
    }
  },
  
  async uploadMediaDocument(form: MediaDocumentForm): Promise<ApiResponse<MediaDocument>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First verify that the user owns the registration
      const { data: registration, error: regError } = await supabase
        .from('media_registrations')
        .select('user_id')
        .eq('id', form.registrationId)
        .single();
        
      if (regError || !registration) {
        throw new Error('Registration not found or access denied');
      }
      
      if (registration.user_id !== user.id) {
        throw new Error('You do not have permission to upload documents for this registration');
      }
      
      // Generate unique file path: userId/registrationId/documentType-uuid.ext
      const fileExt = form.file.name.split('.').pop();
      const filePath = `${user.id}/${form.registrationId}/${form.documentType}-${uuidv4()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('media_documents')
        .upload(filePath, form.file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // Create document record
      const { data, error } = await supabase
        .from('media_documents')
        .insert({
          registration_id: form.registrationId,
          file_path: filePath,
          file_name: form.file.name,
          file_type: form.file.type,
          document_type: form.documentType,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      const document: MediaDocument = {
        id: data.id,
        registrationId: data.registration_id,
        filePath: data.file_path,
        fileName: data.file_name,
        fileType: data.file_type,
        documentType: data.document_type as MediaDocumentType,
        status: data.status as MediaDocumentStatus,
        reviewerNotes: data.reviewer_notes,
        uploadedAt: data.uploaded_at,
        reviewedAt: data.reviewed_at
      };
      
      return { data: document };
    } catch (error: any) {
      console.error('Error uploading media document:', error);
      return { error: { message: error.message, code: 'UPLOAD_ERROR' } };
    }
  },
  
  async updateMediaDocument(id: string, form: MediaDocumentUpdateForm): Promise<ApiResponse<MediaDocument>> {
    try {
      const updateData: Record<string, any> = {};
      
      if (form.status) {
        updateData.status = form.status;
        updateData.reviewed_at = new Date().toISOString();
      }
      
      if (form.reviewerNotes !== undefined) {
        updateData.reviewer_notes = form.reviewerNotes;
      }
      
      const { data, error } = await supabase
        .from('media_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      const document: MediaDocument = {
        id: data.id,
        registrationId: data.registration_id,
        filePath: data.file_path,
        fileName: data.file_name,
        fileType: data.file_type,
        documentType: data.document_type as MediaDocumentType,
        status: data.status as MediaDocumentStatus,
        reviewerNotes: data.reviewer_notes,
        uploadedAt: data.uploaded_at,
        reviewedAt: data.reviewed_at
      };
      
      return { data: document };
    } catch (error: any) {
      console.error('Error updating media document:', error);
      return { error: { message: error.message, code: 'UPDATE_ERROR' } };
    }
  },
  
  async deleteMediaDocument(id: string): Promise<ApiResponse<void>> {
    try {
      // First get the document to get the file path
      const { data: document, error: getError } = await supabase
        .from('media_documents')
        .select('file_path')
        .eq('id', id)
        .single();
        
      if (getError || !document) {
        throw new Error('Document not found');
      }
      
      // Delete the file from storage
      const { error: deleteStorageError } = await supabase
        .storage
        .from('media_documents')
        .remove([document.file_path]);
        
      if (deleteStorageError) {
        throw new Error(deleteStorageError.message);
      }
      
      // Delete the document record
      const { error } = await supabase
        .from('media_documents')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      return { data: undefined };
    } catch (error: any) {
      console.error('Error deleting media document:', error);
      return { error: { message: error.message, code: 'DELETE_ERROR' } };
    }
  },
  
  getDocumentUrl(filePath: string): string {
    const { data } = supabase.storage.from('media_documents').getPublicUrl(filePath);
    return data.publicUrl;
  }
};
