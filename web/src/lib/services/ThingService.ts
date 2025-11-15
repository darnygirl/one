/**
 * Cycle 28: ThingService - Effect.ts service for things
 *
 * Provides thing management with type validation and complex operations.
 * Uses Effect.ts for error handling, logging, and pipelines.
 */

import { Context, Effect, Layer, pipe } from "effect";
import type {
  Thing,
  CreateThingInput,
  UpdateThingInput,
  ThingFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  ThingNotFoundError,
  ValidationError,
  GroupNotFoundError,
} from "@/lib/ontology/errors";

// ============================================================================
// Thing Types (66+ types from ontology)
// ============================================================================

export const THING_TYPES = [
  // Core entities
  "user",
  "agent",
  "content",
  "token",
  "course",
  "lesson",
  "module",
  "assignment",
  "quiz",
  "certificate",

  // Commerce
  "product",
  "service",
  "order",
  "payment",
  "invoice",
  "subscription",

  // Content
  "post",
  "page",
  "article",
  "video",
  "audio",
  "document",
  "image",

  // Social
  "comment",
  "like",
  "share",
  "follow",
  "message",
  "notification",

  // Organization
  "team",
  "project",
  "task",
  "milestone",
  "workflow",
  "template",

  // Technical
  "api_key",
  "webhook",
  "integration",
  "deployment",
  "environment",
  "log",

  // Financial
  "transaction",
  "wallet",
  "balance",
  "transfer",
  "refund",
  "payout",

  // And 20+ more...
] as const;

export type ThingType = (typeof THING_TYPES)[number];

// ============================================================================
// Service Interface
// ============================================================================

export interface IThingService {
  /**
   * Create a new thing
   */
  create(
    input: CreateThingInput
  ): Effect.Effect<Thing, ValidationError | GroupNotFoundError>;

  /**
   * Update an existing thing
   */
  update(
    id: string,
    input: UpdateThingInput
  ): Effect.Effect<Thing, ThingNotFoundError | ValidationError>;

  /**
   * Delete a thing (soft delete)
   */
  delete(id: string): Effect.Effect<void, ThingNotFoundError>;

  /**
   * Read a thing by ID
   */
  read(id: string): Effect.Effect<Thing, ThingNotFoundError>;

  /**
   * List things with optional filtering
   */
  list(filter?: ThingFilter): Effect.Effect<Thing[], never>;

  /**
   * Filter things by complex criteria
   */
  filter(
    predicate: (thing: Thing) => boolean
  ): Effect.Effect<Thing[], never>;

  /**
   * Search things by name and properties
   */
  search(
    query: string,
    groupId?: string
  ): Effect.Effect<Thing[], never>;

  /**
   * Batch create multiple things
   */
  batchCreate(
    inputs: CreateThingInput[]
  ): Effect.Effect<Thing[], ValidationError | GroupNotFoundError>;

  /**
   * Get things by type
   */
  getByType(
    type: string,
    groupId?: string
  ): Effect.Effect<Thing[], never>;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class ThingService extends Context.Tag("ThingService")<
  ThingService,
  IThingService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeThingService = (): IThingService => {
  // In-memory store for demo (replace with actual backend)
  const things = new Map<string, Thing>();

  return {
    create: (input: CreateThingInput) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.create", {
          type: input.type,
          name: input.name,
        });

