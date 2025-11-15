/**
 * ConvexService - Effect.ts wrapper for Convex client
 *
 * Cycle 36: Effect.ts wrapper for Convex client
 * - Functions: query, mutation, action
 * - Type-safe Convex operations
 * - Effect retry logic
 */

import { Effect, Data, Schedule } from "effect";
import type { ConvexClient } from "convex/browser";
import type { FunctionReference, FunctionReturnType, FunctionArgs } from "convex/server";

// ============================================================================
// Error Types
// ============================================================================

export class ConvexError extends Data.TaggedError("ConvexError")<{
  operation: "query" | "mutation" | "action";
  functionName: string;
  reason: string;
}> {}

export class ConvexNetworkError extends Data.TaggedError("ConvexNetworkError")<{
  operation: string;
  retryCount: number;
  reason: string;
}> {}

export class ConvexTimeoutError extends Data.TaggedError("ConvexTimeoutError")<{
  operation: string;
  timeout: number;
}> {}

// ============================================================================
// Types
// ============================================================================

export type ConvexQueryOptions = {
  timeout?: number; // Milliseconds
  retries?: number;
  cache?: boolean;
};

export type ConvexMutationOptions = {
  timeout?: number;
  retries?: number;
  optimistic?: boolean;
};

export type ConvexActionOptions = {
  timeout?: number;
  retries?: number;
};

// ============================================================================
// Retry Strategy
// ============================================================================

/**
 * Exponential backoff retry schedule
 * Retries: 100ms, 200ms, 400ms, 800ms, 1600ms
 */
const retrySchedule = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(5))
);

/**
 * Retry only on network errors
 */
const shouldRetry = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNREFUSED")
    );
  }
  return false;
};

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Execute a Convex query with Effect
 */
