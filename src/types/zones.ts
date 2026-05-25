
export interface AccessZone {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: ZonePermission[];
  timeRestrictions?: TimeRestriction[];
  capacity?: number;
}

export interface ZonePermission {
  action: 'enter' | 'exit' | 'access_vip' | 'access_media' | 'access_backstage';
  allowed: boolean;
}

export interface TimeRestriction {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  days: number[];    // 0-6 (Sunday-Saturday)
  description: string;
}

export interface GuestAccessControl {
  guestId: string;
  isBlacklisted: boolean;
  isWhitelisted: boolean;
  blacklistReason?: string;
  whitelistReason?: string;
  accessLog: AccessLogEntry[];
  restrictions: AccessRestriction[];
}

export interface AccessLogEntry {
  id: string;
  timestamp: Date;
  action: 'check-in' | 'check-out' | 'denied' | 'restricted';
  zone: string;
  location?: string;
  deviceInfo?: string;
}

export interface AccessRestriction {
  id: string;
  type: 'time' | 'zone' | 'capacity' | 'custom';
  value: any;
  active: boolean;
  expiresAt?: Date;
}
