# 🎉 Chat Interface Demo Guide

## 🚀 Quick Start

```bash
cd web
bun run dev
```

Then open your browser to:
- **Main Chat:** http://localhost:4321/chat
- **Generative UI Demo:** http://localhost:4321/chat/genui

---

## 🌟 Main Features

### 1. **Centered Prompt UI** ✨
- Beautiful centered prompt on empty state
- Smooth transition to bottom after first message
- Just like ChatGPT!

### 2. **15+ AI Models** 🤖
**Free Models (No API Key):**
- Gemini 2.5 Flash Lite
- Polaris Alpha
- DeepSeek R1T2 Chimera
- GLM 4.5 Air
- DeepSeek R1T Chimera

**Premium Models (Requires OpenRouter API Key):**
- Claude Sonnet 4.5
- GPT-5
- Gemini 2.5 Pro
- Grok 4 Fast
- And 10+ more!

### 3. **8 Working AI Tools** 🛠️

#### Weather Tool
```
"What's the weather in San Francisco?"
"Show me the weather in Tokyo"
```
- Real-time weather data (wttr.in API)
- Temperature, humidity, wind, UV index
- No API key required!

#### Web Search Tool
```
"Search for latest AI news"
"Find information about TypeScript"
```
- DuckDuckGo integration
- Instant answers + related topics

#### Calculator Tool
```
"Calculate 25 * 48 + sqrt(144)"
"What is sin(45) * 100?"
```
- Safe math evaluation
- Supports advanced functions

#### Translation Tool
```
"Translate 'Hello World' to Spanish"
"Translate 'Bonjour' to English"
```
- Multi-language support
- Auto language detection

#### Time/Date Tool
```
"What time is it in New York?"
"Get current time in Tokyo"
```
- Multiple timezones
- 12h/24h formats

#### Currency Converter
```
"Convert 100 USD to EUR"
"How much is 50 GBP in JPY?"
```
- Real-time exchange rates
- 150+ currencies supported

#### Code Formatter
```
"Format this JSON: {name:test,value:123}"
"Beautify this JavaScript code"
```
- JSON, JavaScript, TypeScript, Python
- Auto-indentation

#### UUID Generator
```
"Generate 5 UUIDs"
"Create a short ID"
```
- Standard UUID v4
- Short IDs (8 chars)
- Nano IDs (21 chars)

### 4. **Generative UI** 🎨

```
"Generate a sales chart (demo)"
"Create a data table (demo)"
"Build a contact form (demo)"
"Show project timeline (demo)"
```

- Dynamic charts (line, bar, pie, area)
- Beautiful data tables
- Forms and timelines
- Real-time rendering

### 5. **Conversation History** 💾
- Auto-save all conversations
- Export to JSON or Markdown
- Search past chats
- Delete conversations

### 6. **Keyboard Shortcuts** ⌨️
- `Enter` - Send message
- `Shift+Enter` - New line
- `Cmd/Ctrl+K` - New chat (coming soon)
- `Cmd/Ctrl+L` - Clear conversation (coming soon)
- `Escape` - Stop generation (coming soon)

---

## 🎯 Demo Scenarios

### Scenario 1: Weather & Travel Planning
```
1. "What's the weather in Paris?"
2. "What time is it there?"
3. "Convert 100 USD to EUR"
```

### Scenario 2: Developer Workflow
```
1. "Generate 3 UUIDs"
2. "Format this JSON: {test:123,data:abc}"
3. "Calculate 1024 * 768"
```

### Scenario 3: Research & Analysis
```
1. "Search for latest AI developments"
2. "Translate the results to Spanish"
3. "Generate a chart showing AI progress (demo)"
```

### Scenario 4: Multi-Model Comparison
```
1. Ask same question to Gemini (free)
2. Switch to GPT-4 (requires API key)
3. Compare responses
```

---

## 🔧 Configuration

