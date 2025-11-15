/**
 * Cycle 50: useEvent Hook - React hook wrapping EventService
 *
 * Provides React hooks for event logging and querying with Effect.ts integration.
 * Includes event streaming, audit trails, pagination support, and real-time updates.
 */

import { useState, useEffect, useCallback } from "react";
import { Effect } from "effect";
import type { Event, EventFilter, CreateEventInput } from "@/lib/ontology/types";
import { EventService, runEventService } from "@/lib/services/EventService";
import type { OntologyError } from "@/lib/ontology/errors";

// ============================================================================
// Hook Types
// ============================================================================

interface UseEventResult {
  event: Event | null;
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseLogEventResult {
  logEvent: (input: CreateEventInput) => Promise<Event | null>;
  loading: boolean;
  error: OntologyError | null;
}

interface UseEventTimelineResult {
  events: Event[];
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch a single event by ID
 *
 * @example
 * ```tsx
 * const { event, loading, error } = useEvent("event_123");
 * ```
 */
export function useEvent(id: string | null): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setEvent(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.log({ 
          type: "query", 
          groupId: "default", 
          metadata: { eventId: id } 
        });
      });

      const result = await runEventService(program);
      setEvent(result);
    } catch (err) {
      setError(err as OntologyError);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}

/**
 * Hook to query events with optional filtering
 *
 * @example
 * ```tsx
 * const { events, loading } = useEvents({ groupId: "group_123", type: "created" });
 * ```
 */
export function useEvents(filter?: EventFilter): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.query(filter);
      });

      const result = await runEventService(program);
      setEvents(result);
    } catch (err) {
      setError(err as OntologyError);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

/**
 * Hook to log a new event
 *
 * @example
 * ```tsx
 * const { logEvent, loading } = useLogEvent();
 * await logEvent({ 
 *   type: "created", 
 *   groupId: "group_123", 
 *   actorId: "person_123", 
 *   targetId: "thing_123" 
 * });
 * ```
 */
export function useLogEvent(): UseLogEventResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const logEvent = useCallback(async (input: CreateEventInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.log(input);
      });

      const result = await runEventService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logEvent, loading, error };
}

/**
 * Hook to get event timeline for a thing or person
 *
 * @example
 * ```tsx
 * const { events, loading } = useEventTimeline("thing_123", 50);
 * ```
 */
export function useEventTimeline(
  thingId: string | null,
  limit = 50
): UseEventTimelineResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!thingId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.getTimeline(thingId, limit);
      });

      const result = await runEventService(program);
      setEvents(result);
    } catch (err) {
      setError(err as OntologyError);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [thingId, limit]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { events, loading, error, refetch: fetchTimeline };
}

/**
 * Hook to get audit log for a group
 *
 * @example
 * ```tsx
 * const { events, loading } = useAuditLog("group_123");
 * ```
 */
export function useAuditLog(
  groupId: string | null,
  startTime?: number,
  endTime?: number
): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchAudit = useCallback(async () => {
    if (!groupId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.getAudit(groupId, startTime, endTime);
      });

      const result = await runEventService(program);
      setEvents(result);
    } catch (err) {
      setError(err as OntologyError);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, startTime, endTime]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return { events, loading, error, refetch: fetchAudit };
}

/**
 * Hook to get event statistics for a group
 *
 * @example
 * ```tsx
 * const { stats, loading } = useEventStats("group_123");
 * ```
 */
export function useEventStats(
  groupId: string | null,
  startTime?: number,
  endTime?: number
) {
  const [stats, setStats] = useState<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByActor: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchStats = useCallback(async () => {
    if (!groupId) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.getStats(groupId, startTime, endTime);
      });

      const result = await runEventService(program);
      setStats(result);
    } catch (err) {
      setError(err as OntologyError);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, startTime, endTime]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook to stream events in real-time
 *
 * @example
 * ```tsx
 * const { events, isStreaming, startStream, stopStream } = useEventStream({ groupId: "group_123" });
 * ```
 */
export function useEventStream(filter?: EventFilter) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const startStream = useCallback(() => {
    if (isStreaming) return;

    setIsStreaming(true);
    setError(null);
    setEvents([]);

    const program = Effect.gen(function* () {
      const service = yield* EventService;
      return yield* service.stream(filter, (event) => {
        setEvents((prev) => [event, ...prev].slice(0, 100)); // Keep last 100 events
      });
    });

    runEventService(program)
      .then((unsub) => {
        setUnsubscribe(() => unsub);
      })
      .catch((err) => {
        setError(err as OntologyError);
        setIsStreaming(false);
      });
  }, [filter, isStreaming]);

  const stopStream = useCallback(() => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
    setIsStreaming(false);
  }, [unsubscribe]);

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  return { events, isStreaming, startStream, stopStream, error };
}

/**
 * Hook to get events by type
 *
 * @example
 * ```tsx
 * const { events, loading } = useEventsByType("created", "group_123", 50);
 * ```
 */
export function useEventsByType(
  type: string,
  groupId?: string,
  limit = 50
): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* EventService;
        return yield* service.getByType(type, groupId, limit);
      });

      const result = await runEventService(program);
      setEvents(result);
    } catch (err) {
      setError(err as OntologyError);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [type, groupId, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
