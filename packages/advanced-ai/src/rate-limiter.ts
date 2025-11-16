/**
 * AI Tools Rate Limiter
 * Throttling, queuing, and quota management for API calls
 */

export interface RateLimitConfig {
  maxCallsPerMinute?: number;
  maxConcurrent?: number;
  quotaPerDay?: number;
  quotaPerHour?: number;
  tier?: 'free' | 'premium' | 'enterprise';
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface UsageStats {
  callsThisMinute: number;
  callsThisHour: number;
  callsToday: number;
  quotaUsed: number;
  quotaLimit: number;
  percentageUsed: number;
}

interface QueuedRequest {
  id: string;
  tool: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

/**
 * Tier-based rate limits
 */
const TIER_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    maxCallsPerMinute: 10,
    maxConcurrent: 2,
    quotaPerDay: 100,
    quotaPerHour: 20,
  },
  premium: {
    maxCallsPerMinute: 60,
    maxConcurrent: 10,
    quotaPerDay: 1000,
    quotaPerHour: 200,
  },
  enterprise: {
    maxCallsPerMinute: 300,
    maxConcurrent: 50,
    quotaPerDay: 10000,
    quotaPerHour: 2000,
  },
};

/**
 * Rate Limiter Implementation
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private queue: QueuedRequest[] = [];
  private activeRequests = 0;
  private callHistory: number[] = []; // timestamps of recent calls
  private dailyUsage: Map<string, number> = new Map(); // date -> call count
  private hourlyUsage: Map<string, number> = new Map(); // hour -> call count
  private minuteUsage: Map<string, number> = new Map(); // minute -> call count
  private warningThreshold = 0.8; // 80%
  private onWarning?: (stats: UsageStats) => void;
  private onQuotaExceeded?: (stats: UsageStats) => void;

  constructor(config: RateLimitConfig = {}) {
    const tierConfig = TIER_LIMITS[config.tier || 'free'];
    this.config = {
      ...tierConfig,
      ...config,
      tier: config.tier || 'free',
    } as Required<RateLimitConfig>;

    // Load usage from localStorage
    this.loadUsage();
  }

  /**
   * Check if request is allowed
   */
  checkLimit(tool: string): RateLimitStatus {
    const now = Date.now();
    const currentMinute = this.getMinuteKey(now);
    const currentHour = this.getHourKey(now);
    const currentDay = this.getDayKey(now);

    // Clean old entries
    this.cleanOldEntries(now);

    // Check per-minute limit
    const minuteCalls = this.minuteUsage.get(currentMinute) || 0;
    if (minuteCalls >= this.config.maxCallsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: this.getNextMinute(now),
        retryAfter: this.getNextMinute(now) - now,
      };
    }

    // Check hourly quota
    const hourCalls = this.hourlyUsage.get(currentHour) || 0;
    if (hourCalls >= this.config.quotaPerHour) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: this.getNextHour(now),
        retryAfter: this.getNextHour(now) - now,
      };
    }

    // Check daily quota
    const dayCalls = this.dailyUsage.get(currentDay) || 0;
    if (dayCalls >= this.config.quotaPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: this.getNextDay(now),
        retryAfter: this.getNextDay(now) - now,
      };
    }

    // Check concurrent requests
    if (this.activeRequests >= this.config.maxConcurrent) {
      return {
        allowed: false,
        remaining: this.config.maxConcurrent - this.activeRequests,
        resetAt: now + 1000, // retry in 1 second
        retryAfter: 1000,
      };
    }

    return {
      allowed: true,
      remaining: Math.min(
        this.config.maxCallsPerMinute - minuteCalls,
        this.config.quotaPerHour - hourCalls,
        this.config.quotaPerDay - dayCalls
      ),
      resetAt: this.getNextMinute(now),
    };
  }

  /**
   * Execute request with rate limiting and queuing
   */
  async execute<T>(tool: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${tool}-${Date.now()}-${Math.random()}`,
        tool,
        execute: fn,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(request);
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const request = this.queue[0];
    const status = this.checkLimit(request.tool);

    if (!status.allowed) {
      // Wait and retry
      if (status.retryAfter) {
        setTimeout(() => this.processQueue(), Math.min(status.retryAfter, 1000));
      }
      return;
    }

    // Remove from queue and execute
    this.queue.shift();
    this.activeRequests++;

    try {
      // Record usage
      this.recordCall(request.tool);

      // Check for warnings
      const stats = this.getUsageStats();
      if (stats.percentageUsed >= this.warningThreshold * 100 && this.onWarning) {
        this.onWarning(stats);
      }

      // Execute request
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;

      // Process next request
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  /**
   * Record API call
   */
  private recordCall(tool: string): void {
    const now = Date.now();
    const currentMinute = this.getMinuteKey(now);
    const currentHour = this.getHourKey(now);
    const currentDay = this.getDayKey(now);

    // Update counters
    this.minuteUsage.set(currentMinute, (this.minuteUsage.get(currentMinute) || 0) + 1);
    this.hourlyUsage.set(currentHour, (this.hourlyUsage.get(currentHour) || 0) + 1);
    this.dailyUsage.set(currentDay, (this.dailyUsage.get(currentDay) || 0) + 1);

    // Add to call history
    this.callHistory.push(now);

    // Save to localStorage
    this.saveUsage();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    const now = Date.now();
    const currentMinute = this.getMinuteKey(now);
    const currentHour = this.getHourKey(now);
    const currentDay = this.getDayKey(now);

    const callsThisMinute = this.minuteUsage.get(currentMinute) || 0;
    const callsThisHour = this.hourlyUsage.get(currentHour) || 0;
    const callsToday = this.dailyUsage.get(currentDay) || 0;

    return {
      callsThisMinute,
      callsThisHour,
      callsToday,
      quotaUsed: callsToday,
      quotaLimit: this.config.quotaPerDay,
      percentageUsed: (callsToday / this.config.quotaPerDay) * 100,
    };
  }

  /**
   * Set warning callback
   */
  onQuotaWarning(callback: (stats: UsageStats) => void): void {
    this.onWarning = callback;
  }

  /**
   * Set quota exceeded callback
   */
  onQuotaExceeded(callback: (stats: UsageStats) => void): void {
    this.onQuotaExceeded = callback;
  }

  /**
   * Reset quotas (for testing)
   */
  reset(): void {
    this.queue = [];
    this.activeRequests = 0;
    this.callHistory = [];
    this.dailyUsage.clear();
    this.hourlyUsage.clear();
    this.minuteUsage.clear();
    this.saveUsage();
  }

  /**
   * Clean old entries
   */
  private cleanOldEntries(now: number): void {
    // Remove entries older than 24 hours
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // Clean call history
    this.callHistory = this.callHistory.filter(timestamp => timestamp > dayAgo);

    // Clean minute usage (keep last 2 minutes)
    const currentMinute = this.getMinuteKey(now);
    const previousMinute = this.getMinuteKey(now - 60 * 1000);
    for (const [key] of this.minuteUsage) {
      if (key !== currentMinute && key !== previousMinute) {
        this.minuteUsage.delete(key);
      }
    }

    // Clean hour usage (keep last 2 hours)
    const currentHour = this.getHourKey(now);
    const previousHour = this.getHourKey(now - 60 * 60 * 1000);
    for (const [key] of this.hourlyUsage) {
      if (key !== currentHour && key !== previousHour) {
        this.hourlyUsage.delete(key);
      }
    }

    // Clean daily usage (keep last 2 days)
    const currentDay = this.getDayKey(now);
    const previousDay = this.getDayKey(now - 24 * 60 * 60 * 1000);
    for (const [key] of this.dailyUsage) {
      if (key !== currentDay && key !== previousDay) {
        this.dailyUsage.delete(key);
      }
    }
  }

  /**
   * Time key generators
   */
  private getMinuteKey(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  }

  private getHourKey(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
  }

  private getDayKey(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private getNextMinute(timestamp: number): number {
    const date = new Date(timestamp);
    date.setMinutes(date.getMinutes() + 1);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  private getNextHour(timestamp: number): number {
    const date = new Date(timestamp);
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  private getNextDay(timestamp: number): number {
    const date = new Date(timestamp);
    date.setDate(date.getDate() + 1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  /**
   * Persistence
   */
  private saveUsage(): void {
    try {
      const data = {
        callHistory: this.callHistory,
        dailyUsage: Array.from(this.dailyUsage.entries()),
        hourlyUsage: Array.from(this.hourlyUsage.entries()),
        minuteUsage: Array.from(this.minuteUsage.entries()),
      };
      localStorage.setItem('ai-tools-rate-limiter', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save rate limiter data:', error);
    }
  }

  private loadUsage(): void {
    try {
      const data = localStorage.getItem('ai-tools-rate-limiter');
      if (!data) return;

      const parsed = JSON.parse(data);
      this.callHistory = parsed.callHistory || [];
      this.dailyUsage = new Map(parsed.dailyUsage || []);
      this.hourlyUsage = new Map(parsed.hourlyUsage || []);
      this.minuteUsage = new Map(parsed.minuteUsage || []);

      // Clean old entries
      this.cleanOldEntries(Date.now());
    } catch (error) {
      console.error('Failed to load rate limiter data:', error);
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter({ tier: 'free' });
