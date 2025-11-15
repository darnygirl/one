# Ontology UI Component Library

**Complete UI toolkit for building applications on the ONE Platform's 6-dimension ontology.**

Built on top of shadcn/ui with 100 production-ready components mapped to the 6-dimension ontology.

---

## 📊 Component Overview

| Dimension | Components | Description |
|-----------|------------|-------------|
| **GROUPS** | 15 | Multi-tenant containers with infinite nesting |
| **PEOPLE** | 15 | Authorization, roles, and user management |
| **THINGS** | 20 | All entities in the system (66+ types) |
| **CONNECTIONS** | 12 | All relationships between entities (25+ types) |
| **EVENTS** | 12 | Complete audit trail (67+ event types) |
| **KNOWLEDGE** | 10 | Labels, vectors, and semantic search |
| **UNIVERSAL** | 8 | Cross-dimensional components |
| **LAYOUT** | 8 | Navigation and layout components |
| **GENERATIVE** | 7 | AI-powered UI generation |
| **TOTAL** | **107** | Complete UI toolkit |

---

## 🚀 Quick Start

```tsx
// Import dimension-specific components
import { GroupCard, GroupList } from '@/components/ontology-ui/groups';
import { UserCard, UserList } from '@/components/ontology-ui/people';
import { ThingCard, ThingList } from '@/components/ontology-ui/things';

// Import universal components
import { OntologyCard, OntologyList } from '@/components/ontology-ui/universal';

// Import layout components
import { OntologyHeader, DimensionSwitcher } from '@/components/ontology-ui/layouts';

// Use in your Astro pages or React components
<GroupCard group={group} showMembers />
<UserList users={users} searchable paginated />
<ThingGrid things={products} columns={3} />
<OntologyHeader currentDimension="things" currentUser={user} />
```

---

## 📦 1. GROUPS Dimension (15 components)

**Multi-tenant containers with infinite nesting**

| # | Component | Description |
|---|-----------|-------------|
| 1 | **GroupCard** | Display group information with metadata |
| 2 | **GroupList** | Scrollable list of groups with filtering |
| 3 | **GroupTree** | Hierarchical tree view of nested groups |
| 4 | **GroupSelector** | Dropdown selector for choosing groups |
| 5 | **GroupBreadcrumb** | Breadcrumb navigation through group hierarchy |
| 6 | **GroupCreator** | Form for creating new groups |
| 7 | **GroupSettings** | Settings panel for group configuration |
| 8 | **GroupMembers** | List of members in a group |
| 9 | **GroupHierarchy** | Visual hierarchy diagram |
| 10 | **GroupSwitcher** | Quick switcher between groups |
| 11 | **GroupInvite** | Invite form for adding members |
| 12 | **GroupPermissions** | Permission matrix for group access |
| 13 | **GroupStats** | Statistics dashboard for group metrics |
| 14 | **GroupBadge** | Small badge showing group name/icon |
| 15 | **GroupHeader** | Header component with group branding |

```tsx
import { GroupCard, GroupList, GroupTree } from '@/components/ontology-ui/groups';

<GroupCard group={group} showMembers memberCount={42} />
<GroupList groups={groups} searchable paginated />
<GroupTree groups={hierarchicalGroups} selectedGroupId={currentGroupId} />
```

---

## 👥 2. PEOPLE Dimension (15 components)

**Authorization, roles, and user management**

| # | Component | Description |
|---|-----------|-------------|
| 16 | **UserCard** | User profile card with avatar and details |
| 17 | **UserList** | List of users with filtering and search |
| 18 | **UserProfile** | Full user profile display |
| 19 | **UserAvatar** | Avatar component with status indicator |
| 20 | **UserRoleSelector** | Dropdown for selecting user roles |
| 21 | **UserPermissions** | Permission matrix for user access |
| 22 | **UserActivity** | Activity feed for user actions |
| 23 | **UserSearch** | Search component for finding users |
| 24 | **UserInvite** | Form for inviting new users |
| 25 | **TeamCard** | Card for displaying team information |
| 26 | **TeamList** | List of teams with members |
| 27 | **RoleBadge** | Badge showing user role |
| 28 | **PermissionMatrix** | Grid showing permissions across roles |
| 29 | **UserPresence** | Real-time presence indicator |
| 30 | **UserMenu** | Dropdown menu for user actions |

