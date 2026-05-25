
import { Guest } from "@/types";

export interface ScanEntry {
  id: string;
  guest: Guest;
  timestamp: Date;
  successful: boolean;
  synced: boolean;
}
