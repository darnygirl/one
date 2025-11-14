# Generative UI Components - Phase 4

**AI-powered UI generation components for chat interfaces**

This directory contains 7 components (cycles 90-96) for building generative UI experiences in AI chat applications.

---

## Components

### Cycle 90: UIComponentPreview
**Preview generated UI components in sandbox**

Features:
- Iframe isolation or Shadow DOM for safe preview
- Interactive props editor
- Copy code button with clipboard support
- Responsive preview modes (mobile, tablet, desktop)

```tsx
import { UIComponentPreview } from '@/components/ontology-ui/generative';

<UIComponentPreview
  componentCode={generatedCode}
  componentName="CustomButton"
  initialProps={{ label: "Click me", variant: "primary" }}
  onPropsChange={handlePropsChange}
/>
```

---

### Cycle 91: UIComponentEditor
**Edit generated component code**

Features:
- Syntax highlighting (Monaco editor or CodeMirror)
- Live preview of changes
- Undo/redo functionality
- Save to component library

```tsx
import { UIComponentEditor } from '@/components/ontology-ui/generative';

<UIComponentEditor
  initialCode={code}
  componentName="MyComponent"
  language="tsx"
  onSave={handleSave}
  onPreview={handlePreview}
  autoSave
/>
```

---

### Cycle 92: UIComponentLibrary
**Browse generated UI components**

Features:
- Search and filter components
- Tags/categories organization
- Favorites system
- Export/import functionality

```tsx
import { UIComponentLibrary } from '@/components/ontology-ui/generative';

<UIComponentLibrary
  components={savedComponents}
  onComponentSelect={handleSelect}
  onExport={handleExport}
  onImport={handleImport}
/>
```

---

### Cycle 93: DynamicForm
**Forms generated from AI**

Features:
- Field validation (client-side and server-side)
- Conditional logic (show/hide fields based on values)
- Multi-step support
- Submit to Convex backend

```tsx
import { DynamicForm } from '@/components/ontology-ui/generative';

<DynamicForm
  title="Contact Form"
  description="Get in touch with us"
  fields={[
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "message", label: "Message", type: "textarea", required: true },
  ]}
  onSubmit={handleSubmit}
/>
```

---

### Cycle 94: DynamicTable
**Tables generated from data**

Features:
- Sorting, filtering, pagination
- Export to CSV
- Column customization
- Responsive design

```tsx
import { DynamicTable } from '@/components/ontology-ui/generative';

<DynamicTable
  title="User Data"
  data={users}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true, filterable: true },
    { key: "role", label: "Role", filterable: true },
  ]}
  exportable
  paginated
/>
```

---

### Cycle 95: DynamicChart
**Charts from natural language queries**

Features:
- Multiple chart types (bar, line, pie, area, scatter)
- Interactive tooltips
- Export to image
- Responsive design

```tsx
import { DynamicChart } from '@/components/ontology-ui/generative';

<DynamicChart
  title="Sales by Region"
  data={[
    { label: "North", value: 120 },
    { label: "South", value: 90 },
    { label: "East", value: 150 },
    { label: "West", value: 80 },
  ]}
  defaultType="bar"
  showLegend
  exportable
/>
```

---

### Cycle 96: DynamicDashboard
**Full dashboards from natural language**

Features:
- Drag-drop widgets
- Layout persistence (localStorage)
- Real-time data from Convex
- Responsive grid system

```tsx
import { DynamicDashboard } from '@/components/ontology-ui/generative';

<DynamicDashboard
  title="Analytics Dashboard"
  initialWidgets={[
    {
      id: "1",
      type: "stat",
      title: "Total Users",
      position: { x: 0, y: 0 },
      size: { width: 4, height: 2 },
      data: { value: 1234, label: "Users" },
    },
    {
      id: "2",
      type: "chart",
      title: "Revenue",
      position: { x: 4, y: 0 },
      size: { width: 8, height: 4 },
    },
  ]}
  realtime
  groupId={currentGroupId}
/>
```

---

## Integration with AI Chat

These components are designed to work with AI chat interfaces like CopilotKit or custom chat implementations:

```tsx
import { DynamicForm, DynamicChart, DynamicDashboard } from '@/components/ontology-ui/generative';

// In your AI chat component
function AIChat() {
  const [generatedUI, setGeneratedUI] = useState(null);

  const handleAIResponse = (response) => {
    // Parse AI response to determine which component to render
    if (response.type === 'form') {
      setGeneratedUI(
        <DynamicForm
          title={response.title}
          fields={response.fields}
          onSubmit={handleFormSubmit}
        />
      );
    } else if (response.type === 'chart') {
      setGeneratedUI(
        <DynamicChart
          title={response.title}
          data={response.data}
          defaultType={response.chartType}
        />
      );
    } else if (response.type === 'dashboard') {
      setGeneratedUI(
        <DynamicDashboard
          title={response.title}
          initialWidgets={response.widgets}
        />
      );
    }
  };

  return (
    <div>
      <ChatInterface onResponse={handleAIResponse} />
      {generatedUI && <div className="mt-4">{generatedUI}</div>}
    </div>
  );
}
```

---

## Technology Stack

- **React 19** - Component framework
- **TypeScript** - Type safety
- **shadcn/ui** - Base UI components
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Convex** - Real-time backend (optional)
- **nanostores** - State management

---

## Use Cases

1. **AI-powered form builders** - Generate forms from natural language
2. **Data visualization** - Create charts from queries
3. **Component libraries** - Save and reuse generated components
4. **Dashboard builders** - Build custom dashboards with drag-drop
5. **Code editors** - Edit and preview generated code
6. **Component marketplaces** - Share components with teams

---

**Phase 4 Complete:** 7 generative UI components ready for AI chat integration.