```tsx
import { UserCard, UserList, UserAvatar } from '@/components/ontology-ui/people';

<UserCard user={user} showRole showEmail />
<UserList users={users} searchable filterable />
<UserAvatar user={user} status="online" size="lg" />
```

---

## 📦 3. THINGS Dimension (20 components)

**All entities in the system (66+ types)**

| # | Component | Description |
|---|-----------|-------------|
| 31 | **ThingCard** | Universal card for any thing type |
| 32 | **ThingList** | List of things with type filtering |
| 33 | **ThingGrid** | Grid layout for things |
| 34 | **ThingCreator** | Multi-step form for creating things |
| 35 | **ThingEditor** | Editor for updating thing properties |
| 36 | **ThingPreview** | Preview modal for things |
| 37 | **ThingActions** | Action menu for thing operations |
| 38 | **ThingMetadata** | Metadata panel showing thing properties |
| 39 | **ThingTags** | Tag manager for things |
| 40 | **ThingSearch** | Search component for finding things |
| 41 | **ThingFilter** | Advanced filtering interface |
| 42 | **ThingSort** | Sort controls for thing lists |
| 43 | **CourseCard** | Specialized card for courses |
| 44 | **LessonCard** | Card for displaying lessons |
| 45 | **TokenCard** | Card for displaying tokens |
| 46 | **AgentCard** | Card for AI agents |
| 47 | **ContentCard** | Card for content items |
| 48 | **ProductCard** | Card for products/services |
| 49 | **ThingTypeSelector** | Dropdown for selecting thing types |
| 50 | **ThingStatus** | Status indicator with state transitions |

```tsx
import { ThingCard, ThingGrid, CourseCard } from '@/components/ontology-ui/things';

<ThingCard thing={product} showType showTags />
<ThingGrid things={products} columns={4} />
<CourseCard course={course} showPrice showProgress />
```

---

## 🔗 4. CONNECTIONS Dimension (12 components)

**All relationships between entities (25+ types)**

| # | Component | Description |
|---|-----------|-------------|
| 51 | **ConnectionCard** | Card showing a connection relationship |
| 52 | **ConnectionList** | List of connections with type filtering |
| 53 | **ConnectionGraph** | Visual graph of connections |
| 54 | **RelationshipTree** | Tree view of relationships |
| 55 | **FollowButton** | Button for follow/unfollow actions |
| 56 | **OwnershipBadge** | Badge showing ownership relationship |
| 57 | **ConnectionCreator** | Form for creating connections |
| 58 | **RelationshipViewer** | Panel showing all relationships for an entity |
| 59 | **NetworkGraph** | D3/Canvas network visualization |
| 60 | **ConnectionTimeline** | Timeline of connection changes |
| 61 | **ConnectionTypeSelector** | Dropdown for connection types |
| 62 | **ConnectionStrength** | Visual indicator of connection strength |

```tsx
import { ConnectionCard, ConnectionGraph, FollowButton } from '@/components/ontology-ui/connections';

<ConnectionCard connection={connection} showStrength />
<ConnectionGraph connections={connections} things={things} />
<FollowButton thing={user} isFollowing={true} />
```

---

## 📅 5. EVENTS Dimension (12 components)

**Complete audit trail (67+ event types)**

| # | Component | Description |
|---|-----------|-------------|
| 63 | **EventCard** | Card displaying an event |
| 64 | **EventList** | List of events with filtering |
| 65 | **EventTimeline** | Timeline visualization of events |
| 66 | **ActivityFeed** | Real-time activity stream |
| 67 | **AuditLog** | Detailed audit log with search |
| 68 | **EventFilter** | Advanced event filtering |
| 69 | **EventSearch** | Search component for events |
| 70 | **EventDetails** | Detailed view of event data |
| 71 | **ChangeHistory** | History of changes to an entity |
| 72 | **NotificationCard** | Card for displaying notifications |
| 73 | **NotificationList** | List of notifications |
| 74 | **NotificationCenter** | Dropdown notification center |

