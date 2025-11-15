/**
 * CacheService - Effect.ts caching strategy
 *
 * Cycle 35: Effect.ts caching strategy
 * - Functions: get, set, invalidate, clear
 * - TTL support
 * - Memory + LocalStorage backends
 */

import { Effect, Data, Context } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class CacheError extends Data.TaggedError("CacheError")<{
  operation: string;
  reason: string;
}> {}

export class CacheMissError extends Data.TaggedError("CacheMissError")<{
  key: string;
}> {}

export class SerializationError extends Data.TaggedError("SerializationError")<{
  key: string;
  reason: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
  createdAt: number;
};

export type CacheOptions = {
  ttl?: number; // Time to live in milliseconds
  backend?: "memory" | "localStorage";
};

export type CacheStats = {
  hits: number;
  misses: number;
  size: number;
  backend: string;
};

// ============================================================================
// Cache Backend Interface
// ============================================================================

export interface CacheBackend {
  readonly name: string;
  readonly get: <T>(key: string) => Effect.Effect<CacheEntry<T> | null, CacheError>;
  readonly set: <T>(key: string, entry: CacheEntry<T>) => Effect.Effect<void, CacheError>;
  readonly delete: (key: string) => Effect.Effect<void, CacheError>;
  readonly clear: () => Effect.Effect<void, CacheError>;
  readonly keys: () => Effect.Effect<string[], CacheError>;
  readonly size: () => Effect.Effect<number, CacheError>;
}

// ============================================================================
// Memory Backend
// ============================================================================

class MemoryBackend implements CacheBackend {
  readonly name = "memory";
  private store = new Map<string, CacheEntry<unknown>>();

  readonly get = <T>(key: string): Effect.Effect<CacheEntry<T> | null, CacheError> =>
    Effect.sync(() => {
      const entry = this.store.get(key) as CacheEntry<T> | undefined;
      return entry ?? null;
    });

  readonly set = <T>(key: string, entry: CacheEntry<T>): Effect.Effect<void, CacheError> =>
    Effect.sync(() => {
      this.store.set(key, entry as CacheEntry<unknown>);
    });

  readonly delete = (key: string): Effect.Effect<void, CacheError> =>
    Effect.sync(() => {
      this.store.delete(key);
    });

  readonly clear = (): Effect.Effect<void, CacheError> =>
    Effect.sync(() => {
      this.store.clear();
    });

  readonly keys = (): Effect.Effect<string[], CacheError> =>
    Effect.sync(() => Array.from(this.store.keys()));

  readonly size = (): Effect.Effect<number, CacheError> =>
    Effect.sync(() => this.store.size);
}

// ============================================================================
// LocalStorage Backend
// ============================================================================

class LocalStorageBackend implements CacheBackend {
  readonly name = "localStorage";
  private prefix = "cache:";

