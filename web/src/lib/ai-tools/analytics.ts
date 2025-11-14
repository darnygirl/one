/**
 * AI Tools Analytics
 * Usage tracking, performance metrics, and success/failure rates
 */

export interface ToolUsage {
  tool: string;
  timestamp: number;
  duration: number;
  success: boolean;
  parameters?: Record<string, any>;
}

export interface ToolMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  averageDuration: number;
  lastUsed: number;
}

const STORAGE_KEY = 'ai_tools_analytics';
const MAX_RECORDS = 1000;

/**
 * Track tool usage
 */
export function trackToolUsage(usage: ToolUsage): void {
  try {
    const records = getUsageRecords();
    records.push(usage);

    // Keep only recent records
    const recentRecords = records.slice(-MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRecords));
  } catch (error) {
    console.error('Failed to track tool usage:', error);
  }
}

/**
 * Get all usage records
 */
export function getUsageRecords(): ToolUsage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get metrics for a specific tool
 */
export function getToolMetrics(toolName: string): ToolMetrics {
  const records = getUsageRecords().filter(r => r.tool === toolName);

  if (records.length === 0) {
    return {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      successRate: 0,
      averageDuration: 0,
      lastUsed: 0,
    };
  }

  const successfulCalls = records.filter(r => r.success).length;
  const failedCalls = records.length - successfulCalls;
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const lastUsed = Math.max(...records.map(r => r.timestamp));

  return {
    totalCalls: records.length,
    successfulCalls,
    failedCalls,
    successRate: (successfulCalls / records.length) * 100,
    averageDuration: totalDuration / records.length,
    lastUsed,
  };
}

/**
 * Get metrics for all tools
 */
export function getAllToolMetrics(): Record<string, ToolMetrics> {
  const records = getUsageRecords();
  const toolNames = [...new Set(records.map(r => r.tool))];

  const metrics: Record<string, ToolMetrics> = {};
  toolNames.forEach(tool => {
    metrics[tool] = getToolMetrics(tool);
  });

  return metrics;
}

/**
 * Get most popular tools
 */
export function getPopularTools(limit: number = 10): Array<{ tool: string; calls: number }> {
  const metrics = getAllToolMetrics();

  return Object.entries(metrics)
    .map(([tool, data]) => ({ tool, calls: data.totalCalls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, limit);
}

/**
 * Get recent tool usage (last N days)
 */
export function getRecentUsage(days: number = 7): ToolUsage[] {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return getUsageRecords().filter(r => r.timestamp >= cutoff);
}

/**
 * Get usage by time period
 */
export function getUsageByPeriod(period: 'hour' | 'day' | 'week' = 'day'): Record<string, number> {
  const records = getUsageRecords();
  const grouped: Record<string, number> = {};

  records.forEach(record => {
    const date = new Date(record.timestamp);
    let key: string;

    switch (period) {
      case 'hour':
        key = `${date.toISOString().slice(0, 13)}:00`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      default: // day
        key = date.toISOString().slice(0, 10);
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  return grouped;
}

/**
 * Get performance insights
 */
export interface PerformanceInsight {
  type: 'success' | 'warning' | 'error';
  tool: string;
  message: string;
  metric: number;
}

export function getPerformanceInsights(): PerformanceInsight[] {
  const metrics = getAllToolMetrics();
  const insights: PerformanceInsight[] = [];

  Object.entries(metrics).forEach(([tool, data]) => {
    // Success rate insights
    if (data.successRate < 50) {
      insights.push({
        type: 'error',
        tool,
        message: `Low success rate (${data.successRate.toFixed(1)}%)`,
        metric: data.successRate,
      });
    } else if (data.successRate < 80) {
      insights.push({
        type: 'warning',
        tool,
        message: `Moderate success rate (${data.successRate.toFixed(1)}%)`,
        metric: data.successRate,
      });
    } else if (data.successRate >= 95) {
      insights.push({
        type: 'success',
        tool,
        message: `Excellent success rate (${data.successRate.toFixed(1)}%)`,
        metric: data.successRate,
      });
    }

    // Performance insights
    if (data.averageDuration > 5000) {
      insights.push({
        type: 'warning',
        tool,
        message: `Slow average response (${(data.averageDuration / 1000).toFixed(1)}s)`,
        metric: data.averageDuration,
      });
    } else if (data.averageDuration < 500) {
      insights.push({
        type: 'success',
        tool,
        message: `Fast average response (${data.averageDuration.toFixed(0)}ms)`,
        metric: data.averageDuration,
      });
    }
  });

  return insights.sort((a, b) => {
    const typeOrder = { error: 0, warning: 1, success: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
}

/**
 * Export analytics data as JSON
 */
export function exportAnalytics(): string {
  const data = {
    records: getUsageRecords(),
    metrics: getAllToolMetrics(),
    insights: getPerformanceInsights(),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear analytics:', error);
  }
}

/**
 * Measure tool execution time
 */
export async function measureToolExecution<T>(
  toolName: string,
  fn: () => Promise<T>,
  parameters?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let result: T;

  try {
    result = await fn();
    success = true;
    return result;
  } catch (error) {
    throw error;
  } finally {
    const duration = Date.now() - startTime;

    trackToolUsage({
      tool: toolName,
      timestamp: startTime,
      duration,
      success,
      parameters,
    });
  }
}
