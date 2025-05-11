
export interface Accreditation {
  id: string;
  requestId?: string;
  eventId: string;
  userId: string;
  typeId: string;
  qrCode: string;
  validityStart: string;
  validityEnd: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  revoked: boolean;
  revocationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccreditationForm {
  requestId?: string;
  eventId: string;
  userId: string;
  typeId: string;
  validityStart: string;
  validityEnd: string;
}

export interface AccreditationsQueryParams {
  eventId?: string;
  userId?: string;
  typeId?: string;
  isCheckedIn?: boolean;
  revoked?: boolean;
  page?: number;
  limit?: number;
}

export interface CheckInData {
  accreditationId: string;
  checkedInBy: string;
}
