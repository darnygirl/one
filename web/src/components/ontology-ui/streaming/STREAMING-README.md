# Streaming & Real-time Components

**Phase 1 of the ontology-ui component library - Real-time data streaming, collaboration, and chat**

Built with Convex real-time database, react-window virtualization, recharts, and Framer Motion.

---

## Components Overview

### 1. StreamingChart

**Live data visualization with smooth updates**

```tsx
import { StreamingChart } from '@/components/ontology-ui/streaming';

<StreamingChart
  data={chartData}
  type="line" // or "bar" | "area"
  title="Real-time Metrics"
  color="hsl(var(--primary))"
  maxDataPoints={50}
  height={300}
  onDataPointClick={(point) => console.log(point)}
/>
```

**Features:**
- Live data updates from Convex
- Line, bar, and area chart types
- Smooth transitions (500ms ease-out)
- Real-time tooltips with formatted values
- Auto-limits to maxDataPoints for performance
- Live indicator badge when new data arrives

**Use cases:**
- Real-time analytics dashboards
- Live metrics monitoring
- Performance tracking
- User activity graphs

---

### 2. LiveActivityFeed

**Real-time activity stream with time-based grouping**

```tsx
import { LiveActivityFeed } from '@/components/ontology-ui/streaming';

<LiveActivityFeed
  events={events}
  onLoadMore={handleLoadMore}
  hasMore={true}
  isLoading={false}
/>
```

**Features:**
- Infinite scroll with intersection observer
- Time-based grouping (Today, Yesterday, Last 7 days, Earlier)
- "New activity" badge with pulse animation
- Smooth scroll to top when new items arrive
- Sticky time period headers
- Fade-in animations for new items

**Use cases:**
- Activity feeds
- Audit logs
- Notification streams
- Event timelines

---

### 3. CollaborationCursor

**Multi-user cursor tracking for collaborative editing**

```tsx
import { CollaborationCursor, useCursorBroadcast } from '@/components/ontology-ui/streaming';

const { broadcastCursor } = useCursorBroadcast(userId, userName, color);

<CollaborationCursor
  cursors={cursors}
  onCursorMove={broadcastCursor}
  showLabels={true}
  cursorTimeout={5000}
/>
```

**Features:**
- Real-time cursor position tracking
- Color-coded cursors per user
- Username labels with custom colors
- Auto-hides inactive cursors (5s timeout)
- Smooth animations with Framer Motion
- Throttled broadcasts (20fps) for performance

**Use cases:**
- Collaborative document editing
- Whiteboard collaboration
- Multi-user design tools
- Real-time code editors

---

### 4. ChatMessage

**Individual chat message with rich content support**

```tsx
import { ChatMessage } from '@/components/ontology-ui/streaming';

<ChatMessage
  message={{
    _id: "msg_1",
    userId: "user_1",
    userName: "John Doe",
    content: "Hello world!",
    timestamp: Date.now(),
    type: "text", // or "code" | "markdown"
    reactions: [{ emoji: "👍", count: 5, userIds: ["user_2"] }],
  }}
  currentUserId="user_1"
  onReact={(messageId, emoji) => {}}
  onDelete={(messageId) => {}}
/>
```

**Features:**
- Text, code block, and markdown support
- User avatar and timestamp
- Reaction system with emoji support
- Copy message button
- Edit/delete for own messages
- "Edited" badge
- Smooth hover animations

**Use cases:**
- Chat applications
- Team messaging
- Code collaboration
- Support systems

---

### 5. ChatMessageList

**Virtualized scrollable message list with performance optimization**

```tsx
import { ChatMessageList } from '@/components/ontology-ui/streaming';

<ChatMessageList
  messages={messages}
  currentUserId="user_1"
  height={600}
  itemHeight={80}
  onLoadMore={loadOlderMessages}
  hasMore={true}
  onReact={handleReact}
  onDelete={handleDelete}
/>
```

**Features:**
- Virtualization with react-window (handles 10,000+ messages)
- Auto-scroll to bottom on new messages
- "Jump to latest" button when scrolled up
- Load more on scroll to top
- Scroll position persistence
- Non-virtualized variant for < 100 messages

**Virtualized vs Simple:**

| Feature | ChatMessageList | SimpleChatMessageList |
|---------|----------------|---------------------|
| Max messages | 10,000+ | < 100 |
| Virtualization | Yes | No |
| Performance | High | Medium |
| DOM nodes | ~10 | All |
| Use when | Large chats | Small chats |

**Use cases:**
- High-volume chat rooms
- Message history
- Support tickets
- Comment threads

---

### 6. ChatInput

**Multi-line input with typing indicators and autocomplete**

```tsx
import { ChatInput } from '@/components/ontology-ui/streaming';

<ChatInput
  onSend={(message, type) => sendMessage(message, type)}
  onTyping={handleTyping}
  typingUsers={typingUsers}
  placeholder="Type a message..."
  maxLength={5000}
  onAttachment={handleFileUpload}
  mentions={[
    { id: "user_1", name: "John Doe" },
    { id: "user_2", name: "Jane Smith" },
  ]}
/>
```

