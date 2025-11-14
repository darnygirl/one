# Visualization Components

Advanced data visualization components for the 6-dimension ontology. These components provide powerful tools for visualizing complex data relationships, hierarchies, timelines, and patterns.

## Components

### 1. HeatmapChart

Visualize activity patterns and correlations across two dimensions with color-coded intensity.

**Features:**
- Interactive zoom controls (zoom in/out)
- Configurable color scales (min, mid, max colors)
- Cell tooltips on hover
- Value labels on cells
- Export to CSV and PNG
- Responsive design
- Color legend

**Props:**
```typescript
interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title?: string;
  colorScale?: { min: string; mid: string; max: string };
  minValue?: number;
  maxValue?: number;
  cellWidth?: number;
  cellHeight?: number;
  showLabels?: boolean;
  showTooltip?: boolean;
  onCellClick?: (point: HeatmapDataPoint) => void;
  exportable?: boolean;
}

interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}
```

**Example:**
```tsx
import { HeatmapChart } from "@/components/ontology-ui/visualization";

const activityData = [
  { x: "Mon", y: "9AM", value: 23 },
  { x: "Mon", y: "12PM", value: 45 },
  { x: "Tue", y: "9AM", value: 28 },
  // ...
];

<HeatmapChart
  data={activityData}
  title="User Activity Heatmap"
  cellWidth={80}
  cellHeight={50}
  exportable={true}
/>
```

### 2. NetworkDiagram

Force-directed network graph for visualizing relationships and connections between entities.

**Features:**
- Multiple layout algorithms:
  - Force-directed (default)
  - Hierarchical
  - Radial
  - Circular
- Interactive node clustering with color coding
- Link strength visualization (line thickness and animation)
- Drag nodes to reposition
- Zoom and pan controls
- Real-time network statistics
- Node selection with details panel

**Props:**
```typescript
interface NetworkDiagramProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  title?: string;
  showClusters?: boolean;
  interactive?: boolean;
  layoutType?: "force" | "hierarchical" | "radial" | "circular";
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
}

interface NetworkNode {
  id: string;
  label: string;
  type?: string;
  cluster?: string;
  data?: Record<string, unknown>;
}

interface NetworkLink {
  source: string;
  target: string;
  label?: string;
  strength?: number;
  type?: string;
}
```

**Example:**
```tsx
import { NetworkDiagram } from "@/components/ontology-ui/visualization";

const nodes = [
  { id: "1", label: "Alice", type: "creator", cluster: "team-a" },
  { id: "2", label: "Bob", type: "user", cluster: "team-a" },
  { id: "3", label: "Charlie", type: "admin", cluster: "team-b" },
];

const links = [
  { source: "1", target: "2", label: "follows", strength: 0.9 },
  { source: "2", target: "3", label: "collaborates", strength: 0.7 },
];

<NetworkDiagram
  nodes={nodes}
  links={links}
  title="Team Network"
  showClusters={true}
  layoutType="force"
/>
```

### 3. TreemapChart

Hierarchical treemap visualization with nested rectangles and drill-down navigation.

**Features:**
- Nested rectangle layout
- Click to drill down into children
- Breadcrumb navigation
- Back button to navigate up hierarchy
- Hover tooltips with details
- Responsive rectangle sizing
- Hierarchical statistics (items, total value, depth)
- Customizable color schemes

**Props:**
```typescript
interface TreemapChartProps {
  data: TreemapNode[];
  title?: string;
  enableDrilldown?: boolean;
  showTooltip?: boolean;
  colorScheme?: string[];
  aspectRatio?: number;
  onNodeClick?: (node: TreemapNode) => void;
}

interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
  color?: string;
  data?: Record<string, unknown>;
}
```

**Example:**
```tsx
import { TreemapChart } from "@/components/ontology-ui/visualization";

const contentData = [
  {
    name: "Courses",
    children: [
      {
        name: "Web Development",
        value: 450,
        children: [
          { name: "React Basics", value: 120 },
          { name: "TypeScript Advanced", value: 180 },
        ],
      },
      {
        name: "Data Science",
        value: 380,
        children: [
          { name: "Python", value: 140 },
          { name: "ML Basics", value: 160 },
        ],
      },
    ],
  },
];

<TreemapChart
  data={contentData}
  title="Content Hierarchy"
  enableDrilldown={true}
  showTooltip={true}
/>
```

### 4. GanttChart

Project timeline visualization with task dependencies, milestones, and progress tracking.

**Features:**
- Task bars with progress indicators
- Dependency visualization (arrows between tasks)
- Milestone markers (diamond shapes)
- Status indicators:
  - Pending (gray)
  - In Progress (blue)
  - Completed (green)
  - Blocked (red)
