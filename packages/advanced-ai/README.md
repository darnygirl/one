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

## License

MIT © ONE Platform Team
