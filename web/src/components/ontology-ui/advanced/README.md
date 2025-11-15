# Advanced UI Components

**Phase 3 - Advanced UI Features (Patterns)**

These components provide specialized, complex UI patterns for advanced interactions.

---

## Components (7 total)

### 1. MultiSelect

Advanced multi-select component with search and keyboard navigation.

**Features:**
- Checkbox groups
- Select all/none functionality
- Tag display for selected items
- Keyboard navigation (arrow keys, enter, escape)
- Search filtering

**Usage:**
```tsx
import { MultiSelect } from '@/components/ontology-ui/advanced';

const options = [
  { value: '1', label: 'Option 1', description: 'First option' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
];

<MultiSelect
  options={options}
  value={selectedValues}
  onChange={setSelectedValues}
  showSelectAll={true}
  searchPlaceholder="Search options..."
/>
```

---

### 2. DateRangePicker

Date range picker with calendar popup and quick presets.

**Features:**
- Calendar popup with two months
- Quick range presets (Today, Last 7 Days, This Month, etc.)
- Custom range selection
- Clear and Apply buttons

**Usage:**
```tsx
import { DateRangePicker } from '@/components/ontology-ui/advanced';

<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  showPresets={true}
  placeholder="Select date range..."
/>
```

**Built-in Presets:**
- Today
- Yesterday
- Last 7/30 Days
- This Week/Month/Year
- Last Week/Month/Year

---

### 3. RichTextEditor

Rich text editor with markdown support and formatting toolbar.

**Features:**
- Formatting toolbar (bold, italic, underline, headings)
- Markdown support
- Mentions (@user) with autocomplete
- Link and image insertion
- Markdown guide

**Usage:**
```tsx
import { RichTextEditor } from '@/components/ontology-ui/advanced';

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  enableMentions={true}
  onMention={async (query) => {
    // Return user suggestions
    return [{ id: '1', label: 'John Doe' }];
  }}
/>
```

**Note:** This is a simplified version. For production, consider:
- Lexical: `npm install lexical @lexical/react`
- Tiptap: `npm install @tiptap/react @tiptap/starter-kit`

---

### 4. FileUploader

File upload component with drag-drop and progress tracking.

**Features:**
- Drag and drop support
- Progress bars for uploads
- Image previews
- Multiple file support
- File type and size validation
- Upload status tracking

**Usage:**
```tsx
import { FileUploader } from '@/components/ontology-ui/advanced';

<FileUploader
  value={uploadedFiles}
  onChange={setUploadedFiles}
  onUpload={async (file) => {
    // Upload file and return URL
    const url = await uploadToServer(file);
    return url;
  }}
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={5}
  multiple={true}
  showPreview={true}
/>
```

---

### 5. ImageCropper

Image cropping component with zoom and rotation controls.

**Features:**
- Zoom controls (slider + buttons)
- Rotate controls (slider + 90° button)
- Aspect ratio presets (square, portrait, landscape, widescreen)
- Live preview
- Export to blob/URL

**Usage:**
```tsx
import { ImageCropper } from '@/components/ontology-ui/advanced';

<ImageCropper
  src={imageUrl}
  onCrop={(blob, url) => {
    // Handle cropped image
    console.log('Cropped image:', url);
  }}
  defaultAspectRatio={1} // Square
  showPreview={true}
/>
```

**Aspect Ratios:**
- Free (no constraint)
- Square (1:1)
- Portrait (3:4)
- Landscape (4:3)
- Widescreen (16:9)
- Banner (21:9)

**Note:** For production, consider:
- `react-easy-crop`: `npm install react-easy-crop`
- `react-image-crop`: `npm install react-image-crop`

---

### 6. ColorPicker

Advanced color picker with multiple input formats.

**Features:**
- RGB sliders with live preview
- HSL sliders with live preview
- Hex input with validation
- HTML5 color input
- Eyedropper tool (browser support required)
- Saved colors (localStorage)
- Preset color palettes
- Remove saved colors

**Usage:**
```tsx
import { ColorPicker } from '@/components/ontology-ui/advanced';

<ColorPicker
  value={color}
  onChange={setColor}
  showPresets={true}
  showSaved={true}
  showEyedropper={true}
  presets={['#FF0000', '#00FF00', '#0000FF']}
/>
```

**Supported Formats:**
- RGB: `rgb(255, 0, 0)`
- HSL: `hsl(0, 100%, 50%)`
- Hex: `#FF0000`

---

### 7. TimeSeriesChart

Time series chart with real-time updates and zoom controls.

**Features:**
- Multiple chart types (line, area, bar)
- Real-time data updates
- Zoom in/out/reset controls
- Pan with brush component
- Multiple series support
- Export to PNG
- Responsive design
- Grid and legend options

**Usage:**
```tsx
import { TimeSeriesChart } from '@/components/ontology-ui/advanced';

const data = [
  { timestamp: Date.now() - 60000, cpu: 45, memory: 60 },
  { timestamp: Date.now() - 30000, cpu: 55, memory: 65 },
  { timestamp: Date.now(), cpu: 50, memory: 62 },
];

const series = [
  { key: 'cpu', name: 'CPU Usage', color: '#8884d8' },
  { key: 'memory', name: 'Memory Usage', color: '#82ca9d' },
];

<TimeSeriesChart
  data={data}
  series={series}
  title="System Metrics"
  showLegend={true}
  showBrush={true}
  enableZoom={true}
  enableExport={true}
  height={400}
  onRefresh={() => fetchLatestData()}
/>
```

**Built on Recharts:**
- Already installed: `recharts@^2.15.4`
- Full TypeScript support
- Responsive by default

---

## Installation

All components are already integrated into the ontology-ui library.

```tsx
// Import individual components
import {
  MultiSelect,
  DateRangePicker,
  RichTextEditor,
  FileUploader,
  ImageCropper,
  ColorPicker,
  TimeSeriesChart,
} from '@/components/ontology-ui/advanced';

// Or import from main ontology-ui
import {
  MultiSelect,
  DateRangePicker,
  // ... all other components
} from '@/components/ontology-ui';
```

---

## Dependencies

These components use existing dependencies:

- **react-day-picker** - DateRangePicker calendar
- **recharts** - TimeSeriesChart visualization
- **date-fns** - Date formatting
- **lucide-react** - Icons
- **shadcn/ui** - Base UI components

No additional dependencies required!

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type {
  MultiSelectOption,
  MultiSelectProps,
  DateRangePickerProps,
  TimeSeriesDataPoint,
  TimeSeriesSeries,
  // ... etc
} from '@/components/ontology-ui/advanced';
```

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader support
- Color contrast compliance

---

## Responsive Design

All components are mobile-first and fully responsive:

- Touch-friendly controls
- Adaptive layouts
- Mobile-optimized interactions

---

## Performance

Components are optimized for performance:

- Memoization where appropriate
- Debounced search/filter operations
- Lazy rendering for large datasets
- Efficient re-renders

---

## Theme Support

All components support dark/light themes via Tailwind CSS:

```tsx
// Automatically adapts to current theme
<ColorPicker value={color} onChange={setColor} />
```

---

## Future Enhancements

Consider these upgrades for production:

### RichTextEditor
- Install Lexical or Tiptap for full WYSIWYG
- Add image upload handler
- Add code syntax highlighting
- Add table support

### ImageCropper
- Install react-easy-crop for better UX
- Add preset crop shapes (circle, rounded)
- Add filters and adjustments

### FileUploader
- Add Cloudflare R2/S3 integration
- Add drag-to-reorder
- Add image optimization
- Add video thumbnail generation

---

**Built with TypeScript, React 19, and shadcn/ui**
