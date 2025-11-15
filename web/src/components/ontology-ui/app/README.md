# App Components - Phase 4

Production-ready components for app/mail interfaces built for the ONE platform's 6-dimension ontology.

## Components (Cycles 76-82)

### Cycle 76: OntologyPanel
Enhanced ResizablePanel specifically for ontology dimensions with:
- Smart min/max sizes based on dimension type
- Collapse/expand with keyboard shortcuts (`[` to toggle)
- State persistence per dimension in localStorage
- Smooth animations and transitions
- Memory of last size for each dimension

**Usage:**
```tsx
import { OntologyPanel } from '@/components/ontology-ui/app';

<OntologyPanel dimension="things" defaultSize={30}>
  <ThingList />
</OntologyPanel>
```

---

### Cycle 77: DimensionNav
Navigation component for the 6 dimensions with:
- Active state highlighting with dimension-specific colors
- Real-time badge counts from Convex
- Keyboard shortcuts (1-6 for quick switching)
- Icon + label with collapse mode support
- Smooth transitions

**Keyboard Shortcuts:**
- `1` - People
- `2` - Things
- `3` - Connections
- `4` - Events
- `5` - Knowledge
- `6` - Groups

**Usage:**
```tsx
import { DimensionNav } from '@/components/ontology-ui/app';

<DimensionNav
  activeDimension="things"
  onDimensionChange={(dim) => setDimension(dim)}
  counts={{ things: 42, people: 15 }}
  collapsed={false}
/>
```

---

### Cycle 78: StatusFilter
Filter by entity status with:
- Tab interface or dropdown mode
- Count badges per status
- Keyboard shortcuts (a/d/w/e/b/r)
- Persisted selection in localStorage
- Real-time count updates

**Statuses:**
- `active` - Active items (shortcut: `a`)
- `done` - Completed items (shortcut: `d`)
- `waiting` - Waiting on something (shortcut: `w`)
- `deferred` - Deferred for later (shortcut: `e`)
- `blocked` - Blocked by dependencies (shortcut: `b`)
- `archived` - Archived items (shortcut: `r`)

**Usage:**
```tsx
import { StatusFilter } from '@/components/ontology-ui/app';

<StatusFilter
  activeStatus="active"
  onStatusChange={(status) => setStatus(status)}
  counts={{ active: 12, done: 45, waiting: 3 }}
  mode="tabs" // or "dropdown"
/>
```

---

### Cycle 79: JourneyStageFilter
Filter by customer journey stages with:
- Chip/pill interface for 9 journey stages
- Multi-select capability
- Clear all button
- Smart suggestions based on context
- Smooth animations

**Journey Stages:**
1. `unaware` - Not aware of product/service
2. `aware` - Aware but not engaged
3. `interested` - Showing interest
4. `considering` - Actively considering purchase
5. `evaluating` - Comparing options
6. `trial` - In trial or demo
7. `customer` - Active customer
8. `advocate` - Recommends to others
9. `promoter` - Actively promotes brand

**Usage:**
```tsx
import { JourneyStageFilter } from '@/components/ontology-ui/app';

<JourneyStageFilter
  selectedStages={['customer', 'advocate']}
  onStagesChange={(stages) => setStages(stages)}
  counts={{ customer: 150, advocate: 42, promoter: 15 }}
  suggestions={['evaluating', 'trial']}
/>
```

---

### Cycle 80: EntityDisplay
Right panel for displaying any entity with:
- Adapts layout based on entity type (person/thing/connection/event)
- Quick actions toolbar (edit, share, copy, delete)
- Related entities sidebar
- Activity timeline
- Responsive tabs interface

**Usage:**
```tsx
import { EntityDisplay } from '@/components/ontology-ui/app';

<EntityDisplay
  entity={selectedEntity}
  dimension="things"
  relatedEntities={relatedItems}
  recentEvents={activityLog}
  onAction={(action, entity) => handleAction(action, entity)}
/>
```

---

### Cycle 81: UnifiedSearch
Search across all 6 dimensions with:
- AI-powered suggestions
- Recent searches display
- Filters by type, status, date
- Keyboard shortcuts (`/` or `⌘K`)
- Instant results with highlighting

**Keyboard Shortcuts:**
- `/` - Open search
- `⌘K` or `Ctrl+K` - Open command palette
- `Escape` - Close search

**Usage:**
```tsx
import { UnifiedSearch } from '@/components/ontology-ui/app';

<UnifiedSearch
  onSearch={(query, filters) => handleSearch(query, filters)}
  onSelect={(result) => handleSelect(result)}
  recentSearches={['product launches', 'team updates']}
  suggestions={['new customers', 'pending tasks']}
/>
```

---

### Cycle 82: MobileAppNav
Bottom navigation for mobile with:
- 5 tabs for main dimensions (people, things, connections, events, knowledge)
- Badge counts for notifications
- Active state highlighting
- Smooth transitions
- Haptic feedback on supported devices
- Safe area insets for iOS

**Usage:**
```tsx
import { MobileAppNav } from '@/components/ontology-ui/app';

<MobileAppNav
  activeDimension="things"
  onDimensionChange={(dim) => setDimension(dim)}
  counts={{ things: 12, events: 3 }}
/>
```

---

## Design Principles

1. **Ontology-First**: All components map to the 6-dimension ontology (groups, people, things, connections, events, knowledge)

2. **Keyboard Accessible**: Every component has keyboard shortcuts for power users

3. **State Persistence**: User preferences are saved to localStorage

4. **Real-time Updates**: Badge counts and data update in real-time via Convex

5. **Mobile-Responsive**: All components adapt to mobile with touch-friendly interfaces

6. **Dark Mode**: Full support for light/dark themes

7. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

---

## Integration with Existing Components

These app components work seamlessly with existing ontology-ui components:

```tsx
import {
  OntologyPanel,
  DimensionNav,
  StatusFilter,
  JourneyStageFilter,
  EntityDisplay,
  UnifiedSearch,
  MobileAppNav,
} from '@/components/ontology-ui/app';

import {
  ThingCard,
  PersonCard,
  EventCard,
} from '@/components/ontology-ui';

// Build complete app interfaces
<ResizablePanelGroup direction="horizontal">
  <OntologyPanel dimension="things" defaultSize={20}>
    <DimensionNav
      activeDimension="things"
      onDimensionChange={setDimension}
    />
  </OntologyPanel>

  <OntologyPanel dimension="things" defaultSize={30}>
    <StatusFilter activeStatus="active" onStatusChange={setStatus} />
    <JourneyStageFilter selectedStages={stages} onStagesChange={setStages} />
    {/* List of things */}
  </OntologyPanel>

  <OntologyPanel dimension="things" defaultSize={50}>
    <EntityDisplay entity={selected} dimension="things" />
  </OntologyPanel>
</ResizablePanelGroup>
```

---

## Performance

All components are optimized for production:
- ✅ React 19 with TypeScript
- ✅ Minimal bundle size
- ✅ Lazy loading where appropriate
- ✅ Memoized callbacks
- ✅ Efficient re-renders
- ✅ Local state management

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

---

Built with ❤️ for the ONE platform
