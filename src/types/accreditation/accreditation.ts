
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
  // Dodatkowe pola dla pełnego cyklu życia akredytacji
  status: AccreditationStatus;
  badgeNumber?: string;
  badgePrinted: boolean;
  badgePrintedAt?: string;
  accessHistory?: AccessHistoryEntry[];
  notes?: string;
}

export type AccreditationStatus = 
  | 'pending'    // Akredytacja oczekuje na przetworzenie
  | 'approved'   // Akredytacja zatwierdzona, ale nie wydana
  | 'issued'     // Identyfikator został wydany
  | 'active'     // Akredytacja aktywna i używana
  | 'expired'    // Akredytacja wygasła
  | 'revoked'    // Akredytacja unieważniona
  | 'suspended'; // Akredytacja tymczasowo zawieszona

export interface AccessHistoryEntry {
  timestamp: string;
  areaId: string;
  areaName: string;
  scannerUserId: string;
  scannerUsername?: string;
  granted: boolean;
  deniedReason?: string;
}

export interface AccreditationForm {
  requestId?: string;
  eventId: string;
  userId: string;
  typeId: string;
  validityStart: string;
  validityEnd: string;
  badgeNumber?: string;
  notes?: string;
  status?: AccreditationStatus;
}

export interface AccreditationsQueryParams {
  eventId?: string;
  userId?: string;
  typeId?: string;
  isCheckedIn?: boolean;
  revoked?: boolean;
  status?: AccreditationStatus;
  badgePrinted?: boolean;
  page?: number;
  limit?: number;
}

export interface CheckInData {
  accreditationId: string;
  checkedInBy: string;
}

export interface AccessAreaEntry {
  areaId: string;
  timestamp: string;
  userId: string;
  accreditationId: string;
  deviceId?: string;
  status: 'granted' | 'denied';
  reason?: string;
}

export interface AccreditationBadgeData {
  id: string;
  firstName: string;
  lastName: string;
  organization: string;
  position?: string;
  typeId: string;
  typeName: string;
  validFrom: string;
  validTo: string;
  qrCode: string;
  badgeNumber?: string;
  photoUrl?: string;
  accessAreas: string[];
  eventName: string;
  eventLogo?: string;
}

export interface AccreditationStats {
  total: number;
  active: number;
  pending: number;
  issued: number;
  checkedIn: number;
  revoked: number;
  byType: {
    typeId: string;
    typeName: string;
    count: number;
  }[];
}
