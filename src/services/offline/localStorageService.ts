
import { LocalStorageService } from "@/types/supabase";

/**
 * Serwis do zarządzania danymi w localStorage
 */
class LocalStorageServiceImpl implements LocalStorageService {
  /**
   * Zapisuje dane do localStorage
   */
  set(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  }

  /**
   * Pobiera dane z localStorage
   */
  get<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) return null;
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Usuwa dane z localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }

  /**
   * Czyści całe localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  /**
   * Pobiera wszystkie klucze pasujące do wzorca
   */
  getKeysMatching(pattern: string): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Pobiera rozmiar zajmowany przez localStorage
   */
  getSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }
    return totalSize / 1024; // w KB
  }
}

// Eksportujemy pojedynczą instancję serwisu
export const localStorageService = new LocalStorageServiceImpl();
