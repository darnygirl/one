# Enhanced Components - Phase 3 Advanced UI Features

**Build Date:** 2025-11-14
**Status:** ✅ Complete (Cycles 51-57)

Production-ready enhanced components with advanced features for the 6-dimension ontology.

## Overview

Phase 3 builds upon the foundational components with:
- **Effect.ts integration** - Business logic and error handling
- **Live updates** - Real-time data with Convex subscriptions
- **Optimistic UI** - Instant feedback with rollback on error
- **Advanced interactions** - Drag-and-drop, voice search, zoom controls
- **Performance** - Virtualization, infinite scroll, lazy loading
- **Persistence** - LocalStorage, undo/redo, state management
- **Framer Motion** - Smooth animations and transitions
- **Modern libraries** - @dnd-kit, @xyflow/react, react-window, effect

## Recent Additions (Cycles 51-57)

### 1. EnhancedCourseCard (Cycle 51)

Enhanced course card with enrollment, wishlist, and real-time updates.

**Features:**
- Effect.ts integration for enrollment validation
- Real-time student count updates (Convex ready)
- Progress streaming with optimistic updates
- Wishlist with Convex sync (Convex ready)
- Animated enrollment counter
- Smooth transitions with Framer Motion

**Usage:**
```tsx
import { EnhancedCourseCard } from '@/components/ontology-ui/enhanced';

<EnhancedCourseCard
  course={courseData}
  groupId="group_123"
  showProgress={true}
  showWishlist={true}
/>
```

---

### 2. EnhancedVideoPlayer (Cycle 52)

Advanced video player with progress sync, watch party, and custom controls.

**Features:**
- Progress sync with Effect.ts (every 5 seconds)
- Real-time watch party support (Convex ready)
- Playback speed persistence (localStorage)
- Custom controls with keyboard shortcuts
- Picture-in-picture support
- Quality selector
- Auto-hide controls on mouse move

**Usage:**
```tsx
import { EnhancedVideoPlayer } from '@/components/ontology-ui/enhanced';

<EnhancedVideoPlayer
  videoId="video_123"
  src="/path/to/video.mp4"
  title="Lesson 1: Introduction"
  enableWatchParty={true}
  onProgress={(progress, time) => console.log(progress)}
/>
```

**Keyboard shortcuts:**
- `Space/K` - Play/Pause
- `←/→` - Skip 5s backward/forward
- `F` - Fullscreen
- `M` - Mute/Unmute

---

### 3. EnhancedQuiz (Cycle 53)

Quiz component with real-time scoring, leaderboard, and answer explanations.

**Features:**
- Real-time scoring with Effect.ts
- Leaderboard integration (Convex ready)
- Time limits with countdown
- Answer explanations
- Performance analytics
- Question indicators
- Results screen with review

**Usage:**
```tsx
import { EnhancedQuiz } from '@/components/ontology-ui/enhanced';

<EnhancedQuiz
  quiz={quizData}
  groupId="group_123"
  onComplete={(score, percentage) => console.log(score)}
  showLeaderboard={true}
/>
```

---

### 4. EnhancedProgress (Cycle 54)

Progress tracker with achievements, XP system, and streak tracking.

**Features:**
- Achievements with Effect.ts
- XP system with level progression
- Streak tracking with persistence
- Milestone notifications
- Gamification elements
- Achievement unlock animations

**Usage:**
```tsx
import { EnhancedProgress } from '@/components/ontology-ui/enhanced';

<EnhancedProgress
  userId="user_123"
  courseId="course_123"
  groupId="group_123"
/>
```

---

### 5. EnhancedUserCard (Cycle 55)

User card with live presence, activity stream, and quick actions.

**Features:**
- Live presence from Convex (Convex ready)
- Activity stream with real-time updates
- Connection count
- Quick actions (message, follow)
- Status indicators
- Profile preview on hover

**Usage:**
```tsx
import { EnhancedUserCard } from '@/components/ontology-ui/enhanced';

<EnhancedUserCard
  user={userData}
  currentUserId="current_user_123"
  showActions={true}
  showActivity={true}
  showConnections={true}
/>
```

---

### 6. EnhancedGroupCard (Cycle 56)

