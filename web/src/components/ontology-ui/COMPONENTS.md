# Ontology UI Component Library

## 100 Components Mapped to the 6-Dimension Ontology

Built on top of shadcn/ui, these components provide a complete UI toolkit for building applications on the ONE Platform.

---

## 1. GROUPS Dimension (15 components)
*Multi-tenant containers with infinite nesting*

1. **GroupCard** - Display group information with metadata
2. **GroupList** - Scrollable list of groups with filtering
3. **GroupTree** - Hierarchical tree view of nested groups
4. **GroupSelector** - Dropdown selector for choosing groups
5. **GroupBreadcrumb** - Breadcrumb navigation through group hierarchy
6. **GroupCreator** - Form for creating new groups
7. **GroupSettings** - Settings panel for group configuration
8. **GroupMembers** - List of members in a group
9. **GroupHierarchy** - Visual hierarchy diagram
10. **GroupSwitcher** - Quick switcher between groups
11. **GroupInvite** - Invite form for adding members
12. **GroupPermissions** - Permission matrix for group access
13. **GroupStats** - Statistics dashboard for group metrics
14. **GroupBadge** - Small badge showing group name/icon
15. **GroupHeader** - Header component with group branding

---

## 2. PEOPLE Dimension (15 components)
*Authorization, roles, and user management*

16. **UserCard** - User profile card with avatar and details
17. **UserList** - List of users with filtering and search
18. **UserProfile** - Full user profile display
19. **UserAvatar** - Avatar component with status indicator
20. **UserRoleSelector** - Dropdown for selecting user roles
21. **UserPermissions** - Permission matrix for user access
22. **UserActivity** - Activity feed for user actions
23. **UserSearch** - Search component for finding users
24. **UserInvite** - Form for inviting new users
25. **TeamCard** - Card for displaying team information
26. **TeamList** - List of teams with members
27. **RoleBadge** - Badge showing user role (owner, user, customer)
28. **PermissionMatrix** - Grid showing permissions across roles
29. **UserPresence** - Real-time presence indicator
30. **UserMenu** - Dropdown menu for user actions

---

## 3. THINGS Dimension (20 components)
*All entities in the system (66+ types)*

31. **ThingCard** - Universal card for any thing type
32. **ThingList** - List of things with type filtering
33. **ThingGrid** - Grid layout for things
34. **ThingCreator** - Multi-step form for creating things
35. **ThingEditor** - Editor for updating thing properties
36. **ThingPreview** - Preview modal for things
37. **ThingActions** - Action menu for thing operations
38. **ThingMetadata** - Metadata panel showing thing properties
39. **ThingTags** - Tag manager for things
40. **ThingSearch** - Search component for finding things
41. **ThingFilter** - Advanced filtering interface
42. **ThingSort** - Sort controls for thing lists
43. **CourseCard** - Specialized card for courses
44. **LessonCard** - Card for displaying lessons
45. **TokenCard** - Card for displaying tokens
46. **AgentCard** - Card for AI agents
47. **ContentCard** - Card for content items
48. **ProductCard** - Card for products/services
49. **ThingTypeSelector** - Dropdown for selecting thing types
50. **ThingStatus** - Status indicator with state transitions

---

## 4. CONNECTIONS Dimension (12 components)
*All relationships between entities (25+ types)*

51. **ConnectionCard** - Card showing a connection relationship
52. **ConnectionList** - List of connections with type filtering
53. **ConnectionGraph** - Visual graph of connections
54. **RelationshipTree** - Tree view of relationships
55. **FollowButton** - Button for follow/unfollow actions
56. **OwnershipBadge** - Badge showing ownership relationship
57. **ConnectionCreator** - Form for creating connections
58. **RelationshipViewer** - Panel showing all relationships for an entity
59. **NetworkGraph** - D3/Canvas network visualization
60. **ConnectionTimeline** - Timeline of connection changes
61. **ConnectionTypeSelector** - Dropdown for connection types
62. **ConnectionStrength** - Visual indicator of connection strength

---

## 5. EVENTS Dimension (12 components)
*Complete audit trail (67+ event types)*