export const query = <Query extends FunctionReference<"query">>(
  client: ConvexClient,
  queryFn: Query,
  args: FunctionArgs<Query>,
  options?: ConvexQueryOptions
): Effect.Effect<FunctionReturnType<Query>, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    const timeout = options?.timeout ?? 30000; // 30 seconds default
    const maxRetries = options?.retries ?? 3;

    const operation = Effect.tryPromise({
      try: async () => {
        return await client.query(queryFn, args);
      },
      catch: (error) =>
        new ConvexError({
          operation: "query",
          functionName: queryFn._name ?? "unknown",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

    // Add timeout
    const withTimeout = operation.pipe(
      Effect.timeout(`${timeout} millis`),
      Effect.mapError((error) => {
        if (error._tag === "TimeoutException") {
          return new ConvexTimeoutError({
            operation: "query",
            timeout,
          });
        }
        return error;
      })
    );

    // Add retry logic for network errors
    const withRetry = withTimeout.pipe(
      Effect.retry({
        schedule: Schedule.recurs(maxRetries),
        while: (error) =>
          error._tag === "ConvexError" && shouldRetry(new Error(error.reason)),
      }),
      Effect.mapError((error) => {
        if (error._tag === "ConvexError" && shouldRetry(new Error(error.reason))) {
          return new ConvexNetworkError({
            operation: "query",
            retryCount: maxRetries,
            reason: error.reason,
          });
        }
        return error;
      })
    );

    return yield* withRetry;
  });

// ============================================================================
// Mutation Operations
// ============================================================================

/**
 * Execute a Convex mutation with Effect
 */
export const mutation = <Mutation extends FunctionReference<"mutation">>(
  client: ConvexClient,
  mutationFn: Mutation,
  args: FunctionArgs<Mutation>,
  options?: ConvexMutationOptions
): Effect.Effect<FunctionReturnType<Mutation>, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    const timeout = options?.timeout ?? 30000; // 30 seconds default
    const maxRetries = options?.retries ?? 2; // Fewer retries for mutations

    const operation = Effect.tryPromise({
      try: async () => {
        return await client.mutation(mutationFn, args);
      },
      catch: (error) =>
        new ConvexError({
          operation: "mutation",
          functionName: mutationFn._name ?? "unknown",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

    // Add timeout
    const withTimeout = operation.pipe(
      Effect.timeout(`${timeout} millis`),
      Effect.mapError((error) => {
        if (error._tag === "TimeoutException") {
          return new ConvexTimeoutError({
            operation: "mutation",
            timeout,
          });
        }
        return error;
      })
    );

    // Add retry logic (only for network errors, not validation errors)
    const withRetry = withTimeout.pipe(
      Effect.retry({
        schedule: Schedule.recurs(maxRetries),
        while: (error) =>
          error._tag === "ConvexError" && shouldRetry(new Error(error.reason)),
      }),
      Effect.mapError((error) => {
        if (error._tag === "ConvexError" && shouldRetry(new Error(error.reason))) {
          return new ConvexNetworkError({
            operation: "mutation",
            retryCount: maxRetries,
            reason: error.reason,
          });
        }
        return error;
      })
    );

    return yield* withRetry;
  });

// ============================================================================
// Action Operations
// ============================================================================

/**
 * Execute a Convex action with Effect
 */
export const action = <Action extends FunctionReference<"action">>(
  client: ConvexClient,
  actionFn: Action,
  args: FunctionArgs<Action>,
  options?: ConvexActionOptions
): Effect.Effect<FunctionReturnType<Action>, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    const timeout = options?.timeout ?? 60000; // 60 seconds for actions
    const maxRetries = options?.retries ?? 3;

    const operation = Effect.tryPromise({
      try: async () => {
        return await client.action(actionFn, args);
      },
      catch: (error) =>
        new ConvexError({
          operation: "action",
          functionName: actionFn._name ?? "unknown",
          reason: error instanceof Error ? error.message : "Unknown error",
        }),
    });

    // Add timeout
    const withTimeout = operation.pipe(
      Effect.timeout(`${timeout} millis`),
      Effect.mapError((error) => {
        if (error._tag === "TimeoutException") {
          return new ConvexTimeoutError({
            operation: "action",
            timeout,
          });
        }
        return error;
      })
    );

    // Add retry logic
    const withRetry = withTimeout.pipe(
      Effect.retry({
        schedule: Schedule.recurs(maxRetries),
        while: (error) =>
          error._tag === "ConvexError" && shouldRetry(new Error(error.reason)),
      }),
      Effect.mapError((error) => {
        if (error._tag === "ConvexError" && shouldRetry(new Error(error.reason))) {
          return new ConvexNetworkError({
            operation: "action",
            retryCount: maxRetries,
            reason: error.reason,
          });
        }
        return error;
      })
    );

    return yield* withRetry;
  });

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Execute multiple queries in parallel
 */
export const batchQueries = <T>(
  operations: Effect.Effect<T, ConvexError | ConvexTimeoutError | ConvexNetworkError>[]
): Effect.Effect<T[], ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.all(operations, { concurrency: "unbounded" });

/**
 * Execute multiple mutations sequentially
 */
export const sequentialMutations = <T>(
  operations: Effect.Effect<T, ConvexError | ConvexTimeoutError | ConvexNetworkError>[]
): Effect.Effect<T[], ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.all(operations, { concurrency: 1 });

// ============================================================================
// Pagination Helpers
// ============================================================================

export type PaginatedResult<T> = {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
};

/**
 * Helper to handle paginated queries
 */
export const paginatedQuery = <Query extends FunctionReference<"query">, T = FunctionReturnType<Query>>(
  client: ConvexClient,
  queryFn: Query,
  args: FunctionArgs<Query>,
  options?: ConvexQueryOptions
): Effect.Effect<PaginatedResult<T>, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    const result = yield* query(client, queryFn, args, options);

    // Assuming Convex pagination pattern: { data: T[], cursor: string | null }
    if (
      typeof result === "object" &&
      result !== null &&
      "data" in result &&
      Array.isArray(result.data)
    ) {
      return {
        data: result.data as T[],
        cursor: (result as any).cursor ?? null,
        hasMore: !!(result as any).cursor,
      };
    }

    // Non-paginated result, wrap it
    return {
      data: [result] as T[],
      cursor: null,
      hasMore: false,
    };
  });

