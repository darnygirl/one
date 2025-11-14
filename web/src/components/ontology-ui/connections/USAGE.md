# CONNECTIONS Dimension - Usage Guide

The CONNECTIONS dimension components visualize and manage relationships between things in the ontology.

## Components

### 1. ConnectionCard

Displays a single connection relationship with type, strength, and metadata.

```tsx
import { ConnectionCard } from "@/components/ontology-ui/connections";

// Basic usage
<ConnectionCard connection={connection} />

// With thing details
<ConnectionCard
  connection={connection}
  fromThing={productThing}
  toThing={userThing}
  showStrength={true}
/>

// Interactive card
<ConnectionCard
  connection={connection}
  interactive={true}
  onClick={() => handleConnectionClick(connection)}
/>

// Card variants
<ConnectionCard connection={connection} variant="outline" size="lg" />
```

**Props:**
- `connection: Connection` - Connection data (required)
- `fromThing?: Thing` - Source thing (optional, displays name instead of ID)
- `toThing?: Thing` - Target thing (optional, displays name instead of ID)
- `showStrength?: boolean` - Show strength indicator (default: true)
- `variant?: "default" | "outline" | "ghost"` - Card style
- `size?: "sm" | "md" | "lg"` - Card size
- `interactive?: boolean` - Enable hover effects
- `onClick?: () => void` - Click handler

---

### 2. ConnectionList

Displays a filterable, sortable, paginated list of connections.

```tsx
import { ConnectionList } from "@/components/ontology-ui/connections";

// Basic usage
<ConnectionList connections={connections} />

// With filtering and interaction
<ConnectionList
  connections={connections}
  onConnectionClick={(connection) => console.log(connection)}
  typeFilter="owns"
  searchable={true}
  filterable={true}
  sortable={true}
  paginated={true}
  pageSize={20}
/>

// Disable features
<ConnectionList
  connections={connections}
  searchable={false}
  paginated={false}
/>
```

**Props:**
- `connections: Connection[]` - Array of connections (required)
- `onConnectionClick?: (connection: Connection) => void` - Click handler
- `typeFilter?: ConnectionType` - Initial type filter
- `searchable?: boolean` - Enable search (default: true)
- `filterable?: boolean` - Enable type filter (default: true)
- `sortable?: boolean` - Enable sorting (default: true)
- `paginated?: boolean` - Enable pagination (default: true)
- `pageSize?: number` - Items per page (default: 10)

**Features:**
- **Search** - Search by connection type
- **Filter** - Filter by connection type (owns, follows, purchased, etc.)
- **Sort** - Sort by creation date or strength
- **Pagination** - Navigate through pages of connections

---

### 3. ConnectionGraph

Visual SVG-based network graph showing things (nodes) and connections (edges).

```tsx
import { ConnectionGraph } from "@/components/ontology-ui/connections";

// Basic usage
<ConnectionGraph connections={connections} things={things} />

// Centered on specific thing
<ConnectionGraph
  connections={connections}
  things={things}
  centerThingId={userId}
/>

// Custom styling
<ConnectionGraph
  connections={connections}
  things={things}
  className="max-w-4xl mx-auto"
/>
```

**Props:**
- `connections: Connection[]` - Array of connections (required)
- `things: Thing[]` - Array of things to display as nodes (required)
- `centerThingId?: string` - ID of thing to center graph on (optional)
- `className?: string` - Additional CSS classes

**Features:**
- **Visual Layout** - Circular layout with center node
- **Arrow Edges** - Directional arrows showing connection flow
- **Strength Labels** - Shows connection strength on edges (if available)
- **Thing Icons** - Displays thing type icons in nodes
- **Interactive Legend** - Explains graph elements

**Graph Elements:**
- **Center Node** - Primary/highlighted node (blue)
- **Connected Nodes** - Related things (gray)
- **Directed Edges** - Arrows showing connection direction
- **Strength Labels** - Percentage on edges (if strength is set)

---

## Connection Types

The following connection types are supported:

