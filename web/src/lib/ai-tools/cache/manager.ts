/**
 * AI Tools Cache Manager
 * LRU cache implementation with TTL, size limits, and statistics
 */

import { CacheStorage } from './storage';

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  size: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  maxSize: number;
  entries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  byTool: Record<string, {
    hits: number;
    misses: number;
    size: number;
    entries: number;
  }>;
}

export interface CacheConfig {
  maxSize?: number; // in bytes
  defaultTTL?: number; // in milliseconds
  maxEntries?: number;
}

/**
 * LRU Cache Manager
 */
export class CacheManager {
  private storage: CacheStorage;
  private stats: {
    hits: number;
    misses: number;
    byTool: Map<string, { hits: number; misses: number }>;
  };
  private config: Required<CacheConfig>;
  private accessOrder: Map<string, number>; // key -> last access time

  constructor(config: CacheConfig = {}) {
    this.storage = new CacheStorage();
    this.stats = {
      hits: 0,
      misses: 0,
      byTool: new Map(),
    };
    this.config = {
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB default
      defaultTTL: config.defaultTTL || 60 * 60 * 1000, // 1 hour default
      maxEntries: config.maxEntries || 1000,
    };
    this.accessOrder = new Map();

    // Load stats from localStorage
    this.loadStats();
  }

  /**
   * Generate cache key from tool name and parameters
   */
  generateKey(tool: string, params: any): string {
    // Create stable key from tool + params
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    return `${tool}:${this.hashString(paramsStr)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get value from cache
   */
  async get<T>(tool: string, params: any): Promise<T | null> {
    const key = this.generateKey(tool, params);
    const value = await this.storage.get<T>(key);

    if (value) {
      // Cache hit
      this.stats.hits++;
      this.recordToolStat(tool, 'hit');
      this.accessOrder.set(key, Date.now());
      this.saveStats();
      return value;
    }

    // Cache miss
    this.stats.misses++;
    this.recordToolStat(tool, 'miss');
    this.saveStats();
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(tool: string, params: any, value: T, ttl?: number): Promise<void> {
    const key = this.generateKey(tool, params);
    const actualTTL = ttl || this.config.defaultTTL;

    // Check if we need to evict entries (LRU)
    await this.evictIfNeeded();

    // Store value
    await this.storage.set(key, value, actualTTL);
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Evict least recently used entries if cache is full
   */
  private async evictIfNeeded(): Promise<void> {
    const currentSize = await this.storage.size();
    const keys = await this.storage.keys();

    // Check size limit
    if (currentSize > this.config.maxSize) {
      await this.evictLRU(currentSize - this.config.maxSize);
    }

    // Check entry count limit
    if (keys.length >= this.config.maxEntries) {
      await this.evictLRU(0, keys.length - this.config.maxEntries + 1);
    }
  }

  /**
   * Evict least recently used entries
   */
  private async evictLRU(bytesToFree: number = 0, entriesToFree: number = 0): Promise<void> {
    // Sort keys by access time (oldest first)
    const sortedKeys = Array.from(this.accessOrder.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([key]) => key);

    let freedBytes = 0;
    let freedEntries = 0;

    for (const key of sortedKeys) {
      if (freedBytes >= bytesToFree && freedEntries >= entriesToFree) {
        break;
      }

      await this.storage.delete(key);
      this.accessOrder.delete(key);
      freedEntries++;

      // Approximate size freed (we don't track individual sizes currently)
      freedBytes += 1024; // Assume 1KB per entry
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(tool: string, params: any): Promise<void> {
    const key = this.generateKey(tool, params);
    await this.storage.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.storage.clear();
    this.accessOrder.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.byTool.clear();
    this.saveStats();
  }

  /**
   * Clear cache for specific tool
   */
  async clearTool(tool: string): Promise<void> {
    const keys = await this.storage.keys();
    const toolKeys = keys.filter(key => key.startsWith(`${tool}:`));

    for (const key of toolKeys) {
      await this.storage.delete(key);
      this.accessOrder.delete(key);
    }

    this.stats.byTool.delete(tool);
    this.saveStats();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const storageStats = await this.storage.getStats();
    const keys = await this.storage.keys();

    // Calculate oldest and newest entries
    const accessTimes = Array.from(this.accessOrder.values());
    const oldestEntry = accessTimes.length > 0 ? Math.min(...accessTimes) : null;
    const newestEntry = accessTimes.length > 0 ? Math.max(...accessTimes) : null;

    // Group by tool
    const byTool: Record<string, any> = {};
    for (const [tool, stats] of this.stats.byTool.entries()) {
      const toolKeys = keys.filter(key => key.startsWith(`${tool}:`));
      byTool[tool] = {
        hits: stats.hits,
        misses: stats.misses,
        entries: toolKeys.length,
        hitRate: stats.hits + stats.misses > 0
          ? (stats.hits / (stats.hits + stats.misses)) * 100
          : 0,
      };
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0,
      totalSize: storageStats.totalSize,
      maxSize: this.config.maxSize,
      entries: keys.length,
      oldestEntry,
      newestEntry,
      byTool,
    };
  }

  /**
   * Export cache data
   */
  async export(): Promise<any> {
    const keys = await this.storage.keys();
    const data: Record<string, any> = {};

    for (const key of keys) {
      const value = await this.storage.get(key);
      if (value) {
        data[key] = value;
      }
    }

    return {
      version: 1,
      timestamp: Date.now(),
      stats: await this.getStats(),
      data,
    };
  }

  /**
   * Import cache data
   */
  async import(exportData: any): Promise<void> {
    if (exportData.version !== 1) {
      throw new Error('Unsupported cache export version');
    }

    // Clear existing cache
    await this.clear();

    // Import data
    for (const [key, value] of Object.entries(exportData.data)) {
      const [tool] = key.split(':');
      await this.storage.set(key, value, this.config.defaultTTL);
      this.accessOrder.set(key, Date.now());
    }
  }

  /**
   * Warm up cache with popular queries
   */
  async warmup(queries: Array<{ tool: string; params: any; fetch: () => Promise<any> }>): Promise<void> {
    const promises = queries.map(async ({ tool, params, fetch }) => {
      // Check if already cached
      const cached = await this.get(tool, params);
      if (cached) return;

      // Fetch and cache
      try {
        const result = await fetch();
        await this.set(tool, params, result);
      } catch (error) {
        console.error(`Warmup failed for ${tool}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Record tool-specific statistics
   */
  private recordToolStat(tool: string, type: 'hit' | 'miss'): void {
    const stats = this.stats.byTool.get(tool) || { hits: 0, misses: 0 };

    if (type === 'hit') {
      stats.hits++;
    } else {
      stats.misses++;
    }

    this.stats.byTool.set(tool, stats);
  }

  /**
   * Save statistics to localStorage
   */
  private saveStats(): void {
    try {
      const statsData = {
        hits: this.stats.hits,
        misses: this.stats.misses,
        byTool: Array.from(this.stats.byTool.entries()),
      };
      localStorage.setItem('ai-tools-cache-stats', JSON.stringify(statsData));
    } catch (error) {
      console.error('Failed to save cache stats:', error);
    }
  }

  /**
   * Load statistics from localStorage
   */
  private loadStats(): void {
    try {
      const data = localStorage.getItem('ai-tools-cache-stats');
      if (!data) return;

      const statsData = JSON.parse(data);
      this.stats.hits = statsData.hits || 0;
      this.stats.misses = statsData.misses || 0;
      this.stats.byTool = new Map(statsData.byTool || []);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
