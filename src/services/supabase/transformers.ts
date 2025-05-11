
import { 
  AccreditationRequest, 
  AccreditationType, 
  Accreditation 
} from "@/types/accreditation";

/**
 * Funkcje transformujące dane między formatem Supabase a formatem aplikacji
 */

// Transformery dla Accreditation Request
export const toAccreditationRequestDb = (data: Partial<AccreditationRequest>) => {
  return {
    id: data.id,
    event_id: data.eventId,
    user_id: data.userId,
    media_name: data.mediaName,
    media_type: data.mediaType,
    website_url: data.websiteUrl,
    contact_email: data.contactEmail,
    contact_phone: data.contactPhone,
    request_notes: data.requestNotes,
    status: data.status,
    approval_notes: data.approvalNotes,
    approval_date: data.approvalDate,
    approved_by: data.approvedBy,
  };
};

export const fromAccreditationRequestDb = (data: any): AccreditationRequest => {
  return {
    id: data.id,
    eventId: data.event_id,
    userId: data.user_id,
    mediaName: data.media_name,
    mediaType: data.media_type,
    websiteUrl: data.website_url,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    requestNotes: data.request_notes,
    status: data.status,
    approvalNotes: data.approval_notes,
    approvalDate: data.approval_date,
    approvedBy: data.approved_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Transformery dla Accreditation Type
export const toAccreditationTypeDb = (data: Partial<AccreditationType>) => {
  return {
    id: data.id,
    event_id: data.eventId,
    name: data.name,
    description: data.description,
    access_areas: data.accessAreas,
    max_requests: data.maxRequests,
    requires_approval: data.requiresApproval,
    created_by: data.createdBy,
  };
};

export const fromAccreditationTypeDb = (data: any): AccreditationType => {
  return {
    id: data.id,
    eventId: data.event_id,
    name: data.name,
    description: data.description,
    accessAreas: data.access_areas,
    maxRequests: data.max_requests,
    requiresApproval: data.requires_approval,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
  };
};

// Transformery dla Accreditation
export const toAccreditationDb = (data: Partial<Accreditation>) => {
  return {
    id: data.id,
    request_id: data.requestId,
    event_id: data.eventId,
    user_id: data.userId,
    type_id: data.typeId,
    qr_code: data.qrCode,
    validity_start: data.validityStart,
    validity_end: data.validityEnd,
    is_checked_in: data.isCheckedIn,
    checked_in_at: data.checkedInAt,
    checked_in_by: data.checkedInBy,
    revoked: data.revoked,
    revocation_reason: data.revocationReason,
  };
};

export const fromAccreditationDb = (data: any): Accreditation => {
  return {
    id: data.id,
    requestId: data.request_id,
    eventId: data.event_id,
    userId: data.user_id,
    typeId: data.type_id,
    qrCode: data.qr_code,
    validityStart: data.validity_start,
    validityEnd: data.validity_end,
    isCheckedIn: data.is_checked_in,
    checkedInAt: data.checked_in_at,
    checkedInBy: data.checked_in_by,
    revoked: data.revoked || false,
    revocationReason: data.revocation_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
