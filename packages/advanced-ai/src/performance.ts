/**
 * AI Tools Performance Monitoring
 * Track execution times, cache hits, and performance metrics
 */

import type { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private aggregatedStats: Map<string, {
    totalExecutions: number;
    successfulExecutions: number;
    totalTime: number;
    cacheHits: number;
    avgTime: number;
    cacheHitRate: number;
  }> = new Map();

  /**
   * Start performance measurement
   */
  startMeasure(tool: string): () => void {
    const startTime = performance.now();
    const startMark = `${tool}-start-${Date.now()}`;

    try {
      performance.mark(startMark);
    } catch (error) {
      // Performance API not available
    }

    return () => {
      const endTime = performance.now();
      return endTime - startTime;
    };
  }

  /**
   * Record performance metric
   */
  record(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Trim old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Update aggregated stats
    this.updateAggregatedStats(metric);

    // Save to localStorage
    this.saveMetrics();
  }

  /**
   * Update aggregated statistics
   */
  private updateAggregatedStats(metric: PerformanceMetrics): void {
    const stats = this.aggregatedStats.get(metric.tool) || {
      totalExecutions: 0,
      successfulExecutions: 0,
      totalTime: 0,
      cacheHits: 0,
      avgTime: 0,
      cacheHitRate: 0,
    };

    stats.totalExecutions++;
    if (metric.success) {
      stats.successfulExecutions++;
    }
    stats.totalTime += metric.executionTime;
    if (metric.cacheHit) {
      stats.cacheHits++;
    }
    stats.avgTime = stats.totalTime / stats.totalExecutions;
    stats.cacheHitRate = (stats.cacheHits / stats.totalExecutions) * 100;

    this.aggregatedStats.set(metric.tool, stats);
  }

  /**
   * Get metrics for a specific tool
   */
  getToolMetrics(tool: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.tool === tool);
  }

  /**
   * Get aggregated statistics for a tool
   */
  getToolStats(tool: string) {
    return this.aggregatedStats.get(tool);
  }

  /**
   * Get all aggregated statistics
   */
  getAllStats() {
    return Array.from(this.aggregatedStats.entries()).map(([tool, stats]) => ({
      tool,
      ...stats,
    }));
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get slowest tools
   */
  getSlowestTools(limit: number = 5) {
    return this.getAllStats()
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  /**
   * Get fastest tools
   */
  getFastestTools(limit: number = 5) {
    return this.getAllStats()
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, limit);
  }

  /**
   * Get cache performance
   */
  getCachePerformance() {
    const stats = this.getAllStats();
    const totalHits = stats.reduce((sum, s) => sum + s.cacheHits, 0);
    const totalExecutions = stats.reduce((sum, s) => sum + s.totalExecutions, 0);

    return {
      totalHits,
      totalExecutions,
      hitRate: totalExecutions > 0 ? (totalHits / totalExecutions) * 100 : 0,
      byTool: stats.map(s => ({
        tool: s.tool,
        hitRate: s.cacheHitRate,
      })),
    };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const stats = this.getAllStats();
    const totalExecutions = stats.reduce((sum, s) => sum + s.totalExecutions, 0);
    const totalTime = stats.reduce((sum, s) => sum + s.totalTime, 0);
    const totalSuccesses = stats.reduce((sum, s) => sum + s.successfulExecutions, 0);

    return {
      totalExecutions,
      totalTime,
      avgTime: totalExecutions > 0 ? totalTime / totalExecutions : 0,
      successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0,
      uniqueTools: stats.length,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.aggregatedStats.clear();
    this.saveMetrics();
  }

  /**
   * Export metrics
   */
  export() {
    return {
      metrics: this.metrics,
      aggregatedStats: Array.from(this.aggregatedStats.entries()),
      timestamp: Date.now(),
    };
  }

  /**
   * Import metrics
   */
  import(data: any): void {
    if (data.metrics) {
      this.metrics = data.metrics;
    }
    if (data.aggregatedStats) {
      this.aggregatedStats = new Map(data.aggregatedStats);
    }
    this.saveMetrics();
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      const data = {
        metrics: this.metrics.slice(-100), // Save last 100 only
        aggregatedStats: Array.from(this.aggregatedStats.entries()),
      };
      localStorage.setItem('ai-tools-performance', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetrics(): void {
    try {
      const data = localStorage.getItem('ai-tools-performance');
      if (!data) return;

      const parsed = JSON.parse(data);
      this.metrics = parsed.metrics || [];
      this.aggregatedStats = new Map(parsed.aggregatedStats || []);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  constructor() {
    this.loadMetrics();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance measurement decorator
 */
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  tool: string,
  fn: T,
  cacheable: boolean = false
): T {
  return (async (...args: any[]) => {
    const endMeasure = performanceMonitor.startMeasure(tool);
    let success = false;
    let cacheHit = false;

    try {
      const result = await fn(...args);
      success = true;

      // Check if result came from cache (heuristic: very fast execution)
      const executionTime = endMeasure();
      cacheHit = cacheable && executionTime < 10; // < 10ms likely from cache

      performanceMonitor.record({
        executionTime,
        cacheHit,
        timestamp: Date.now(),
        tool,
        success,
      });

      return result;
    } catch (error) {
      const executionTime = endMeasure();

      performanceMonitor.record({
        executionTime,
        cacheHit: false,
        timestamp: Date.now(),
        tool,
        success: false,
      });

      throw error;
    }
  }) as T;
}
