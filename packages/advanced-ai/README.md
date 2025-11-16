# @one-platform/advanced-ai

Advanced AI tools for the ONE Platform - 22+ client-side tools including calculator, weather, search, translation, image generation, code execution, and more.

## Features

- 🧮 **Calculator** - Mathematical expressions, scientific functions, unit conversions
- 🌤️ **Weather** - 7-day forecasts, alerts, location-based data
- 🔍 **Web Search** - Internet search with credibility scoring
- 🌐 **Translation** - 100+ languages with phonetics
- ⏰ **Time & Timezone** - World clock, countdown timers
- 💱 **Currency** - Real-time exchange rates for 150+ currencies
- 🎨 **Color Tools** - Conversion, palettes, contrast checking
- 🔐 **Encoding** - Base64, URL encoding, hex conversion
- 🔑 **Hash** - MD5, SHA-256, bcrypt password hashing
- 📝 **Markdown** - Parse and render markdown
- 🎲 **Lorem Ipsum** - Generate placeholder text
- 🔒 **Password Generator** - Secure password generation
- 🔗 **URL Shortener** - Shorten URLs
- 📋 **QR Code** - Generate QR codes
- 🎯 **UUID** - Generate UUIDs (v4, v5)
- 💻 **Code Formatter** - Format code (JS, Python, etc.)
- 🖼️ **Image Generation** - AI image creation (Stable Diffusion, DALL-E)
- 📁 **File Processor** - Upload and process files
- ⚙️ **Code Executor** - Sandbox JavaScript and Python execution
- 🎤 **Voice Tools** - Text-to-speech and speech-to-text
- 🔧 **JSON Tools** - Validate, format, minify JSON
- 🎭 **Regex Tools** - Test and generate regex patterns

## Installation

\`\`\`bash
npm install @one-platform/advanced-ai
# or
bun add @one-platform/advanced-ai
\`\`\`

## Quick Start

### Using AI Tools (Core Functionality)

\`\`\`typescript
import { toolRegistry, registerAllTools } from '@one-platform/advanced-ai';

// Register all tools
registerAllTools();

// Execute a tool
const result = await toolRegistry.execute('calculator', {
  expression: 'sqrt(144) + 25 * 3'
});

console.log(result); // { result: 87, ... }
\`\`\`

### Using React Components

> **Note:** The React components require shadcn/ui components and lucide-react icons. Ensure you have these installed and properly configured in your project with path aliases (e.g., `@/components/ui/*`).

\`\`\`tsx
import { AIToolsPanel, ChatClient, ToolCall } from '@one-platform/advanced-ai/components';

// Display AI Tools Panel with calculator, weather, search, etc.
function MyApp() {
  return (
    <div>
      <AIToolsPanel />
    </div>
  );
}

// Or use the full chat client with tool integration
function ChatApp() {
  return (
    <ChatClient
      apiEndpoint="/api/chat"
      model="google/gemini-2.5-flash-lite"
    />
  );
}
\`\`\`

### Available Components

**Chat Interfaces:**
- \`ChatClient\` - Full-featured chat with settings and model selection
- \`ChatClientV2\` - Advanced chat with streaming support
- \`SimpleChatClient\` - Minimal chat interface
- \`FreeChatClient\` - Chat optimized for free models
- \`Chatbot\` - Embedded chatbot widget

**Tool Components:**
- \`AIToolsPanel\` - Panel with calculator, weather, search, translation
- \`ToolCall\` - Display tool execution results

**Message Components:**
- \`Message\` - Display a single message
- \`MessageList\` - List of messages with scrolling
- \`AgentMessage\` - AI agent message with reasoning

**Display Components:**
- \`CodeBlock\` - Syntax-highlighted code display
- \`LoadingIndicator\` - Loading animation
- \`Reasoning\` - Display AI reasoning process
- \`FileUploader\` - File upload with progress
- \`ImageGallery\` - Image grid display

**Input Components:**
- \`PromptInput\` - User input with suggestions
- \`Suggestions\` - Quick action suggestions

**Elements & Examples:**
- \`import * from '@one-platform/advanced-ai/components/elements'\` - 35+ UI elements
- \`import * from '@one-platform/advanced-ai/components/examples'\` - 20+ example implementations

## License

MIT © ONE Platform Team
