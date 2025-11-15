/**
 * Cycle 27: PersonService - Effect.ts service for people/users
 *
 * Provides person management with role validation and permissions.
 * Uses Effect.ts for error handling, logging, and dependency injection.
 */

import { Context, Effect, Layer, pipe } from "effect";
import type {
  Person,
  CreatePersonInput,
  UpdatePersonInput,
  PersonFilter,
} from "@/lib/ontology/types";
import { OntologyErrors } from "@/lib/ontology/errors";
import type {
  PersonNotFoundError,
  ValidationError,
  PermissionDeniedError,
  GroupNotFoundError,
} from "@/lib/ontology/errors";

// ============================================================================
// Role Types
// ============================================================================

export type Role = "platform_owner" | "org_owner" | "org_user" | "customer";

export const ROLES: Role[] = [
  "platform_owner",
  "org_owner",
  "org_user",
  "customer",
];

export interface Permission {
  action: string;
  resource: string;
  scope: "platform" | "organization" | "self";
}

// ============================================================================
// Service Interface
// ============================================================================

export interface IPersonService {
  /**
   * Create a new person
   */
  create(
    input: CreatePersonInput
  ): Effect.Effect<Person, ValidationError | GroupNotFoundError>;

  /**
   * Update an existing person
   */
  update(
    id: string,
    input: UpdatePersonInput
  ): Effect.Effect<Person, PersonNotFoundError | ValidationError>;

  /**
   * Invite a person to a group
   */
  invite(
    email: string,
    groupId: string,
    role: Role
  ): Effect.Effect<Person, ValidationError | GroupNotFoundError>;

  /**
   * Update person's role
   */
  updateRole(
    id: string,
    role: Role,
    actorId: string
  ): Effect.Effect<Person, PersonNotFoundError | PermissionDeniedError>;

  /**
   * Get permissions for a person
   */
  getPermissions(id: string): Effect.Effect<Permission[], PersonNotFoundError>;

  /**
   * Read a person by ID
   */
  read(id: string): Effect.Effect<Person, PersonNotFoundError>;

  /**
   * List people with optional filtering
   */
  list(filter?: PersonFilter): Effect.Effect<Person[], never>;

  /**
   * Delete a person
   */
  delete(id: string): Effect.Effect<void, PersonNotFoundError>;
}

// ============================================================================
// Service Context Tag
// ============================================================================