- Drag tasks to reschedule (if enabled)
- Click to select task and view details
- Timeline with month headers
- Task details panel

**Props:**
```typescript
interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
  showProgress?: boolean;
  showDependencies?: boolean;
  showMilestones?: boolean;
  enableDrag?: boolean;
  onTaskClick?: (task: GanttTask) => void;
  onTaskDrag?: (taskId: string, newStart: Date, newEnd: Date) => void;
}

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number;
  dependencies?: string[];
  milestone?: boolean;
  status?: "pending" | "in-progress" | "completed" | "blocked";
  assignee?: string;
  data?: Record<string, unknown>;
}
```

**Example:**
```tsx
import { GanttChart } from "@/components/ontology-ui/visualization";

const projectTasks = [
  {
    id: "1",
    name: "Planning",
    start: new Date(2025, 10, 1),
    end: new Date(2025, 10, 7),
    progress: 1,
    status: "completed",
  },
  {
    id: "2",
    name: "Development",
    start: new Date(2025, 10, 8),
    end: new Date(2025, 10, 30),
    progress: 0.6,
    status: "in-progress",
    dependencies: ["1"],
  },
  {
    id: "3",
    name: "Launch",
    start: new Date(2025, 11, 1),
    end: new Date(2025, 11, 1),
    milestone: true,
    dependencies: ["2"],
  },
];

<GanttChart
  tasks={projectTasks}
  title="Project Timeline"
  showProgress={true}
  showDependencies={true}
  showMilestones={true}
/>
```

## Usage in Astro Pages

All components are React components and must use the `client:*` directive:

```astro
---
import {
  HeatmapChart,
  NetworkDiagram,
  TreemapChart,
  GanttChart,
} from "@/components/ontology-ui/visualization";
import Layout from "@/layouts/Layout.astro";

// Prepare your data
const heatmapData = [...];
const networkData = { nodes: [...], links: [...] };
---

<Layout title="Data Visualization">
  <!-- Critical charts: load immediately -->
  <HeatmapChart client:load data={heatmapData} />

  <!-- Secondary charts: load when idle -->
  <NetworkDiagram client:idle nodes={networkData.nodes} links={networkData.links} />

  <!-- Below-fold charts: load when visible -->
  <TreemapChart client:visible data={treeData} />
  <GanttChart client:visible tasks={projectTasks} />
</Layout>
```

## Technology Stack

- **HeatmapChart**: Custom SVG implementation
- **NetworkDiagram**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **TreemapChart**: [recharts](https://recharts.org/)
- **GanttChart**: Custom implementation with date-fns

## Dependencies

All required dependencies are already installed:

```json
{
  "@xyflow/react": "^12.9.2",
  "recharts": "^2.15.4",
  "date-fns": "^4.1.0"
}
```

## Ontology Mapping

These visualization components map to the 6-dimension ontology:

### Things Dimension
- Visualize products, courses, tokens, agents as nodes in NetworkDiagram
- Show hierarchical content in TreemapChart

### Connections Dimension
- Display relationships as links in NetworkDiagram
- Show ownership, follows, collaborations

### Events Dimension
- Timeline events in GanttChart
- Activity patterns in HeatmapChart

### Knowledge Dimension
- Cluster visualization in NetworkDiagram
- Hierarchical taxonomy in TreemapChart

### Groups Dimension
- Group memberships as network clusters
- Group hierarchy as treemap

### People Dimension
- User activity in HeatmapChart
- User connections in NetworkDiagram
- Team tasks in GanttChart

## Performance Considerations

1. **Large datasets**: Consider data pagination or aggregation
2. **Real-time updates**: Use `client:load` for live data
3. **Below-fold charts**: Use `client:visible` to defer loading
4. **Interactive features**: Enable only when needed

## Accessibility

All components include:
- ARIA labels
- Keyboard navigation support
- Screen reader compatible tooltips
- High contrast mode support
- Focus indicators

## Customization

### Color Schemes

Components use CSS variables for theming:

```css
--chart-1: 220 70% 50%;
--chart-2: 160 60% 45%;
--chart-3: 30 80% 55%;
--chart-4: 280 65% 60%;
--chart-5: 340 75% 55%;
```

### Responsive Design

All components are responsive and adapt to container width:

```astro
<div class="w-full max-w-4xl">
  <HeatmapChart client:load data={data} />
</div>
```

## Demo Page

View live examples at: `/demos/visualization`

## Support

For issues or questions, see:
- Main documentation: `/web/src/components/ontology-ui/README.md`
- Component plan: `/web/src/components/ontology-ui/CYCLE-PLAN-2.md`
- Ontology docs: `/one/knowledge/ontology.md`
