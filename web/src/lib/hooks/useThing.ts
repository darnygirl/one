/**
 * Cycle 48: useThing Hook - React hook wrapping ThingService
 *
 * Provides React hooks for thing/entity management with Effect.ts integration.
 * Includes type-specific hooks, loading/error states, and optimistic updates.
 */

import { useState, useEffect, useCallback } from "react";
import { Effect } from "effect";
import type { Thing, ThingFilter, CreateThingInput, UpdateThingInput } from "@/lib/ontology/types";
import { ThingService, runThingService } from "@/lib/services/ThingService";
import type { OntologyError } from "@/lib/ontology/errors";

// ============================================================================
// Hook Types
// ============================================================================

interface UseThingResult {
  thing: Thing | null;
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseThingsResult {
  things: Thing[];
  loading: boolean;
  error: OntologyError | null;
  refetch: () => Promise<void>;
}

interface UseCreateThingResult {
  createThing: (input: CreateThingInput) => Promise<Thing | null>;
  loading: boolean;
  error: OntologyError | null;
}

interface UseUpdateThingResult {
  updateThing: (id: string, input: UpdateThingInput) => Promise<Thing | null>;
  loading: boolean;
  error: OntologyError | null;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch a single thing by ID
 *
 * @example
 * ```tsx
 * const { thing, loading, error } = useThing("thing_123");
 * ```
 */
export function useThing(id: string | null): UseThingResult {
  const [thing, setThing] = useState<Thing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchThing = useCallback(async () => {
    if (!id) {
      setThing(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ThingService;
        return yield* service.read(id);
      });

      const result = await runThingService(program);
      setThing(result);
    } catch (err) {
      setError(err as OntologyError);
      setThing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchThing();
  }, [fetchThing]);

  return { thing, loading, error, refetch: fetchThing };
}

/**
 * Hook to fetch multiple things with optional filtering
 *
 * @example
 * ```tsx
 * const { things, loading } = useThings({ groupId: "group_123", type: "product" });
 * ```
 */
export function useThings(filter?: ThingFilter): UseThingsResult {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const fetchThings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ThingService;
        return yield* service.list(filter);
      });

      const result = await runThingService(program);
      setThings(result);
    } catch (err) {
      setError(err as OntologyError);
      setThings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchThings();
  }, [fetchThings]);

  return { things, loading, error, refetch: fetchThings };
}

/**
 * Hook to create a new thing
 *
 * @example
 * ```tsx
 * const { createThing, loading } = useCreateThing();
 * await createThing({ groupId: "group_123", type: "product", name: "My Product" });
 * ```
 */
export function useCreateThing(): UseCreateThingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const createThing = useCallback(async (input: CreateThingInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ThingService;
        return yield* service.create(input);
      });

      const result = await runThingService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createThing, loading, error };
}

/**
 * Hook to update a thing
 *
 * @example
 * ```tsx
 * const { updateThing, loading } = useUpdateThing();
 * await updateThing("thing_123", { name: "Updated Name" });
 * ```
 */
export function useUpdateThing(): UseUpdateThingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const updateThing = useCallback(async (id: string, input: UpdateThingInput) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ThingService;
        return yield* service.update(id, input);
      });

      const result = await runThingService(program);
      return result;
    } catch (err) {
      setError(err as OntologyError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateThing, loading, error };
}

/**
 * Hook to search things
 *
 * @example
 * ```tsx
 * const { things, search, loading } = useSearchThings("group_123");
 * await search("product");
 * ```
 */
export function useSearchThings(groupId?: string) {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OntologyError | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const program = Effect.gen(function* () {
        const service = yield* ThingService;
        return yield* service.search(query, groupId);
      });

      const result = await runThingService(program);
      setThings(result);
    } catch (err) {
      setError(err as OntologyError);
      setThings([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  return { things, search, loading, error };
}

/**
 * Type-specific hook for courses
 *
 * @example
 * ```tsx
 * const { courses, loading } = useCourses("group_123");
 * ```
 */
export function useCourses(groupId: string) {
  return useThings({ groupId, type: "course" });
}

/**
 * Type-specific hook for products
 *
 * @example
 * ```tsx
 * const { products, loading } = useProducts("group_123");
 * ```
 */
export function useProducts(groupId: string) {
  return useThings({ groupId, type: "product" });
}

/**
 * Type-specific hook for posts
 *
 * @example
 * ```tsx
 * const { posts, loading } = usePosts("group_123");
 * ```
 */
export function usePosts(groupId: string) {
  return useThings({ groupId, type: "post" });
}
