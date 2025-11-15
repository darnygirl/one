/**
 * ValidationService - Effect.ts validation layer
 *
 * Cycle 34: Effect.ts validation layer
 * - Functions: validateGroup, validatePerson, validateThing
 * - Schema validation with Effect
 * - Custom error messages
 */

import { Effect, Data } from "effect";
import { z } from "zod";

// ============================================================================
// Error Types
// ============================================================================

export class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string;
  message: string;
  value?: unknown;
}> {}

export class SchemaValidationError extends Data.TaggedError("SchemaValidationError")<{
  errors: Array<{ field: string; message: string }>;
  schema: string;
}> {}

// ============================================================================
// Base Validation Types
// ============================================================================

export type Group = {
  id?: string;
  name: string;
  description?: string;
  parentGroupId?: string;
  metadata?: Record<string, unknown>;
};

export type Person = {
  id?: string;
  name: string;
  email: string;
  role: "platform_owner" | "org_owner" | "org_user" | "customer";
  groupId?: string;
  metadata?: Record<string, unknown>;
};

export type Thing = {
  id?: string;
  type: string;
  name: string;
  description?: string;
  groupId: string;
  ownerId: string;
  metadata?: Record<string, unknown>;
};

// ============================================================================
// Zod Schemas
// ============================================================================

const GroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Group name is required").max(255, "Group name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  parentGroupId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const PersonSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["platform_owner", "org_owner", "org_user", "customer"]),
  groupId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const ThingSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(5000, "Description too long").optional(),
  groupId: z.string().uuid("Invalid group ID"),
  ownerId: z.string().uuid("Invalid owner ID"),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Generic Validation Helpers
// ============================================================================

/**
 * Validate data against a Zod schema
 */
export const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  schemaName: string
): Effect.Effect<T, SchemaValidationError> =>
  Effect.gen(function* () {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return yield* new SchemaValidationError({
        errors,
        schema: schemaName,
      });
    }

    return result.data;
  });

/**
 * Validate a single field value
 */
export const validateField = (
  field: string,
  value: unknown,
  validator: (val: unknown) => boolean,
  message: string
): Effect.Effect<void, ValidationError> =>
  Effect.gen(function* () {
    if (!validator(value)) {
      return yield* new ValidationError({
        field,
        message,
        value,
      });
    }
  });

// ============================================================================
// Group Validation
// ============================================================================

/**
 * Validate group name
 */
export const validateGroupName = (
  name: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    if (!name || !name.trim()) {
      return yield* new ValidationError({
        field: "name",
        message: "Group name is required",
        value: name,
      });
    }

    if (name.length < 2) {
      return yield* new ValidationError({
        field: "name",
        message: "Group name must be at least 2 characters",
        value: name,
      });
    }

    if (name.length > 255) {
      return yield* new ValidationError({
        field: "name",
        message: "Group name cannot exceed 255 characters",
        value: name,
      });
    }

    return name.trim();
  });

/**
 * Validate complete group object
 */
export const validateGroup = (
  data: unknown
): Effect.Effect<Group, SchemaValidationError | ValidationError> =>
  Effect.gen(function* () {
    // First validate against schema
    const group = yield* validateSchema(GroupSchema, data, "Group");

    // Additional business logic validation
    yield* validateGroupName(group.name);

    // Validate parent group reference if present
    if (group.parentGroupId) {
      // In a real app, check if parent group exists
      // For now, just validate format
      if (group.parentGroupId === group.id) {
        return yield* new ValidationError({
          field: "parentGroupId",
          message: "Group cannot be its own parent",
          value: group.parentGroupId,
        });
      }
    }

    return group;
  });

// ============================================================================
// Person Validation
// ============================================================================

/**
 * Validate email address
 */
export const validateEmail = (
  email: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !email.trim()) {
      return yield* new ValidationError({
        field: "email",
        message: "Email is required",
        value: email,
      });
    }

    if (!emailRegex.test(email)) {
      return yield* new ValidationError({
        field: "email",
        message: "Invalid email format",
        value: email,
      });
    }

    return email.trim().toLowerCase();
  });

/**
 * Validate person name
 */
export const validatePersonName = (
  name: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    if (!name || !name.trim()) {
      return yield* new ValidationError({
        field: "name",
        message: "Name is required",
        value: name,
      });
    }

    if (name.length < 2) {
      return yield* new ValidationError({
        field: "name",
        message: "Name must be at least 2 characters",
        value: name,
      });
    }

    if (name.length > 255) {
      return yield* new ValidationError({
        field: "name",
        message: "Name cannot exceed 255 characters",
        value: name,
      });
    }

    return name.trim();
  });