```tsx
import { EventCard, EventTimeline, NotificationCenter } from '@/components/ontology-ui/events';

<EventCard event={event} showActor showTarget />
<EventTimeline events={events} groupByDate />
<NotificationCenter notifications={notifications} unreadCount={5} />
```

---

## 🧠 6. KNOWLEDGE Dimension (10 components)

**Labels, vectors, and semantic search**

| # | Component | Description |
|---|-----------|-------------|
| 75 | **LabelCard** | Card for displaying labels |
| 76 | **LabelList** | List of labels with counts |
| 77 | **LabelCreator** | Form for creating labels |
| 78 | **TagCloud** | Visual tag cloud |
| 79 | **SearchBar** | Universal search bar with autocomplete |
| 80 | **SearchResults** | Search results with highlighting |
| 81 | **VectorSearch** | Semantic search interface |
| 82 | **KnowledgeGraph** | Visual knowledge graph |
| 83 | **CategoryTree** | Hierarchical category browser |
| 84 | **TaxonomyBrowser** | Browse and navigate taxonomies |

```tsx
import { SearchBar, SearchResults, VectorSearch } from '@/components/ontology-ui/knowledge';

<SearchBar onSearch={handleSearch} suggestions={suggestions} />
<SearchResults results={results} query={query} />
<VectorSearch onSearch={handleSemanticSearch} results={aiResults} />
```

---

## 🌐 7. UNIVERSAL Components (8 components)

**Cross-dimensional components that work with any dimension**

| # | Component | Description |
|---|-----------|-------------|
| 85 | **OntologyCard** | Universal card that adapts to any dimension |
| 86 | **OntologyList** | Universal list component |
| 87 | **OntologyGrid** | Universal grid component |
| 88 | **OntologyTable** | Data table with sorting and filtering |
| 89 | **OntologyForm** | Dynamic form builder |
| 90 | **OntologyModal** | Modal dialog for any dimension |
| 91 | **OntologyDrawer** | Slide-out drawer |
| 92 | **OntologySheet** | Bottom sheet component |

```tsx
import { OntologyCard, OntologyList, OntologyForm } from '@/components/ontology-ui/universal';

// Works with ANY dimension
<OntologyCard data={anyEntity} dimension="things" />
<OntologyList items={anyItems} dimension="people" searchable />
<OntologyForm dimension="groups" fields={formFields} onSubmit={handleSubmit} />
```

---

## 🎨 8. LAYOUT Components (8 components)

**Navigation and layout for ontology-aware apps**

| # | Component | Description |
|---|-----------|-------------|
| 93 | **OntologyNav** | Navigation with dimension switching |
| 94 | **DimensionSwitcher** | Switch between 6 dimensions |
| 95 | **OntologyBreadcrumb** | Multi-level breadcrumb |
| 96 | **OntologySidebar** | Sidebar with dimension navigation |
| 97 | **OntologyHeader** | Header with group/user context |
| 98 | **OntologyFooter** | Footer with platform info |
| 99 | **CommandPalette** | Quick command/search palette (⌘K) |
| 100 | **QuickSwitcher** | Quick switcher for entities (⌘J) |

```tsx
import { OntologyHeader, OntologySidebar, CommandPalette } from '@/components/ontology-ui/layouts';

<OntologyHeader currentDimension="things" currentUser={user} />
<OntologySidebar currentDimension="groups" currentGroup={group} />
<CommandPalette open={isOpen} things={things} onCommand={handleCommand} />
```

---

## 🤖 9. GENERATIVE Components (7 components)

**AI-powered UI generation for chat interfaces**

