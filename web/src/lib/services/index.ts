/**
 * Services Index - Effect.ts Service Layer
 *
 * Central export for all ontology services following the 6-dimension model.
 * Each service provides Effect.ts-based operations with:
 * - Type-safe error handling
 * - Comprehensive logging
 * - Layer-based dependency injection
 * - Pure business logic
 */

// ============================================================================
// Service Exports
// ============================================================================

// Cycle 26: GroupService
export {
  GroupService,
  makeGroupService,
  GroupServiceLive,
  runGroupService,
  type IGroupService,
} from "./GroupService";

// Cycle 27: PersonService
export {
  PersonService,
  makePersonService,
  PersonServiceLive,
  runPersonService,
  type IPersonService,
  type Role,
  type Permission,
  ROLES,
} from "./PersonService";

// Cycle 28: ThingService
export {
  ThingService,
  makeThingService,
  ThingServiceLive,
  runThingService,
  validateThingType,
  type IThingService,
  type ThingType,
  THING_TYPES,
} from "./ThingService";

// Cycle 29: ConnectionService
export {
  ConnectionService,
  makeConnectionService,
  ConnectionServiceLive,
  runConnectionService,
  type IConnectionService,
  type ConnectionType,
  CONNECTION_TYPES,
} from "./ConnectionService";

// Cycle 30: EventService
export {
  EventService,
  makeEventService,
  EventServiceLive,
  runEventService,
  type IEventService,
  type EventType,
  EVENT_TYPES,
} from "./EventService";

// Cycle 31: KnowledgeService
export {
  KnowledgeService,
  makeKnowledgeService,
  KnowledgeServiceLive,
  runKnowledgeService,
  type IKnowledgeService,
  type SearchResult,
  type Category,
} from "./KnowledgeService";

// Cycle 32: AuthService
export {
  AuthService,
  makeAuthService,
  AuthServiceLive,
  runAuthService,
  type IAuthService,
  type Session,
  type AuthToken,
  type LoginCredentials,
  type RefreshTokenRequest,
} from "./AuthService";

// ============================================================================
// Combined Layer (All Services)
// ============================================================================

import { Layer } from "effect";
import { GroupServiceLive } from "./GroupService";
import { PersonServiceLive } from "./PersonService";
import { ThingServiceLive } from "./ThingService";
import { ConnectionServiceLive } from "./ConnectionService";
import { EventServiceLive } from "./EventService";
import { KnowledgeServiceLive } from "./KnowledgeService";
import { AuthServiceLive } from "./AuthService";

/**
 * Combined layer with all ontology services.
 * Use this to provide all services at once.
 *
 * @example
 * ```ts
 * import { pipe, Effect } from "effect";
 * import { AllServicesLive, GroupService, ThingService } from "@/lib/services";
 *
 * const program = Effect.gen(function* () {
 *   const groupService = yield* GroupService;
 *   const thingService = yield* ThingService;
 *
 *   const group = yield* groupService.create({
 *     slug: "my-org",
 *     name: "My Organization",
 *     type: "business",
 *   });
 *
 *   const thing = yield* thingService.create({
 *     groupId: group._id,
 *     type: "product",
 *     name: "My Product",
 *   });
 *
 *   return { group, thing };
 * });
 *
 * // Run with all services
 * pipe(program, Effect.provide(AllServicesLive), Effect.runPromise);
 * ```
 */
export const AllServicesLive = Layer.mergeAll(
  GroupServiceLive,
  PersonServiceLive,
  ThingServiceLive,
  ConnectionServiceLive,
  EventServiceLive,
  KnowledgeServiceLive,
  AuthServiceLive
);

// ============================================================================
// Service Documentation
// ============================================================================

