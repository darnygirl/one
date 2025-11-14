# AI Tools Performance Features

Complete caching, rate limiting, and performance monitoring system for AI Tools.

## Features Overview

### 1. Result Caching (LRU with TTL)

**Automatically cache tool results** with:
- LRU (Least Recently Used) eviction
- TTL-based expiration
- LocalStorage for small results
- IndexedDB for large results (images, files)
- Automatic cache key generation
- Size limit enforcement (10MB default)

### 2. Cache UI Dashboard

**Visual cache management** with:
- Cache statistics (hits/misses, size)
- Hit rate visualization per tool
- Manual cache clear buttons
- Export/import cache data
- Cache settings (TTL, max size)

### 3. Rate Limiting

**Protect APIs with**:
- Per-minute throttling
- Request queuing
- Daily/hourly quotas
- Tiered limits (free/premium/enterprise)
- Warning notifications at 80% quota

### 4. Performance Monitoring

**Track tool performance**:
- Execution time tracking
- Cache hit rate analysis
- Success/failure rates
- Performance trends
- Slowest/fastest tools

## Usage Examples

### Basic Tool with Caching

```typescript
import { toolRegistry } from '@/lib/ai-tools/registry';

// Register tool with caching enabled
toolRegistry.register({
  name: 'weather',
  description: 'Get weather data',
  category: 'search',
  parameters: [
    {
      name: 'location',
      type: 'string',
      description: 'City name',
      required: true,
    },
  ],
  execute: async (params) => {
    // Fetch weather data (expensive operation)
    const response = await fetch(
      `https://api.weather.com/v1/weather?location=${params.location}`
    );
    return response.json();
  },
  cacheable: true, // Enable caching
  cacheTTL: 30 * 60 * 1000, // 30 minutes
  metadata: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['weather', 'search'],
  },
});

// Execute (automatically cached)
const weather = await toolRegistry.execute('weather', { location: 'Tokyo' });
// First call: Fetches from API
// Second call: Returns from cache (instant!)
```

### Cache Manager UI

```tsx
import { CacheManager } from '@/components/ai-tools/CacheManager';

export function SettingsPage() {
  return (
    <div>
      <h1>Cache Settings</h1>
      <CacheManager />
    </div>
  );
}
```

### Rate Limiting Configuration

```typescript
import { RateLimiter } from '@/lib/ai-tools/rate-limiter';

// Create custom rate limiter
const limiter = new RateLimiter({
  tier: 'premium', // or 'free', 'enterprise'
  maxCallsPerMinute: 60,
  maxConcurrent: 10,
  quotaPerDay: 1000,
  quotaPerHour: 200,
});

// Set warning callback
limiter.onQuotaWarning((stats) => {
  console.warn(`Quota warning: ${stats.percentageUsed}% used`);
  // Show toast notification
});

// Execute with rate limiting
const result = await limiter.execute('weather', async () => {
  return fetchWeatherData();
});

// Check usage stats
const stats = limiter.getUsageStats();
console.log(`Calls today: ${stats.callsToday}/${stats.quotaLimit}`);
```

### Performance Monitoring

```typescript
import { performanceMonitor } from '@/lib/ai-tools/performance';

// Performance is automatically tracked when using toolRegistry

// Get tool performance stats
const weatherStats = performanceMonitor.getToolStats('weather');
console.log(`Avg execution time: ${weatherStats?.avgTime}ms`);
console.log(`Cache hit rate: ${weatherStats?.cacheHitRate}%`);

// Get overall performance summary
const summary = performanceMonitor.getSummary();
console.log(`Total executions: ${summary.totalExecutions}`);
console.log(`Average time: ${summary.avgTime}ms`);
console.log(`Success rate: ${summary.successRate}%`);

// Find slowest tools
const slowest = performanceMonitor.getSlowestTools(5);
slowest.forEach(({ tool, avgTime }) => {
  console.log(`${tool}: ${avgTime}ms`);
});

