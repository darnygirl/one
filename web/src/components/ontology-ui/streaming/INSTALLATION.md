# Installation & Setup

## Dependencies

All required dependencies are already installed:

```json
{
  "recharts": "^2.15.4",           // ✅ Installed - For StreamingChart
  "react-window": "^1.8.10",       // ✅ Installed - For ChatMessageList
  "framer-motion": "^12.23.24",    // ✅ Installed - For animations
  "convex": "^1.28.2",             // ✅ Installed - Real-time database
  "@radix-ui/*": "latest"          // ✅ Installed - shadcn/ui components
}
```

## Quick Start

### 1. Import Components

```tsx
import {
  StreamingChart,
  LiveActivityFeed,
  CollaborationCursor,
  ChatMessage,
  ChatMessageList,
  ChatInput,
} from '@/components/ontology-ui/streaming';
```

### 2. Basic Usage

**Real-time Chart:**
```tsx
<StreamingChart
  data={metrics}
  type="line"
  title="Active Users"
  height={300}
/>
```

**Activity Feed:**
```tsx
<LiveActivityFeed
  events={events}
  onLoadMore={loadMore}
  hasMore={true}
/>
```

**Chat System:**
```tsx
<div className="flex flex-col h-screen">
  <ChatMessageList
    messages={messages}
    currentUserId={userId}
  />
  <ChatInput
    onSend={handleSend}
    typingUsers={typingUsers}
  />
</div>
```

**Collaboration Cursors:**
```tsx
<CollaborationCursor
  cursors={activeCursors}
  onCursorMove={handleCursorMove}
  showLabels={true}
/>
```

## Convex Integration

All components work seamlessly with Convex:

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  // Real-time query
  const data = useQuery(api.myModule.list);

  // Real-time mutation
  const update = useMutation(api.myModule.update);

  return <StreamingChart data={data || []} />;
}
```

## File Locations

```
/web/src/components/ontology-ui/streaming/
├── StreamingChart.tsx          # Live charts
├── LiveActivityFeed.tsx        # Activity stream
├── CollaborationCursor.tsx     # Multi-user cursors
├── ChatMessage.tsx             # Individual message
├── ChatMessageList.tsx         # Message list (virtualized)
├── ChatInput.tsx               # Message input
├── index.ts                    # Exports
├── STREAMING-README.md         # Full documentation
├── PHASE-1-COMPLETE.md         # Completion summary
└── INSTALLATION.md             # This file
```

## TypeScript Support

All components are fully typed:

```typescript
import type {
  ChartDataPoint,
  ChatMessageData,
  CursorPosition,
  TypingUser,
  Reaction,
} from '@/components/ontology-ui/streaming';
```

## Next Steps

1. ✅ Components are ready to use
2. ✅ TypeScript types are defined
3. ✅ Convex integration works out of the box
4. ✅ Documentation is complete

See `STREAMING-README.md` for detailed usage examples.
