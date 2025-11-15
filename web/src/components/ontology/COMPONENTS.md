# Ontology UI Components - Complete Reference

**25 production-ready components** for building applications with the ONE Platform's 6-dimension ontology.

## Core Components

### Card (Universal Renderer)
Renders ANY thing type based on ontology configuration.

```tsx
import { Card } from "@/components/ontology";

<Card thing={myThing} view="card" onClick={(thing) => {...}} />
```

**Props:**
- `thing`: Thing to render
- `view`: "card" | "list" | "detail"
- `onClick`: Custom click handler
- `showActions`: Show action buttons (default: true)
- `showConnections`: Show connection badges (default: true)

---

## Layout Components

### ThingGrid
Responsive grid layout for things.

```tsx
<ThingGrid things={courses} onThingClick={(thing) => {...}} />
```

### ThingList
Vertical list layout.

```tsx
<ThingList things={products} onThingClick={(thing) => {...}} />
```

### ThingTable
Sortable table with headers.

```tsx
<ThingTable things={posts} onRowClick={(post) => {...}} />
```

### ThingDetail
Single thing detail view.

```tsx
<ThingDetail thing={course} />
```

---

## Search & Filter Components

### SearchBar
Debounced search with clear button.

```tsx
<SearchBar
  onSearch={(query) => setSearchQuery(query)}
  placeholder="Search courses..."
  debounceMs={300}
/>
```

### FilterPanel
Advanced filtering UI with Sheet/Drawer.

```tsx
<FilterPanel
  thingType="course"
  filters={filters}
  onFiltersChange={setFilters}
/>
```

**Filter Types:**
- Checkbox filters (multi-select)
- Range filters (slider)
- Category filters

### SortDropdown
Sort things by fields.

```tsx
<SortDropdown
  options={courseSortOptions}
  value={sortOption}
  onChange={setSortOption}
/>
```

**Preset Options:**
- `courseSortOptions`
- `productSortOptions`
- `postSortOptions`

---

## Pagination & Infinite Scroll

### Pagination
Page-based navigation with page size selector.

```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  pageSize={20}
  totalItems={200}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

### InfiniteScroll
Auto-load more things as user scrolls.

```tsx
<InfiniteScroll
  things={things}
  hasMore={hasMore}
  loading={loading}
  onLoadMore={loadMore}
  view="card"
  threshold={500}
/>
```

---

## Modal & Preview Components

### ThingPreview
Quick preview modal/drawer for things.

```tsx
<ThingPreview
  thing={selectedThing}
  open={previewOpen}
  onOpenChange={setPreviewOpen}
  mode="auto" // "dialog" | "drawer" | "auto"
/>
```

### ShareDialog
Share things via social media, email, or copy link.

```tsx
<ShareDialog thing={course}>
  <Button>Share</Button>
</ShareDialog>
```

**Features:**
- Twitter, Facebook, LinkedIn, Email
- Copy link to clipboard
- Native share API (mobile)

---

## Data Display Components

### StatsCard
Display aggregate statistics with trends.

```tsx
<StatsCard
  stats={[
    {
      label: "Total Sales",
      value: "$12,345",
      change: 12.5,
      trend: "up",
      changeLabel: "from last month",
    },
    // ... more stats
  ]}
/>
```

### RelatedThings
Show related or recommended things.

```tsx
<RelatedThings
  thing={course}
  maxItems={4}
  title="Related Courses"
/>
```

### ThingTimeline
Timeline of events for a thing.

```tsx
<ThingTimeline thing={course} maxEvents={10} />
```

---

## Form & Actions Components

### ThingForm
Dynamic form generator based on thing type.

```tsx
<ThingForm
  thingType="course"
  initialData={course}
  onSubmit={async (data) => {
    await saveCourse(data);
  }}
  onCancel={() => setEditing(false)}
