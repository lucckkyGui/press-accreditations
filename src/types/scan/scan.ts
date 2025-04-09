
import { ScanEntry } from "@/types/scanner";

/**
 * Typy związane ze skanowaniem
 */

// Rozszerzenie typu ScanEntry o dodatkowe pola potrzebne w Supabase
export interface ScanEntryDB extends Omit<ScanEntry, "timestamp"> {
  timestamp: string;
  eventId: string;
  scannedBy: string;
  location?: string;
  createdAt: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser?: string;
  };
  verificationMethod?: "qr" | "manual" | "face" | "id";
  scanResult?: "success" | "duplicate" | "expired" | "invalid";
}