export class PersonService extends Context.Tag("PersonService")<
  PersonService,
  IPersonService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makePersonService = (): IPersonService => {
  // In-memory store for demo (replace with actual backend)
  const people = new Map<string, Person>();

  return {
    create: (input: CreatePersonInput) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.create", { email: input.email });

        // Validate input
        if (!input.email || !input.email.includes("@")) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "email",
              input.email,
              "Invalid email address"
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

        if (!ROLES.includes(input.role)) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "role",
              input.role,
              `Invalid role. Must be one of: ${ROLES.join(", ")}`
            )
          );
        }

        // Check for duplicate email in same group
        for (const person of people.values()) {
          if (
            person.email === input.email &&
            person.groupId === input.groupId
          ) {
            return yield* Effect.fail(
              OntologyErrors.validation(
                "email",
                input.email,
                "Email already exists in this group"
              )
            );
          }
        }

        // Create person
        const now = Date.now();
        const person: Person = {
          _id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          groupId: input.groupId,
          email: input.email,
          name: input.name,
          role: input.role,
          properties: input.properties || {},
          status: "active",
          createdAt: now,
          updatedAt: now,
        };

        people.set(person._id, person);

        yield* Effect.log("PersonService.create.success", {
          personId: person._id,
          email: person.email,
        });

        return person;
      }),

    update: (id: string, input: UpdatePersonInput) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.update", { id, input });

        const person = people.get(id);
        if (!person) {
          return yield* Effect.fail(OntologyErrors.personNotFound(id));
        }

        // Validate role if being updated
        if (input.role && !ROLES.includes(input.role)) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "role",
              input.role,
              `Invalid role. Must be one of: ${ROLES.join(", ")}`
            )
          );
        }

        // Update person
        const updated: Person = {
          ...person,
          name: input.name ?? person.name,
          role: input.role ?? person.role,
          properties: input.properties ?? person.properties,
          status: input.status ?? person.status,
          updatedAt: Date.now(),
        };

        people.set(id, updated);

        yield* Effect.log("PersonService.update.success", { id });
        return updated;
      }),

    invite: (email: string, groupId: string, role: Role) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.invite", { email, groupId, role });

        // Validate email
        if (!email || !email.includes("@")) {
          return yield* Effect.fail(
            OntologyErrors.validation("email", email, "Invalid email address")
          );
        }

        // Validate role
        if (!ROLES.includes(role)) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "role",
              role,
              `Invalid role. Must be one of: ${ROLES.join(", ")}`
            )
          );
        }

        // Check if person already exists
        for (const person of people.values()) {
          if (person.email === email && person.groupId === groupId) {
            return yield* Effect.fail(
              OntologyErrors.validation(
                "email",
                email,
                "Person already invited to this group"
              )
            );
          }
        }

        // Create invited person
        const now = Date.now();
        const person: Person = {
          _id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          groupId,
          email,
          role,
          properties: { invited: true, invitedAt: now },
          status: "active",
          createdAt: now,
          updatedAt: now,
        };

        people.set(person._id, person);

        yield* Effect.log("PersonService.invite.success", {
          personId: person._id,
          email,
        });

        return person;
      }),

    updateRole: (id: string, role: Role, actorId: string) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.updateRole", { id, role, actorId });

        const person = people.get(id);
        if (!person) {
          return yield* Effect.fail(OntologyErrors.personNotFound(id));
        }

        const actor = people.get(actorId);
        if (!actor) {
          return yield* Effect.fail(OntologyErrors.personNotFound(actorId));
        }

        // Validate role
        if (!ROLES.includes(role)) {
          return yield* Effect.fail(
            OntologyErrors.validation(
              "role",
              role,
              `Invalid role. Must be one of: ${ROLES.join(", ")}`
            )
          );
        }

        // Check permissions
        // Only platform_owner and org_owner can change roles
        if (actor.role !== "platform_owner" && actor.role !== "org_owner") {
          return yield* Effect.fail(
            OntologyErrors.permissionDenied(
              "updateRole",
              `person:${id}`,
              "org_owner or platform_owner"
            )
          );
        }

        // org_owner cannot create platform_owner
        if (actor.role === "org_owner" && role === "platform_owner") {
          return yield* Effect.fail(
            OntologyErrors.permissionDenied(
              "updateRole",
              `person:${id}`,
              "platform_owner"
            )
          );
        }

        // Update role
        const updated: Person = {
          ...person,
          role,
          updatedAt: Date.now(),
        };

        people.set(id, updated);

        yield* Effect.log("PersonService.updateRole.success", { id, role });
        return updated;
      }),

    getPermissions: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.getPermissions", { id });

        const person = people.get(id);
        if (!person) {
          return yield* Effect.fail(OntologyErrors.personNotFound(id));
        }

        const permissions: Permission[] = [];

        // Platform owner permissions
        if (person.role === "platform_owner") {
          permissions.push(
            { action: "*", resource: "*", scope: "platform" },
            { action: "manage", resource: "groups", scope: "platform" },
            { action: "manage", resource: "people", scope: "platform" },
            { action: "manage", resource: "things", scope: "platform" }
          );
        }

        // Org owner permissions
        if (person.role === "org_owner") {
          permissions.push(
            { action: "manage", resource: "group", scope: "organization" },
            { action: "manage", resource: "people", scope: "organization" },
            { action: "create", resource: "things", scope: "organization" },
            { action: "update", resource: "things", scope: "organization" },
            { action: "delete", resource: "things", scope: "organization" }
          );
        }

        // Org user permissions
        if (person.role === "org_user") {
          permissions.push(
            { action: "read", resource: "group", scope: "organization" },
            { action: "read", resource: "people", scope: "organization" },
            { action: "create", resource: "things", scope: "organization" },
            { action: "update", resource: "own_things", scope: "self" }
          );
        }

        // Customer permissions
        if (person.role === "customer") {
          permissions.push(
            { action: "read", resource: "things", scope: "organization" },
            { action: "purchase", resource: "things", scope: "organization" },
            { action: "update", resource: "profile", scope: "self" }
          );
        }

        yield* Effect.log("PersonService.getPermissions.success", {
          id,
          permissionCount: permissions.length,
        });

        return permissions;
      }),

    read: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.read", { id });

        const person = people.get(id);
        if (!person) {
          return yield* Effect.fail(OntologyErrors.personNotFound(id));
        }

        yield* Effect.log("PersonService.read.success", { id });
        return person;
      }),

    list: (filter?: PersonFilter) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.list", { filter });

        let result = Array.from(people.values());

        // Apply filters
        if (filter?.groupId) {
          result = result.filter((p) => p.groupId === filter.groupId);
        }

        if (filter?.role) {
          result = result.filter((p) => p.role === filter.role);
        }

        if (filter?.status) {
          result = result.filter((p) => p.status === filter.status);
        }

        // Apply sorting
        if (filter?.sortBy) {
          const sortBy = filter.sortBy as keyof Person;
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

        yield* Effect.log("PersonService.list.success", { count: result.length });
        return result;
      }),

    delete: (id: string) =>
      Effect.gen(function* () {
        yield* Effect.log("PersonService.delete", { id });

        const person = people.get(id);
        if (!person) {
          return yield* Effect.fail(OntologyErrors.personNotFound(id));
        }

        people.delete(id);

        yield* Effect.log("PersonService.delete.success", { id });
      }),
  };
};

// ============================================================================
// Service Layer
// ============================================================================

export const PersonServiceLive = Layer.succeed(
  PersonService,
  makePersonService()
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run a PersonService effect with live dependencies
 */
export const runPersonService = <E, A>(
  effect: Effect.Effect<A, E, PersonService>
): Promise<A> =>
  pipe(effect, Effect.provide(PersonServiceLive), Effect.runPromise);
