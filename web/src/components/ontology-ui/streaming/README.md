# Streaming & Real-time Components

AI streaming components with token-by-token rendering, thinking indicators, tool calls, and generative UI.

## Components

### 1. StreamingResponse
AI response with token-by-token streaming and typing effect.

**Features:**
- Token-by-token streaming with configurable speed
- Blinking cursor animation during streaming
- Stop generation button
- Smooth typing effect

**Usage:**
```tsx
import { StreamingResponse } from '@/components/ontology-ui/streaming';

<StreamingResponse
  content={aiResponse}
  isStreaming={true}
  onStop={() => stopGeneration()}
  showCursor={true}
  speed={30} // ms per character
/>
```

### 2. ThinkingIndicator
Animated thinking/reasoning display with progress tracking.

**Features:**
- 3 animation variants: dots, spinner, pulse
- Progress percentage display
- Stage/status messages
- Smooth animations

**Usage:**
```tsx
import { ThinkingIndicator } from '@/components/ontology-ui/streaming';

<ThinkingIndicator
  isThinking={true}
  message="AI is thinking..."
  progress={45}
  stage="Analyzing data"
  variant="dots"
/>
```

**Variants:**
- `dots` - Animated bouncing dots (default)
- `spinner` - Rotating spinner icon
- `pulse` - Pulsing brain icon

### 3. ToolCallDisplay
Display tool calls with expandable details and syntax highlighting.

**Features:**
- Expandable/collapsible interface
- Status badges (pending, running, completed, error)
- JSON syntax highlighting
- Timestamps
- Arguments and results display

**Usage:**
```tsx
import { ToolCallDisplay } from '@/components/ontology-ui/streaming';

const toolCall = {
  id: 'call_123',
  name: 'search_database',
  arguments: { query: 'products', limit: 10 },
  result: { count: 42, items: [...] },
  status: 'completed',
  timestamp: new Date(),
};

<ToolCallDisplay
  toolCall={toolCall}
  defaultExpanded={false}
/>
```

**Tool Call Status:**
- `pending` - Queued for execution
- `running` - Currently executing
- `completed` - Successfully completed
- `error` - Failed with error

### 4. GenerativeUIContainer
Container for generative UI components with error boundaries and sandboxing.

**Features:**
- Error boundary for safe rendering
- Loading states
- Sandboxed rendering (isolated CSS)
- Automatic error recovery
- Error callbacks

**Usage:**
```tsx
import { GenerativeUIContainer } from '@/components/ontology-ui/streaming';

<GenerativeUIContainer
  loading={isGenerating}
  loadingMessage="Generating dashboard..."
  sandbox={true}
  onError={(error, errorInfo) => logError(error)}
>
  <DynamicallyGeneratedUI />
</GenerativeUIContainer>
```

### 5. CodeBlockStreaming
Code blocks with syntax highlighting, streaming support, and copy functionality.

**Features:**
- Line-by-line streaming
- Syntax highlighting via Shiki
- Copy to clipboard button
- Line numbers
- Language badge
- Filename display
- Dark/light themes

**Usage:**
```tsx
import { CodeBlockStreaming } from '@/components/ontology-ui/streaming';

<CodeBlockStreaming
  code={sourceCode}
  language="typescript"
  filename="example.ts"
  isStreaming={true}
  showLineNumbers={true}
  theme="dark"
/>
```

**Supported Languages:**
All languages supported by Shiki (100+ languages including TypeScript, Python, Rust, Go, etc.)

### 6. MarkdownStreaming
Markdown with live rendering as it streams.

**Features:**
- Word-by-word streaming for smooth rendering
- Full GFM (GitHub Flavored Markdown) support
- Tables, lists, code blocks, blockquotes
- No flickering during render
- Optional cursor animation
- Styled prose output

**Usage:**
```tsx
import { MarkdownStreaming } from '@/components/ontology-ui/streaming';

<MarkdownStreaming
  content={markdownContent}
  isStreaming={true}
  speed={20}
  showCursor={false}
/>
```

**Supported Markdown:**
- Headings (h1-h6)
- Bold, italic, strikethrough
- Lists (ordered, unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Tables
- Links and images
- Horizontal rules

## Types

```typescript
interface StreamingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
}

interface ThinkingState {
  isThinking: boolean;
  message?: string;
  progress?: number;
  stage?: string;
}

interface CodeBlock {
  code: string;
  language: string;
  filename?: string;
  isStreaming?: boolean;
}
```

## Complete Example: AI Chat Interface

```tsx
import {
  StreamingResponse,
  ThinkingIndicator,
  ToolCallDisplay,
  CodeBlockStreaming,
  MarkdownStreaming,
} from '@/components/ontology-ui/streaming';

export function AIChatInterface() {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  return (
    <div className="space-y-4">
      {/* Messages */}
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.role === 'user' ? (
            <div className="bg-muted p-4 rounded-lg">
              {msg.content}
            </div>
          ) : (
            <MarkdownStreaming
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          )}
        </div>
      ))}

      {/* Thinking indicator */}
      {isThinking && (
        <ThinkingIndicator
          isThinking={true}
          message="Analyzing your request..."
          variant="dots"
        />
      )}

      {/* Tool calls */}
      {toolCalls.map((call) => (
        <ToolCallDisplay key={call.id} toolCall={call} />
      ))}
    </div>
  );
}
```

## Performance

All components are optimized for performance:
- Debounced streaming updates
- Efficient re-renders
- Lazy syntax highlighting
- Memoized calculations
- Smooth animations (60fps)

## Accessibility

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support
- Reduced motion support

## Dependencies

- `react` - UI framework
- `framer-motion` - Animations
- `shiki` - Syntax highlighting
- `marked` - Markdown parsing
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android Chrome 90+)
