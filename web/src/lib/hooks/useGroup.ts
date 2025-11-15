/**
 * useGroup Hook - React Hook for Group Management
 *
 * Provides React hooks for working with groups from the 6-dimension ontology.
 * Wraps DataProvider's group operations with Effect.ts error handling.
 *
 * Features:
 * - Get single group by ID or slug
 * - List groups with filtering
 * - Create new groups
 * - Update existing groups
 * - Delete groups
 * - Type-safe error handling
 * - Loading states
 * - Integration with Convex real-time updates
 *
 * @example
 * ```tsx
 * import { useGroup, useGroups, useCreateGroup } from "@/lib/hooks/useGroup";
 *
 * function GroupSelector() {
 *   const { groups, loading, error } = useGroups({ type: "organization" });
 *
 *   if (loading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <Select>
 *       {groups.map(group => (
 *         <SelectItem key={group._id} value={group._id}>
 *           {group.name}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 *
 * function CreateGroupForm() {
 *   const { createGroup, creating, error } = useCreateGroup();
 *
 *   const handleSubmit = async (data) => {
 *     const groupId = await createGroup({
 *       slug: data.slug,
 *       name: data.name,
 *       type: "organization"
 *     });
 *     console.log("Created group:", groupId);
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */

import { useState, useEffect } from "react";
import { Effect } from "effect";
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  ListGroupsOptions,
  GroupNotFoundError,
  GroupCreateError,
  QueryError,
  DataProviderError,
} from "@/providers/DataProvider";
import { DataProviderService } from "@/providers/DataProvider";
import { getOrCreateDataProviderLayer } from "@/lib/effect-client";

// ============================================================================
// ERROR HANDLING
// ============================================================================

type GroupError =
  | GroupNotFoundError
  | GroupCreateError
  | QueryError
  | DataProviderError;

interface ErrorState {
  _tag: string;
  message: string;
  id?: string;
  cause?: unknown;
}

function formatError(error: GroupError): ErrorState {
  return {
    _tag: error._tag,
    message: "message" in error ? error.message : "An error occurred",
    id: "id" in error ? error.id : undefined,
    cause: "cause" in error ? error.cause : undefined,
  };
}

// ============================================================================
// useGroup Hook - Get Single Group
// ============================================================================

export interface UseGroupOptions {
  id?: string;
  slug?: string;
}