// Export metrics
const exportData = performanceMonitor.export();
downloadJSON(exportData);
```

## Tier Limits

### Free Tier
- 10 calls/minute
- 2 concurrent requests
- 100 calls/day
- 20 calls/hour

### Premium Tier
- 60 calls/minute
- 10 concurrent requests
- 1,000 calls/day
- 200 calls/hour

### Enterprise Tier
- 300 calls/minute
- 50 concurrent requests
- 10,000 calls/day
- 2,000 calls/hour

## Cache Key Generation

Cache keys are automatically generated from:
1. Tool name
2. Sorted parameter keys
3. Parameter values
4. Hash function

Example:
```typescript
// Input: tool='weather', params={ location: 'Tokyo', units: 'metric' }
// Key: 'weather:a7f3e2d1' (hash of sorted params)
```

## Storage Strategy

### LocalStorage (< 100KB)
- Fast access
- Limited to 5MB total
- Synchronous API
- Good for small results

### IndexedDB (> 100KB)
- Unlimited storage
- Asynchronous API
- Good for images, files, large datasets
- Automatic fallback

## Cache Warmup

Pre-load popular queries:

```typescript
import { cacheManager } from '@/lib/ai-tools/cache/manager';

await cacheManager.warmup([
  {
    tool: 'weather',
    params: { location: 'Tokyo' },
    fetch: () => fetchWeatherData('Tokyo'),
  },
  {
    tool: 'weather',
    params: { location: 'London' },
    fetch: () => fetchWeatherData('London'),
  },
]);
```

## Manual Cache Control

```typescript
import { cacheManager } from '@/lib/ai-tools/cache/manager';

// Get cached result
const cached = await cacheManager.get('weather', { location: 'Tokyo' });

// Set cached result
await cacheManager.set('weather', { location: 'Tokyo' }, weatherData, 60000);

// Delete specific cache entry
await cacheManager.delete('weather', { location: 'Tokyo' });

// Clear all cache for a tool
await cacheManager.clearTool('weather');

// Clear all cache
await cacheManager.clear();

// Get statistics
const stats = await cacheManager.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Entries: ${stats.entries}`);

// Export/import
const exportData = await cacheManager.export();
await cacheManager.import(exportData);
```

## Best Practices

### 1. Set Appropriate TTL

```typescript
// Fast-changing data (5 minutes)
cacheTTL: 5 * 60 * 1000

// Moderate data (30 minutes)
cacheTTL: 30 * 60 * 1000

// Slow-changing data (24 hours)
cacheTTL: 24 * 60 * 60 * 1000

// Static data (7 days)
cacheTTL: 7 * 24 * 60 * 60 * 1000
```

### 2. Disable Cache for Real-Time Data

```typescript
{
  cacheable: false, // Disable caching
}
```

### 3. Monitor Performance

```typescript
// Check if a tool is slow
const stats = performanceMonitor.getToolStats('myTool');
if (stats && stats.avgTime > 1000) {
  console.warn('Tool is slow, consider optimization');
}
```

### 4. Handle Quota Warnings

```typescript
rateLimiter.onQuotaWarning((stats) => {
  toast.warning(`${stats.percentageUsed.toFixed(0)}% of daily quota used`);
});
```

### 5. Optimize Cache Size

```typescript
// Monitor cache size
const stats = await cacheManager.getStats();
const usagePercent = (stats.totalSize / stats.maxSize) * 100;

if (usagePercent > 80) {
  // Clear old entries
  await cacheManager.clearTool('lessUsedTool');
}
```

## Integration with Existing Tools

All existing tools automatically benefit from:
- ✅ Caching (enabled by default)
- ✅ Rate limiting (10 calls/min on free tier)
- ✅ Performance tracking
- ✅ Usage statistics

No code changes required!

## Troubleshooting

### Cache Not Working

1. Check if tool has `cacheable: false`
2. Verify localStorage is enabled
3. Check cache size limits
4. Inspect browser console for errors

### Rate Limiting Issues

1. Check current tier limits
2. Verify usage stats: `rateLimiter.getUsageStats()`
3. Increase limits or upgrade tier
4. Clear old usage data: `rateLimiter.reset()`

### Performance Issues

1. Check slowest tools: `performanceMonitor.getSlowestTools()`
2. Optimize slow tools
3. Increase cache TTL for expensive operations
4. Use Web Workers for heavy computation

## Web Workers (Advanced)

For heavy computation (hashing, image processing):

```typescript
// Create worker
const worker = new Worker(
  new URL('./workers/hash-worker.ts', import.meta.url),
  { type: 'module' }
);

// Use in tool
execute: async (params) => {
  return new Promise((resolve) => {
    worker.postMessage(params);
    worker.onmessage = (e) => resolve(e.data);
  });
}
```

## Next Steps

- Monitor cache hit rates
- Optimize slow tools
- Set appropriate TTL values
- Configure rate limits per tier
- Export metrics for analysis
