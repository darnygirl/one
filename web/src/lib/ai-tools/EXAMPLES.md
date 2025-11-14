# AI Tools Examples

Comprehensive code examples for all 18 AI tools. Each example includes multiple use cases and integration patterns.

## Table of Contents

### Data & Information
1. [Weather Tool](#1-weather-tool)
2. [Web Search Tool](#2-web-search-tool)

### Utility Tools
3. [Calculator](#3-calculator)
4. [Time Tool](#4-time-tool)
5. [Currency Converter](#5-currency-converter)

### Encoding & Security
6. [Encoding Tool](#6-encoding-tool)
7. [Hash Tool](#7-hash-tool)
8. [Password Generator](#8-password-generator)

### Developer Tools
9. [Code Formatter](#9-code-formatter)
10. [UUID Generator](#10-uuid-generator)
11. [JSON Tools](#11-json-tools)
12. [Regex Tool](#12-regex-tool)
13. [Markdown Tool](#13-markdown-tool)

### Creative Tools
14. [QR Code Generator](#14-qr-code-generator)
15. [Color Tools](#15-color-tools)
16. [Lorem Ipsum](#16-lorem-ipsum)
17. [URL Shortener](#17-url-shortener)
18. [Translation](#18-translation)

---

## 1. Weather Tool

### Basic Usage

```typescript
import { toolRegistry } from '@/lib/ai-tools/registry';

// Get current weather for a city
const weather = await toolRegistry.execute('get_weather', {
  location: 'San Francisco',
  units: 'imperial'
});

console.log(weather);
// {
//   location: 'San Francisco',
//   temperature: 65,
//   feels_like: 62,
//   conditions: 'Partly cloudy',
//   humidity: 72,
//   wind_speed: 8,
//   ...
// }
```

### Multi-Day Forecast

```typescript
// Get 7-day forecast
const forecast = await toolRegistry.execute('get_weather', {
  location: 'London',
  units: 'metric',
  forecast_days: 7
});

forecast.forecast.forEach((day) => {
  console.log(`${day.date}: ${day.temp_high}°/${day.temp_low}° - ${day.conditions}`);
});
```

### Using Coordinates

```typescript
// Get weather by latitude/longitude
const weather = await toolRegistry.execute('get_weather', {
  location: '37.7749,-122.4194', // San Francisco coords
  units: 'metric'
});
```

### React Component Integration

```tsx
import { useState, useEffect } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function WeatherWidget({ city }: { city: string }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const result = await toolRegistry.execute('get_weather', {
          location: city,
          units: 'imperial',
          forecast_days: 3
        });
        setWeather(result);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  if (loading) return <div>Loading...</div>;
  if (!weather) return <div>Failed to load weather</div>;

  return (
    <div className="weather-widget">
      <h2>{weather.location}</h2>
      <div className="current">
        <span className="temp">{weather.temperature}°F</span>
        <span className="conditions">{weather.conditions}</span>
      </div>
      <div className="forecast">
        {weather.forecast.map((day) => (
          <div key={day.date}>
            <span>{day.date}</span>
            <span>{day.temp_high}° / {day.temp_low}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Web Search Tool

### Basic Search

```typescript
// Search the web
const results = await toolRegistry.execute('web_search', {
  query: 'AI tools 2024',
  num_results: 10
});

results.results.forEach((result) => {
  console.log(`${result.title}\n${result.url}\n${result.snippet}\n`);
});
```

### Filtered Search

```typescript
// Search with filters
const results = await toolRegistry.execute('web_search', {
  query: 'site:github.com typescript tools',
  num_results: 5
});
```

### Search with Caching

```typescript
import { cacheManager } from '@/lib/ai-tools/cache/manager';

// Search is cached for 1 hour by default
const query = 'machine learning tutorials';

// First call - cache miss
const results1 = await toolRegistry.execute('web_search', {
  query,
  num_results: 10
});

// Second call - cache hit (instant)
const results2 = await toolRegistry.execute('web_search', {
  query,
  num_results: 10
});

const stats = await cacheManager.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

---

## 3. Calculator

### Standard Mode

```typescript
// Basic arithmetic
const result = await toolRegistry.execute('calculator', {
  expression: '2 + 2 * 5',
  mode: 'standard'
});
console.log(result.result); // 12

// Decimal operations
const result2 = await toolRegistry.execute('calculator', {
  expression: '10 / 3',
  mode: 'standard'
});
console.log(result2.result); // 3.333...

// Parentheses
const result3 = await toolRegistry.execute('calculator', {
  expression: '(2 + 3) * 4',
  mode: 'standard'
});
console.log(result3.result); // 20
```

### Scientific Mode

```typescript
// Trigonometry
const result = await toolRegistry.execute('calculator', {
  expression: 'sin(45) + cos(45)',
  mode: 'scientific'
});

// Logarithms
const result2 = await toolRegistry.execute('calculator', {
  expression: 'log(100)',
  mode: 'scientific'
});

// Square roots and powers
const result3 = await toolRegistry.execute('calculator', {
  expression: 'sqrt(16) + pow(2, 8)',
  mode: 'scientific'
});
console.log(result3.result); // 4 + 256 = 260
```

### Unit Conversion

```typescript
// Temperature
const celsius = await toolRegistry.execute('calculator', {
  expression: '100',
  mode: 'unit_conversion',
  unit_from: 'celsius',
  unit_to: 'fahrenheit'
});
console.log(celsius.result); // 212

// Length
const meters = await toolRegistry.execute('calculator', {
  expression: '1000',
  mode: 'unit_conversion',
  unit_from: 'meters',
  unit_to: 'feet'
});

// Weight
const pounds = await toolRegistry.execute('calculator', {
  expression: '100',
  mode: 'unit_conversion',
  unit_from: 'kilograms',
  unit_to: 'pounds'
});

// Data
const gb = await toolRegistry.execute('calculator', {
  expression: '1024',
  mode: 'unit_conversion',
  unit_from: 'megabytes',
  unit_to: 'gigabytes'
});
```

### Calculator Component

```tsx
import { useState } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('standard');

  async function calculate() {
    try {
      const res = await toolRegistry.execute('calculator', {
        expression,
        mode
      });
      setResult(res.result.toString());
    } catch (error) {
      setResult('Error: ' + error.message);
    }
  }

  return (
    <div className="calculator">
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="standard">Standard</option>
        <option value="scientific">Scientific</option>
        <option value="unit_conversion">Unit Conversion</option>
      </select>

      <input
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression"
      />

      <button onClick={calculate}>Calculate</button>

      <div className="result">{result}</div>
    </div>
  );
}
```

---

## 4. Time Tool

### Current Time

```typescript
// Get current time in a timezone
const time = await toolRegistry.execute('get_time', {
  mode: 'current',
  timezone: 'America/New_York'
});

console.log(`${time.time} ${time.date}`);
// "14:30:00 2024-03-15"
```

### World Clock

```typescript
// Get time in multiple timezones
const worldClock = await toolRegistry.execute('get_time', {
  mode: 'world_clock',
  timezones: [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]
});

worldClock.times.forEach((t) => {
  console.log(`${t.timezone}: ${t.time} (${t.offset})`);
});
```

### Countdown Timer

```typescript
// Countdown to a specific date
const countdown = await toolRegistry.execute('get_time', {
  mode: 'countdown',
  target_date: '2025-12-31T23:59:59Z'
});

console.log(`${countdown.days} days, ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`);
```

### Stopwatch

```typescript
// Start a stopwatch
const stopwatch = await toolRegistry.execute('get_time', {
  mode: 'stopwatch',
  action: 'start'
});

// Later: stop the stopwatch
const final = await toolRegistry.execute('get_time', {
  mode: 'stopwatch',
  action: 'stop',
  start_time: stopwatch.start_time
});

console.log(`Elapsed: ${final.elapsed}ms`);
```

### World Clock Component

```tsx
import { useState, useEffect } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function WorldClock({ timezones }: { timezones: string[] }) {
  const [times, setTimes] = useState([]);

  useEffect(() => {
    async function updateTimes() {
      const result = await toolRegistry.execute('get_time', {
        mode: 'world_clock',
        timezones
      });
      setTimes(result.times);
    }

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [timezones]);

  return (
    <div className="world-clock">
      {times.map((t) => (
        <div key={t.timezone} className="time-zone">
          <span className="city">{t.timezone.split('/')[1]}</span>
          <span className="time">{t.time}</span>
          <span className="offset">{t.offset}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. Currency Converter

### Basic Conversion

```typescript
// Convert USD to EUR
const result = await toolRegistry.execute('currency', {
  amount: 100,
  from: 'USD',
  to: 'EUR'
});

console.log(`$100 USD = €${result.result} EUR`);
console.log(`Exchange rate: ${result.rate}`);
```

### Multiple Conversions

```typescript
// Convert to multiple currencies
const amount = 1000;
const currencies = ['EUR', 'GBP', 'JPY', 'AUD'];

for (const currency of currencies) {
  const result = await toolRegistry.execute('currency', {
    amount,
    from: 'USD',
    to: currency
  });

  console.log(`$${amount} USD = ${result.symbol}${result.result} ${currency}`);
}
```

### Currency Converter Component

```tsx
import { useState } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState(null);

  async function convert() {
    const res = await toolRegistry.execute('currency', {
      amount,
      from,
      to
    });
    setResult(res);
  }

  return (
    <div className="currency-converter">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
      </select>

      <span>to</span>

      <select value={to} onChange={(e) => setTo(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
      </select>

      <button onClick={convert}>Convert</button>

      {result && (
        <div className="result">
          {result.symbol}{result.result.toFixed(2)} {to}
          <div className="rate">Rate: {result.rate}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Encoding Tool

### Base64 Encoding

```typescript
// Encode to base64
const encoded = await toolRegistry.execute('encoding', {
  text: 'Hello World',
  operation: 'encode',
  format: 'base64'
});
console.log(encoded.result); // SGVsbG8gV29ybGQ=

// Decode from base64
const decoded = await toolRegistry.execute('encoding', {
  text: 'SGVsbG8gV29ybGQ=',
  operation: 'decode',
  format: 'base64'
});
console.log(decoded.result); // Hello World
```

### Hex Encoding

```typescript
// Encode to hex
const hex = await toolRegistry.execute('encoding', {
  text: 'Hello',
  operation: 'encode',
  format: 'hex'
});
console.log(hex.result); // 48656c6c6f

// Decode from hex
const text = await toolRegistry.execute('encoding', {
  text: '48656c6c6f',
  operation: 'decode',
  format: 'hex'
});
console.log(text.result); // Hello
```

### URL Encoding

```typescript
// URL encode
const encoded = await toolRegistry.execute('encoding', {
  text: 'Hello World! #special',
  operation: 'encode',
  format: 'url'
});
console.log(encoded.result); // Hello%20World%21%20%23special

// URL decode
const decoded = await toolRegistry.execute('encoding', {
  text: 'Hello%20World%21%20%23special',
  operation: 'decode',
  format: 'url'
});
console.log(decoded.result); // Hello World! #special
```

---

## 7. Hash Tool

### Generate Hashes

```typescript
// SHA-256 hash
const sha256 = await toolRegistry.execute('hash', {
  text: 'password123',
  algorithm: 'sha256'
});
console.log(sha256.hash);

// MD5 hash
const md5 = await toolRegistry.execute('hash', {
  text: 'password123',
  algorithm: 'md5'
});
console.log(md5.hash);

// SHA-512 hash
const sha512 = await toolRegistry.execute('hash', {
  text: 'sensitive data',
  algorithm: 'sha512'
});
console.log(sha512.hash);
```

### File Integrity Check

```typescript
async function verifyFile(content: string, expectedHash: string) {
  const result = await toolRegistry.execute('hash', {
    text: content,
    algorithm: 'sha256'
  });

  return result.hash === expectedHash;
}

const isValid = await verifyFile(fileContent, knownHash);
console.log(`File integrity: ${isValid ? 'VALID' : 'INVALID'}`);
```

---

## 8. Password Generator

### Basic Password

```typescript
// Generate a strong password
const result = await toolRegistry.execute('password', {
  length: 16,
  include_uppercase: true,
  include_lowercase: true,
  include_numbers: true,
  include_symbols: true
});

console.log(`Password: ${result.password}`);
console.log(`Strength: ${result.strength}`);
```

### Custom Password Options

```typescript
// Numbers and letters only (no symbols)
const simple = await toolRegistry.execute('password', {
  length: 12,
  include_uppercase: true,
  include_lowercase: true,
  include_numbers: true,
  include_symbols: false
});

// All uppercase PIN
const pin = await toolRegistry.execute('password', {
  length: 6,
  include_uppercase: false,
  include_lowercase: false,
  include_numbers: true,
  include_symbols: false
});
```

### Password Generator Component

```tsx
import { useState } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });

  async function generate() {
    const result = await toolRegistry.execute('password', {
      length,
      include_uppercase: options.uppercase,
      include_lowercase: options.lowercase,
      include_numbers: options.numbers,
      include_symbols: options.symbols
    });

    setPassword(result.password);
  }

  return (
    <div className="password-generator">
      <div className="options">
        <label>
          Length: <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} />
        </label>
        <label>
          <input type="checkbox" checked={options.uppercase} onChange={(e) => setOptions({...options, uppercase: e.target.checked})} />
          Uppercase
        </label>
        <label>
          <input type="checkbox" checked={options.lowercase} onChange={(e) => setOptions({...options, lowercase: e.target.checked})} />
          Lowercase
        </label>
        <label>
          <input type="checkbox" checked={options.numbers} onChange={(e) => setOptions({...options, numbers: e.target.checked})} />
          Numbers
        </label>
        <label>
          <input type="checkbox" checked={options.symbols} onChange={(e) => setOptions({...options, symbols: e.target.checked})} />
          Symbols
        </label>
      </div>

      <button onClick={generate}>Generate Password</button>

      {password && (
        <div className="result">
          <code>{password}</code>
          <button onClick={() => navigator.clipboard.writeText(password)}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Code Formatter

### Format JavaScript

```typescript
const uglyJs = 'function hello(){console.log("hi");return true;}';

const result = await toolRegistry.execute('format_code', {
  code: uglyJs,
  language: 'javascript'
});

console.log(result.formatted);
// function hello() {
//   console.log("hi");
//   return true;
// }
```

### Format JSON

```typescript
const uglyJson = '{"name":"John","age":30,"city":"New York"}';

const result = await toolRegistry.execute('format_code', {
  code: uglyJson,
  language: 'json'
});

console.log(result.formatted);
// {
//   "name": "John",
//   "age": 30,
//   "city": "New York"
// }
```

### Format TypeScript

```typescript
const uglyTs = 'interface User{name:string;age:number}const user:User={name:"John",age:30}';

const result = await toolRegistry.execute('format_code', {
  code: uglyTs,
  language: 'typescript'
});

console.log(result.formatted);
```

---

## 10. UUID Generator

### Generate UUIDs

```typescript
// Generate 5 UUIDs (v4)
const result = await toolRegistry.execute('generate_uuid', {
  count: 5,
  version: 4
});

result.uuids.forEach((uuid) => {
  console.log(uuid);
});
// a1b2c3d4-e5f6-4789-a012-345678901234
// b2c3d4e5-f6a0-4123-b456-789012345678
// ...
```

### Different UUID Versions

```typescript
// UUID v1 (timestamp-based)
const v1 = await toolRegistry.execute('generate_uuid', {
  count: 1,
  version: 1
});

// UUID v4 (random)
const v4 = await toolRegistry.execute('generate_uuid', {
  count: 1,
  version: 4
});

// UUID v5 (name-based)
const v5 = await toolRegistry.execute('generate_uuid', {
  count: 1,
  version: 5,
  namespace: 'dns',
  name: 'example.com'
});
```

---

## 11. JSON Tools

### Format JSON

```typescript
const ugly = '{"name":"John","age":30,"items":[1,2,3]}';

const formatted = await toolRegistry.execute('json_tools', {
  json: ugly,
  operation: 'format'
});

console.log(formatted.result);
// {
//   "name": "John",
//   "age": 30,
//   "items": [1, 2, 3]
// }
```

### Validate JSON

```typescript
const valid = await toolRegistry.execute('json_tools', {
  json: '{"valid": true}',
  operation: 'validate'
});
console.log(valid.valid); // true

const invalid = await toolRegistry.execute('json_tools', {
  json: '{invalid json}',
  operation: 'validate'
});
console.log(invalid.valid); // false
console.log(invalid.error); // Error message
```

### Minify JSON

```typescript
const pretty = `{
  "name": "John",
  "age": 30
}`;

const minified = await toolRegistry.execute('json_tools', {
  json: pretty,
  operation: 'minify'
});

console.log(minified.result); // {"name":"John","age":30}
```

---

## 12. Regex Tool

### Test Pattern

```typescript
const result = await toolRegistry.execute('regex', {
  pattern: '\\d+',
  text: 'Hello 123 World 456',
  operation: 'test'
});

console.log(result.matches); // true
console.log(result.matched); // ['123', '456']
```

### Replace with Regex

```typescript
const result = await toolRegistry.execute('regex', {
  pattern: '\\d+',
  text: 'Price: $123, Quantity: 456',
  replacement: 'XXX',
  operation: 'replace'
});

console.log(result.result); // Price: $XXX, Quantity: XXX
```

### Extract Matches

```typescript
const result = await toolRegistry.execute('regex', {
  pattern: '[a-z]+@[a-z]+\\.[a-z]+',
  text: 'Contact: john@example.com or jane@example.org',
  operation: 'extract'
});

console.log(result.matches); // ['john@example.com', 'jane@example.org']
```

---

## 13. Markdown Tool

### Markdown to HTML

```typescript
const markdown = `
# Heading 1

This is **bold** and *italic* text.

- Item 1
- Item 2
- Item 3

[Link](https://example.com)
`;

const result = await toolRegistry.execute('markdown', {
  text: markdown,
  operation: 'to_html'
});

console.log(result.result);
// <h1>Heading 1</h1>
// <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
// <ul>
//   <li>Item 1</li>
//   ...
```

### HTML to Markdown

```typescript
const html = '<h1>Title</h1><p>This is <strong>bold</strong>.</p>';

const result = await toolRegistry.execute('markdown', {
  text: html,
  operation: 'to_markdown'
});

console.log(result.result);
// # Title
//
// This is **bold**.
```

---

## 14. QR Code Generator

### Basic QR Code

```typescript
const result = await toolRegistry.execute('qr_code', {
  text: 'https://one.ie',
  size: 300
});

// result.qrCode is a base64-encoded PNG image
console.log(result.qrCode); // data:image/png;base64,...
```

### QR Code with Options

```typescript
const result = await toolRegistry.execute('qr_code', {
  text: 'Important information',
  size: 500,
  error_correction: 'H' // High error correction
});
```

### QR Code Component

```tsx
import { useState } from 'react';
import { toolRegistry } from '@/lib/ai-tools/registry';

export function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');

  async function generate() {
    const result = await toolRegistry.execute('qr_code', {
      text,
      size: 300
    });
    setQrCode(result.qrCode);
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL"
      />
      <button onClick={generate}>Generate QR Code</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </div>
  );
}
```

---

## 15. Color Tools

### Convert Colors

```typescript
// Hex to RGB
const rgb = await toolRegistry.execute('color_tools', {
  color: '#FF5733',
  operation: 'convert',
  to_format: 'rgb'
});
console.log(rgb.result); // rgb(255, 87, 51)

// RGB to Hex
const hex = await toolRegistry.execute('color_tools', {
  color: 'rgb(255, 87, 51)',
  operation: 'convert',
  to_format: 'hex'
});
console.log(hex.result); // #FF5733

// Hex to HSL
const hsl = await toolRegistry.execute('color_tools', {
  color: '#FF5733',
  operation: 'convert',
  to_format: 'hsl'
});
console.log(hsl.result); // hsl(9, 100%, 60%)
```

### Generate Palettes

```typescript
// Complementary colors
const complementary = await toolRegistry.execute('color_tools', {
  color: '#3498db',
  operation: 'palette',
  scheme: 'complementary'
});
console.log(complementary.palette); // ['#3498db', '#db7934']

// Analogous colors
const analogous = await toolRegistry.execute('color_tools', {
  color: '#3498db',
  operation: 'palette',
  scheme: 'analogous'
});

// Triadic colors
const triadic = await toolRegistry.execute('color_tools', {
  color: '#3498db',
  operation: 'palette',
  scheme: 'triadic'
});
```

---

## 16. Lorem Ipsum

### Generate Text

```typescript
// Generate paragraphs
const paragraphs = await toolRegistry.execute('lorem', {
  count: 3,
  type: 'paragraphs'
});
console.log(paragraphs.text);

// Generate sentences
const sentences = await toolRegistry.execute('lorem', {
  count: 5,
  type: 'sentences'
});

// Generate words
const words = await toolRegistry.execute('lorem', {
  count: 20,
  type: 'words'
});
```

---

## 17. URL Shortener

### Shorten URL

```typescript
// Using TinyURL
const result = await toolRegistry.execute('url_shortener', {
  url: 'https://example.com/very/long/path/to/resource',
  service: 'tinyurl'
});

console.log(`Short URL: ${result.shortUrl}`);
console.log(`Original: ${result.originalUrl}`);

// Using is.gd
const result2 = await toolRegistry.execute('url_shortener', {
  url: 'https://example.com/another/long/url',
  service: 'isgd'
});
```

---

## 18. Translation

### Basic Translation

```typescript
// Translate with auto-detect
const result = await toolRegistry.execute('translate', {
  text: 'Hello world',
  from: 'auto',
  to: 'es'
});

console.log(result.translatedText); // Hola mundo
console.log(result.fromLanguage); // en
```

### Translation with Phonetics

```typescript
const result = await toolRegistry.execute('translate', {
  text: 'Thank you',
  from: 'en',
  to: 'ja',
  include_phonetics: true
});

console.log(result.translatedText); // ありがとう
console.log(result.phonetics); // Arigatō
```

### Multiple Languages

```typescript
const text = 'Good morning';
const languages = ['es', 'fr', 'de', 'ja'];

for (const lang of languages) {
  const result = await toolRegistry.execute('translate', {
    text,
    from: 'en',
    to: lang
  });

  console.log(`${lang}: ${result.translatedText}`);
}
// es: Buenos días
// fr: Bonjour
// de: Guten Morgen
// ja: おはようございます
```

---

## Advanced Patterns

### Tool Chaining Example

```typescript
import { executeChain } from '@/lib/ai-tools/chain/executor';

// Chain: Get weather → Translate → Format
const chain = {
  id: 'weather-translate-format',
  nodes: [
    {
      id: 'weather',
      toolName: 'get_weather',
      parameters: { location: 'Paris', units: 'metric' }
    },
    {
      id: 'translate',
      toolName: 'translate',
      parameters: { from: 'en', to: 'fr' }
    },
    {
      id: 'format',
      toolName: 'markdown',
      parameters: { operation: 'to_html' }
    }
  ],
  edges: [
    {
      id: 'e1',
      sourceNodeId: 'weather',
      targetNodeId: 'translate',
      sourceOutputKey: 'conditions',
      targetInputKey: 'text'
    },
    {
      id: 'e2',
      sourceNodeId: 'translate',
      targetNodeId: 'format',
      sourceOutputKey: 'translatedText',
      targetInputKey: 'text'
    }
  ]
};

const result = await executeChain(chain);
```

### Batch Processing

```typescript
// Process multiple inputs in parallel
const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3'
];

const promises = urls.map(url =>
  toolRegistry.execute('url_shortener', {
    url,
    service: 'tinyurl'
  })
);

const results = await Promise.all(promises);
results.forEach((r) => {
  console.log(`${r.originalUrl} → ${r.shortUrl}`);
});
```

### Error Handling Pattern

```typescript
async function safeToolExecution(toolName, params) {
  try {
    return await toolRegistry.execute(toolName, params);
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await toolRegistry.execute(toolName, params);
    } else if (error.message.includes('Network')) {
      // Fallback behavior
      return { error: 'Network unavailable', fallback: true };
    } else {
      throw error;
    }
  }
}
```

---

**For more information, see:**
- [Main Documentation](./README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Integration Tests](/web/test/ai-tools/integration.test.ts)