### Add OpenRouter API Key
1. Click "Add API Key" button
2. Get free key from: https://openrouter.ai/keys
3. Enter key and save
4. Unlock all premium models!

### Select Model
- Click model selector in input area
- Choose from 15+ models
- Free models work without API key
- Premium models require API key

---

## 📦 Architecture

```
/chat/index.astro          # Main chat page
  └─ ChatClient.tsx        # Production chat client

/components/chat/
  ├─ ChatClient.tsx        # Main chat logic
  ├─ DemoCard.tsx          # Demo suggestion cards
  ├─ HeroSection.tsx       # Hero with gradient
  ├─ CenteredPrompt.tsx    # Animated prompt
  └─ ConversationSidebar.tsx # History sidebar

/lib/chat/
  ├─ types.ts              # TypeScript types
  ├─ constants.ts          # Configuration
  ├─ models.ts             # 15+ AI models
  ├─ demos.ts              # Demo suggestions
  ├─ history.ts            # Conversation persistence
  └─ keyboard.ts           # Keyboard shortcuts

/lib/ai-tools/
  ├─ registry.ts           # Tool registry
  ├─ types.ts              # Tool interfaces
  └─ tools/
      ├─ weather.ts        # Weather API
      ├─ websearch.ts      # DuckDuckGo
      ├─ calculator.ts     # Math eval
      ├─ translation.ts    # Multi-lang
      ├─ time.ts           # Timezone
      ├─ currency.ts       # Exchange rates
      ├─ code-formatter.ts # Code beautify
      └─ uuid.ts           # ID generation

/components/ai-tools/
  ├─ WeatherCard.tsx       # Weather display
  ├─ SearchResults.tsx     # Search display
  └─ CalculatorResult.tsx  # Calc display

/api/
  ├─ chat.ts               # Main API endpoint
  └─ genui.ts              # Generative UI API
```

---

## 🎨 UI Features

### Empty State
- Beautiful hero with gradient text
- Demo cards in 4 categories
- Centered prompt input
- Model selector inline

### Chat State
- Messages in conversation view
- Smooth scroll behavior
- Copy message button
- Loading indicators
- Error handling

### Prompt Input
- Auto-resize textarea
- Voice input button
- Model selector
- Send button with loading state

### Theme
- Dark mode optimized
- Beautiful gradients
- Smooth animations
- Responsive design

---

## 🐛 Troubleshooting

### Chat not loading?
```bash
# Restart dev server
cd web
bun run dev
```

### Tools not working?
- Check browser console for errors
- Some tools require external APIs
- Network connection required

### API key not saving?
- Check localStorage permissions
- Try incognito mode
- Clear browser cache

---

## 📊 Progress: 25/100 Cycles

```
[████████░░░░░░░░░░░░░░░░░░░░░░░░░░] 25%

✅ Phase 1: Setup & Cleanup (100%)
✅ Phase 2: UI/UX Enhancement (100%)
⏳ Phase 3: AI Tools Integration (32%)
⏳ Phase 4: Advanced Features (0%)
⏳ Phase 5: Performance (0%)
⏳ Phase 6: Testing & Docs (0%)
⏳ Phase 7: Deployment (0%)
```

---

## 🔗 Links

- **Full Plan:** `/one/events/chat-transformation-100-cycle-plan.md`
- **Progress Report:** `/one/events/chat-transformation-progress.md`
- **OpenRouter:** https://openrouter.ai/keys

---

## 💡 Tips

1. **Start with free models** - No API key needed!
2. **Try demo cards** - Quick way to see generative UI
3. **Use tools** - Ask about weather, search, calculations
4. **Export conversations** - Save important chats
5. **Keyboard shortcuts** - Faster workflow

---

**Built with:** React 19, Astro 5, Tailwind v4, TypeScript, OpenRouter API

**Status:** Phase 3 in progress (Cycles 26-50)

Enjoy the demo! 🚀