  readonly get = <T>(key: string): Effect.Effect<CacheEntry<T> | null, CacheError> =>
    Effect.try({
      try: () => {
        if (typeof window === "undefined" || !window.localStorage) {
          return null;
        }

        const item = localStorage.getItem(this.prefix + key);
        if (!item) return null;

        try {
          return JSON.parse(item) as CacheEntry<T>;
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(this.prefix + key);
          return null;
        }
      },
      catch: (error) =>
        new CacheError({
          operation: "get",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

  readonly set = <T>(key: string, entry: CacheEntry<T>): Effect.Effect<void, CacheError> =>
    Effect.try({
      try: () => {
        if (typeof window === "undefined" || !window.localStorage) {
          throw new Error("localStorage not available");
        }

        const serialized = JSON.stringify(entry);
        localStorage.setItem(this.prefix + key, serialized);
      },
      catch: (error) =>
        new CacheError({
          operation: "set",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

  readonly delete = (key: string): Effect.Effect<void, CacheError> =>
    Effect.try({
      try: () => {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }
        localStorage.removeItem(this.prefix + key);
      },
      catch: (error) =>
        new CacheError({
          operation: "delete",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

  readonly clear = (): Effect.Effect<void, CacheError> =>
    Effect.try({
      try: () => {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }

        // Clear all cache entries
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix));
        keys.forEach((key) => localStorage.removeItem(key));
      },
      catch: (error) =>
        new CacheError({
          operation: "clear",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

  readonly keys = (): Effect.Effect<string[], CacheError> =>
    Effect.try({
      try: () => {
        if (typeof window === "undefined" || !window.localStorage) {
          return [];
        }

        return Object.keys(localStorage)
          .filter((k) => k.startsWith(this.prefix))
          .map((k) => k.substring(this.prefix.length));
      },
      catch: (error) =>
        new CacheError({
          operation: "keys",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

  readonly size = (): Effect.Effect<number, CacheError> =>
    Effect.gen(function* () {
      const keys = yield* this.keys();
      return keys.length;
    });
}

// ============================================================================
// Context
// ============================================================================

export interface Cache {
  readonly backend: CacheBackend;
  readonly stats: {
    hits: number;
    misses: number;
  };
}

export const Cache = Context.GenericTag<Cache>("Cache");

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get value from cache
 */
export const get = <T>(
  key: string
): Effect.Effect<T, CacheMissError | CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    const entry = yield* cache.backend.get<T>(key);

    if (!entry) {
      cache.stats.misses++;
      return yield* new CacheMissError({ key });
    }

    // Check if expired
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      // Remove expired entry
      yield* cache.backend.delete(key);
      cache.stats.misses++;
      return yield* new CacheMissError({ key });
    }

    cache.stats.hits++;
    return entry.value;
  });

/**
 * Set value in cache
 */
export const set = <T>(
  key: string,
  value: T,
  options?: CacheOptions
): Effect.Effect<void, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: options?.ttl ? now + options.ttl : null,
    };

    yield* cache.backend.set(key, entry);
  });

/**
 * Invalidate (delete) a cache entry
 */
export const invalidate = (
  key: string
): Effect.Effect<void, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    yield* cache.backend.delete(key);
  });

/**
 * Invalidate multiple keys matching a pattern
 */
export const invalidatePattern = (
  pattern: RegExp
): Effect.Effect<number, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    const allKeys = yield* cache.backend.keys();
    const matchingKeys = allKeys.filter((key) => pattern.test(key));

    yield* Effect.all(
      matchingKeys.map((key) => cache.backend.delete(key)),
      { concurrency: "unbounded" }
    );

    return matchingKeys.length;
  });

/**
 * Clear all cache entries
 */
export const clear = (): Effect.Effect<void, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    yield* cache.backend.clear();
    cache.stats.hits = 0;
    cache.stats.misses = 0;
  });

/**
 * Get cache statistics
 */
export const getStats = (): Effect.Effect<CacheStats, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    const size = yield* cache.backend.size();

    return {
      hits: cache.stats.hits,
      misses: cache.stats.misses,
      size,
      backend: cache.backend.name,
    };
  });

/**
 * Get or compute a value (with caching)
 */
export const getOrCompute = <T, E, R>(
  key: string,
  compute: Effect.Effect<T, E, R>,
  options?: CacheOptions
): Effect.Effect<T, E | CacheError, Cache | R> =>
  Effect.gen(function* () {
    // Try to get from cache
    const cached = yield* Effect.either(get<T>(key));

    if (cached._tag === "Right") {
      return cached.right;
    }

    // Cache miss - compute value
    const value = yield* compute;

    // Store in cache
    yield* set(key, value, options);

    return value;
  });

/**
 * Wrap an Effect with caching
 */
export const cached = <T, E, R>(
  key: string,
  effect: Effect.Effect<T, E, R>,
  options?: CacheOptions
): Effect.Effect<T, E | CacheError, Cache | R> =>
  getOrCompute(key, effect, options);

/**
 * Clean up expired entries
 */
export const cleanupExpired = (): Effect.Effect<number, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;
    const allKeys = yield* cache.backend.keys();
    let removed = 0;

    for (const key of allKeys) {
      const entry = yield* cache.backend.get(key);

      if (entry && entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        yield* cache.backend.delete(key);
        removed++;
      }
    }

    return removed;
  });

/**
 * Get cache size in bytes (localStorage only)
 */
export const getSizeInBytes = (): Effect.Effect<number, CacheError, Cache> =>
  Effect.gen(function* () {
    const cache = yield* Cache;

    if (cache.backend.name !== "localStorage") {
      return 0;
    }

    const allKeys = yield* cache.backend.keys();
    let totalSize = 0;

    for (const key of allKeys) {
      const entry = yield* cache.backend.get(key);
      if (entry) {
        totalSize += JSON.stringify(entry).length;
      }
    }

    return totalSize;
  });

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a cache instance with memory backend
 */
export const createMemoryCache = (): Cache => ({
  backend: new MemoryBackend(),
  stats: { hits: 0, misses: 0 },
});

/**
 * Create a cache instance with localStorage backend
 */
export const createLocalStorageCache = (): Cache => ({
  backend: new LocalStorageBackend(),
  stats: { hits: 0, misses: 0 },
});

/**
 * Helper: Run effect with cache context
 */
export const withCache = <R, E, A>(
  backend: "memory" | "localStorage",
  effect: Effect.Effect<A, E, Cache | R>
): Effect.Effect<A, E, R> => {
  const cache = backend === "memory" ? createMemoryCache() : createLocalStorageCache();
  return effect.pipe(Effect.provideService(Cache, cache));
};

/**
 * Create a namespaced cache key
 */
export const createKey = (...parts: (string | number)[]): string =>
  parts.join(":");