/>
```

**Features:**
- Auto-generates fields from ontology config
- Supports all field types (text, price, badges, images, etc.)
- Validation ready
- Loading states

### BulkActions
Perform actions on multiple selected things.

```tsx
<BulkActions
  selectedThings={selected}
  onSelectAll={setSelectAll}
  onDelete={handleBulkDelete}
  onArchive={handleBulkArchive}
  onExport={handleBulkExport}
  customActions={[
    {
      label: "Add to Featured",
      action: (things) => {...},
    },
  ]}
/>
```

---

## Utility Components

### EmptyState
Empty state with icon and action button.

```tsx
<EmptyState
  config={{
    icon: "BookOpen",
    title: "No courses yet",
    description: "Get started by creating your first course",
    action: {
      label: "Create Course",
      variant: "default",
    },
  }}
  onAction={() => navigate("/courses/new")}
/>
```

### Actions
Action buttons for things (used internally by Card).

```tsx
<Actions
  thing={course}
  primary={{ action: "enroll", label: "Enroll Now" }}
  secondary={[...]}
  context={[...]}
/>
```

### ConnectionBadges
Display relationships (used internally by Card).

```tsx
<ConnectionBadges thing={course} config={connectionConfig} />
```

---

## Field Components (8 types)

Used internally by `Field` component, but can be used standalone:

- **Heading**: Headings with size/weight variants
- **Text**: Text with icon, truncation, expandable
- **Price**: Currency formatting, badges, strikethrough
- **Image**: Lazy loading, aspect ratios, skeleton
- **TagList**: Tags with overflow tooltip
- **DateField**: Relative/absolute date formatting
- **Link**: Internal/external links with icons
- **Markdown**: Rich content rendering

---

## Usage Patterns

### Complete Thing List Page

```tsx
import {
  SearchBar,
  FilterPanel,
  SortDropdown,
  ThingGrid,
  Pagination,
  StatsCard,
  courseSortOptions,
} from "@/components/ontology";

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState(courseSortOptions[0]);
  const [page, setPage] = useState(1);

  return (
    <div className="container py-8">
      {/* Stats */}
      <StatsCard stats={stats} className="mb-8" />

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <SearchBar onSearch={setSearch} className="flex-1" />
        <FilterPanel
          thingType="course"
          filters={filters}
          onFiltersChange={setFilters}
        />
        <SortDropdown
          options={courseSortOptions}
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* Grid */}
      <ThingGrid things={courses} />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={20}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Thing Detail Page with Related Items

```tsx
function CourseDetailPage() {
  return (
    <div className="container py-8">
      <ThingDetail thing={course} />

      <div className="mt-12">
        <RelatedThings thing={course} title="You might also like" />
      </div>

      <div className="mt-12">
        <ThingTimeline thing={course} />
      </div>
    </div>
  );
}
```

### Infinite Scroll Feed

```tsx
function FeedPage() {
  return (
    <InfiniteScroll
      things={posts}
      hasMore={hasMore}
      loading={loading}
      onLoadMore={loadMore}
      view="list"
    />
  );
}
```

---

## Complete Component List

| Component | Purpose | Lines |
|-----------|---------|-------|
| Card | Universal thing renderer | 150 |
| Field | Field router | 200 |
| Actions | Action handler | 180 |
| ConnectionBadges | Relationship display | 100 |
| EmptyState | Empty states | 50 |
| ThingGrid | Grid layout | 80 |
| ThingList | List layout | 60 |
| ThingTable | Table layout | 120 |
| ThingDetail | Detail view | 40 |
| SearchBar | Debounced search | 80 |
| FilterPanel | Advanced filtering | 200 |
| SortDropdown | Sorting | 100 |
| Pagination | Page navigation | 150 |
| ThingPreview | Quick preview | 80 |
| ShareDialog | Social sharing | 150 |
| RelatedThings | Recommendations | 80 |
| StatsCard | Metrics display | 100 |
| InfiniteScroll | Auto-load more | 120 |
| ThingForm | Dynamic forms | 250 |
| BulkActions | Multi-select actions | 120 |
| ThingTimeline | Event timeline | 130 |
| **8 Field Components** | Field rendering | 600 |
| **TOTAL** | **25 components** | **3,020** |

---

**Every component is fully typed, accessible, and production-ready.**
