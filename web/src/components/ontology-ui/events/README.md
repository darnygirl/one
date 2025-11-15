# EVENTS Dimension Components

Production-ready React components for displaying and managing events in the 6-dimension ontology.

## Components

### 1. ActivityFeed

Real-time activity stream with live updates, auto-refresh, and scroll-to-load-more functionality.

**Props:**
- `events: Event[]` - Array of events to display
- `maxItems?: number` - Maximum items per load (default: 20)
- `autoRefresh?: boolean` - Enable live update detection (default: false)
- `className?: string` - Additional CSS classes

**Features:**
- Live "New activity" badge when new events arrive
- Compact view mode for older events
- Load more pagination
- Auto-refresh indicator

**Usage:**
```tsx
import { ActivityFeed } from '@/components/ontology-ui/events';

<ActivityFeed 
  events={recentEvents} 
  maxItems={20}
  autoRefresh={true}
/>
```

### 2. AuditLog

Detailed audit log with advanced search, filtering, and CSV export.

**Props:**
- `events: Event[]` - Array of events to display
- `searchable?: boolean` - Enable search functionality (default: true)
- `exportable?: boolean` - Enable CSV export (default: true)
- `className?: string` - Additional CSS classes

**Features:**
- Searchable table view
- Click event to see full details
- CSV export functionality
- Pagination (10 items per page)
- Displays: timestamp, event type, actor, target, metadata

**Usage:**
```tsx
import { AuditLog } from '@/components/ontology-ui/events';

<AuditLog 
  events={allEvents} 
  searchable={true}
  exportable={true}
/>
```

### 3. EventFilter

Advanced event filtering with multiple criteria and quick filters.

**Props:**
- `onFilterChange?: (filters: FilterConfig[]) => void` - Callback when filters change
- `activeFilters?: FilterConfig[]` - Currently active filters
- `className?: string` - Additional CSS classes

**Features:**
- Filter by: event type, actor ID, target ID, group ID, timestamp
- Event type selector with categories
- Date range picker
- Active filter badges (removable)
- Quick filters: Last 24h, Last 7 days, Created only, Updated only

**Usage:**
```tsx
import { EventFilter } from '@/components/ontology-ui/events';
import { useState } from 'react';

const [filters, setFilters] = useState<FilterConfig[]>([]);

<EventFilter 
  activeFilters={filters}
  onFilterChange={setFilters}
/>
```

### 4. EventCard (Helper)

Displays a single event in a card format with icon, timestamp, and metadata.

**Props:**
- `event: Event` - Event to display
- `actor?: Person` - Optional actor information
- `target?: Thing` - Optional target information
- `compact?: boolean` - Compact view (default: false)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { EventCard } from '@/components/ontology-ui/events';

<EventCard 
  event={event}
  actor={actor}
  target={target}
  compact={false}
/>
```

### 5. EventTypeSelector (Helper)

Dropdown selector for event types, organized by category.

**Props:**
- `value?: EventType` - Selected event type
- `onValueChange?: (value: EventType) => void` - Callback when selection changes
- `placeholder?: string` - Placeholder text
- `showBadge?: boolean` - Show event type badge (default: true)

**Categories:**
- Content: created, updated, deleted, uploaded, downloaded, viewed
- Social: followed, liked, commented, shared, tagged
- Learning: enrolled, started, completed
- Workflow: submitted, approved, rejected
- Team: invited, joined, promoted
- Security: logged_in, password_reset, banned
- Financial: purchased, payment_received, refund_issued
- Subscription: subscription_started, subscription_renewed
- Tokens: token_minted, token_transferred, token_burned

**Usage:**
```tsx
import { EventTypeSelector } from '@/components/ontology-ui/events';
import { useState } from 'react';

const [eventType, setEventType] = useState<EventType>();

<EventTypeSelector 
  value={eventType}
  onValueChange={setEventType}
  placeholder="Select event type..."
/>
```

## Complete Example

```tsx
import { useState } from 'react';
import { 
  ActivityFeed, 
  AuditLog, 
  EventFilter 
} from '@/components/ontology-ui/events';
import type { Event, FilterConfig } from '@/components/ontology-ui/types';

export function EventsPage({ events }: { events: Event[] }) {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  
  // Apply filters to events
  const filteredEvents = events.filter(event => {
    return filters.every(filter => {
      const value = event[filter.field as keyof Event];
      
      switch (filter.operator) {
        case 'eq': return value === filter.value;
        case 'contains': return String(value).includes(filter.value);
        default: return true;
      }
    });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity feed */}
      <div className="lg:col-span-2">
        <ActivityFeed 
          events={filteredEvents} 
          maxItems={20}
          autoRefresh={true}
        />
        
        <div className="mt-6">
          <AuditLog 
            events={filteredEvents}
            searchable={true}
            exportable={true}
          />
        </div>
      </div>
      
      {/* Filters sidebar */}
      <div>
        <EventFilter 
          activeFilters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  );
}
```

## Imports

All components follow the ontology-ui import pattern:

```tsx
// Import types
import type { Event, EventType, FilterConfig } from '@/components/ontology-ui/types';

// Import utilities
import { formatRelativeTime, getEventTypeDisplay } from '@/components/ontology-ui/utils';

// Import hooks
import { useSearch, useFilter, usePagination } from '@/components/ontology-ui/hooks';

// Import components
import { 
  ActivityFeed, 
  AuditLog, 
  EventFilter,
  EventCard,
  EventTypeSelector 
} from '@/components/ontology-ui/events';
```

## Architecture

All components follow the ontology-ui architecture:

1. **TSX files only** - React components for testability and portability
2. **shadcn/ui** - Uses Card, Button, Badge, Table, Input, Select components
3. **TypeScript** - Fully typed with interfaces
4. **Production-ready** - Real search, filtering, pagination, export
5. **Ontology-aware** - Maps to EVENTS dimension (actorId, targetId, groupId)

## Features

- Real-time activity updates
- Advanced filtering and search
- CSV export for compliance
- Pagination for performance
- Compact/detailed view modes
- Event type categorization
- Date range filtering
- Quick filter presets
- Active filter management
- Event details modal
