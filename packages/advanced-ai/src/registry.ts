/**
 * AI Tools Registry
 * Central registry for all AI tools with favorites and usage tracking
 */

import type { ToolDefinition, ToolRegistry, ToolCategory, ToolUsageStats } from './types';
import { cacheManager } from './cache/manager';
import { rateLimiter } from './rate-limiter';
import { performanceMonitor } from './performance';

const FAVORITES_KEY = 'ai-tools-favorites';
const USAGE_KEY = 'ai-tools-usage';

class ToolRegistryImpl implements ToolRegistry {
  tools: Map<string, ToolDefinition> = new Map();
  favorites: Set<string> = new Set();
  usage: Map<string, ToolUsageStats> = new Map();

  constructor() {
    this.loadFavorites();
    this.loadUsage();
  }

  // Core tool management
  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  async execute(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Start performance measurement
    const endMeasure = performanceMonitor.startMeasure(name);
    let cacheHit = false;
    let success = false;

    try {
      // Check cache if tool is cacheable
      if (tool.cacheable !== false) {
        const cached = await cacheManager.get(name, params);
        if (cached !== null) {
          cacheHit = true;
          success = true;
          const executionTime = endMeasure();

          // Record performance
          performanceMonitor.record({
            executionTime,
            cacheHit: true,
            timestamp: Date.now(),
            tool: name,
            success: true,
          });

          // Track usage
          this.trackUsage(name, executionTime, true);

          return cached;
        }
      }

      // Execute with rate limiting
      const result = await rateLimiter.execute(name, async () => {
        return tool.execute(params);
      });

      success = true;
      const executionTime = endMeasure();

      // Cache result if tool is cacheable
      if (tool.cacheable !== false) {
        const ttl = tool.cacheTTL || 60 * 60 * 1000; // Default 1 hour
        await cacheManager.set(name, params, result, ttl);
      }

      // Record performance
      performanceMonitor.record({
        executionTime,
        cacheHit: false,
        timestamp: Date.now(),
        tool: name,
        success: true,
      });

      // Track usage
      this.trackUsage(name, executionTime, false);

      return result;
    } catch (error) {
      const executionTime = endMeasure();

      // Record performance
      performanceMonitor.record({
        executionTime,
        cacheHit: false,
        timestamp: Date.now(),
        tool: name,
        success: false,
      });

      throw error;
    }
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  listByCategory(category: ToolCategory): ToolDefinition[] {
    return this.list().filter(tool => tool.category === category);
  }

  search(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.list().filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(lowerQuery);
      const descMatch = tool.description.toLowerCase().includes(lowerQuery);
      const tagMatch = tool.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const categoryMatch = tool.category.toLowerCase().includes(lowerQuery);
      return nameMatch || descMatch || tagMatch || categoryMatch;
    });
  }

  // Favorites management
  addFavorite(name: string) {
    this.favorites.add(name);
    this.saveFavorites();
  }

  removeFavorite(name: string) {
    this.favorites.delete(name);
    this.saveFavorites();
  }

  isFavorite(name: string): boolean {
    return this.favorites.has(name);
  }

  listFavorites(): ToolDefinition[] {
    return this.list().filter(tool => this.favorites.has(tool.name));
  }

  // Usage tracking
  trackUsage(name: string, executionTime?: number, cacheHit?: boolean) {
    const stats = this.usage.get(name) || {
      count: 0,
      lastUsed: 0,
      avgExecutionTime: 0,
      cacheHitRate: 0,
    };

    stats.count += 1;
    stats.lastUsed = Date.now();

    // Update average execution time
    if (executionTime !== undefined) {
      const totalTime = (stats.avgExecutionTime || 0) * (stats.count - 1);
      stats.avgExecutionTime = (totalTime + executionTime) / stats.count;
    }

    // Update cache hit rate
    if (cacheHit !== undefined) {
      const previousHits = ((stats.cacheHitRate || 0) / 100) * (stats.count - 1);
      const newHits = previousHits + (cacheHit ? 1 : 0);
      stats.cacheHitRate = (newHits / stats.count) * 100;
    }

    this.usage.set(name, stats);
    this.saveUsage();
  }

  getUsageStats(name: string): ToolUsageStats | undefined {
    return this.usage.get(name);
  }

  getMostUsed(limit: number = 10): ToolDefinition[] {
    const sorted = this.list().sort((a, b) => {
      const aStats = this.usage.get(a.name);
      const bStats = this.usage.get(b.name);
      const aCount = aStats?.count || 0;
      const bCount = bStats?.count || 0;
      return bCount - aCount;
    });
    return sorted.slice(0, limit);
  }

  getRecent(limit: number = 10): ToolDefinition[] {
    const sorted = this.list().sort((a, b) => {
      const aStats = this.usage.get(a.name);
      const bStats = this.usage.get(b.name);
      const aTime = aStats?.lastUsed || 0;
      const bTime = bStats?.lastUsed || 0;
      return bTime - aTime;
    });
    return sorted.slice(0, limit).filter(tool => {
      const stats = this.usage.get(tool.name);
      return stats && stats.lastUsed > 0;
    });
  }

  // Persistence
  private loadFavorites() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        this.favorites = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  private saveFavorites() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(this.favorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  private loadUsage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.usage = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  }

  private saveUsage() {
    if (typeof window === 'undefined') return;
    try {
      const data = Object.fromEntries(this.usage.entries());
      localStorage.setItem(USAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }

  // Clear all data
  clearUsage() {
    this.usage.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USAGE_KEY);
    }
  }

  clearFavorites() {
    this.favorites.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FAVORITES_KEY);
    }
  }
}

export const toolRegistry = new ToolRegistryImpl();

// Helper to register multiple tools
export function registerTools(...tools: ToolDefinition[]) {
  tools.forEach(tool => toolRegistry.register(tool));
}
