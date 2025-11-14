# 🧪 AI Tools Testing Guide

**100 Cycles Complete! Here's how to test everything.**

## 🚀 Quick Start

```bash
cd web
bun run dev
```

Visit: **http://localhost:4321/chat**

---

## 📍 Pages to Visit

### 1. **Main Chat Interface**
**URL:** `http://localhost:4321/chat`

**What you'll see:**
- Minimal UI with centered prompt input
- 6 prompt suggestion pills above the input
- Clean, distraction-free interface

**Try clicking these suggestions:**
- ☀️ "What's the weather in San Francisco?"
- 🔍 "Search for latest AI news"
- 🧮 "Calculate sqrt(144) + 25 * 3"
- 🌍 "Translate 'Hello World' to Spanish"
- 🕐 "What time is it in Tokyo?"
- 💰 "Convert 100 USD to EUR"

---

## 🎯 Test Prompts by Tool Category

### ☀️ WEATHER TOOL (Enhanced)

**Simple weather:**
```
What's the weather in London?
```

**7-day forecast:**
```
Show me a 7-day forecast for Tokyo
```

**Weather with coordinates:**
```
Get weather for 37.7749,-122.4194
```

**Weather alerts:**
```
Are there any weather alerts in Miami?
```

---

### 🔍 WEB SEARCH TOOL (Enhanced)

**Basic search:**
```
Search for latest developments in AI
```

**Site-specific search:**
```
Search for "machine learning" on site:github.com
```

**News search:**
```
Search for news about Tesla
```

**Image search:**
```
Search for images of sunset
```

---

### 🧮 CALCULATOR TOOL (Enhanced)

**Basic math:**
```
Calculate 2 + 2 * 5
```

**Scientific functions:**
```
Calculate sin(45) + cos(30)
```

**Unit conversion:**
```
Convert 100 kilometers to miles
```

**Complex numbers:**
```
Calculate (3+4i) * (2-i)
```

**Temperature conversion:**
```
Convert 98.6 Fahrenheit to Celsius
```

---

### 🌍 TRANSLATION TOOL (Enhanced)

**Simple translation:**
```
Translate "Hello, how are you?" to French
```

**Auto-detect language:**
```
Translate "Bonjour" to English
```

**With pronunciation:**
```
Translate "Thank you" to Japanese with pronunciation
```

**Multiple languages:**
```
Translate "Good morning" to Spanish, French, and German
```

---

### 🕐 TIME/DATE TOOL (Enhanced)

**World clock:**
```
What time is it in New York, London, and Tokyo?
```

**Meeting time finder:**
```
Find a good meeting time for people in San Francisco, New York, and London
```

**Countdown timer:**
```
How many days until Christmas 2024?
```

**Date calculation:**
```
What date is 45 days from today?
```

---

### 💰 CURRENCY TOOL (Enhanced)

**Basic conversion:**
```
Convert 100 USD to EUR
```

**Cryptocurrency:**
```
Convert 1 Bitcoin to USD
```

**Multiple currencies:**
```
Convert 1000 USD to EUR, GBP, and JPY
```

**Portfolio tracking:**
```
Calculate value of 2 BTC + 10 ETH + 1000 USD
```

---

### 🎨 QR CODE GENERATOR

**Simple QR:**
```
Generate a QR code for https://one.ie
```

**Colored QR:**
```
Create a QR code for "Hello World" with blue foreground and yellow background
```

**Large QR:**
```
Generate a 512x512 QR code for my email: hello@example.com
```

---

### 🔗 URL SHORTENER

**Shorten URL:**
```
Shorten this URL: https://example.com/very/long/url/path
```

**Custom alias:**
```
Create a short URL for https://example.com with alias "mysite"
```

**With QR code:**
```
Shorten https://github.com and show me the QR code
```

---

### 🎨 COLOR TOOLS

**Color conversion:**
```
Convert #FF5733 to RGB and HSL
```

