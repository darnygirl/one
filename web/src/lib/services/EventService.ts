/**
 * Cycle 30: EventService - Effect.ts service for events
 *
 * Provides event logging and querying for audit trails.
 * Uses Effect.ts for error handling, logging, and streaming.
 */

import { Context, Effect, Layer, pipe, Stream } from "effect";
import type {
  Event,
  CreateEventInput,
  EventFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  EventNotFoundError,
  ValidationError,
} from "@/lib/ontology/errors";

// ============================================================================
// Event Types (67+ event types from ontology)
// ============================================================================

export const EVENT_TYPES = [
  // CRUD operations
  "created",
  "updated",
  "deleted",
  "restored",

  // User actions
  "logged_in",
  "logged_out",
  "registered",
  "verified",

  // Commerce
  "purchased",
  "refunded",
  "shipped",
  "delivered",

  // Content
  "published",
  "unpublished",
  "viewed",
  "downloaded",

  // Social
  "liked",
  "commented",
  "shared",
  "followed",
  "unfollowed",

  // Learning
  "enrolled",
  "started",
  "completed",
  "passed",
  "failed",

  // Organization
  "invited",
  "joined",
  "left",
  "promoted",
  "demoted",

  // System
  "deployed",
  "migrated",
  "backup_created",
  "backup_restored",

  // And 37+ more...
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// ============================================================================
// Service Interface
// ============================================================================

export interface IEventService {
  /**
   * Log a new event
   */
  log(
    input: CreateEventInput
  ): Effect.Effect<Event, ValidationError>;

  /**
   * Query events with filtering
   */
  query(filter?: EventFilter): Effect.Effect<Event[], never>;

  /**
   * Get timeline for a thing (all events)
   */
  getTimeline(
    thingId: string,
    limit?: number
  ): Effect.Effect<Event[], never>;

  /**
   * Get audit trail for a group
   */
  getAudit(
    groupId: string,
    startTime?: number,
    endTime?: number
  ): Effect.Effect<Event[], never>;

  /**
   * Stream events in real-time
   */
  stream(
    filter?: EventFilter
  ): Stream.Stream<Event, never>;

  /**
   * Get event statistics
   */
  getStats(
    groupId: string,
    startTime?: number,
    endTime?: number
  ): Effect.Effect<
    {
      totalEvents: number;
      eventsByType: Record<string, number>;
      eventsByActor: Record<string, number>;
    },
    never
  >;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class EventService extends Context.Tag("EventService")<
  EventService,
  IEventService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeEventService = (): IEventService => {
  // In-memory store for demo (replace with actual backend)
  const events = new Map<string, Event>();

  return {
    log: (input: CreateEventInput) =>
      Effect.gen(function* () {
        yield* Effect.log("EventService.log", {
          type: input.type,
          actorId: input.actorId,
          targetId: input.targetId,
        });

        // Validate input
        if (!input.type || input.type.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "type",
              input.type,
              "Event type cannot be empty"
            )
          );
        }

        if (!input.groupId) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "groupId",
              input.groupId,
              "Group ID is required"
            )
          );
        }

        // Create event
        const event: Event = {
          _id: \`event_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          groupId: input.groupId,
          type: input.type,
          actorId: input.actorId,
          targetId: input.targetId,
          timestamp: Date.now(),
          metadata: input.metadata || {},
        };

        events.set(event._id, event);

        yield* Effect.log("EventService.log.success", {
          eventId: event._id,
          type: event.type,
        });

        return event;
      }),

    query: (filter?: EventFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("EventService.query", { filter });

        let result = Array.from(events.values());

        // Apply filters
        if (filter?.groupId) {
          result = result.filter((e) => e.groupId === filter.groupId);
        }

        if (filter?.type) {
          result = result.filter((e) => e.type === filter.type);
        }

        if (filter?.actorId) {
          result = result.filter((e) => e.actorId === filter.actorId);
        }

        if (filter?.targetId) {
          result = result.filter((e) => e.targetId === filter.targetId);
        }

        if (filter?.startTime !== undefined) {
          result = result.filter((e) => e.timestamp >= filter.startTime!);
        }

        if (filter?.endTime !== undefined) {
          result = result.filter((e) => e.timestamp <= filter.endTime!);
        }

        // Sort by timestamp descending (most recent first)
        result.sort((a, b) => b.timestamp - a.timestamp);

        // Apply pagination
        if (filter?.offset !== undefined) {
          result = result.slice(filter.offset);
        }

        if (filter?.limit !== undefined) {
          result = result.slice(0, filter.limit);
        }

        yield* Effect.log("EventService.query.success", {
          count: result.length,
        });

        return result;
      }),

    getTimeline: (thingId: string, limit = 100) =>
      Effect.gen(function* () {
        yield* Effect.log("EventService.getTimeline", { thingId, limit });

        const result = Array.from(events.values())
          .filter((e) => e.targetId === thingId || e.actorId === thingId)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);

        yield* Effect.log("EventService.getTimeline.success", {
          thingId,
          count: result.length,
        });

        return result;
      }),

    getAudit: (groupId: string, startTime?: number, endTime?: number) =>
      Effect.gen(function* () {
        yield* Effect.log("EventService.getAudit", {
          groupId,
          startTime,
          endTime,
        });

        let result = Array.from(events.values()).filter(
          (e) => e.groupId === groupId
        );

        if (startTime !== undefined) {
          result = result.filter((e) => e.timestamp >= startTime);
        }

        if (endTime !== undefined) {
          result = result.filter((e) => e.timestamp <= endTime);
        }

        // Sort by timestamp ascending (oldest first for audit)
        result.sort((a, b) => a.timestamp - b.timestamp);

        yield* Effect.log("EventService.getAudit.success", {
          groupId,
          count: result.length,
        });

        return result;
      }),

    stream: (filter?: EventFilter) => {
      // Create a stream of events
      return Stream.fromIterable(events.values()).pipe(
        Stream.filter((event) => {
          if (filter?.groupId && event.groupId !== filter.groupId) {
            return false;
          }
          if (filter?.type && event.type !== filter.type) {
            return false;
          }
          if (filter?.actorId && event.actorId !== filter.actorId) {
            return false;
          }
          if (filter?.targetId && event.targetId !== filter.targetId) {
            return false;
          }
          if (filter?.startTime && event.timestamp < filter.startTime) {
            return false;
          }
          if (filter?.endTime && event.timestamp > filter.endTime) {
            return false;
          }
          return true;
        })
      );
    },

    getStats: (groupId: string, startTime?: number, endTime?: number) =>
      Effect.gen(function* () {
        yield* Effect.log("EventService.getStats", {
          groupId,
          startTime,
          endTime,
        });

        let result = Array.from(events.values()).filter(
          (e) => e.groupId === groupId
        );

        if (startTime !== undefined) {
          result = result.filter((e) => e.timestamp >= startTime);
        }

        if (endTime !== undefined) {
          result = result.filter((e) => e.timestamp <= endTime);
        }

        // Calculate statistics
        const eventsByType: Record<string, number> = {};
        const eventsByActor: Record<string, number> = {};

        for (const event of result) {
          // Count by type
          eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

          // Count by actor
          if (event.actorId) {
            eventsByActor[event.actorId] =
              (eventsByActor[event.actorId] || 0) + 1;
          }
        }

        const stats = {
          totalEvents: result.length,
          eventsByType,
          eventsByActor,
        };

        yield* Effect.log("EventService.getStats.success", {
          groupId,
          totalEvents: stats.totalEvents,
          uniqueTypes: Object.keys(eventsByType).length,
          uniqueActors: Object.keys(eventsByActor).length,
        });

        return stats;
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const EventServiceLive = Layer.succeed(EventService, makeEventService());

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run an EventService effect with live dependencies
 */
export const runEventService = <E, A>(
  effect: Effect.Effect<A, E, EventService>
): Promise<A> =>
  pipe(effect, Effect.provide(EventServiceLive), Effect.runPromise);