/**
 * Fetch all pages of a paginated query
 */
export const fetchAllPages = <Query extends FunctionReference<"query">, T = FunctionReturnType<Query>>(
  client: ConvexClient,
  queryFn: Query,
  baseArgs: FunctionArgs<Query>,
  options?: ConvexQueryOptions & { maxPages?: number }
): Effect.Effect<T[], ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    const maxPages = options?.maxPages ?? 100;
    const allData: T[] = [];
    let cursor: string | null = null;
    let page = 0;

    while (page < maxPages) {
      const args = cursor ? { ...baseArgs, cursor } : baseArgs;
      const result = yield* paginatedQuery<Query, T>(client, queryFn, args, options);

      allData.push(...result.data);

      if (!result.hasMore) {
        break;
      }

      cursor = result.cursor;
      page++;
    }

    return allData;
  });

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Map Convex errors to user-friendly messages
 */
export const mapConvexError = (
  error: ConvexError | ConvexTimeoutError | ConvexNetworkError
): string => {
  switch (error._tag) {
    case "ConvexTimeoutError":
      return `Operation timed out after ${error.timeout}ms`;
    case "ConvexNetworkError":
      return `Network error after ${error.retryCount} retries: ${error.reason}`;
    case "ConvexError":
      return `${error.operation} failed: ${error.reason}`;
    default:
      return "An unknown error occurred";
  }
};

/**
 * Recover from Convex errors with fallback value
 */
export const withFallback = <T>(
  effect: Effect.Effect<T, ConvexError | ConvexTimeoutError | ConvexNetworkError>,
  fallback: T
): Effect.Effect<T, never> =>
  effect.pipe(
    Effect.catchAll(() => Effect.succeed(fallback))
  );

/**
 * Log Convex errors and continue
 */
export const logErrors = <T>(
  effect: Effect.Effect<T, ConvexError | ConvexTimeoutError | ConvexNetworkError>
): Effect.Effect<T, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  effect.pipe(
    Effect.tapError((error) =>
      Effect.sync(() => {
        console.error(`[ConvexService] ${mapConvexError(error)}`);
      })
    )
  );

// ============================================================================
// Optimistic Updates
// ============================================================================

export type OptimisticUpdate<T> = {
  optimisticValue: T;
  rollback: () => void;
};

/**
 * Execute mutation with optimistic update
 */
export const optimisticMutation = <Mutation extends FunctionReference<"mutation">, T>(
  client: ConvexClient,
  mutationFn: Mutation,
  args: FunctionArgs<Mutation>,
  optimistic: OptimisticUpdate<T>,
  options?: ConvexMutationOptions
): Effect.Effect<FunctionReturnType<Mutation>, ConvexError | ConvexTimeoutError | ConvexNetworkError> =>
  Effect.gen(function* () {
    // Apply optimistic update immediately
    const result = yield* Effect.either(mutation(client, mutationFn, args, options));

    if (result._tag === "Left") {
      // Mutation failed, rollback optimistic update
      optimistic.rollback();
      return yield* Effect.fail(result.left);
    }

    return result.right;
  });

// ============================================================================
// Subscription Helpers (React)
// ============================================================================

/**
 * Convert Convex subscription to Effect stream
 * Note: This is a simplified version - full implementation would use Effect.Stream
 */
export const subscribeQuery = <Query extends FunctionReference<"query">>(
  client: ConvexClient,
  queryFn: Query,
  args: FunctionArgs<Query>,
  onUpdate: (data: FunctionReturnType<Query>) => void,
  onError?: (error: Error) => void
): Effect.Effect<() => void, ConvexError> =>
  Effect.try({
    try: () => {
      // In a real implementation, this would set up a Convex subscription
      // and return an unsubscribe function
      const unsubscribe = () => {
        // Cleanup subscription
      };

      return unsubscribe;
    },
    catch: (error) =>
      new ConvexError({
        operation: "query",
        functionName: queryFn._name ?? "unknown",
        reason: error instanceof Error ? error.message : "Subscription failed",
      }),
  });
