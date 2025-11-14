/**
 * AnalyticsService - Effect.ts Analytics Tracking
 *
 * Provides analytics event tracking with buffering, batching,
 * and integration with analytics platforms.
 *
 * Features:
 * - Event tracking (track, page, identify, group)
 * - Event buffering for performance
 * - Batch sending to reduce network calls
 * - Type-safe error handling
 * - Multiple provider support (Google Analytics, Mixpanel, etc.)
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { AnalyticsService } from "@/lib/services/AnalyticsService";
 *
 * const program = Effect.gen(function* () {
 *   const analytics = yield* AnalyticsService;
 *
 *   // Identify user
 *   yield* analytics.identify("user-123", {
 *     name: "John Doe",
 *     email: "john@example.com"
 *   });
 *
 *   // Track event
 *   yield* analytics.track("Purchase Completed", {
 *     productId: "prod-456",
 *     amount: 99.99
 *   });
 *
 *   // Track page view
 *   yield* analytics.page("Product Detail", {
 *     path: "/products/456"
 *   });
 * });
 * ```
 */

import { Effect, Context, Queue, Fiber } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AnalyticsTrackError {
  readonly _tag = "AnalyticsTrackError";
  constructor(
    readonly eventName: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class AnalyticsIdentifyError {
  readonly _tag = "AnalyticsIdentifyError";
  constructor(
    readonly userId: string,
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class AnalyticsBatchError {
  readonly _tag = "AnalyticsBatchError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class AnalyticsNetworkError {
  readonly _tag = "AnalyticsNetworkError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export type AnalyticsError =
  | AnalyticsTrackError
  | AnalyticsIdentifyError
  | AnalyticsBatchError
  | AnalyticsNetworkError;

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsEvent {
  type: "track" | "page" | "identify" | "group";
  timestamp: number;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface TrackEvent extends AnalyticsEvent {
  type: "track";
  event: string;
}

export interface PageEvent extends AnalyticsEvent {
  type: "page";
  name?: string;
  properties?: {
    path?: string;
    url?: string;
    title?: string;
    referrer?: string;
    [key: string]: unknown;
  };
}

export interface IdentifyEvent extends AnalyticsEvent {
  type: "identify";
  userId: string;
  traits?: Record<string, unknown>;
}

export interface GroupEvent extends AnalyticsEvent {
  type: "group";
  userId: string;
  groupId: string;
  traits?: Record<string, unknown>;
}

export interface AnalyticsConfig {
  bufferSize?: number;
  flushInterval?: number;
  endpoint?: string;
  apiKey?: string;
  debug?: boolean;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IAnalyticsService {
  /**
   * Track an event
   *
   * Records a user action or behavior
   *
   * @param event - Event name
   * @param properties - Event properties
   * @returns void
   */
  track: (
    event: string,
    properties?: Record<string, unknown>
  ) => Effect.Effect<void, AnalyticsError>;

  /**
   * Identify a user
   *
   * Associates future events with a user ID and traits
   *
   * @param userId - User identifier
   * @param traits - User attributes
   * @returns void
   */
  identify: (
    userId: string,
    traits?: Record<string, unknown>
  ) => Effect.Effect<void, AnalyticsError>;

  /**
   * Track a page view
   *
   * Records navigation to a page
   *
   * @param name - Page name
   * @param properties - Page properties
   * @returns void
   */
  page: (
    name?: string,
    properties?: Record<string, unknown>
  ) => Effect.Effect<void, AnalyticsError>;

  /**
   * Associate user with a group
   *
   * Links a user to an organization or team
   *
   * @param userId - User identifier
   * @param groupId - Group identifier
   * @param traits - Group attributes
   * @returns void
   */
  group: (
    userId: string,
    groupId: string,
    traits?: Record<string, unknown>
  ) => Effect.Effect<void, AnalyticsError>;

  /**
   * Flush buffered events
   *
   * Immediately sends all pending events
   *
   * @returns Number of events flushed
   */
  flush: () => Effect.Effect<number, AnalyticsError>;

  /**
   * Reset analytics state
   *
   * Clears user identity and buffered events
   *
   * @returns void
   */
  reset: () => Effect.Effect<void, never>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class AnalyticsServiceImpl implements IAnalyticsService {
  private userId?: string;
  private anonymousId: string;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushFiber?: Fiber.RuntimeFiber<void, AnalyticsError>;

  constructor(private readonly config: AnalyticsConfig = {}) {
    this.anonymousId = this.generateAnonymousId();
    this.startAutoFlush();
  }

  track = (
    event: string,
    properties?: Record<string, unknown>
  ): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      const trackEvent: TrackEvent = {
        type: "track",
        event,
        timestamp: Date.now(),
        userId: this.userId,
        anonymousId: this.anonymousId,
        properties,
        context: this.getContext(),
      };

      yield* this.bufferEvent(trackEvent);

      if (this.config.debug) {
        console.log("[Analytics] Track:", event, properties);
      }
    });

  identify = (
    userId: string,
    traits?: Record<string, unknown>
  ): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      this.userId = userId;

      const identifyEvent: IdentifyEvent = {
        type: "identify",
        userId,
        timestamp: Date.now(),
        anonymousId: this.anonymousId,
        traits,
        context: this.getContext(),
      };

      yield* this.bufferEvent(identifyEvent);

      if (this.config.debug) {
        console.log("[Analytics] Identify:", userId, traits);
      }
    });

  page = (
    name?: string,
    properties?: Record<string, unknown>
  ): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      const pageEvent: PageEvent = {
        type: "page",
        name,
        timestamp: Date.now(),
        userId: this.userId,
        anonymousId: this.anonymousId,
        properties: {
          path: window.location.pathname,
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          ...properties,
        },
        context: this.getContext(),
      };

      yield* this.bufferEvent(pageEvent);

      if (this.config.debug) {
        console.log("[Analytics] Page:", name, properties);
      }
    });

  group = (
    userId: string,
    groupId: string,
    traits?: Record<string, unknown>
  ): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      const groupEvent: GroupEvent = {
        type: "group",
        userId,
        groupId,
        timestamp: Date.now(),
        anonymousId: this.anonymousId,
        traits,
        context: this.getContext(),
      };

      yield* this.bufferEvent(groupEvent);

      if (this.config.debug) {
        console.log("[Analytics] Group:", userId, groupId, traits);
      }
    });

  flush = (): Effect.Effect<number, AnalyticsError> =>
    Effect.gen(this, function* () {
      const events = [...this.eventBuffer];
      this.eventBuffer = [];

      if (events.length === 0) {
        return 0;
      }

      if (this.config.debug) {
        console.log(`[Analytics] Flushing ${events.length} events`);
      }

      yield* this.sendBatch(events);

      return events.length;
    });

  reset = (): Effect.Effect<void, never> =>
    Effect.gen(this, function* () {
      this.userId = undefined;
      this.anonymousId = this.generateAnonymousId();
      this.eventBuffer = [];

      if (this.config.debug) {
        console.log("[Analytics] Reset");
      }
    });

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private bufferEvent = (event: AnalyticsEvent): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      this.eventBuffer.push(event);

      const bufferSize = this.config.bufferSize || 20;
      if (this.eventBuffer.length >= bufferSize) {
        yield* this.flush();
      }
    });

  private sendBatch = (
    events: AnalyticsEvent[]
  ): Effect.Effect<void, AnalyticsError> =>
    Effect.gen(this, function* () {
      const endpoint = this.config.endpoint || "/api/analytics";

      try {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(this.config.apiKey && {
                  Authorization: `Bearer ${this.config.apiKey}`,
                }),
              },
              body: JSON.stringify({ events }),
            }),
          catch: (error) =>
            new AnalyticsNetworkError(
              error instanceof Error ? error.message : "Network error",
              error
            ),
        });

        if (!response.ok) {
          return yield* Effect.fail(
            new AnalyticsBatchError(
              `HTTP ${response.status}: ${response.statusText}`
            )
          );
        }
      } catch (error) {
        return yield* Effect.fail(
          new AnalyticsBatchError(
            error instanceof Error ? error.message : "Batch send failed",
            error
          )
        );
      }
    });

  private getContext = (): Record<string, unknown> => ({
    userAgent: navigator.userAgent,
    locale: navigator.language,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  private generateAnonymousId = (): string => {
    const stored = localStorage.getItem("analytics_anonymous_id");
    if (stored) return stored;

    const id = `anon_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("analytics_anonymous_id", id);
    return id;
  };

  private startAutoFlush = (): void => {
    const interval = this.config.flushInterval || 10000; // 10 seconds

    const autoFlushProgram = Effect.gen(this, function* () {
      while (true) {
        yield* Effect.sleep(interval);
        yield* this.flush();
      }
    });

    // Run auto-flush in background (don't await)
    Effect.runFork(autoFlushProgram);
  };
}

// ============================================================================
// SERVICE TAG (Dependency Injection)
// ============================================================================

export class AnalyticsService extends Context.Tag("AnalyticsService")<
  AnalyticsService,
  IAnalyticsService
>() {}

// ============================================================================
// LAYER FACTORY
// ============================================================================

/**
 * Create AnalyticsService layer with configuration
 *
 * @param config - Service configuration
 * @returns Effect Layer
 */
export const makeAnalyticsServiceLayer = (config?: AnalyticsConfig) =>
  AnalyticsService.of({
    ...new AnalyticsServiceImpl(config),
  });

/**
 * Default AnalyticsService layer
 */
export const AnalyticsServiceLive = makeAnalyticsServiceLayer();
