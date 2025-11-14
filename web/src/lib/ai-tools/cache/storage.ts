/**
 * AI Tools Cache Storage
 * Unified storage interface with localStorage and IndexedDB support
 */

interface StorageValue<T> {
  value: T;
  expiresAt: number;
  size: number;
}

const DB_NAME = 'ai-tools-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

// Compression utilities
function compress(str: string): string {
  // Simple run-length encoding for demo
  // In production, use a real compression library
  return str;
}

function decompress(str: string): string {
  return str;
}

// Calculate approximate size in bytes
function getSize(value: any): number {
  return new Blob([JSON.stringify(value)]).size;
}

/**
 * LocalStorage adapter
 */
class LocalStorageAdapter {
  private prefix = 'ai-tools-cache:';

  async get<T>(key: string): Promise<StorageValue<T> | null> {
    try {
      const data = localStorage.getItem(this.prefix + key);
      if (!data) return null;

      const stored = JSON.parse(data) as StorageValue<T>;

      // Check expiration
      if (stored.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      return stored;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const stored: StorageValue<T> = {
        value,
        expiresAt: Date.now() + ttl,
        size: getSize(value),
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(stored));
    } catch (error) {
      // QuotaExceededError - storage full
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('LocalStorage quota exceeded');
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  async keys(): Promise<string[]> {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length));
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    let total = 0;

    for (const key of keys) {
      const stored = await this.get(key);
      if (stored) {
        total += stored.size;
      }
    }

    return total;
  }
}

/**
 * IndexedDB adapter for large values
 */
class IndexedDBAdapter {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async get<T>(key: string): Promise<StorageValue<T> | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const stored = request.result as StorageValue<T> | undefined;

          if (!stored) {
            resolve(null);
            return;
          }

          // Check expiration
          if (stored.expiresAt < Date.now()) {
            this.delete(key);
            resolve(null);
            return;
          }

          resolve(stored);
        };
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const stored: StorageValue<T> = {
      value,
      expiresAt: Date.now() + ttl,
      size: getSize(value),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(stored, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    let total = 0;

    for (const key of keys) {
      const stored = await this.get(key);
      if (stored) {
        total += stored.size;
      }
    }

    return total;
  }
}

/**
 * Unified storage interface with automatic fallback
 */
export class CacheStorage {
  private localStorage: LocalStorageAdapter;
  private indexedDB: IndexedDBAdapter;
  private maxLocalStorageSize = 4.5 * 1024 * 1024; // 4.5MB (leave room for other data)

  constructor() {
    this.localStorage = new LocalStorageAdapter();
    this.indexedDB = new IndexedDBAdapter();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Try localStorage first (faster)
    const localValue = await this.localStorage.get<T>(key);
    if (localValue) return localValue.value;

    // Fallback to IndexedDB
    const indexedValue = await this.indexedDB.get<T>(key);
    if (indexedValue) return indexedValue.value;

    return null;
  }

  /**
   * Set value in cache with automatic storage selection
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const size = getSize(value);

    // Use localStorage for small values (< 100KB)
    if (size < 100 * 1024) {
      try {
        const currentSize = await this.localStorage.size();
        if (currentSize + size < this.maxLocalStorageSize) {
          await this.localStorage.set(key, value, ttl);
          return;
        }
      } catch (error) {
        // Fallback to IndexedDB if localStorage fails
      }
    }

    // Use IndexedDB for large values or when localStorage is full
    await this.indexedDB.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    await Promise.all([
      this.localStorage.delete(key),
      this.indexedDB.delete(key),
    ]);
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    await Promise.all([
      this.localStorage.clear(),
      this.indexedDB.clear(),
    ]);
  }

  /**
   * Get all cache keys
   */
  async keys(): Promise<string[]> {
    const [localKeys, indexedKeys] = await Promise.all([
      this.localStorage.keys(),
      this.indexedDB.keys(),
    ]);

    return [...new Set([...localKeys, ...indexedKeys])];
  }

  /**
   * Get total cache size in bytes
   */
  async size(): Promise<number> {
    const [localSize, indexedSize] = await Promise.all([
      this.localStorage.size(),
      this.indexedDB.size(),
    ]);

    return localSize + indexedSize;
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    const [localSize, indexedSize, localKeys, indexedKeys] = await Promise.all([
      this.localStorage.size(),
      this.indexedDB.size(),
      this.localStorage.keys(),
      this.indexedDB.keys(),
    ]);

    return {
      totalSize: localSize + indexedSize,
      localStorage: {
        size: localSize,
        count: localKeys.length,
        percentage: (localSize / this.maxLocalStorageSize) * 100,
      },
      indexedDB: {
        size: indexedSize,
        count: indexedKeys.length,
      },
    };
  }
}
