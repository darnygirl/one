# Effect.ts Service Layer - Phase 2

This directory contains the Effect.ts service layer for the ontology-ui component library.

## Services Implemented (Cycles 26-32)

### Cycle 26: GroupService
**File:** `GroupService.ts`

Group management with hierarchical organization support.

**Functions:**
- `create(input)` - Create a new group
- `read(id)` - Read a group by ID
- `update(id, input)` - Update an existing group
- `delete(id)` - Delete a group
- `list(filter?)` - List groups with optional filtering
- `getHierarchy(id)` - Get group hierarchy (parent and children)

**Features:**
- Hierarchical group organization
- Type validation for group types (friend_circle, business, community, dao, government, organization)
- Automatic timestamp management
- Slug uniqueness validation
- Parent-child relationship validation

### Cycle 27: PersonService
**File:** `PersonService.ts`

Person/user management with role validation and permissions.

**Functions:**
- `create(input)` - Create a new person
- `update(id, input)` - Update an existing person
- `invite(email, groupId, role)` - Invite a person to a group
- `updateRole(id, role, actorId)` - Update person's role with permission check
- `getPermissions(id)` - Get permissions for a person
- `read(id)` - Read a person by ID
- `list(filter?)` - List people with optional filtering
- `delete(id)` - Delete a person

**Features:**
- Role validation (platform_owner, org_owner, org_user, customer)
- Permission-based role updates
- Email validation
- Invitation management
- Granular permission calculation per role

**Permissions by Role:**
- `platform_owner` - Full platform access
- `org_owner` - Organization management
- `org_user` - Create/update own things
- `customer` - Read and purchase things

### Cycle 28: ThingService
**File:** `ThingService.ts`

Thing management with type validation and complex operations.

**Functions:**
- `create(input)` - Create a new thing
- `update(id, input)` - Update an existing thing
- `delete(id)` - Delete a thing (soft delete)
- `read(id)` - Read a thing by ID
- `list(filter?)` - List things with optional filtering
- `filter(predicate)` - Filter things by complex criteria
- `search(query, groupId?)` - Search things by name and properties
- `batchCreate(inputs)` - Batch create multiple things
- `getByType(type, groupId?)` - Get things by type

**Features:**
- 66+ thing types supported
- Type validation
- Search in name and properties
- Soft delete with deletedAt timestamp
- Batch operations with Effect.all
- Property merging on update

**Supported Thing Types:**
- Core: user, agent, content, token, course, lesson, module, etc.
- Commerce: product, service, order, payment, invoice, subscription
- Content: post, page, article, video, audio, document, image
- Social: comment, like, share, follow, message, notification
- Organization: team, project, task, milestone, workflow, template
- Technical: api_key, webhook, integration, deployment, environment
- Financial: transaction, wallet, balance, transfer, refund, payout

### Cycle 29: ConnectionService
**File:** `ConnectionService.ts`

Connection/relationship management with strength calculation.

**Functions:**
- `create(input)` - Create a new connection
- `delete(id)` - Delete a connection (soft delete)
- `read(id)` - Read a connection by ID
- `list(filter?)` - List connections with optional filtering
- `getByType(relationshipType, groupId?)` - Get connections by type
- `getNetwork(thingId)` - Get network for a thing (all connections)
- `calculateStrength(connection)` - Calculate connection strength
- `findPath(fromThingId, toThingId, maxDepth?)` - Find path between two things

**Features:**
- 25+ relationship types
- Connection strength calculation based on:
  - Interaction count
  - Duration
  - Recency (20% boost for recent, 20% reduction for stale)
- Network traversal (outgoing and incoming)
- BFS path finding with configurable depth
- Temporal validity (validFrom, validTo)

**Supported Connection Types:**
- Ownership: owns, created_by, belongs_to
- Social: follows, friend_of, member_of, blocks
- Commerce: purchased, sold, subscribed_to
- Content: authored, commented_on, liked, shared
- Learning: enrolled_in, completed, teaches, mentors
- Organization: works_for, manages, reports_to, collaborates_with
- Technical: depends_on, integrates_with, deploys_to

### Cycle 30: EventService
**File:** `EventService.ts`

Event logging and querying for audit trails.

**Functions:**
- `log(input)` - Log a new event
- `query(filter?)` - Query events with filtering
- `getTimeline(thingId, limit?)` - Get timeline for a thing (all events)
- `getAudit(groupId, startTime?, endTime?)` - Get audit trail for a group
- `stream(filter?)` - Stream events in real-time
- `getStats(groupId, startTime?, endTime?)` - Get event statistics

**Features:**
- 67+ event types
- Comprehensive audit trails
- Timeline queries for things
- Time-range filtering
- Event streaming with Effect.Stream
- Statistics aggregation (by type, by actor)
- Automatic timestamp management