**Features:**
- Multi-line textarea with auto-resize
- Send on Enter, new line on Shift+Enter
- @ mention autocomplete
- Typing indicators (dot animation)
- Code block toggle
- File attachment button
- Character count (shows at 80% of limit)
- Debounced typing broadcasts

**Use cases:**
- Chat interfaces
- Comment systems
- Collaborative editing
- Support chats

---

## Real-time Integration with Convex

All streaming components are designed to work seamlessly with Convex real-time database:

### Example: Live Chat with Convex

```tsx
// 1. Query messages in real-time
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function LiveChat({ channelId }: { channelId: string }) {
  // Real-time message query
  const messages = useQuery(api.chat.messages.list, { channelId });

  // Send message mutation
  const sendMessage = useMutation(api.chat.messages.send);

  // Delete message mutation
  const deleteMessage = useMutation(api.chat.messages.delete);

  // React to message mutation
  const reactToMessage = useMutation(api.chat.messages.react);

  return (
    <div className="flex flex-col h-screen">
      <ChatMessageList
        messages={messages || []}
        currentUserId={userId}
        onReact={reactToMessage}
        onDelete={deleteMessage}
      />

      <ChatInput
        onSend={(content, type) =>
          sendMessage({ channelId, content, type })
        }
      />
    </div>
  );
}
```

### Example: Real-time Activity Feed

```tsx
function ActivityDashboard({ groupId }: { groupId: string }) {
  // Real-time events query
  const events = useQuery(api.events.list, {
    groupId,
    limit: 50
  });

  return (
    <LiveActivityFeed
      events={events || []}
      onLoadMore={() => {
        // Load more logic
      }}
    />
  );
}
```

### Example: Streaming Charts

```tsx
function MetricsDashboard({ groupId }: { groupId: string }) {
  // Real-time metrics query
  const metrics = useQuery(api.analytics.metrics, {
    groupId,
    timeRange: "1h"
  });

  // Transform to chart data
  const chartData = metrics?.map(m => ({
    timestamp: m.timestamp,
    value: m.value,
    label: m.label,
  })) || [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <StreamingChart
        data={chartData}
        type="line"
        title="Active Users"
      />

      <StreamingChart
        data={chartData}
        type="area"
        title="Revenue"
      />
    </div>
  );
}
```

---

## Performance Optimization

### Virtualization Strategy

**When to use virtualization:**
- Lists with > 100 items
- High-frequency updates
- Mobile devices

**ChatMessageList** uses react-window to render only visible items:

```
10,000 messages → Only 10-15 DOM nodes rendered
= 99.8% fewer DOM operations
= 60fps scrolling performance
```

### Throttling & Debouncing

**CollaborationCursor** throttles cursor updates to 20fps:
```typescript
// 50ms throttle = 20 updates/second
const THROTTLE_MS = 50;
```

**ChatInput** debounces typing indicators:
```typescript
// Only broadcast "typing" once per 3 seconds
const TYPING_TIMEOUT_MS = 3000;
```

### Animation Performance

All components use:
- **Framer Motion** for GPU-accelerated animations
- **CSS transforms** instead of layout properties
- **will-change** hints for browsers
- **requestAnimationFrame** for smooth updates

---

## Accessibility

All components follow WCAG 2.1 Level AA:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Focus management
- ✅ Color contrast (4.5:1 minimum)
- ✅ Reduced motion support

---

## TypeScript Types

```typescript
// Chart types
export type ChartType = "line" | "bar" | "area";

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
  [key: string]: any;
}

// Chat types
export interface ChatMessageData {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  type?: "text" | "code" | "markdown";
  language?: string;
  reactions?: Reaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface TypingUser {
  userId: string;
  userName: string;
}

// Cursor types
export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}
```

---

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

test('renders message content', () => {
  const message = {
    _id: '1',
    userId: 'user_1',
    userName: 'John',
    content: 'Hello',
    timestamp: Date.now(),
  };

  render(<ChatMessage message={message} />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

test('shows edit button for own messages', () => {
  const message = { /* ... */ };
  render(<ChatMessage message={message} currentUserId="user_1" />);
  // Hover to show actions
  fireEvent.mouseEnter(screen.getByText('Hello'));
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});
```

---

## Component Dependencies

```json
{
  "dependencies": {
    "convex": "^1.28.2",
    "recharts": "^2.15.4",
    "react-window": "^1.8.10",
    "framer-motion": "^12.23.24",
    "@radix-ui/react-*": "shadcn/ui components"
  }
}
```

---

## Next Steps

**Phase 2: Interactive Components**
- Drag & drop kanban boards
- Real-time forms
- Live search with highlights
- Collaborative whiteboards

**Phase 3: Advanced Features**
- Voice/video chat integration
- Screen sharing
- WebRTC peer connections
- End-to-end encryption

---

## Examples

See `/web/src/components/ontology-ui/streaming/example.tsx` for complete working examples.

---

**Built with performance, accessibility, and real-time collaboration in mind.**