Group card with real-time stats, activity preview, and join/leave actions.

**Features:**
- Real-time member count (Convex ready)
- Recent activity preview
- Join/leave buttons with optimistic updates
- Stats dashboard
- Engagement metrics
- Growth indicators

**Usage:**
```tsx
import { EnhancedGroupCard } from '@/components/ontology-ui/enhanced';

<EnhancedGroupCard
  group={groupData}
  currentUserId="user_123"
  showStats={true}
  showActivity={true}
  showActions={true}
/>
```

---

### 7. EnhancedThingCard (Cycle 57)

Thing card with real-time stats, action menu, and drag-to-reorder.

**Features:**
- Real-time stats (views, likes, etc.) via Convex
- Action menu with quick operations
- Quick preview modal
- Drag-to-reorder support
- Context menu for advanced actions
- Live status updates

**Usage:**
```tsx
import { EnhancedThingCard } from '@/components/ontology-ui/enhanced';

<EnhancedThingCard
  thing={thingData}
  stats={{ views: 1247, likes: 89, comments: 23, shares: 12 }}
  showStats={true}
  draggable={false}
  onEdit={(id) => console.log('Edit', id)}
/>
```

---

## Previous Components

### 1. EnhancedEventCard

Enhanced event card with live updates and advanced features.

**Features:**
- Real-time event feed with Convex subscriptions
- Event details modal with full metadata
- Related events section
- Event replay functionality
- Live update animations

**Usage:**
```tsx
import { EnhancedEventCard } from '@/components/ontology-ui/enhanced';

<EnhancedEventCard
  event={event}
  actor={actor}
  target={target}
  relatedEvents={relatedEvents}
  enableReplay={true}
  enableLiveUpdates={true}
  onReplay={(eventId) => console.log('Replay:', eventId)}
/>
```

**Props:**
- `event` - Event object
- `actor` - Person who performed the action (optional)
- `target` - Thing that was affected (optional)
- `relatedEvents` - Array of related events (optional)
- `enableReplay` - Enable replay button (default: false)
- `enableLiveUpdates` - Enable live update animations (default: true)
- `onReplay` - Callback when replay is triggered

---

### 2. EnhancedConnectionGraph

Interactive connection graph with live updates and advanced features.

**Features:**
- Live updates with real-time connection additions
- Interactive node dragging with @xyflow/react
- Filtering by connection type
- Zoom and pan controls
- Connection strength visualization

**Usage:**
```tsx
import { EnhancedConnectionGraph } from '@/components/ontology-ui/enhanced';

<EnhancedConnectionGraph
  connections={connections}
  things={things}
  centerThingId={centerThingId}
  enableLiveUpdates={true}
  enableDragging={true}
  enableFiltering={true}
/>
```

**Props:**
- `connections` - Array of connection objects
- `things` - Array of thing objects
- `centerThingId` - ID of center node (optional)
- `enableLiveUpdates` - Enable live updates (default: true)
- `enableDragging` - Enable node dragging (default: true)
- `enableFiltering` - Enable connection type filter (default: true)

**Libraries:**
- `@xyflow/react` - For interactive graph visualization

---

### 3. EnhancedSearchBar

Advanced search with AI suggestions and voice input.

**Features:**
- AI-powered search suggestions
- Recent searches persistence (localStorage)
- Search analytics tracking
- Voice search support
- Advanced filters

**Usage:**
```tsx
import { EnhancedSearchBar } from '@/components/ontology-ui/enhanced';

<EnhancedSearchBar
  onSearch={(query, filters) => console.log(query, filters)}
  suggestions={suggestions}
  aiSuggestions={['Popular query 1', 'Popular query 2']}
  enableVoice={true}
  enableAnalytics={true}
  enableFilters={true}
  variant="advanced"
/>
```

**Props:**
- `onSearch` - Callback when search is submitted
- `placeholder` - Input placeholder (default: "Search...")
- `suggestions` - Array of search result suggestions
- `aiSuggestions` - Array of AI-generated suggestions
- `enableVoice` - Enable voice search (default: true)
- `enableAnalytics` - Track search analytics (default: true)
- `enableFilters` - Enable advanced filters (default: true)
- `variant` - UI variant: "simple" | "command" | "advanced"