**Generate palette:**
```
Generate a complementary color palette for #3498db
```

**Accessibility check:**
```
Check WCAG contrast between #000000 and #FFFFFF
```

**Gradient:**
```
Create a gradient from red to blue
```

---

### 🔐 BASE64 ENCODER/DECODER

**Encode text:**
```
Encode "Hello World" to Base64
```

**Decode:**
```
Decode SGVsbG8gV29ybGQ= from Base64
```

**URL encoding:**
```
URL encode "hello world & foo=bar"
```

**JWT decode:**
```
Decode this JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
```

---

### #️⃣ HASH GENERATOR

**Generate hashes:**
```
Generate SHA-256 hash for "password123"
```

**Multiple algorithms:**
```
Hash "Hello World" with MD5, SHA-1, and SHA-256
```

**Compare hashes:**
```
Generate all hashes for "secret"
```

---

### 📋 JSON TOOLS

**Validate JSON:**
```
Validate this JSON: {"name": "John", "age": 30}
```

**Format JSON:**
```
Format this: {"name":"John","age":30,"city":"NYC"}
```

**Minify JSON:**
```
Minify this:
{
  "name": "John",
  "age": 30
}
```

**JSON to YAML:**
```
Convert {"name": "John", "age": 30} to YAML
```

---

### 🔍 REGEX TESTER

**Test pattern:**
```
Test regex pattern \d{3}-\d{2}-\d{4} against "123-45-6789"
```

**Email validation:**
```
Test if "user@example.com" matches email pattern
```

**Extract phone numbers:**
```
Find all phone numbers in: "Call 555-1234 or 555-5678"
```

---

### 📝 LOREM IPSUM

**Generate paragraphs:**
```
Generate 3 paragraphs of lorem ipsum
```

**In Spanish:**
```
Generate 2 paragraphs of lorem ipsum in Spanish
```

**With markdown:**
```
Generate lorem ipsum with headings and lists
```

---

### 🔐 PASSWORD GENERATOR

**Random password:**
```
Generate a 16-character password with uppercase, lowercase, numbers, and symbols
```

**Passphrase:**
```
Generate a 6-word passphrase
```

**Bulk passwords:**
```
Generate 10 secure passwords
```

---

### 📄 MARKDOWN PREVIEW

**Preview markdown:**
```
Render this markdown:
# Hello
- Item 1
- Item 2
**Bold text**
```

**With code blocks:**
```
Preview this:
```js
function hello() {
  console.log("Hi");
}
```
```

---

### 💻 CODE FORMATTER

**Format JavaScript:**
```
Format this code: function test(){console.log('hi')}
```

**Python formatting:**
```
Format this Python: def hello():print("Hi")
```

**Multiple languages:**
```
Format and detect language: const x=5;const y=10;console.log(x+y)
```

---

### 🆔 UUID GENERATOR

**Generate UUID:**
```
Generate 5 UUIDs
```

**Specific format:**
```
Generate 10 UUID v4
```

**Short codes:**
```
Generate 20 short codes
```

