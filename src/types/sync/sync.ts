
/**
 * Typy związane z synchronizacją offline
 */

// Dodatkowe typy do synchronizacji danych offline
export interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  entity: "guest" | "event" | "notification" | "scan";
  entityId: string;
  data: any;
  timestamp: string;
  status: "pending" | "synced" | "failed";
  error?: string;
}

// Interfejs do obsługi zapisywania i odczytywania danych z lokalnego storage
export interface LocalStorageService {
  set(key: string, value: any): void;
  get<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}
