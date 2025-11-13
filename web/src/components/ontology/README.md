# Ontology UI Components

Universal UI system that renders **all 66+ thing types** using a single `Card` component.

## Quick Start

```tsx
import { Card } from "@/components/ontology";
import type { Thing } from "@/lib/ontology";

// Render ANY thing type with the same component
<Card thing={course} />
<Card thing={product} />
<Card thing={post} />
```

## Components

### Card (Universal Renderer)
The core component that renders any thing type based on ontology configuration.

```tsx
<Card
  thing={myThing}
  view="card"           // "card" | "list" | "detail"
  onClick={(thing) => navigate(`/${thing.type}/${thing._id}`)}
  showActions={true}
  showConnections={true}
/>
```

### Variant Components

```tsx
import { ThingGrid, ThingList, ThingTable, ThingDetail } from "@/components/ontology";

// Grid layout (responsive)
<ThingGrid things={courses} />

// List layout (vertical)
<ThingList things={products} />

// Table layout (sortable)
<ThingTable things={posts} onRowClick={(post) => {...}} />

// Detail view (single thing)
<ThingDetail thing={course} />
```

## How It Works

### 1. Define Thing Type Configuration

```typescript
// web/src/lib/ontology/config/course.ts
export const courseConfig: ThingConfig = {
  type: "course",
  properties: { title: "", price: 0, ... },
  ui: {
    fields: {
      title: { component: "Heading", size: "xl" },
      price: { component: "Price", currency: "USD", badge: true },
      // ... more fields
    },
    views: {
      card: { fields: ["thumbnail", "title", "price"] },
      list: { fields: ["title", "instructor", "price"] },
    },
    actions: {
      primary: { action: "enroll", label: "Enroll Now" },
    },
  },
};
```

### 2. Register Configuration

```typescript
// web/src/lib/ontology/config/index.ts
import { courseConfig } from "./course";

export const ontologyUIRegistry = {
  course: courseConfig,
  // Add more configs here...
};
```

### 3. Use Card Component

```tsx
// The Card component automatically reads the config and renders appropriately
<Card thing={course} />
```

## Architecture

```
Card Component
    ↓
useThingConfig Hook → Reads UI config from ontology registry
    ↓
Field Component → Routes to appropriate field component
    ↓
shadcn/ui Components → Renders with Badge, Avatar, Button, etc.
```

## Adding New Thing Types

1. Create config file: `web/src/lib/ontology/config/webinar.ts`
2. Define UI configuration (fields, views, actions)
3. Register in `web/src/lib/ontology/config/index.ts`
4. Use `<Card thing={webinar} />` - done!

## Field Components

All field components support configuration via the ontology:

- `Heading` - Headings with size/weight
- `Text` - Text with icon, truncation, expandable
- `Price` - Currency formatting, badges
- `Image` - Lazy loading, aspect ratios
- `Badge` - Status badges with colors
- `TagList` - Tags with overflow tooltip
- `DateField` - Relative/absolute dates
- `Avatar` - User avatars with fallback
- `Link` - Internal/external links
- `Markdown` - Rich content rendering

## Demo

Visit `/ontology-demo` to see live examples of:
- Course cards
- Product cards
- Blog post cards
- Grid layouts
- Table views

## Documentation

- **Specification**: `/one/things/components/card.md`
- **Architecture**: `/one/things/plans/ontology-ui-approach.md`
- **Implementation**: `/one/things/products/ontology-ui-shadcn.md`

---

**Built with shadcn/ui for accessible, beautiful UI out of the box.**