| Type | Display | Example |
|------|---------|---------|
| `owns` | Owns | User owns Product |
| `created` | Created | User created Post |
| `follows` | Follows | User follows Creator |
| `purchased` | Purchased | User purchased Course |
| `enrolled` | Enrolled in | User enrolled in Course |
| `completed` | Completed | User completed Lesson |
| `holds_tokens` | Holds Tokens | User holds Tokens |
| `member_of` | Member of | User member of Team |
| `assigned_to` | Assigned to | Task assigned to User |
| `tagged_with` | Tagged with | Post tagged with Label |
| `commented_on` | Commented on | User commented on Post |
| `liked` | Liked | User liked Content |
| `shared` | Shared | User shared Post |
| `subscribed_to` | Subscribed to | User subscribed to Newsletter |
| `replied_to` | Replied to | Comment replied to Post |
| `mentioned_in` | Mentioned in | User mentioned in Post |
| `connected_to` | Connected to | Thing connected to Thing |
| `depends_on` | Depends on | Task depends on Task |
| `blocks` | Blocks | Issue blocks Issue |
| `duplicates` | Duplicates | Issue duplicates Issue |
| `relates_to` | Relates to | Thing relates to Thing |
| `parent_of` | Parent of | Folder parent of File |
| `child_of` | Child of | File child of Folder |
| `linked_to` | Linked to | Page linked to Page |
| `referenced_by` | Referenced by | Thing referenced by Thing |

---

## Real-World Examples

### Example 1: User Connections Dashboard

```tsx
import {
  ConnectionList,
  ConnectionGraph
} from "@/components/ontology-ui/connections";

function UserConnectionsDashboard({ userId }: { userId: string }) {
  const connections = useQuery(api.queries.connections.list, { userId });
  const things = useQuery(api.queries.things.listConnected, { userId });

  return (
    <div className="space-y-6">
      <h1>Your Connections</h1>

      {/* Visual graph */}
      <ConnectionGraph
        connections={connections}
        things={things}
        centerThingId={userId}
      />

      {/* Detailed list */}
      <ConnectionList
        connections={connections}
        onConnectionClick={(conn) => navigate(`/connections/${conn._id}`)}
        searchable={true}
        filterable={true}
        paginated={true}
      />
    </div>
  );
}
```

### Example 2: Product Relationships

```tsx
import { ConnectionCard } from "@/components/ontology-ui/connections";

function ProductRelationships({ productId }: { productId: string }) {
  const connections = useQuery(api.queries.connections.forProduct, { productId });

  return (
    <div className="grid grid-cols-2 gap-4">
      {connections.map(connection => (
        <ConnectionCard
          key={connection._id}
          connection={connection}
          showStrength={true}
          interactive={true}
          onClick={() => viewConnection(connection)}
        />
      ))}
    </div>
  );
}
```

### Example 3: Social Network Graph

```tsx
import { ConnectionGraph } from "@/components/ontology-ui/connections";

function SocialNetworkGraph({ userId }: { userId: string }) {
  // Get all "follows" connections
  const followConnections = useQuery(api.queries.connections.list, {
    type: "follows",
    fromId: userId,
  });

  // Get all users involved
  const users = useQuery(api.queries.users.listByIds, {
    ids: followConnections.map(c => c.toId),
  });

  return (
    <div>
      <h2>Who You Follow</h2>
      <ConnectionGraph
        connections={followConnections}
        things={users}
        centerThingId={userId}
      />
    </div>
  );
}
```

---

## Styling

All components support Tailwind CSS classes and follow the shadcn/ui design system:

```tsx
// Custom styling
<ConnectionCard
  connection={connection}
  className="border-2 border-primary shadow-xl"
/>

<ConnectionList
  connections={connections}
  className="max-w-4xl mx-auto p-6"
/>

<ConnectionGraph
  connections={connections}
  things={things}
  className="rounded-2xl border-4 border-dashed"
/>
```

---

## Integration with Ontology

These components are designed to work with the 6-dimension ontology:

```tsx
// CONNECTIONS dimension maps relationships
const connection: Connection = {
  _id: "c_abc123",
  _creationTime: Date.now(),
  type: "purchased",           // ConnectionType
  fromId: userId,              // Thing ID (user)
  toId: productId,             // Thing ID (product)
  groupId: orgId,              // Multi-tenant scoping
  strength: 85,                // Optional: 0-100
  metadata: {
    price: 99.99,
    quantity: 1,
  },
  createdAt: Date.now(),
};

// Render the connection
<ConnectionCard connection={connection} />
```

---

## TypeScript Support

All components are fully typed:

```tsx
import type {
  Connection,
  ConnectionType,
  Thing,
} from "@/components/ontology-ui/types";

import type {
  ConnectionCardProps,
  ConnectionListProps,
  ConnectionGraphProps,
} from "@/components/ontology-ui/connections";
```

---

## Accessibility

- Semantic HTML structure
- ARIA labels for icons and interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliant
- Focus indicators

---

## Performance

- Optimized rendering with React memoization
- Pagination for large datasets
- Lazy loading of graph nodes
- Efficient SVG rendering
- Type-safe throughout

---

**Built with shadcn/ui, Tailwind CSS v4, and TypeScript for production-ready ontology visualization.**
