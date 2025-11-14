/**
 * Cycle 29: ConnectionService - Effect.ts service for connections
 *
 * Provides connection/relationship management with strength calculation.
 * Uses Effect.ts for error handling, logging, and composition.
 */

import { Context, Effect, Layer, pipe } from "effect";
import type {
  Connection,
  CreateConnectionInput,
  ConnectionFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  ConnectionNotFoundError,
  ValidationError,
  ThingNotFoundError,
} from "@/lib/ontology/errors";

// ============================================================================
// Connection Types (25+ relationship types from ontology)
// ============================================================================

export const CONNECTION_TYPES = [
  // Ownership
  "owns",
  "created_by",
  "belongs_to",

  // Social
  "follows",
  "friend_of",
  "member_of",
  "blocks",

  // Commerce
  "purchased",
  "sold",
  "subscribed_to",

  // Content
  "authored",
  "commented_on",
  "liked",
  "shared",

  // Learning
  "enrolled_in",
  "completed",
  "teaches",
  "mentors",

  // Organization
  "works_for",
  "manages",
  "reports_to",
  "collaborates_with",

  // Technical
  "depends_on",
  "integrates_with",
  "deploys_to",
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

// ============================================================================
// Service Interface
// ============================================================================

export interface IConnectionService {
  /**
   * Create a new connection
   */
  create(
    input: CreateConnectionInput
  ): Effect.Effect<Connection, ValidationError | ThingNotFoundError>;

  /**
   * Delete a connection
   */
  delete(id: string): Effect.Effect<void, ConnectionNotFoundError>;

  /**
   * Read a connection by ID
   */
  read(id: string): Effect.Effect<Connection, ConnectionNotFoundError>;

  /**
   * List connections with optional filtering
   */
  list(filter?: ConnectionFilter): Effect.Effect<Connection[], never>;

  /**
   * Get connections by type
   */
  getByType(
    relationshipType: string,
    groupId?: string
  ): Effect.Effect<Connection[], never>;

  /**
   * Get network for a thing (all connections)
   */
  getNetwork(
    thingId: string
  ): Effect.Effect<
    {
      outgoing: Connection[];
      incoming: Connection[];
      total: number;
    },
    never
  >;

  /**
   * Calculate connection strength based on metadata
   */
  calculateStrength(
    connection: Connection
  ): Effect.Effect<number, never>;

  /**
   * Find path between two things
   */
  findPath(
    fromThingId: string,
    toThingId: string,
    maxDepth?: number
  ): Effect.Effect<Connection[][], never>;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class ConnectionService extends Context.Tag("ConnectionService")<
  ConnectionService,
  IConnectionService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeConnectionService = (): IConnectionService => {
  // In-memory store for demo (replace with actual backend)
  const connections = new Map<string, Connection>();

  return {
    create: (input: CreateConnectionInput) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.create", {
          relationshipType: input.relationshipType,
          from: input.fromThingId,
          to: input.toThingId,
        });

        // Validate input
        if (!input.fromThingId) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "fromThingId",
              input.fromThingId,
              "From thing ID is required"
            )
          );
        }

        if (!input.toThingId) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "toThingId",
              input.toThingId,
              "To thing ID is required"
            )
          );
        }

        if (!input.relationshipType || input.relationshipType.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "relationshipType",
              input.relationshipType,
              "Relationship type cannot be empty"
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

        // Create connection
        const now = Date.now();
        const connection: Connection = {
          _id: \`conn_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          groupId: input.groupId,
          fromThingId: input.fromThingId,
          toThingId: input.toThingId,
          relationshipType: input.relationshipType,
          metadata: input.metadata,
          strength: input.strength ?? 1.0,
          validFrom: input.validFrom ?? now,
          validTo: input.validTo,
          createdAt: now,
          updatedAt: now,
        };

        connections.set(connection._id, connection);

        yield* Effect.log("ConnectionService.create.success", {
          connectionId: connection._id,
          relationshipType: connection.relationshipType,
        });

        return connection;
      }),

    delete: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.delete", { id });

        const connection = connections.get(id);
        if (!connection) {
          return yield* Effect.fail(OntologyErrors.connectionNotFound(id));
        }

        // Soft delete
        const deleted: Connection = {
          ...connection,
          deletedAt: Date.now(),
        };

        connections.set(id, deleted);

        yield* Effect.log("ConnectionService.delete.success", { id });
      }),

    read: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.read", { id });

        const connection = connections.get(id);
        if (!connection) {
          return yield* Effect.fail(OntologyErrors.connectionNotFound(id));
        }

        yield* Effect.log("ConnectionService.read.success", { id });
        return connection;
      }),

    list: (filter?: ConnectionFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.list", { filter });

        let result = Array.from(connections.values());

        // Filter out soft-deleted items by default
        result = result.filter((c) => !c.deletedAt);

        // Apply filters
        if (filter?.groupId) {
          result = result.filter((c) => c.groupId === filter.groupId);
        }

        if (filter?.fromThingId) {
          result = result.filter((c) => c.fromThingId === filter.fromThingId);
        }

        if (filter?.toThingId) {
          result = result.filter((c) => c.toThingId === filter.toThingId);
        }

        if (filter?.relationshipType) {
          result = result.filter(
            (c) => c.relationshipType === filter.relationshipType
          );
        }

        // Apply sorting
        if (filter?.sortBy) {
          const sortBy = filter.sortBy as keyof Connection;
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

        yield* Effect.log("ConnectionService.list.success", {
          count: result.length,
        });
        return result;
      }),

    getByType: (relationshipType: string, groupId?: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.getByType", {
          relationshipType,
          groupId,
        });

        let result = Array.from(connections.values())
          .filter((c) => !c.deletedAt)
          .filter((c) => c.relationshipType === relationshipType);

        if (groupId) {
          result = result.filter((c) => c.groupId === groupId);
        }

        yield* Effect.log("ConnectionService.getByType.success", {
          relationshipType,
          count: result.length,
        });

        return result;
      }),

    getNetwork: (thingId: string) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.getNetwork", { thingId });

        const allConnections = Array.from(connections.values()).filter(
          (c) => !c.deletedAt
        );

        const outgoing = allConnections.filter((c) => c.fromThingId === thingId);
        const incoming = allConnections.filter((c) => c.toThingId === thingId);

        yield* Effect.log("ConnectionService.getNetwork.success", {
          thingId,
          outgoingCount: outgoing.length,
          incomingCount: incoming.length,
          total: outgoing.length + incoming.length,
        });

        return {
          outgoing,
          incoming,
          total: outgoing.length + incoming.length,
        };
      }),

    calculateStrength: (connection: Connection) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.calculateStrength", {
          connectionId: connection._id,
        });

        let strength = connection.strength || 1.0;

        // Adjust strength based on metadata
        if (connection.metadata) {
          // Increase strength for interactions
          const interactionCount = connection.metadata.interactionCount as
            | number
            | undefined;
          if (interactionCount) {
            strength += Math.log10(interactionCount + 1) * 0.1;
          }

          // Increase strength for time-based connections
          const duration = connection.metadata.duration as number | undefined;
          if (duration) {
            const days = duration / (1000 * 60 * 60 * 24);
            strength += Math.log10(days + 1) * 0.05;
          }

          // Adjust for recency
          if (connection.updatedAt) {
            const daysSinceUpdate =
              (Date.now() - connection.updatedAt) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 7) {
              strength *= 1.2; // 20% boost for recent activity
            } else if (daysSinceUpdate > 365) {
              strength *= 0.8; // 20% reduction for stale connections
            }
          }
        }

        // Cap strength between 0 and 10
        strength = Math.max(0, Math.min(10, strength));

        yield* Effect.log("ConnectionService.calculateStrength.success", {
          connectionId: connection._id,
          originalStrength: connection.strength,
          calculatedStrength: strength,
        });

        return strength;
      }),

    findPath: (fromThingId: string, toThingId: string, maxDepth = 5) =>
      Effect.gen(function* () {
        yield* Effect.log("ConnectionService.findPath", {
          from: fromThingId,
          to: toThingId,
          maxDepth,
        });

        const allConnections = Array.from(connections.values()).filter(
          (c) => !c.deletedAt
        );

        const paths: Connection[][] = [];
        const visited = new Set<string>();

        // BFS to find all paths
        const queue: { thingId: string; path: Connection[] }[] = [
          { thingId: fromThingId, path: [] },
        ];

        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) break;

          const { thingId, path } = current;

          // Skip if already visited or path too long
          if (visited.has(thingId) || path.length >= maxDepth) {
            continue;
          }

          visited.add(thingId);

          // Check if we reached the target
          if (thingId === toThingId && path.length > 0) {
            paths.push(path);
            continue;
          }

          // Add all outgoing connections to queue
          const outgoing = allConnections.filter((c) => c.fromThingId === thingId);
          for (const conn of outgoing) {
            queue.push({
              thingId: conn.toThingId,
              path: [...path, conn],
            });
          }
        }

        yield* Effect.log("ConnectionService.findPath.success", {
          from: fromThingId,
          to: toThingId,
          pathCount: paths.length,
        });

        return paths;
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const ConnectionServiceLive = Layer.succeed(
  ConnectionService,
  makeConnectionService()
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run a ConnectionService effect with live dependencies
 */
export const runConnectionService = <E, A>(
  effect: Effect.Effect<A, E, ConnectionService>
): Promise<A> =>
  pipe(effect, Effect.provide(ConnectionServiceLive), Effect.runPromise);