**Keyboard Shortcuts:**
- `⌘K` or `Ctrl+K` - Focus search bar

---

### 4. InfiniteScroll

Infinite scroll component with Convex pagination.

**Features:**
- Intersection Observer API for efficient loading
- Convex pagination integration
- Loading states
- "Load More" button option
- Customizable threshold and root margin

**Usage:**
```tsx
import { InfiniteScroll, useConvexPagination } from '@/components/ontology-ui/enhanced';

// With hook
const { items, loadMore, hasMore, loading } = useConvexPagination({
  query: api.queries.things.list,
  args: { groupId, type: "product" },
  pageSize: 20,
});

<InfiniteScroll
  items={items}
  loadMore={loadMore}
  hasMore={hasMore}
  loading={loading}
  renderItem={(item) => <ProductCard product={item} />}
  mode="auto"
/>
```

**Props:**
- `items` - Array of items to render
- `loadMore` - Async function to load more items
- `hasMore` - Whether more items are available
- `loading` - Loading state (optional)
- `renderItem` - Function to render each item
- `threshold` - Intersection threshold (default: 0.5)
- `rootMargin` - Root margin for intersection observer (default: "100px")
- `mode` - Loading mode: "auto" | "button" (default: "auto")

**Hook: useConvexPagination**
- Handles Convex pagination automatically
- Returns `{ items, loadMore, hasMore, loading }`

---

### 5. VirtualizedList

Virtualized list for large datasets with react-window.

**Features:**
- react-window integration for efficient rendering
- Dynamic row heights
- Smooth scrolling
- Search within list
- Handles thousands of items efficiently

**Usage:**
```tsx
import { VirtualizedList, createSearchFilter } from '@/components/ontology-ui/enhanced';

const searchFilter = createSearchFilter<Product>(['name', 'description']);

<VirtualizedList
  items={products}
  renderItem={(item, index, style) => (
    <div style={style}>
      <ProductCard product={item} />
    </div>
  )}
  itemHeight={80}
  height={600}
  searchable={true}
  searchFilter={searchFilter}
  title="Products"
/>
```

**Props:**
- `items` - Array of items to render
- `renderItem` - Function to render each item with style
- `getItemKey` - Function to get unique key (optional)
- `itemHeight` - Fixed height or function for dynamic heights
- `height` - Container height (default: 600)
- `width` - Container width (default: "100%")
- `searchable` - Enable search bar (default: true)
- `searchFilter` - Search filter function
- `emptyMessage` - Message when no items (default: "No items found")
- `loading` - Loading state (optional)
- `title` - List title (optional)

**Helper: createSearchFilter**
- Creates a default search filter for specified fields
- Usage: `createSearchFilter<T>(['field1', 'field2'])`

**Libraries:**
- `react-window` - For virtualization

---

### 6. DragDropBoard

Drag and drop component with @dnd-kit.

**Features:**
- @dnd-kit integration for smooth drag and drop
- Persistence with Effect.ts
- Multi-list support (Kanban-style)
- Undo/redo functionality
- Touch support for mobile

**Usage:**
```tsx
import { DragDropBoard } from '@/components/ontology-ui/enhanced';

const lists = [
  {
    id: 'todo',
    title: 'To Do',
    items: [
      { id: '1', content: <TaskCard task={task1} />, listId: 'todo' },
      { id: '2', content: <TaskCard task={task2} />, listId: 'todo' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    items: [],
  },
  {
    id: 'done',
    title: 'Done',
    items: [],
  },
];

<DragDropBoard
  lists={lists}
  onItemMove={(itemId, fromListId, toListId, newIndex) => {
    console.log('Item moved:', { itemId, fromListId, toListId, newIndex });
  }}
  enableUndo={true}
  persistKey="kanban-board"
/>
```

**Props:**
- `lists` - Array of list objects with items
- `onItemMove` - Callback when item is moved between lists
- `onListReorder` - Callback when lists are reordered (optional)
- `enableUndo` - Enable undo/redo (default: true)
- `persistKey` - Key for localStorage persistence (optional)

**Libraries:**
- `@dnd-kit/core` - Core drag and drop
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Transform utilities

