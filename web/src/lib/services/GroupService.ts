/**
 * Cycle 26: GroupService - Effect.ts service for group operations
 *
 * Provides group management with hierarchical organization support.
 * Uses Effect.ts for error handling, logging, and dependency injection.
 */

import { Context, Effect, Layer, pipe } from "effect";
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  GroupFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  GroupNotFoundError,
  ValidationError,
  OperationFailedError,
} from "@/lib/ontology/errors";

// ============================================================================
// Service Interface
// ============================================================================

export interface IGroupService {
  /**
   * Create a new group
   */
  create(
    input: CreateGroupInput
  ): Effect.Effect<Group, ValidationError | OperationFailedError>;

  /**
   * Read a group by ID
   */
  read(id: string): Effect.Effect<Group, GroupNotFoundError>;

  /**
   * Update an existing group
   */
  update(
    id: string,
    input: UpdateGroupInput
  ): Effect.Effect<Group, GroupNotFoundError | ValidationError>;

  /**
   * Delete a group
   */
  delete(id: string): Effect.Effect<void, GroupNotFoundError | OperationFailedError>;

  /**
   * List groups with optional filtering
   */
  list(filter?: GroupFilter): Effect.Effect<Group[], never>;

  /**
   * Get group hierarchy (parent and children)
   */
  getHierarchy(
    id: string
  ): Effect.Effect<
    { group: Group; parent?: Group; children: Group[] },
    GroupNotFoundError
  >;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class GroupService extends Context.Tag("GroupService")<
  GroupService,
  IGroupService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makeGroupService = (): IGroupService => {
  // In-memory store for demo (replace with actual backend)
  const groups = new Map<string, Group>();

  return {
    create: (input: CreateGroupInput) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.create", { slug: input.slug });

        // Validate input
        if (!input.slug || input.slug.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("slug", input.slug, "Slug cannot be empty")
          );
        }

        if (!input.name || input.name.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("name", input.name, "Name cannot be empty")
          );
        }

        // Check for duplicate slug
        for (const group of groups.values()) {
          if (group.slug === input.slug) {
            return yield* Effect.fail(
              OntologyErrors.validation(
                "slug",
                input.slug,
                "Slug already exists"
              )
            );
          }
        }

        // Validate parent group if specified
        if (input.parentGroupId) {
          const parent = groups.get(input.parentGroupId);
          if (!parent) {
            return yield* Effect.fail(
              OntologyErrors.validation(
                "parentGroupId",
                input.parentGroupId,
                "Parent group not found"
              )
            );
          }
        }

        // Create group
        const now = Date.now();
        const group: Group = {
          _id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          slug: input.slug,
          name: input.name,
          type: input.type,
          parentGroupId: input.parentGroupId,
          description: input.description,
          metadata: input.metadata,
          settings: input.settings || {
            visibility: "public",
            joinPolicy: "open",
            plan: "starter",
          },
          status: "active",
          createdAt: now,
          updatedAt: now,
        };

        groups.set(group._id, group);

        yield* Effect.log("GroupService.create.success", {
          groupId: group._id,
          slug: group.slug,
        });

        return group;
      }),

    read: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.read", { id });

        const group = groups.get(id);
        if (!group) {
          return yield* Effect.fail(OntologyErrors.groupNotFound(id));
        }

        yield* Effect.log("GroupService.read.success", { id });
        return group;
      }),

    update: (id: string, input: UpdateGroupInput) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.update", { id, input });

        const group = groups.get(id);
        if (!group) {
          return yield* Effect.fail(OntologyErrors.groupNotFound(id));
        }

        // Validate input
        if (input.name !== undefined && input.name.trim() === "") {
          return yield* Effect.fail(
            OntologyErrors.validation("name", input.name, "Name cannot be empty")
          );
        }

        // Update group
        const updated: Group = {
          ...group,
          name: input.name ?? group.name,
          description: input.description ?? group.description,
          metadata: input.metadata ?? group.metadata,
          settings: input.settings ?? group.settings,
          status: input.status ?? group.status,
          updatedAt: Date.now(),
        };

        groups.set(id, updated);

        yield* Effect.log("GroupService.update.success", { id });
        return updated;
      }),

    delete: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.delete", { id });

        const group = groups.get(id);
        if (!group) {
          return yield* Effect.fail(OntologyErrors.groupNotFound(id));
        }

        // Check for children
        const children = Array.from(groups.values()).filter(
          (g) => g.parentGroupId === id
        );

        if (children.length > 0) {
          return yield* Effect.fail(
            OntologyErrors.operationFailed(
              "delete",
              "Cannot delete group with children",
              { childCount: children.length }
            )
          );
        }

        groups.delete(id);

        yield* Effect.log("GroupService.delete.success", { id });
      }),

    list: (filter?: GroupFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.list", { filter });

        let result = Array.from(groups.values());

        // Apply filters
        if (filter?.type) {
          result = result.filter((g) => g.type === filter.type);
        }

        if (filter?.status) {
          result = result.filter((g) => g.status === filter.status);
        }

        if (filter?.parentGroupId) {
          result = result.filter((g) => g.parentGroupId === filter.parentGroupId);
        }

        // Apply sorting
        if (filter?.sortBy) {
          const sortBy = filter.sortBy as keyof Group;
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

        yield* Effect.log("GroupService.list.success", { count: result.length });
        return result;
      }),

    getHierarchy: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("GroupService.getHierarchy", { id });

        const group = groups.get(id);
        if (!group) {
          return yield* Effect.fail(OntologyErrors.groupNotFound(id));
        }

        // Get parent if exists
        const parent = group.parentGroupId
          ? groups.get(group.parentGroupId)
          : undefined;

        // Get all children
        const children = Array.from(groups.values()).filter(
          (g) => g.parentGroupId === id
        );

        yield* Effect.log("GroupService.getHierarchy.success", {
          id,
          hasParent: !!parent,
          childCount: children.length,
        });

        return { group, parent, children };
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const GroupServiceLive = Layer.succeed(GroupService, makeGroupService());

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run a GroupService effect with live dependencies
 */
export const runGroupService = <E, A>(
  effect: Effect.Effect<A, E, GroupService>
): Promise<A> =>
  pipe(effect, Effect.provide(GroupServiceLive), Effect.runPromise);