| # | Component | Description |
|---|-----------|-------------|
| 101 | **UIComponentPreview** | Preview generated UI components in sandbox |
| 102 | **UIComponentEditor** | Edit component code with syntax highlighting |
| 103 | **UIComponentLibrary** | Browse generated UI components |
| 104 | **DynamicForm** | Forms generated from AI |
| 105 | **DynamicTable** | Tables generated from data |
| 106 | **DynamicChart** | Charts from natural language queries |
| 107 | **DynamicDashboard** | Full dashboards from natural language |

```tsx
import {
  UIComponentPreview,
  UIComponentEditor,
  UIComponentLibrary,
  DynamicForm,
  DynamicTable,
  DynamicChart,
  DynamicDashboard,
} from '@/components/ontology-ui/generative';

// Preview a generated component
<UIComponentPreview
  componentCode={generatedCode}
  componentName="CustomButton"
  initialProps={{ label: "Click me", variant: "primary" }}
/>

// Edit component with live preview
<UIComponentEditor
  initialCode={code}
  componentName="MyComponent"
  language="tsx"
  onSave={handleSave}
/>

// Browse component library
<UIComponentLibrary
  components={savedComponents}
  onComponentSelect={handleSelect}
/>

// Dynamic form from AI
<DynamicForm
  title="Contact Form"
  fields={aiGeneratedFields}
  onSubmit={handleSubmit}
/>

// Dynamic table with sorting/filtering
<DynamicTable
  title="User Data"
  data={users}
  columns={columns}
  exportable
/>

// Charts from natural language
<DynamicChart
  title="Sales by Region"
  data={salesData}
  defaultType="bar"
/>

// Full dashboard with drag-drop
<DynamicDashboard
  title="Analytics Dashboard"
  initialWidgets={widgets}
  realtime
/>
```

---

## 🏗️ Architecture

### Directory Structure

```
/web/src/components/ontology-ui/
├── groups/           # GROUPS dimension (15 components)
├── people/           # PEOPLE dimension (15 components)
├── things/           # THINGS dimension (20 components)
├── connections/      # CONNECTIONS dimension (12 components)
├── events/           # EVENTS dimension (12 components)
├── knowledge/        # KNOWLEDGE dimension (10 components)
├── universal/        # Universal components (8 components)
├── layouts/          # Layout components (8 components)
├── generative/       # Generative UI components (7 components)
├── types/            # Shared TypeScript types
├── hooks/            # Shared React hooks
├── utils/            # Shared utilities
├── COMPONENTS.md     # Component master list
└── README.md         # This file
```

### Technology Stack

- **Framework**: React 19
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **Backend**: Convex (real-time database)
- **State**: React hooks + nanostores

### Component Principles

1. **Built on shadcn/ui** - Leverage existing components (Card, Button, Badge, etc.)
2. **Type-safe** - Full TypeScript with Convex schema types
3. **Dimension-aware** - Each component knows which dimension it belongs to
4. **Group-scoped** - All components respect `groupId` for multi-tenancy
5. **Real-time** - Use Convex queries/mutations for live updates
6. **Accessible** - WCAG 2.1 Level AA compliance
7. **Themeable** - Support dark/light modes via Tailwind theme
8. **Composable** - Can be combined to create complex UIs

---

## 🎯 Shared Types

All components use shared TypeScript types from `/types/index.ts`:

```typescript
// Core ontology types
export type Dimension = "groups" | "people" | "things" | "connections" | "events" | "knowledge";
export type UserRole = "platform_owner" | "org_owner" | "org_user" | "customer";
export type ThingType = "creator" | "user" | "agent" | "content" | "course" | "lesson" | ...;
export type ConnectionType = "owns" | "created" | "follows" | "purchased" | ...;
export type EventType = "created" | "updated" | "deleted" | "purchased" | ...;

// Component props
export interface CardProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

export interface ListProps {
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}

export interface FormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  mode?: "create" | "edit";
}
```

---

## 🪝 Shared Hooks

Reusable React hooks from `/hooks/index.ts`:

```typescript
// Data manipulation
useSort<T>(data, initialSort)       // Sort data by field
useFilter<T>(data, initialFilters)  // Filter data with operators
usePagination<T>(data, pageSize)    // Paginate data
useSearch<T>(data, searchFields)    // Search across fields

// State management
useToggle(initialValue)             // Toggle boolean state
useLocalStorage<T>(key, initial)    // Persist state to localStorage
useDebounce<T>(value, delay)        // Debounce value changes

// Utilities
useClipboard(timeout)               // Copy to clipboard
useDimension()                      // Current dimension context
useGroupContext()                   // Current group context
```

---

## 🛠️ Shared Utilities

Helper functions from `/utils/index.ts`:

```typescript
// CSS
cn(...inputs)                       // Merge Tailwind classes

// Dates
formatDate(timestamp)               // "Jan 1, 2024"
formatDateTime(timestamp)           // "Jan 1, 2024, 3:45 PM"
formatRelativeTime(timestamp)       // "2h ago", "3d ago"

// Strings
truncate(text, maxLength)           // "Long text..."
capitalize(text)                    // "Hello"
titleCase(text)                     // "Hello World"
pluralize(count, singular, plural)  // "1 item", "2 items"

// Display names
getThingTypeDisplay(type)           // "Course", "AI Agent"
getConnectionTypeDisplay(type)      // "Follows", "Purchased"
getEventTypeDisplay(type)           // "Created", "Updated"
getRoleDisplay(role)                // "Platform Owner"

// Colors
getDimensionColor(dimension)        // "blue", "purple", "green"
getThingTypeColor(type)             // Color for thing type
getRoleColor(role)                  // Color for user role

// Icons
getThingTypeIcon(type)              // "📚", "🤖", "🪙"
getDimensionIcon(dimension)         // "🏢", "👥", "📦"

// Numbers
formatNumber(num)                   // "1,234"
formatCurrency(amount, currency)    // "$49.99"
formatPercentage(value, decimals)   // "85.5%"
abbreviateNumber(num)               // "1.2K", "3.4M"

// Arrays
groupBy<T>(array, key)              // Group array by key
unique<T>(array)                    // Remove duplicates
shuffle<T>(array)                   // Randomize order

// Validation
isValidEmail(email)                 // Email validation
isValidUrl(url)                     // URL validation
isValidGroupId(id)                  // Group ID validation
```

---

## 🎨 Theme Support

All components support dark/light themes via Tailwind CSS:

```tsx
// Theme classes automatically adapt
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <Badge className="bg-primary text-primary-foreground">
      Example
    </Badge>
  </Card>
</div>
```

**Theme Variables:**
- `bg-background` - Main background
- `bg-card` - Card background
- `bg-primary` - Primary brand color
- `text-foreground` - Main text color
- `text-muted-foreground` - Secondary text
- `border-border` - Border color

---

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
// Responsive grid
<ThingGrid
  things={products}
  columns={1}  // 1 column on mobile
  className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
/>

// Responsive layout
<OntologyHeader />  // Collapses on mobile
<OntologySidebar /> // Drawer on mobile, sidebar on desktop
```

---

## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast
- Screen reader support

```tsx
// Example with accessibility
<Button aria-label="Close dialog" onClick={handleClose}>
  <X className="h-4 w-4" />
</Button>
```

---

## 🚀 Performance

Components are optimized for performance:

- **Tree shaking** - Import only what you need
- **Code splitting** - Lazy load heavy components
- **Memoization** - React.memo for expensive renders
- **Virtualization** - For large lists (via react-window)
- **Debouncing** - For search and filters

```tsx
// Lazy load heavy components
const KnowledgeGraph = lazy(() => import('@/components/ontology-ui/knowledge/KnowledgeGraph'));

<Suspense fallback={<Spinner />}>
  <KnowledgeGraph things={things} connections={connections} />
</Suspense>
```

---

## 📖 Usage Examples

### Building a Dashboard

```tsx
import {
  OntologyHeader,
  OntologySidebar,
  DimensionSwitcher,
} from '@/components/ontology-ui/layouts';
import { ThingGrid, ThingCard } from '@/components/ontology-ui/things';
import { EventTimeline } from '@/components/ontology-ui/events';