/**
 * Validate complete person object
 */
export const validatePerson = (
  data: unknown
): Effect.Effect<Person, SchemaValidationError | ValidationError> =>
  Effect.gen(function* () {
    // First validate against schema
    const person = yield* validateSchema(PersonSchema, data, "Person");

    // Additional business logic validation
    yield* validatePersonName(person.name);
    yield* validateEmail(person.email);

    // Validate role-specific constraints
    if (person.role === "org_owner" || person.role === "org_user") {
      if (!person.groupId) {
        return yield* new ValidationError({
          field: "groupId",
          message: `${person.role} must belong to a group`,
          value: person.groupId,
        });
      }
    }

    return person;
  });

// ============================================================================
// Thing Validation
// ============================================================================

/**
 * Validate thing type
 */
export const validateThingType = (
  type: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    const validTypes = [
      "user",
      "agent",
      "content",
      "course",
      "lesson",
      "token",
      "product",
      "service",
      "project",
      "task",
      "document",
      "image",
      "video",
      "audio",
    ];

    if (!type || !type.trim()) {
      return yield* new ValidationError({
        field: "type",
        message: "Thing type is required",
        value: type,
      });
    }

    const normalizedType = type.trim().toLowerCase();

    if (!validTypes.includes(normalizedType)) {
      return yield* new ValidationError({
        field: "type",
        message: `Invalid thing type. Must be one of: ${validTypes.join(", ")}`,
        value: type,
      });
    }

    return normalizedType;
  });

/**
 * Validate thing name
 */
export const validateThingName = (
  name: string
): Effect.Effect<string, ValidationError> =>
  Effect.gen(function* () {
    if (!name || !name.trim()) {
      return yield* new ValidationError({
        field: "name",
        message: "Thing name is required",
        value: name,
      });
    }

    if (name.length < 1) {
      return yield* new ValidationError({
        field: "name",
        message: "Thing name must be at least 1 character",
        value: name,
      });
    }

    if (name.length > 255) {
      return yield* new ValidationError({
        field: "name",
        message: "Thing name cannot exceed 255 characters",
        value: name,
      });
    }

    return name.trim();
  });

/**
 * Validate complete thing object
 */
export const validateThing = (
  data: unknown
): Effect.Effect<Thing, SchemaValidationError | ValidationError> =>
  Effect.gen(function* () {
    // First validate against schema
    const thing = yield* validateSchema(ThingSchema, data, "Thing");

    // Additional business logic validation
    yield* validateThingType(thing.type);
    yield* validateThingName(thing.name);

    // Validate IDs format
    if (thing.groupId === thing.ownerId) {
      return yield* new ValidationError({
        field: "ownerId",
        message: "Owner ID cannot be the same as group ID",
        value: thing.ownerId,
      });
    }

    return thing;
  });

// ============================================================================
// Batch Validation
// ============================================================================

/**
 * Validate multiple items of the same type
 */
export const validateBatch = <T>(
  items: unknown[],
  validator: (item: unknown) => Effect.Effect<T, ValidationError | SchemaValidationError>
): Effect.Effect<T[], ValidationError | SchemaValidationError> =>
  Effect.gen(function* () {
    return yield* Effect.all(
      items.map((item, index) =>
        validator(item).pipe(
          Effect.mapError((error) => {
            // Add index context to error
            if (error._tag === "ValidationError") {
              return new ValidationError({
                field: `[${index}].${error.field}`,
                message: error.message,
                value: error.value,
              });
            }
            return error;
          })
        )
      ),
      { concurrency: "unbounded" }
    );
  });

// ============================================================================
// Validation Combinators
// ============================================================================

/**
 * Compose multiple validations
 */
export const composeValidations = <T>(
  value: T,
  validations: Array<(val: T) => Effect.Effect<T, ValidationError>>
): Effect.Effect<T, ValidationError> =>
  Effect.gen(function* () {
    let result = value;

    for (const validation of validations) {
      result = yield* validation(result);
    }

    return result;
  });

/**
 * Validate with custom error message
 */
export const withErrorMessage = <T, E extends Data.TaggedError<string, unknown>>(
  effect: Effect.Effect<T, E>,
  messageMapper: (error: E) => string
): Effect.Effect<T, E> =>
  effect.pipe(
    Effect.mapError((error) => {
      // Create new error with custom message
      const message = messageMapper(error);
      return {
        ...error,
        message,
      } as E;
    })
  );