---

### 7. SplitPane

Resizable split pane layout.

**Features:**
- Horizontal/vertical modes
- Min/max constraints
- Collapse/expand buttons
- State persistence with localStorage
- Touch support for mobile

**Usage:**
```tsx
import { SplitPane, SplitPanePresets } from '@/components/ontology-ui/enhanced';

// Basic usage
<SplitPane
  left={<FileTree />}
  right={<Editor />}
  direction="horizontal"
  defaultSize={25}
  minSize={15}
  maxSize={40}
  collapsible={true}
  persistKey="code-editor"
/>

// Preset layouts
<SplitPanePresets.CodeEditor
  fileTree={<FileTree />}
  editor={<Editor />}
/>
```

**Props:**
- `left` / `right` - Content for horizontal layout
- `top` / `bottom` - Content for vertical layout
- `direction` - Layout direction: "horizontal" | "vertical"
- `defaultSize` - Default size percentage (default: 50)
- `minSize` - Minimum size percentage (default: 20)
- `maxSize` - Maximum size percentage (default: 80)
- `collapsible` - Enable collapse buttons (default: true)
- `persistKey` - Key for localStorage persistence (optional)

**Presets:**
- `SplitPanePresets.CodeEditor` - Code editor layout (file tree + editor)
- `SplitPanePresets.Dashboard` - Dashboard layout (metrics + details)
- `SplitPanePresets.Email` - Email layout (inbox + message)
- `SplitPanePresets.Settings` - Settings layout (menu + content)

**Libraries:**
- `react-resizable-panels` - For resizable panels

---

## Installation

All required dependencies are already installed in the project:

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@xyflow/react": "^12.9.2",
  "react-window": "^2.2.3",
  "react-resizable-panels": "^3.0.6",
  "effect": "^3.18.4"
}
```

## Architecture

### Effect.ts Integration

All components use Effect.ts for:
- **Error handling** - Structured error types
- **Async operations** - Effect.tryPromise for safe promises
- **Persistence** - Effect wrappers for localStorage
- **Composability** - Chain operations with Effect.gen

Example:
```typescript
const persistEffect = Effect.tryPromise({
  try: async () => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  catch: (error) => ({
    _tag: "PersistError" as const,
    message: String(error),
  }),
});

Effect.runPromise(persistEffect).catch(console.error);
```

### TypeScript

All components are fully typed with:
- Strict TypeScript mode
- Generic type parameters for flexibility
- Proper type inference
- Type-safe event handlers

### Performance

Optimizations included:
- **Virtualization** - react-window renders only visible items
- **Intersection Observer** - Efficient scroll detection
- **Memoization** - useMemo for expensive computations
- **Lazy loading** - Components load on demand
- **Debouncing** - Search inputs are debounced

## Best Practices

### 1. State Management

Use nanostores for shared state:
```typescript
import { atom } from 'nanostores';
export const searchQuery$ = atom<string>('');
```

### 2. Persistence

Use localStorage with Effect.ts:
```typescript
const persistEffect = Effect.tryPromise({
  try: async () => localStorage.setItem(key, value),
  catch: (error) => ({ _tag: "PersistError", message: String(error) }),
});
```

### 3. Error Handling

Use Effect.ts error types:
```typescript
type LoadError =
  | { _tag: "NetworkError"; message: string }
  | { _tag: "ValidationError"; field: string };
```

### 4. Accessibility

All components include:
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Testing

Components are testable with:
- React Testing Library
- Vitest for unit tests
- Integration tests for interactions

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { EnhancedEventCard } from './EnhancedEventCard';

test('renders event card', () => {
  render(<EnhancedEventCard event={mockEvent} />);
  expect(screen.getByText('Event Title')).toBeInTheDocument();
});
```

## Contributing

When adding new enhanced components:
1. Follow existing patterns (Effect.ts, TypeScript, shadcn/ui)
2. Add comprehensive JSDoc comments
3. Export from index.ts
4. Update this README with usage examples
5. Ensure accessibility (ARIA, keyboard nav)
6. Add error handling with Effect.ts
7. Include loading and empty states

## License

Part of the ONE Platform. See root LICENSE.md for details.