**Validate UUID:**
```
Validate this UUID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🔗 Tool Chaining Examples

### Chain 1: Weather Research
```
Search for weather in Paris, then get the detailed forecast
```

### Chain 2: Translation QR
```
Translate "Hello World" to Japanese and create a QR code for it
```

### Chain 3: URL Processing
```
Shorten https://example.com/long/url and generate a QR code
```

### Chain 4: Color Accessibility
```
Convert #FF5733 to RGB, generate a palette, and check WCAG accessibility
```

### Chain 5: Secure Data
```
Hash "secret data" with SHA-256 and encode to Base64
```

---

## 📊 Advanced Features Testing

### 📁 File Upload
```
Upload an image and analyze it
Upload a CSV and show me the data
Process this PDF file
```

### 🖼️ Image Generation
```
Generate an image of a sunset over mountains
Create a 512x512 artistic image of a cat
Generate a photorealistic portrait
```

### 💻 Code Execution
```
Execute this JavaScript: console.log([1,2,3,4,5].map(x => x * 2))
Run this Python code: print([x**2 for x in range(10)])
Calculate fibonacci(10) in JavaScript
```

### 🔊 Voice Tools
```
Read this text aloud: "Hello, this is a test of the text-to-speech system"
Convert speech to text (use microphone)
Read the weather forecast aloud
```

---

## 🎛️ UI Components to Test

### Tool Browser
Visit the tool browser to see all 22 tools in a visual gallery.

**Features to test:**
- Search for tools by name
- Filter by category (data, search, utility, encoding, dev, creative)
- Mark tools as favorites (star icon)
- View popular tools (by usage)
- See recent tools (last used)
- Click "Details" for full tool info
- Try "Try It" button to use a tool

### Tool Settings
Access settings to configure preferences.

**Features to test:**
- Set weather units (metric/imperial)
- Choose time format (12h/24h)
- Select default language
- Toggle theme (light/dark)
- Add API keys (OpenAI, Google Maps, etc.)
- Export settings to JSON
- Import settings from JSON
- Clear usage history
- Clear favorites
- Reset all settings

### Chain Builder
Create custom tool chains visually.

**Features to test:**
- Add nodes (select from 22 tools)
- Remove nodes
- Create edges (connections between tools)
- Configure node parameters
- Execute chain
- Watch real-time execution
- View results
- Save chain to localStorage
- Export chain as JSON
- Import chain from JSON
- Load preset chains (18 available)

### Chain Monitor
Watch chains execute in real-time.

**Features to test:**
- See node timeline
- View status indicators (pending/running/complete/error)
- Check performance metrics
- Expand result previews
- Download execution logs
- Monitor errors with details

### Cache Manager
Monitor and manage the caching system.

**Features to test:**
- View cache hit rate
- See total cache size
- Check entries count
- View per-tool statistics
- Configure max cache size
- Set TTL (time to live)
- Export cache data
- Import cache data
- Clear cache
- Refresh statistics

---

## 🏆 Success Criteria

✅ All 22 tools execute successfully
✅ Tool chaining works with multiple nodes
✅ Caching reduces response times (50-90%)
✅ Rate limiting prevents quota exhaustion
✅ Error handling shows user-friendly messages
✅ All UI components render correctly
✅ Mobile responsive on all screen sizes
✅ Dark mode works throughout
✅ Search and favorites persist across sessions
✅ Export/import functions work correctly

---

## 📊 Performance Benchmarks

**Expected Performance:**
- Weather tool: <500ms (first call), <50ms (cached)
- Web search: <1s (first call), <50ms (cached)
- Calculator: <10ms
- Translation: <2s (first call), <100ms (cached)
- Currency: <1s (first call), <50ms (cached)
- QR code: <200ms
- Hash generation: <10ms
- Code execution: <500ms (complex code)
- Image generation: 2-40s (provider-dependent)
- Chain execution: Sum of individual tool times

---

## 🐛 Common Issues & Solutions

### Issue: "API Key Required"
**Solution:** Add your API key in Tool Settings for premium features

### Issue: Rate limit exceeded
**Solution:** Wait for quota reset or upgrade to premium tier

### Issue: Tool not responding
**Solution:** Check cache manager, clear cache if needed

### Issue: Chain execution fails
**Solution:** Verify all tool parameters are correctly mapped

### Issue: File upload fails
**Solution:** Check file size (10MB free, 50MB premium)

---

## 📞 Support

For issues or questions:
- Check `/web/src/lib/ai-tools/README.md`
- Review `/web/src/lib/ai-tools/EXAMPLES.md`
- See `/web/src/lib/ai-tools/CONTRIBUTING.md`

---

**Happy Testing! 🚀**
