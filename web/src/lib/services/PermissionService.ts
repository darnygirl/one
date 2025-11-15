/**
 * PermissionService - Effect.ts authorization/permissions
 *
 * Cycle 33: Effect.ts authorization layer
 * - Functions: checkPermission, getRolePermissions, grantPermission
 * - Permission matrix calculation
 * - Effect context for current user
 */

import { Effect, Data, Context } from "effect";

// ============================================================================
// Error Types
// ============================================================================

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  userId: string;
  action: string;
  resource: string;
}> {}

export class PermissionDeniedError extends Data.TaggedError("PermissionDeniedError")<{
  userId: string;
  requiredPermission: string;
  userRole: string;
}> {}

export class InvalidRoleError extends Data.TaggedError("InvalidRoleError")<{
  role: string;
}> {}

// ============================================================================
// Types
// ============================================================================

export type Role = "platform_owner" | "org_owner" | "org_user" | "customer";

export type Permission =
  | "groups:create"
  | "groups:read"
  | "groups:update"
  | "groups:delete"
  | "things:create"
  | "things:read"
  | "things:update"
  | "things:delete"
  | "connections:create"
  | "connections:read"
  | "connections:delete"
  | "events:read"
  | "knowledge:create"
  | "knowledge:read"
  | "knowledge:update"
  | "knowledge:delete"
  | "platform:admin"
  | "org:admin"
  | "org:manage_users"
  | "org:view_analytics";

export type User = {
  id: string;
  role: Role;
  groupId?: string;
};

export type PermissionCheck = {
  action: Permission;
  resource?: string;
  resourceGroupId?: string;
};

// ============================================================================
// Context
// ============================================================================

export interface CurrentUser {
  readonly user: User;
}

export const CurrentUser = Context.GenericTag<CurrentUser>("CurrentUser");

// ============================================================================
// Permission Matrix
// ============================================================================

const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  platform_owner: [
    "platform:admin",
    "groups:create",
    "groups:read",
    "groups:update",
    "groups:delete",
    "things:create",
    "things:read",
    "things:update",
    "things:delete",
    "connections:create",
    "connections:read",
    "connections:delete",
    "events:read",
    "knowledge:create",
    "knowledge:read",
    "knowledge:update",
    "knowledge:delete",
    "org:admin",
    "org:manage_users",
    "org:view_analytics",
  ],
  org_owner: [
    "org:admin",
    "org:manage_users",
    "org:view_analytics",
    "groups:create",
    "groups:read",
    "groups:update",
    "groups:delete",
    "things:create",
    "things:read",
    "things:update",
    "things:delete",
    "connections:create",
    "connections:read",
    "connections:delete",
    "events:read",
    "knowledge:create",
    "knowledge:read",
    "knowledge:update",
    "knowledge:delete",
  ],
  org_user: [
    "things:create",
    "things:read",
    "things:update",
    "connections:create",
    "connections:read",
    "events:read",
    "knowledge:read",
  ],
  customer: [
    "things:read",
    "events:read",
    "knowledge:read",
  ],
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (
  role: Role
): Effect.Effect<Permission[], InvalidRoleError> =>
  Effect.gen(function* () {
    const permissions = PERMISSION_MATRIX[role];

    if (!permissions) {
      return yield* new InvalidRoleError({ role });
    }

    return permissions;
  });

/**
 * Check if a user has a specific permission
 */
export const checkPermission = (
  check: PermissionCheck
): Effect.Effect<boolean, UnauthorizedError | InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;

    // Get user's permissions
    const permissions = yield* getRolePermissions(user.role);

    // Check if user has the required permission
    const hasPermission = permissions.includes(check.action);

    if (!hasPermission) {
      return false;
    }

    // Additional check for group-scoped resources
    if (check.resourceGroupId && user.groupId) {
      // org_owner and org_user can only access resources in their group
      if (user.role === "org_owner" || user.role === "org_user") {
        if (check.resourceGroupId !== user.groupId) {
          return false;
        }
      }
    }

    return true;
  });

/**
 * Require permission (throws if not authorized)
 */
export const requirePermission = (
  check: PermissionCheck
): Effect.Effect<void, UnauthorizedError | PermissionDeniedError | InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const hasPermission = yield* checkPermission(check);

    if (!hasPermission) {
      return yield* new PermissionDeniedError({
        userId: user.id,
        requiredPermission: check.action,
        userRole: user.role,
      });
    }
  });

/**
 * Grant permission (admin only)
 * In a real implementation, this would update a database
 */
export const grantPermission = (
  targetUserId: string,
  permission: Permission
): Effect.Effect<void, UnauthorizedError | PermissionDeniedError | InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    // Require platform admin permission
    yield* requirePermission({ action: "platform:admin" });

    // In a real implementation, this would:
    // 1. Update the user's role/permissions in the database
    // 2. Invalidate permission cache
    // 3. Log the permission change

    console.log(`Granted ${permission} to user ${targetUserId}`);
  });

/**
 * Check if user can access group
 */
export const canAccessGroup = (
  groupId: string
): Effect.Effect<boolean, InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;

    // Platform owners can access all groups
    if (user.role === "platform_owner") {
      return true;
    }

    // Others can only access their own group
    return user.groupId === groupId;
  });

/**
 * Require group access
 */
export const requireGroupAccess = (
  groupId: string
): Effect.Effect<void, UnauthorizedError | InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const canAccess = yield* canAccessGroup(groupId);

    if (!canAccess) {
      return yield* new UnauthorizedError({
        userId: user.id,
        action: "access",
        resource: `group:${groupId}`,
      });
    }
  });

/**
 * Get effective permissions for current user with group context
 */
export const getEffectivePermissions = (
  groupId?: string
): Effect.Effect<Permission[], InvalidRoleError, CurrentUser> =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const basePermissions = yield* getRolePermissions(user.role);

    // If checking for specific group, filter permissions
    if (groupId && user.groupId && groupId !== user.groupId) {
      // User cannot access resources in other groups
      if (user.role !== "platform_owner") {
        return [];
      }
    }

    return basePermissions;
  });

/**
 * Helper: Create user context
 */
export const withUser = <R, E, A>(
  user: User,
  effect: Effect.Effect<A, E, CurrentUser | R>
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.provideService(CurrentUser, { user })
  );