export default function Dashboard() {
  const [dimension, setDimension] = useState<Dimension>("things");

  return (
    <div className="min-h-screen">
      <OntologyHeader
        currentDimension={dimension}
        currentUser={user}
        onDimensionChange={setDimension}
      />

      <div className="flex">
        <OntologySidebar
          currentDimension={dimension}
          currentGroup={group}
          onDimensionChange={setDimension}
        />

        <main className="flex-1 p-8">
          <ThingGrid things={products} columns={3} />
          <EventTimeline events={recentEvents} groupByDate />
        </main>
      </div>
    </div>
  );
}
```

### Building a User Profile

```tsx
import { UserProfile, UserActivity } from '@/components/ontology-ui/people';
import { ThingList } from '@/components/ontology-ui/things';
import { ConnectionGraph } from '@/components/ontology-ui/connections';

export default function UserProfilePage({ userId }) {
  return (
    <div className="container mx-auto p-8">
      <UserProfile user={user} showActivity showStats />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h2>Recent Activity</h2>
          <UserActivity user={user} events={events} maxItems={10} />
        </div>

        <div>
          <h2>Connections</h2>
          <ConnectionGraph
            connections={userConnections}
            things={connectedThings}
            centerThingId={userId}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2>Created Content</h2>
        <ThingList
          things={userContent}
          searchable
          paginated
        />
      </div>
    </div>
  );
}
```

### Building a Search Page

```tsx
import { SearchBar, SearchResults, VectorSearch } from '@/components/ontology-ui/knowledge';
import { ThingFilter } from '@/components/ontology-ui/things';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  return (
    <div className="container mx-auto p-8">
      <SearchBar
        onSearch={setQuery}
        suggestions={suggestions}
        placeholder="Search across all dimensions..."
      />

      <div className="flex gap-8 mt-8">
        <aside className="w-64">
          <ThingFilter
            onFilterChange={setFilters}
            activeFilters={filters}
          />
        </aside>

        <main className="flex-1">
          <SearchResults
            results={results}
            query={query}
            onResultClick={handleResultClick}
          />

          <div className="mt-8">
            <h3>AI-Powered Search</h3>
            <VectorSearch
              onSearch={handleSemanticSearch}
              results={aiResults}
              loading={isSearching}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

Components are designed to be testable:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThingCard } from '@/components/ontology-ui/things';

test('ThingCard displays thing name', () => {
  const thing = { name: "Test Product", type: "product" };
  render(<ThingCard thing={thing} />);
  expect(screen.getByText("Test Product")).toBeInTheDocument();
});

test('ThingCard onClick handler', () => {
  const handleClick = vi.fn();
  const thing = { name: "Test Product", type: "product" };
  render(<ThingCard thing={thing} onClick={handleClick} />);
  fireEvent.click(screen.getByText("Test Product"));
  expect(handleClick).toHaveBeenCalled();
});
```

---

## 📚 Documentation

- **Component Docs**: `/web/src/components/ontology-ui/COMPONENTS.md`
- **Type Reference**: `/web/src/components/ontology-ui/types/index.ts`
- **Hook Reference**: `/web/src/components/ontology-ui/hooks/index.ts`
- **Utility Reference**: `/web/src/components/ontology-ui/utils/index.ts`
- **Ontology Spec**: `/one/knowledge/ontology.md`

---

## 🤝 Contributing

When adding new components:

1. Follow the existing patterns (shadcn/ui + TypeScript)
2. Map to one of the 6 dimensions
3. Add proper TypeScript interfaces
4. Include usage examples
5. Update the index.ts exports
6. Update COMPONENTS.md

---

## 📄 License

MIT License - Built for the ONE Platform

---

**Built with clarity, simplicity, and infinite scale in mind.**

107 components. 6 dimensions. 1 unified system. AI-powered UI generation.