**Supported Event Types:**
- CRUD: created, updated, deleted, restored
- User: logged_in, logged_out, registered, verified
- Commerce: purchased, refunded, shipped, delivered
- Content: published, unpublished, viewed, downloaded
- Social: liked, commented, shared, followed, unfollowed
- Learning: enrolled, started, completed, passed, failed
- Organization: invited, joined, left, promoted, demoted
- System: deployed, migrated, backup_created, backup_restored

### Cycle 31: KnowledgeService
**File:** `KnowledgeService.ts`

Knowledge management with semantic search and categorization.

**Functions:**
- `addLabel(input)` - Add a label to a thing
- `search(query, groupId, limit?)` - Search knowledge by label
- `vectorSearch(embedding, groupId, limit?)` - Vector search (semantic)
- `getCategories(groupId)` - Get all categories for a group
- `read(id)` - Read knowledge by ID
- `list(filter?)` - List knowledge with optional filtering
- `delete(id)` - Delete knowledge entry
- `generateEmbedding(text)` - Generate embedding for text
- `getRelated(thingId, limit?)` - Get related things by label

**Features:**
- Label-based categorization
- Text search with relevance scoring
- Vector/semantic search with cosine similarity
- Category aggregation with counts
- Related thing discovery
- Mock embedding generation (384-dimensional)
- Effect caching for embeddings (planned)

**Search Scoring:**
- Exact label match: 1.0
- Partial label match: 0.5
- Metadata match: 0.3

### Cycle 32: AuthService
**File:** `AuthService.ts`

Authentication service with Better Auth integration.

**Functions:**
- `login(credentials)` - Login with email and password
- `logout(sessionId)` - Logout and invalidate session
- `validateSession(sessionId)` - Validate a session
- `refreshToken(request)` - Refresh access token
- `getCurrentSession()` - Get current session
- `isAuthenticated()` - Check if user is authenticated
- `register(email, password, name?)` - Register new user
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password with token

**Features:**
- Session management (24-hour expiry)
- Token-based authentication (access + refresh)
- Password validation (min 8 characters)
- Email validation
- Session expiration checking
- Multiple session support
- Ready for Better Auth integration

## Usage

### Individual Service

```typescript
import { runGroupService, GroupService } from "@/lib/services";
import { Effect } from "effect";

// Create a group
const group = await runGroupService(
  Effect.gen(function* () {
    const service = yield* GroupService;
    return yield* service.create({
      slug: "my-org",
      name: "My Organization",
      type: "business",
    });
  })
);
```

### Multiple Services

```typescript
import { AllServicesLive, GroupService, ThingService } from "@/lib/services";
import { Effect, pipe } from "effect";

const program = Effect.gen(function* () {
  const groupService = yield* GroupService;
  const thingService = yield* ThingService;

  // Create group
  const group = yield* groupService.create({
    slug: "my-org",
    name: "My Organization",
    type: "business",
  });

  // Create thing in group
  const thing = yield* thingService.create({
    groupId: group._id,
    type: "product",
    name: "My Product",
    properties: { price: 99.99 },
  });

  return { group, thing };
});

// Run with all services
const result = await pipe(
  program,
  Effect.provide(AllServicesLive),
  Effect.runPromise
);
```

### Error Handling

```typescript
import { runThingService, ThingService } from "@/lib/services";
import { Effect } from "effect";

try {
  const thing = await runThingService(
    Effect.gen(function* () {
      const service = yield* ThingService;
      return yield* service.read("thing_123");
    })
  );
} catch (error) {
  if (error._tag === "ThingNotFound") {
    console.log("Thing not found:", error.thingId);
  }
}
```

## Architecture

Each service follows the Effect.ts pattern:

1. **Service Interface** - TypeScript interface with Effect return types
2. **Context Tag** - Effect Context.Tag for dependency injection
3. **Implementation** - Pure business logic with Effect.gen
4. **Service Layer** - Layer.succeed for providing the service
5. **Helper Functions** - runService helpers for easy usage

## Testing

Services use in-memory storage for demo purposes. For production:

1. Create backend-specific implementations (Convex, PostgreSQL, etc.)
2. Create backend-specific layers
3. Swap layers based on environment

## Statistics

- **Total Services:** 7
- **Total Lines of Code:** ~10,311 (including existing services)
- **Effect.ts Features Used:**
  - Context & Layer (dependency injection)
  - Effect.gen (generator syntax)
  - Effect.all (parallel operations)
  - Effect.log (comprehensive logging)
  - Stream (event streaming)
  - Tagged union errors

## Next Steps

- **Phase 3:** Build React hooks that use these services
- **Phase 4:** Create demo pages showcasing each service
- **Phase 5:** Backend integration (replace in-memory with Convex/DB)
- **Phase 6:** Testing suite with mock implementations