/**
 * # Effect.ts Service Layer
 *
 * This directory contains 7 Effect.ts services that implement the 6-dimension
 * ontology model with proper error handling and dependency injection.
 *
 * ## Services
 *
 * ### 1. GroupService (Cycle 26)
 * Manages hierarchical group organization with:
 * - Create, read, update, delete operations
 * - Group hierarchy traversal
 * - Type validation and error handling
 *
 * ### 2. PersonService (Cycle 27)
 * Manages people/users with role-based permissions:
 * - User creation and updates
 * - Role validation (platform_owner, org_owner, org_user, customer)
 * - Permission calculation
 * - Invitation management
 *
 * ### 3. ThingService (Cycle 28)
 * Manages 66+ entity types:
 * - Type-safe CRUD operations
 * - Search and filtering
 * - Batch operations
 * - Soft delete support
 *
 * ### 4. ConnectionService (Cycle 29)
 * Manages relationships between things:
 * - 25+ relationship types
 * - Connection strength calculation
 * - Network traversal
 * - Path finding
 *
 * ### 5. EventService (Cycle 30)
 * Provides audit trail and event logging:
 * - 67+ event types
 * - Timeline queries
 * - Event streaming
 * - Statistics and analytics
 *
 * ### 6. KnowledgeService (Cycle 31)
 * Manages search and categorization:
 * - Label management
 * - Text search
 * - Vector/semantic search
 * - Category aggregation
 * - Related thing discovery
 *
 * ### 7. AuthService (Cycle 32)
 * Handles authentication:
 * - Login/logout
 * - Session management
 * - Token refresh
 * - Better Auth integration ready
 *
 * ## Usage Patterns
 *
 * ### Individual Service
 * ```ts
 * import { runGroupService, GroupService } from "@/lib/services";
 *
 * // Option 1: Use helper function
 * const group = await runGroupService(
 *   Effect.gen(function* () {
 *     const service = yield* GroupService;
 *     return yield* service.create({
 *       slug: "my-org",
 *       name: "My Organization",
 *       type: "business",
 *     });
 *   })
 * );
 *
 * // Option 2: Provide layer manually
 * const group = await pipe(
 *   Effect.gen(function* () {
 *     const service = yield* GroupService;
 *     return yield* service.create({...});
 *   }),
 *   Effect.provide(GroupServiceLive),
 *   Effect.runPromise
 * );
 * ```
 *
 * ### Multiple Services
 * ```ts
 * import { AllServicesLive, GroupService, ThingService } from "@/lib/services";
 *
 * const program = Effect.gen(function* () {
 *   const groupService = yield* GroupService;
 *   const thingService = yield* ThingService;
 *
 *   // Create group
 *   const group = yield* groupService.create({
 *     slug: "my-org",
 *     name: "My Organization",
 *     type: "business",
 *   });
 *
 *   // Create thing in group
 *   const thing = yield* thingService.create({
 *     groupId: group._id,
 *     type: "product",
 *     name: "My Product",
 *   });
 *
 *   return { group, thing };
 * });
 *
 * // Run with all services
 * const result = await pipe(
 *   program,
 *   Effect.provide(AllServicesLive),
 *   Effect.runPromise
 * );
 * ```
 *
 * ### Error Handling
 * ```ts
 * import { Effect, Either } from "effect";
 * import { runThingService, ThingService } from "@/lib/services";
 *
 * const result = await runThingService(
 *   Effect.gen(function* () {
 *     const service = yield* ThingService;
 *
 *     // Try to get a thing
 *     return yield* service.read("thing_123");
 *   })
 * ).catch((error) => {
 *   // Handle typed errors
 *   if (error._tag === "ThingNotFound") {
 *     console.log("Thing not found:", error.thingId);
 *     return null;
 *   }
 *   throw error;
 * });
 * ```
 *
 * ## Architecture
 *
 * Each service follows the same pattern:
 *
 * 1. **Interface Definition** - TypeScript interface with Effect return types
 * 2. **Context Tag** - Effect Context.Tag for dependency injection
 * 3. **Implementation** - Pure business logic with Effect.gen
 * 4. **Service Layer** - Layer.succeed for providing the service
 * 5. **Helper Functions** - runService for easy usage
 *
 * ## Testing
 *
 * Services are designed to be easily testable:
 *
 * ```ts
 * import { Effect, Layer } from "effect";
 * import { ThingService, type IThingService } from "@/lib/services";
 *
 * // Create mock service
 * const mockThingService: IThingService = {
 *   create: (input) => Effect.succeed({
 *     _id: "mock_thing",
 *     ...input,
 *     createdAt: Date.now(),
 *     updatedAt: Date.now(),
 *   }),
 *   // ... other methods
 * };
 *
 * // Create mock layer
 * const MockThingServiceLive = Layer.succeed(ThingService, mockThingService);
 *
 * // Use in tests
 * const result = await pipe(
 *   Effect.gen(function* () {
 *     const service = yield* ThingService;
 *     return yield* service.create({...});
 *   }),
 *   Effect.provide(MockThingServiceLive),
 *   Effect.runPromise
 * );
 * ```
 *
 * ## Integration with Backend
 *
 * These services use in-memory storage for demo purposes. To integrate with
 * a real backend (Convex, PostgreSQL, etc.):
 *
 * 1. Create backend-specific implementations of each service interface
 * 2. Create backend-specific layers
 * 3. Swap layers at runtime based on environment
 *
 * ```ts
 * // lib/services/implementations/ConvexThingService.ts
 * export const makeConvexThingService = (
 *   convexClient: ConvexClient
 * ): IThingService => ({
 *   create: (input) =>
 *     Effect.gen(function* () {
 *       const result = await convexClient.mutation(api.things.create, input);
 *       return result;
 *     }),
 *   // ... other methods
 * });
 *
 * export const ConvexThingServiceLive = Layer.effect(
 *   ThingService,
 *   Effect.gen(function* () {
 *     const convex = yield* ConvexClient;
 *     return makeConvexThingService(convex);
 *   })
 * );
 * ```
 */
