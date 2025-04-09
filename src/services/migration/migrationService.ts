
import { SyncOperation, ApiResponse } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Serwis odpowiedzialny za migrację danych do Supabase
 * oraz synchronizację operacji offline
 */

// Klucz do przechowywania operacji w localStorage
const SYNC_OPERATIONS_KEY = "event_manager_sync_operations";

// Interfejs dla funkcji migracji
interface MigrationOptions {
  onProgress?: (progress: number, total: number) => void;
  batchSize?: number;
}

/**
 * Klasa zarządzająca migracją i synchronizacją danych
 */
export class MigrationService {
  // Zapisuje operację do synchronizacji
  static saveOperation(operation: Omit<SyncOperation, "id" | "timestamp" | "status">): void {
    try {
      const existingOperations: SyncOperation[] = this.getPendingOperations();
      
      const newOperation: SyncOperation = {
        ...operation,
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        status: "pending"
      };
      
      existingOperations.push(newOperation);
      localStorage.setItem(SYNC_OPERATIONS_KEY, JSON.stringify(existingOperations));
      
      console.log(`Operation queued for sync: ${operation.type} - ${operation.entity}`);
    } catch (error) {
      console.error("Error saving operation:", error);
    }
  }

  // Pobiera oczekujące operacje
  static getPendingOperations(): SyncOperation[] {
    try {
      const operations = localStorage.getItem(SYNC_OPERATIONS_KEY);
      return operations ? JSON.parse(operations) : [];
    } catch (error) {
      console.error("Error retrieving operations:", error);
      return [];
    }
  }

  // Aktualizuje status operacji
  static updateOperationStatus(id: string, status: 'synced' | 'failed', error?: string): void {
    try {
      const operations = this.getPendingOperations();
      const updatedOperations = operations.map(op => 
        op.id === id ? { ...op, status, error } : op
      );
      
      localStorage.setItem(SYNC_OPERATIONS_KEY, JSON.stringify(updatedOperations));
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  }

  // Synchronizuje wszystkie oczekujące operacje
  static async syncPendingOperations(
    syncFn: (operations: SyncOperation[]) => Promise<ApiResponse<{successful: string[], failed: {id: string, error: string}[]}>>
  ): Promise<{successful: number, failed: number}> {
    const pendingOperations = this.getPendingOperations().filter(op => op.status === "pending");
    
    if (pendingOperations.length === 0) {
      return { successful: 0, failed: 0 };
    }
    
    try {
      const result = await syncFn(pendingOperations);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (result.data) {
        // Aktualizacja statusów operacji
        result.data.successful.forEach(id => {
          this.updateOperationStatus(id, "synced");
        });
        
        result.data.failed.forEach(({id, error}) => {
          this.updateOperationStatus(id, "failed", error);
        });
        
        // Usunięcie zsynchronizowanych operacji po 24h
        this.cleanupSyncedOperations();
        
        return { 
          successful: result.data.successful.length, 
          failed: result.data.failed.length 
        };
      }
      
      return { successful: 0, failed: 0 };
    } catch (error) {
      console.error("Error syncing operations:", error);
      toast({
        title: "Błąd synchronizacji",
        description: "Nie udało się zsynchronizować danych. Spróbuj ponownie później.",
        variant: "destructive"
      });
      return { successful: 0, failed: pendingOperations.length };
    }
  }

  // Usuwa zsynchronizowane operacje starsze niż 24h
  private static cleanupSyncedOperations(): void {
    try {
      const operations = this.getPendingOperations();
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const filteredOperations = operations.filter(op => {
        if (op.status !== "synced") return true;
        
        const opDate = new Date(op.timestamp);
        return opDate > oneDayAgo;
      });
      
      localStorage.setItem(SYNC_OPERATIONS_KEY, JSON.stringify(filteredOperations));
    } catch (error) {
      console.error("Error cleaning up synced operations:", error);
    }
  }

  /**
   * Migruje dane z localStorage do Supabase
   */
  static async migrateLocalData(
    migrationFn: (data: any[], entity: string) => Promise<ApiResponse<{successful: number, failed: number}>>,
    getLocalDataFn: (entity: string) => any[],
    entities: string[],
    options: MigrationOptions = {}
  ): Promise<{[key: string]: {successful: number, failed: number}}> {
    const results: {[key: string]: {successful: number, failed: number}} = {};
    const { onProgress, batchSize = 50 } = options;
    
    let currentEntity = 0;
    
    for (const entity of entities) {
      try {
        const localData = getLocalDataFn(entity);
        
        if (!localData || localData.length === 0) {
          results[entity] = { successful: 0, failed: 0 };
          continue;
        }
        
        // Migracja danych w paczkach
        const batches = [];
        for (let i = 0; i < localData.length; i += batchSize) {
          batches.push(localData.slice(i, i + batchSize));
        }
        
        let successful = 0;
        let failed = 0;
        
        for (let i = 0; i < batches.length; i++) {
          const result = await migrationFn(batches[i], entity);
          
          if (result.error) {
            console.error(`Error migrating ${entity}:`, result.error);
            failed += batches[i].length;
          } else if (result.data) {
            successful += result.data.successful;
            failed += result.data.failed;
          }
          
          if (onProgress) {
            const totalEntities = entities.length;
            const totalBatches = batches.length;
            const progress = ((currentEntity / totalEntities) + ((i + 1) / totalBatches) / totalEntities) * 100;
            onProgress(Math.round(progress), 100);
          }
        }
        
        results[entity] = { successful, failed };
        
      } catch (error) {
        console.error(`Error migrating ${entity}:`, error);
        results[entity] = { 
          successful: 0, 
          failed: getLocalDataFn(entity)?.length || 0 
        };
      }
      
      currentEntity++;
    }
    
    return results;
  }
}

/**
 * Hook do obsługi synchronizacji danych offline
 * Będzie używany po zintegrowaniu projektu z Supabase
 */
export const useMigration = () => {
  const syncPendingOperations = async (
    syncFn: (operations: SyncOperation[]) => Promise<ApiResponse<{successful: string[], failed: {id: string, error: string}[]}>>
  ) => {
    return MigrationService.syncPendingOperations(syncFn);
  };

  const migrateLocalData = async (
    migrationFn: (data: any[], entity: string) => Promise<ApiResponse<{successful: number, failed: number}>>,
    getLocalDataFn: (entity: string) => any[],
    entities: string[],
    options?: MigrationOptions
  ) => {
    return MigrationService.migrateLocalData(migrationFn, getLocalDataFn, entities, options);
  };

  return {
    saveOperation: MigrationService.saveOperation,
    getPendingOperations: MigrationService.getPendingOperations,
    syncPendingOperations,
    migrateLocalData,
  };
};