export interface UseGroupResult {
  group: Group | null;
  loading: boolean;
  error: ErrorState | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single group by ID or slug
 *
 * @param options - Group identifier (id or slug)
 * @returns Group data, loading state, error, and refetch function
 */
export function useGroup(options: UseGroupOptions): UseGroupResult {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchGroup = async () => {
    if (!options.id && !options.slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      if (options.id) {
        return yield* provider.groups.get(options.id);
      } else if (options.slug) {
        return yield* provider.groups.getBySlug(options.slug);
      }

      return null;
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));
      setGroup(result);
    } catch (err) {
      setError(formatError(err as GroupError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [options.id, options.slug]);

  return {
    group,
    loading,
    error,
    refetch: fetchGroup,
  };
}

// ============================================================================
// useGroups Hook - List Multiple Groups
// ============================================================================

export interface UseGroupsResult {
  groups: Group[];
  loading: boolean;
  error: ErrorState | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch multiple groups with filtering
 *
 * @param options - List options (type, status, parentGroupId, limit, offset)
 * @returns Groups array, loading state, error, and refetch function
 */
export function useGroups(options?: ListGroupsOptions): UseGroupsResult {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.groups.list(options);
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));
      setGroups(result);
    } catch (err) {
      setError(formatError(err as GroupError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [
    options?.type,
    options?.status,
    options?.parentGroupId,
    options?.limit,
    options?.offset,
  ]);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
  };
}

// ============================================================================
// useCreateGroup Hook - Create New Group
// ============================================================================

export interface UseCreateGroupResult {
  createGroup: (input: CreateGroupInput) => Promise<string>;
  creating: boolean;
  error: ErrorState | null;
  reset: () => void;
}

/**
 * Hook to create a new group
 *
 * @returns Function to create group, loading state, error, and reset function
 */
export function useCreateGroup(): UseCreateGroupResult {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const createGroup = async (input: CreateGroupInput): Promise<string> => {
    setCreating(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.groups.create(input);
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      const groupId = await Effect.runPromise(program.pipe(Effect.provide(layer)));
      return groupId;
    } catch (err) {
      const formattedError = formatError(err as GroupError);
      setError(formattedError);
      throw formattedError;
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  return {
    createGroup,
    creating,
    error,
    reset,
  };
}

// ============================================================================
// useUpdateGroup Hook - Update Existing Group
// ============================================================================

export interface UseUpdateGroupResult {
  updateGroup: (id: string, input: UpdateGroupInput) => Promise<void>;
  updating: boolean;
  error: ErrorState | null;
  reset: () => void;
}

/**
 * Hook to update an existing group
 *
 * @returns Function to update group, loading state, error, and reset function
 */
export function useUpdateGroup(): UseUpdateGroupResult {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const updateGroup = async (
    id: string,
    input: UpdateGroupInput
  ): Promise<void> => {
    setUpdating(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.groups.update(id, input);
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      await Effect.runPromise(program.pipe(Effect.provide(layer)));
    } catch (err) {
      const formattedError = formatError(err as GroupError);
      setError(formattedError);
      throw formattedError;
    } finally {
      setUpdating(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  return {
    updateGroup,
    updating,
    error,
    reset,
  };
}

// ============================================================================
// useDeleteGroup Hook - Delete Group
// ============================================================================

export interface UseDeleteGroupResult {
  deleteGroup: (id: string) => Promise<void>;
  deleting: boolean;
  error: ErrorState | null;
  reset: () => void;
}

/**
 * Hook to delete a group
 *
 * @returns Function to delete group, loading state, error, and reset function
 */
export function useDeleteGroup(): UseDeleteGroupResult {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const deleteGroup = async (id: string): Promise<void> => {
    setDeleting(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.groups.delete(id);
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      await Effect.runPromise(program.pipe(Effect.provide(layer)));
    } catch (err) {
      const formattedError = formatError(err as GroupError);
      setError(formattedError);
      throw formattedError;
    } finally {
      setDeleting(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  return {
    deleteGroup,
    deleting,
    error,
    reset,
  };
}

// ============================================================================
// useGroupHierarchy Hook - Get Group with Parent Chain
// ============================================================================

export interface UseGroupHierarchyResult {
  group: Group | null;
  parents: Group[];
  loading: boolean;
  error: ErrorState | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a group with its full parent hierarchy
 *
 * Useful for breadcrumbs and navigation
 *
 * @param groupId - Group ID
 * @returns Group, parent chain, loading state, error, and refetch function
 */
export function useGroupHierarchy(groupId?: string): UseGroupHierarchyResult {
  const [group, setGroup] = useState<Group | null>(null);
  const [parents, setParents] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchHierarchy = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get the group
      const currentGroup = yield* provider.groups.get(groupId);
      const parentChain: Group[] = [];

      // Walk up the parent chain
      let parentId = currentGroup.parentGroupId;
      while (parentId) {
        const parent = yield* provider.groups.get(parentId);
        parentChain.unshift(parent); // Add to beginning
        parentId = parent.parentGroupId;
      }

      return { currentGroup, parentChain };
    });

    const layer = getOrCreateDataProviderLayer();

    try {
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));
      setGroup(result.currentGroup);
      setParents(result.parentChain);
    } catch (err) {
      setError(formatError(err as GroupError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, [groupId]);

  return {
    group,
    parents,
    loading,
    error,
    refetch: fetchHierarchy,
  };
}