63. **EventCard** - Card displaying an event
64. **EventList** - List of events with filtering
65. **EventTimeline** - Timeline visualization of events
66. **ActivityFeed** - Real-time activity stream
67. **AuditLog** - Detailed audit log with search
68. **EventFilter** - Advanced event filtering
69. **EventSearch** - Search component for events
70. **EventDetails** - Detailed view of event data
71. **ChangeHistory** - History of changes to an entity
72. **NotificationCard** - Card for displaying notifications
73. **NotificationList** - List of notifications
74. **NotificationCenter** - Dropdown notification center

---

## 6. KNOWLEDGE Dimension (10 components)
*Labels, vectors, and semantic search*

75. **LabelCard** - Card for displaying labels
76. **LabelList** - List of labels with counts
77. **LabelCreator** - Form for creating labels
78. **TagCloud** - Visual tag cloud
79. **SearchBar** - Universal search bar with autocomplete
80. **SearchResults** - Search results with highlighting
81. **VectorSearch** - Semantic search interface
82. **KnowledgeGraph** - Visual knowledge graph
83. **CategoryTree** - Hierarchical category browser
84. **TaxonomyBrowser** - Browse and navigate taxonomies

---

## 7. UNIVERSAL Components (8 components)
*Cross-dimensional components that work with any dimension*

85. **OntologyCard** - Universal card that adapts to any dimension
86. **OntologyList** - Universal list component
87. **OntologyGrid** - Universal grid component
88. **OntologyTable** - Data table with sorting and filtering
89. **OntologyForm** - Dynamic form builder
90. **OntologyModal** - Modal dialog for any dimension
91. **OntologyDrawer** - Slide-out drawer
92. **OntologySheet** - Bottom sheet component

---

## 8. LAYOUT Components (8 components)
*Navigation and layout for ontology-aware apps*

93. **OntologyNav** - Navigation with dimension switching
94. **DimensionSwitcher** - Switch between 6 dimensions
95. **OntologyBreadcrumb** - Multi-level breadcrumb
96. **OntologySidebar** - Sidebar with dimension navigation
97. **OntologyHeader** - Header with group/user context
98. **OntologyFooter** - Footer with platform info
99. **CommandPalette** - Quick command/search palette
100. **QuickSwitcher** - Quick switcher for entities

---

## Component Architecture

All components follow these principles:

1. **Built on shadcn/ui** - Leverage existing components (Card, Button, Badge, etc.)
2. **Type-safe** - Full TypeScript with Convex schema types
3. **Dimension-aware** - Each component knows which dimension it belongs to
4. **Group-scoped** - All components respect `groupId` for multi-tenancy
5. **Real-time** - Use Convex queries/mutations for live updates
6. **Accessible** - WCAG 2.1 Level AA compliance
7. **Themeable** - Support dark/light modes via Tailwind theme
8. **Composable** - Can be combined to create complex UIs

---

## Directory Structure

```
/web/src/components/ontology-ui/
├── groups/           # GROUPS dimension (1-15)
├── people/           # PEOPLE dimension (16-30)
├── things/           # THINGS dimension (31-50)
├── connections/      # CONNECTIONS dimension (51-62)
├── events/           # EVENTS dimension (63-74)
├── knowledge/        # KNOWLEDGE dimension (75-84)
├── universal/        # Universal components (85-92)
├── layouts/          # Layout components (93-100)
├── types/            # Shared TypeScript types
├── hooks/            # Shared React hooks
└── utils/            # Shared utilities
```

---

## Usage Example

```tsx
import { GroupSelector } from '@/components/ontology-ui/groups/GroupSelector';
import { ThingCard } from '@/components/ontology-ui/things/ThingCard';
import { EventTimeline } from '@/components/ontology-ui/events/EventTimeline';

export function Dashboard() {
  return (
    <div>
      <GroupSelector />
      <ThingCard thingId="..." />
      <EventTimeline groupId="..." />
    </div>
  );
}
```

---

## 9. GENERATIVE Components (7 components)
*AI-powered UI generation for chat interfaces*

101. **UIComponentPreview** - Preview generated UI components in sandbox with iframe isolation
102. **UIComponentEditor** - Edit component code with syntax highlighting and live preview
103. **UIComponentLibrary** - Browse and manage generated components with search/filter
104. **DynamicForm** - AI-generated forms with validation and multi-step support
105. **DynamicTable** - Data tables with sorting, filtering, and CSV export
106. **DynamicChart** - Charts from natural language with multiple visualization types
107. **DynamicDashboard** - Full dashboards with drag-drop widgets and real-time data

---

**Total:** 107 components across 9 categories, all mapped to the 6-dimension ontology.