        // Validate input
        if (!input.type || input.type.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("type", input.type, "Type cannot be empty")
          );
        }

        if (!input.name || input.name.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("name", input.name, "Name cannot be empty")
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

        // Create thing
        const now = Date.now();
        const thing: Thing = {
          _id: \`thing_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          groupId: input.groupId,
          type: input.type,
          name: input.name,
          properties: input.properties || {},
          status: input.status || "active",
          createdAt: now,
          updatedAt: now,
        };

        things.set(thing._id, thing);

        yield* Effect.log("ThingService.create.success", {
          thingId: thing._id,
          type: thing.type,
        });

        return thing;
      }),

    update: (id: string, input: UpdateThingInput) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.update", { id, input });

        const thing = things.get(id);
        if (!thing) {
          return yield* Effect.fail(OntologyErrors.thingNotFound(id));
        }

        // Validate input
        if (input.name !== undefined && input.name.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("name", input.name, "Name cannot be empty")
          );
        }

        // Update thing
        const updated: Thing = {
          ...thing,
          name: input.name ?? thing.name,
          properties: input.properties
            ? { ...thing.properties, ...input.properties }
            : thing.properties,
          status: input.status ?? thing.status,
          updatedAt: Date.now(),
        };

        things.set(id, updated);

        yield* Effect.log("ThingService.update.success", { id });
        return updated;
      }),

    delete: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.delete", { id });

        const thing = things.get(id);
        if (!thing) {
          return yield* Effect.fail(OntologyErrors.thingNotFound(id));
        }

        // Soft delete
        const deleted: Thing = {
          ...thing,
          status: "archived",
          deletedAt: Date.now(),
          updatedAt: Date.now(),
        };

        things.set(id, deleted);

        yield* Effect.log("ThingService.delete.success", { id });
      }),

    read: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.read", { id });

        const thing = things.get(id);
        if (!thing) {
          return yield* Effect.fail(OntologyErrors.thingNotFound(id));
        }

        yield* Effect.log("ThingService.read.success", { id });
        return thing;
      }),

    list: (filter?: ThingFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.list", { filter });

        let result = Array.from(things.values());

        // Filter out soft-deleted items by default
        result = result.filter((t) => !t.deletedAt);

        // Apply filters
        if (filter?.groupId) {
          result = result.filter((t) => t.groupId === filter.groupId);
        }

        if (filter?.type) {
          result = result.filter((t) => t.type === filter.type);
        }

        if (filter?.status) {
          result = result.filter((t) => t.status === filter.status);
        }

        if (filter?.search) {
          const query = filter.search.toLowerCase();
          result = result.filter(
            (t) =>
              t.name.toLowerCase().includes(query) ||
              JSON.stringify(t.properties).toLowerCase().includes(query)
          );
        }

        // Apply sorting
        if (filter?.sortBy) {
          const sortBy = filter.sortBy as keyof Thing;
          const sortOrder = filter.sortOrder || "asc";

          result.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal === bVal) return 0;
            if (aVal === undefined) return 1;
            if (bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortOrder === "asc" ? comparison : -comparison;
          });
        }

        // Apply pagination
        if (filter?.offset !== undefined) {
          result = result.slice(filter.offset);
        }

        if (filter?.limit !== undefined) {
          result = result.slice(0, filter.limit);
        }

        yield* Effect.log("ThingService.list.success", { count: result.length });
        return result;
      }),

    filter: (predicate: (thing: Thing) => boolean) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.filter");

        const result = Array.from(things.values())
          .filter((t) => !t.deletedAt)
          .filter(predicate);

        yield* Effect.log("ThingService.filter.success", {
          count: result.length,
        });

        return result;
      }),

    search: (query: string, groupId?: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.search", { query, groupId });

        const searchLower = query.toLowerCase();
        let result = Array.from(things.values()).filter((t) => !t.deletedAt);

        // Filter by group if specified
        if (groupId) {
          result = result.filter((t) => t.groupId === groupId);
        }

        // Search in name and properties
        result = result.filter(
          (t) =>
            t.name.toLowerCase().includes(searchLower) ||
            t.type.toLowerCase().includes(searchLower) ||
            JSON.stringify(t.properties).toLowerCase().includes(searchLower)
        );

        yield* Effect.log("ThingService.search.success", {
          query,
          count: result.length,
        });

        return result;
      }),

    batchCreate: (inputs: CreateThingInput[]) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.batchCreate", {
          count: inputs.length,
        });

        // Create all things using Effect pipeline
        const createEffects = inputs.map((input) =>
          Effect.gen(function* () {
            // Validate input
            if (!input.type || input.type.trim() === "") {
              return yield* Effect.fail(
                OntologyErrors.validation(
                  "type",
                  input.type,
                  "Type cannot be empty"
                )
              );
            }

            if (!input.name || input.name.trim() === "") {
              return yield* Effect.fail(
                OntologyErrors.validation(
                  "name",
                  input.name,
                  "Name cannot be empty"
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

            // Create thing
            const now = Date.now();
            const thing: Thing = {
              _id: \`thing_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
              groupId: input.groupId,
              type: input.type,
              name: input.name,
              properties: input.properties || {},
              status: input.status || "active",
              createdAt: now,
              updatedAt: now,
            };

            things.set(thing._id, thing);
            return thing;
          })
        );

        // Execute all creates in parallel
        const created = yield* Effect.all(createEffects, {
          concurrency: "unbounded",
        });

        yield* Effect.log("ThingService.batchCreate.success", {
          count: created.length,
        });

        return created;
      }),

    getByType: (type: string, groupId?: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ThingService.getByType", { type, groupId });

        let result = Array.from(things.values())
          .filter((t) => !t.deletedAt)
          .filter((t) => t.type === type);

        if (groupId) {
          result = result.filter((t) => t.groupId === groupId);
        }

        yield* Effect.log("ThingService.getByType.success", {
          type,
          count: result.length,
        });

        return result;
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const ThingServiceLive = Layer.succeed(ThingService, makeThingService());

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run a ThingService effect with live dependencies
 */
export const runThingService = <E, A>(
  effect: Effect.Effect<A, E, ThingService>
): Promise<A> =>
  pipe(effect, Effect.provide(ThingServiceLive), Effect.runPromise);

/**
 * Validate thing type
 */
export const validateThingType = (
  type: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    if (THING_TYPES.includes(type as ThingType)) {
      return type;
    }

    yield* Effect.log("ThingService.validateThingType.warning", {
      type,
      message: "Custom thing type (not in predefined list)",
    });

    return type;
  });
