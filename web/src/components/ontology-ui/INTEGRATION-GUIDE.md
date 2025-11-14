# Ontology UI - Integration Guide

## Overview

This guide shows how to use all ontology-ui components together to build production applications.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Patterns](#core-patterns)
3. [Integration Components](#integration-components)
4. [Real-World Examples](#real-world-examples)
5. [Best Practices](#best-practices)
6. [Performance](#performance)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# All components are already available in the project
import { ThingCard, UnifiedInterface } from '@/components/ontology-ui';
```

### Basic Usage

```tsx
import { ThingCard, EventTimeline, OntologyExplorer } from '@/components/ontology-ui';

export function MyApp() {
  return (
    <div>
      {/* Display a product */}
      <ThingCard thing={product} type="product" />

      {/* Show activity */}
      <EventTimeline events={recentEvents} />

      {/* Explore data */}
      <OntologyExplorer data={ontologyData} />
    </div>
  );
}
```

---

## Core Patterns

### 1. Dimension-Based Components

**Each dimension has dedicated components:**

```tsx
// Groups
import { GroupCard, GroupTree, GroupSelector } from '@/components/ontology-ui';

<GroupCard group={organization} />
<GroupTree groups={hierarchy} />
<GroupSelector onSelect={(group) => setActiveGroup(group)} />

// People
import { UserCard, UserList, UserPermissions } from '@/components/ontology-ui';

<UserCard user={currentUser} />
<UserList users={teamMembers} />
<UserPermissions userId={userId} />

// Things
import { ThingCard, ThingGrid, ThingCreator } from '@/components/ontology-ui';

<ThingCard thing={product} type="product" />
<ThingGrid things={products} type="product" />
<ThingCreator type="product" onCreated={(thing) => addThing(thing)} />

// Connections
import { ConnectionCard, ConnectionGraph, RelationshipViewer } from '@/components/ontology-ui';

<ConnectionCard connection={relationship} />
<ConnectionGraph connections={relationships} />
<RelationshipViewer thingId={productId} />

// Events
import { EventCard, EventTimeline, ActivityFeed } from '@/components/ontology-ui';

<EventCard event={purchaseEvent} />
<EventTimeline events={history} />
<ActivityFeed groupId={groupId} />

// Knowledge
import { SearchBar, LabelCard, KnowledgeGraph } from '@/components/ontology-ui';

<SearchBar onSearch={(query) => search(query)} />
<LabelCard label={categoryLabel} />
<KnowledgeGraph thingId={documentId} />
```

### 2. Universal Components

**Work across all dimensions:**

```tsx
import {
  OntologyForm,
  OntologyModal,
  OntologyList,
  OntologyGrid,
  OntologyTable,
} from '@/components/ontology-ui';

// Create/edit any dimension
<OntologyForm
  dimension="things"
  type="product"
  mode="create"
  onSubmit={(data) => createProduct(data)}
/>

// Modal for any dimension
<OntologyModal
  dimension="people"
  item={user}
  onClose={() => setModalOpen(false)}
/>

// List with search/filter/sort
<OntologyList
  dimension="things"
  items={products}
  searchable
  filterable
  sortable
/>
```

### 3. Streaming & Real-time

**Live updates and collaboration:**

```tsx
import {
  LiveActivityFeed,
  RealtimeTable,
  LiveKanban,
  CollaborativeWhiteboard,
  ChatMessage,
} from '@/components/ontology-ui';

// Live activity feed
<LiveActivityFeed groupId={groupId} />

// Real-time table
<RealtimeTable
  columns={columns}
  data={products}
  onUpdate={(id, data) => updateProduct(id, data)}
/>

// Kanban with live updates
<LiveKanban
  columns={columns}
  onCardMove={(cardId, columnId) => moveCard(cardId, columnId)}
/>

// Collaborative whiteboard
<CollaborativeWhiteboard
  roomId={projectId}
  userId={currentUser.id}
/>
```

---

## Integration Components

### ChatToComponent

**Convert AI chat responses into ontology components:**

```tsx
import { ChatToComponent } from '@/components/ontology-ui';

// Stream AI response into component
<ChatToComponent
  stream={aiResponseStream}
  expectedType="things"
  onComponentRendered={(component) => {
    console.log('Rendered:', component);
    // component.dimension → "things"
    // component.data → { ...productData }
  }}
  onError={(error) => console.error(error)}
/>

// Custom parser for specific formats
<ChatToComponent
  stream={aiResponse}
  customParser={(text) => {
    // Parse your custom format
    return {
      dimension: "things",
      data: parseCustomFormat(text),
    };
  }}
/>
```

**Example: AI creates a product**

```tsx
function ProductCreator() {
  const [stream, setStream] = useState<ReadableStream | null>(null);

  async function generateProduct(description: string) {
    const response = await fetch('/api/ai/generate-product', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });

    setStream(response.body);
  }

  return (
    <div>
      <Input
        placeholder="Describe a product..."
        onSubmit={(desc) => generateProduct(desc)}
      />

      {stream && (
        <ChatToComponent
          stream={stream}
          expectedType="things"
          onComponentRendered={(component) => {
            // Save the generated product
            saveProduct(component.data);
          }}
        />
      )}
    </div>
  );
}
```

### ComponentToChat

**Embed interactive components in chat:**

```tsx
import { ComponentToChat, ComponentToChatList } from '@/components/ontology-ui';

// Single embedded component
<ComponentToChat
  component={{
    id: "product-123",
    dimension: "things",
    data: productData,
    timestamp: Date.now(),
  }}
  interactive
  shareable
  onAction={(action, data) => {
    if (action === "view_details") {
      router.push(`/products/${data.component.data._id}`);
    }
  }}
  customActions={[
    {
      label: "Add to Cart",
      onClick: (component) => addToCart(component.data),
    },
  ]}
/>

// List of embedded components
<ComponentToChatList
  components={chatComponents}
  interactive
  shareable
  onAction={(action, data) => handleAction(action, data)}
/>
```

**Example: Chat with product recommendations**

```tsx
function ChatWithProducts() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [embeddedComponents, setEmbeddedComponents] = useState<EmbeddedComponent[]>([]);

  async function sendMessage(text: string) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    // AI returns product recommendations
    if (data.products) {
      const components = data.products.map(product => ({
        id: product._id,
        dimension: "things" as const,
        data: product,
        timestamp: Date.now(),
      }));

      setEmbeddedComponents(components);
    }
  }

  return (
    <div>
      {messages.map(msg => <ChatMessage key={msg.id} {...msg} />)}

      {embeddedComponents.length > 0 && (
        <div className="mt-4">
          <h3>Product Recommendations</h3>
          <ComponentToChatList
            components={embeddedComponents}
            interactive
            shareable
          />
        </div>
      )}
    </div>
  );
}
```

### OntologyExplorer

**Interactive explorer for all 6 dimensions:**

```tsx
import { OntologyExplorer } from '@/components/ontology-ui';

<OntologyExplorer
  data={{
    groups: organizations,
    people: users,
    things: products,
    connections: relationships,
    events: activityLog,
    knowledge: labels,
  }}
  initialDimension="things"
  enableGraph
  enableExport
  onSelect={(dimension, item) => {
    console.log(`Selected ${dimension}:`, item);
    router.push(`/${dimension}/${item._id}`);
  }}
  onFilterChange={(filters) => {
    console.log('Filters changed:', filters);
  }}
/>
```

**Features:**
- ✅ Search across all dimensions
- ✅ Filter by dimension, type, status
- ✅ View modes: Grid, List, Graph
- ✅ Export to JSON/CSV
- ✅ Toggle dimension visibility
- ✅ Drill-down navigation

### UnifiedInterface

**Complete application interface:**

```tsx
import { UnifiedInterface } from '@/components/ontology-ui';

<UnifiedInterface
  initialApp="chat"
  ontologyData={{
    things: products,
    connections: relationships,
    events: activityLog,
  }}
  user={{
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
  }}
  enableTheme
  customApps={[
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart className="h-4 w-4" />,
      component: <AnalyticsDashboard />,
    },
  ]}
/>
```

**Built-in features:**
- ✅ Command palette (⌘K)
- ✅ App switching (⌘1, ⌘2, ⌘3)
- ✅ Theme toggle (⌘T)
- ✅ Sidebar toggle (⌘B)
- ✅ Notifications
- ✅ User menu
- ✅ Cross-app navigation

---

## Real-World Examples

### Example 1: E-commerce Dashboard

```tsx
import {
  UnifiedInterface,
  ThingGrid,
  EventTimeline,
  AnalyticsDashboard,
} from '@/components/ontology-ui';

function EcommerceDashboard() {
  const { products, orders, events } = useDashboardData();

  return (
    <UnifiedInterface
      initialApp="app"
      ontologyData={{
        things: [...products, ...orders],
        events: events,
      }}
      customApps={[
        {
          id: "products",
          name: "Products",
          icon: <Package className="h-4 w-4" />,
          component: (
            <ThingGrid
              things={products}
              type="product"
              onSelect={(product) => router.push(`/products/${product._id}`)}
            />
          ),
        },
        {
          id: "analytics",
          name: "Analytics",
          icon: <BarChart className="h-4 w-4" />,
          component: <AnalyticsDashboard data={analyticsData} />,
        },
      ]}
    />
  );
}
```

### Example 2: Learning Management System

```tsx
import {
  ThingCard,
  EventTimeline,
  LiveProgressTracker,
  OntologyExplorer,
} from '@/components/ontology-ui';

function LMSDashboard() {
  const { courses, lessons, progress } = useLMSData();

  return (
    <div className="space-y-6">
      {/* Enrolled courses */}
      <section>
        <h2>My Courses</h2>
        <div className="grid grid-cols-3 gap-4">
          {courses.map(course => (
            <ThingCard key={course._id} thing={course} type="course" />
          ))}
        </div>
      </section>

      {/* Progress tracking */}
      <section>
        <h2>Progress</h2>
        <LiveProgressTracker
          steps={progress.steps}
          currentStep={progress.current}
          showHistory
        />
      </section>

      {/* Recent activity */}
      <section>
        <h2>Recent Activity</h2>
        <EventTimeline events={progress.events} />
      </section>
    </div>
  );
}
```

### Example 3: Project Management

```tsx
import {
  LiveKanban,
  CollaborativeWhiteboard,
  CommentThread,
  ActivityFeed,
} from '@/components/ontology-ui';

function ProjectManagement({ projectId }: { projectId: string }) {
  const { tasks, columns } = useProjectData(projectId);

  return (
    <Tabs defaultValue="kanban">
      <TabsList>
        <TabsTrigger value="kanban">Board</TabsTrigger>
        <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="kanban">
        <LiveKanban
          columns={columns}
          onCardMove={(cardId, columnId) => moveTask(cardId, columnId)}
        />
      </TabsContent>

      <TabsContent value="whiteboard">
        <CollaborativeWhiteboard
          roomId={projectId}
          userId={currentUser.id}
        />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityFeed groupId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
```

---

## Best Practices

### 1. Component Selection

**Use the right component for the job:**

```tsx
// ✅ Good: Use ThingCard for all thing types
<ThingCard thing={product} type="product" />
<ThingCard thing={course} type="course" />
<ThingCard thing={token} type="token" />

// ❌ Bad: Create separate components
<ProductCard product={product} />
<CourseCard course={course} />
<TokenCard token={token} />
```

### 2. State Management

**Use nanostores for shared state:**

```tsx
import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';

// Create store
export const selectedThingIdconst atom<string | null>(null);

// Use in component
function ThingViewer() {
  const selectedId = useStore(selectedThingId);

  return (
    <div>
      <ThingGrid
        things={things}
        onSelect={(thing) => selectedThingId.set(thing._id)}
      />

      {selectedId && (
        <ThingPreview thingId={selectedId} />
      )}
    </div>
  );
}
```

### 3. Real-time Updates

**Use Convex queries for live data:**

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function LiveProductList({ groupId }: { groupId: string }) {
  const products = useQuery(api.queries.things.list, {
    groupId,
    type: "product",
  });

  if (products === undefined) return <Skeleton />;

  return <ThingGrid things={products} type="product" />;
}
```

### 4. Error Handling

**Always handle errors gracefully:**

```tsx
function SafeComponent() {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ChatToComponent
      stream={stream}
      onError={(err) => setError(err)}
    />
  );
}
```

---

## Performance

### Bundle Size Optimization

**Use dynamic imports for large components:**

```tsx
import { lazy, Suspense } from 'react';

const OntologyExplorer = lazy(() => import('@/components/ontology-ui/integration/OntologyExplorer'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <OntologyExplorer data={data} />
    </Suspense>
  );
}
```

### Virtualization

**Use virtualized lists for large datasets:**

```tsx
import { VirtualizedList } from '@/components/ontology-ui';

<VirtualizedList
  items={largeDataset}
  height={600}
  itemHeight={80}
  renderItem={(item) => <ThingCard thing={item} type="product" />}
/>
```

---

## Troubleshooting

### Common Issues

**1. Components not rendering**
```tsx
// Check that data has correct shape
console.log('Thing:', thing);
// Ensure required fields: _id, name, type, groupId, ownerId
```

**2. Real-time updates not working**
```tsx
// Verify Convex is configured
import { ConvexProvider } from 'convex/react';

<ConvexProvider client={convex}>
  <App />
</ConvexProvider>
```

**3. TypeScript errors**
```tsx
// Import types explicitly
import type { Thing, Person, Event } from '@/components/ontology-ui/types';
```

---

## Next Steps

1. **Explore the component library**: Browse all 200+ components
2. **Check examples**: See real-world usage in `/apps/`
3. **Read API docs**: Full TypeScript documentation
4. **Build your app**: Start with UnifiedInterface
5. **Contribute**: Submit PRs for new features

---

**The complete ontology-ui library is ready to power your application! 🚀**
