# AI Tools - Advanced Features Documentation

**Version:** 1.0.0
**Phase:** 5 (Advanced Features)
**Cycles:** 76-90

## Overview

This document covers the advanced AI tools implemented in Phase 5 of the AI Tools Deep Integration plan. These tools provide cutting-edge capabilities including file processing, AI image generation, code execution sandboxing, and voice interaction.

## Table of Contents

1. [File Upload & Processing](#file-upload--processing)
2. [Image Generation](#image-generation)
3. [Code Execution Sandbox](#code-execution-sandbox)
4. [Voice Tools](#voice-tools)
5. [Security Considerations](#security-considerations)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)

---

## File Upload & Processing

### Tool: `process_file`

**Category:** Utility
**Version:** 1.0.0

### Features

- **File Type Detection:** Automatic detection via magic numbers
- **Size Limits:** 10MB (free tier), 50MB (premium tier)
- **Supported Formats:**
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOCX
  - Data: CSV, TXT, MD
  - Archives: ZIP

### Capabilities

1. **Image Analysis**
   - Dimensions extraction
   - Color space detection
   - Alpha channel detection
   - Estimated color count

2. **Text Extraction**
   - Plain text files
   - Markdown files
   - CSV parsing (first 100 rows)

3. **Metadata Extraction**
   - File name, size, type
   - Last modified timestamp
   - File type validation
   - Readable size formatting

4. **Preview Generation**
   - Thumbnail creation (200x200 max)
   - Image previews
   - Data URL generation

### Parameters

```typescript
{
  file: File,                    // Required: The file to process
  tier: 'free' | 'premium',      // Optional: User tier (default: 'free')
  extract_text: boolean,         // Optional: Extract text from file (default: true)
  analyze_image: boolean,        // Optional: Analyze image properties (default: true)
  generate_preview: boolean      // Optional: Generate preview/thumbnail (default: true)
}
```

### Response Format

```typescript
{
  success: boolean,
  file: {
    metadata: {
      name: string,
      size: number,
      type: string,
      extension: string,
      lastModified: number,
      readable_size: string,
      is_valid: boolean,
      exceeded_limit: boolean,
      limit_mb: number
    },
    analysis?: {
      dimensions?: { width: number, height: number },
      format?: string,
      has_alpha?: boolean,
      estimated_colors?: number
    },
    extracted_data?: {
      text?: string,
      csv_rows?: any[]
    },
    preview?: {
      data_url?: string,
      thumbnail?: string
    },
    errors?: string[]
  },
  summary: {
    name: string,
    size: string,
    type: string,
    valid: boolean,
    features_processed: {
      metadata: boolean,
      analysis: boolean,
      text_extraction: boolean,
      csv_parsing: boolean,
      preview: boolean
    }
  }
}
```

### UI Component: FileUploader

**Location:** `/web/src/components/ai/FileUploader.tsx`

**Features:**
- Drag-and-drop interface
- Multi-file upload
- Real-time processing status
- File preview thumbnails
- Extracted data display
- Size limit validation
- Tier-based limits

**Usage:**

```tsx
import { FileUploader } from '@/components/ai/FileUploader';

<FileUploader
  tier="free"
  onFileProcessed={(result) => {
    console.log('File processed:', result);
  }}
  acceptedTypes={['image/*', 'text/*', '.csv']}
/>
```

---

## Image Generation

### Tool: `generate_image`

**Category:** Creative
**Version:** 1.0.0

### Features

- **Multiple Providers:**
  - DALL-E 2/3 (requires OpenAI API key)
  - Stable Diffusion (free, no API key)

- **Style Presets:**
  - Vivid (vibrant, dramatic)
  - Natural (realistic)
  - Artistic (creative interpretation)
  - Photorealistic (ultra HD)
  - Anime (Japanese animation)
  - Sketch (pencil drawing)

- **Size Options:**
  - 256x256
  - 512x512
  - 1024x1024
  - 1024x1792 (portrait)
  - 1792x1024 (landscape)

### Capabilities

1. **Automatic Prompt Enhancement**
   - Style-based enhancements
   - Quality descriptors
   - Technical improvements

2. **Prompt Suggestions**
   - 5 variations of original prompt
   - Different artistic styles
   - Quality improvements

3. **Batch Generation**
   - Multiple images per request
   - DALL-E 2: up to 10 images
   - DALL-E 3: 1 image per request

### Parameters

```typescript
{
  prompt: string,                                          // Required: Image description
  provider: 'dalle' | 'stable-diffusion',                 // Optional: AI provider (default: 'stable-diffusion')
  size: '256x256' | '512x512' | '1024x1024' | ...,       // Optional: Image size (default: '1024x1024')
  style: 'vivid' | 'natural' | 'artistic' | ...,         // Optional: Style preset (default: 'natural')
  quality: 'standard' | 'hd',                             // Optional: Quality (DALL-E only, default: 'standard')
  n: number,                                              // Optional: Number of images (default: 1)
  enhance_prompt: boolean,                                // Optional: Auto-enhance prompt (default: true)
  api_key?: string                                        // Optional: OpenAI API key (for DALL-E)
}
```

### Response Format

```typescript
{
  success: boolean,
  images: [
    {
      url: string,
      revised_prompt?: string,
      width: number,
      height: number,
      format: string,
      provider: string
    }
  ],
  metadata: {
    original_prompt: string,
    enhanced_prompt: string,
    provider: string,
    style: string,
    quality: string,
    size: string,
    count: number,
    total_pixels: number
  },
  prompt_suggestions: string[],
  tips: string[]
}
```

### UI Component: ImageGallery

**Location:** `/web/src/components/ai/ImageGallery.tsx`

**Features:**
- Responsive grid layout
- Image lightbox/modal
- Download functionality
- URL copy to clipboard
- Open in new tab
- Metadata display
- Revised prompt display

**Usage:**

```tsx
import { ImageGallery } from '@/components/ai/ImageGallery';

<ImageGallery
  images={result.images}
  originalPrompt={result.metadata.original_prompt}
  enhancedPrompt={result.metadata.enhanced_prompt}
  metadata={result.metadata}
/>
```

### Provider Comparison

| Feature | Stable Diffusion | DALL-E 2 | DALL-E 3 |
|---------|-----------------|----------|----------|
| API Key | ❌ Not required | ✅ Required | ✅ Required |
| Cost | 🆓 Free | 💰 Paid | 💰 Paid |
| Quality | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Great | ⭐⭐⭐⭐⭐ Excellent |
| Speed | ⚡ Fast | ⚡ Fast | 🐌 Slower |
| Batch | ✅ Yes | ✅ Up to 10 | ❌ Single only |
| HD Quality | ❌ No | ❌ No | ✅ Yes |

---

## Code Execution Sandbox

### Tool: `execute_code`

**Category:** Development
**Version:** 1.0.0

### Features

- **Supported Languages:**
  - JavaScript (native)
  - Python (via Pyodide)

- **Safety Features:**
  - Sandboxed execution
  - Timeout limits
  - No filesystem access
  - No network requests (except Pyodide)
  - Limited memory usage

### Capabilities

1. **JavaScript Execution**
   - Synchronous code
   - Async/await support
   - Console output capture
   - Return value capture
   - Error handling with stack traces

2. **Python Execution**
   - Client-side Python (Pyodide)
   - Standard library support
   - NumPy, Pandas available
   - Console output capture
   - Return value serialization

3. **Result Visualization**
   - Automatic chart detection
   - Array data → Line chart
   - Object data → Bar chart
   - Console log display

### Parameters

```typescript
{
  code: string,                  // Required: Code to execute
  language: 'javascript' | 'python',  // Required: Programming language
  timeout: number,               // Optional: Timeout in ms (default: 5000 for JS, 10000 for Python)
  detect_visualizations: boolean // Optional: Detect viz data (default: true)
}
```

### Response Format

```typescript
{
  success: boolean,
  language: string,
  result: {
    output: string,
    console_logs: string[],
    return_value: any,
    execution_time_ms: number,
    memory_used?: string,
    errors: string[],
    warnings: string[],
    visualizations?: Array<{
      type: 'line_chart' | 'bar_chart',
      data: any,
      label?: string
    }>
  },
  formatted_output: string,
  security_info: {
    sandboxed: boolean,
    timeout_ms: number,
    restrictions: string[]
  },
  tips: string[]
}
```

### Security Model

**Sandbox Restrictions:**
1. No DOM manipulation
2. No `eval()` or `Function()` outside sandbox
3. No filesystem access
4. No network requests (except Pyodide loading)
5. Execution timeout enforced
6. Limited global scope access

**Safe for:**
- Educational code examples
- Algorithm demonstrations
- Data processing
- Mathematical calculations
- Code snippets testing

**NOT safe for:**
- Production code execution
- User-generated scripts
- Sensitive operations
- Long-running processes

---

## Voice Tools

### Tool: `voice_tools`

**Category:** Utility
**Version:** 1.0.0

### Features

- **Text-to-Speech:**
  - Multi-language support
  - Voice selection
  - Rate, pitch, volume control
  - Playback controls (pause, resume, stop)

- **Voice Recognition:**
  - Speech-to-text
  - Multi-language support
  - Continuous mode
  - Interim results

- **Voice Management:**
  - List available voices
  - Voice recommendations by use case
  - Gender detection
  - Local vs cloud voices

### Actions

#### 1. Speak

Convert text to speech with customizable settings.

```typescript
{
  action: 'speak',
  text: string,          // Text to speak
  language: string,      // Language code (default: 'en-US')
  rate: number,          // 0.1 to 10 (default: 1)
  pitch: number,         // 0 to 2 (default: 1)
  volume: number,        // 0 to 1 (default: 1)
  voice?: string         // Specific voice name
}
```

#### 2. Recognize

Convert speech to text.

```typescript
{
  action: 'recognize',
  language: string       // Language code (default: 'en-US')
}
```

#### 3. List Voices

Get all available voices.

```typescript
{
  action: 'list_voices'
}
```

#### 4. Playback Control

Control current speech playback.

```typescript
{
  action: 'stop' | 'pause' | 'resume'
}
```

#### 5. Get Recommendations

Get voice settings for specific use cases.

```typescript
{
  action: 'get_recommendations',
  use_case: 'narration' | 'assistant' | 'announcement' | 'reading'
}
```

### Response Format

```typescript
{
  success: boolean,
  action: string,
  // For 'speak' action
  result?: {
    text: string,
    duration_estimate_ms: number,
    voice_used: string,
    language: string,
    settings: VoiceSettings,
    playback_controls: {
      playing: boolean,
      paused: boolean,
      stopped: boolean
    }
  },
  // For 'recognize' action
  transcript?: string,
  confidence?: number,
  // For 'list_voices' action
  voices?: Array<{
    name: string,
    lang: string,
    gender?: string,
    local: boolean,
    default: boolean
  }>,
  grouped_by_language?: Record<string, any>,
  // For 'get_recommendations' action
  recommendations?: Array<{
    lang: string,
    settings: VoiceSettings,
    description: string
  }>,
  tips?: string[]
}
```

### Supported Languages

Common languages with native browser support:
- English: en-US, en-GB, en-AU
- Spanish: es-ES, es-MX
- French: fr-FR, fr-CA
- German: de-DE
- Italian: it-IT
- Japanese: ja-JP
- Korean: ko-KR
- Chinese: zh-CN, zh-TW
- Portuguese: pt-BR, pt-PT
- Russian: ru-RU

### Use Case Recommendations

| Use Case | Rate | Pitch | Description |
|----------|------|-------|-------------|
| Narration | 0.9 | 1.0 | Slower, clear voice for storytelling |
| Assistant | 1.1 | 1.2 | Friendly, upbeat voice |
| Announcement | 0.95 | 0.9 | Clear, authoritative tone |
| Reading | 1.0 | 1.0 | Comfortable reading pace |

---

## Security Considerations

### File Processing

1. **Size Limits:** Enforced at 10MB (free) / 50MB (premium)
2. **Type Validation:** Magic number detection
3. **Client-Side Processing:** No server uploads
4. **Memory Limits:** Process only necessary data
5. **Preview Generation:** Size-limited thumbnails

### Image Generation

1. **API Key Storage:** Never stored in code
2. **Rate Limiting:** Provider-specific limits
3. **Content Policy:** Follow provider guidelines
4. **Cost Control:** Limit batch sizes
5. **URL Expiry:** Generated URLs may expire

### Code Execution

1. **Sandboxing:** Restricted global scope
2. **Timeout Enforcement:** Hard limits on execution
3. **No Network Access:** Except Pyodide CDN
4. **No Filesystem:** Client-side only
5. **Error Isolation:** Errors don't affect app
6. **Memory Limits:** Browser heap limits apply

### Voice Tools

1. **Browser Permissions:** Microphone access required
2. **Privacy:** No audio recording stored
3. **Local Processing:** Browser's native APIs
4. **No Server Calls:** Client-side only
5. **User Consent:** Required for recognition

---

## Usage Examples

### Complete File Upload Flow

```tsx
import { FileUploader } from '@/components/ai/FileUploader';
import { toolRegistry } from '@/lib/ai-tools/registry';

function MyComponent() {
  const handleFileProcessed = (result: any) => {
    console.log('Metadata:', result.file.metadata);

    if (result.file.analysis) {
      console.log('Image dimensions:', result.file.analysis.dimensions);
    }

    if (result.file.extracted_data?.csv_rows) {
      console.log('CSV data:', result.file.extracted_data.csv_rows);
    }
  };

  return (
    <FileUploader
      tier="premium"
      onFileProcessed={handleFileProcessed}
      acceptedTypes={['image/*', 'text/*', '.csv', '.pdf']}
    />
  );
}
```

### Image Generation with Gallery

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageGallery } from '@/components/ai/ImageGallery';
import { toolRegistry } from '@/lib/ai-tools/registry';

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    try {
      const res = await toolRegistry.execute('generate_image', {
        prompt,
        provider: 'stable-diffusion',
        size: '1024x1024',
        style: 'photorealistic',
        enhance_prompt: true,
      });
      setResult(res);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image..."
        />
        <Button onClick={generateImage} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {result && (
        <ImageGallery
          images={result.images}
          originalPrompt={result.metadata.original_prompt}
          enhancedPrompt={result.metadata.enhanced_prompt}
          metadata={result.metadata}
        />
      )}
    </div>
  );
}
```

### Code Execution Playground

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toolRegistry } from '@/lib/ai-tools/registry';

function CodePlayground() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);

  const executeCode = async () => {
    try {
      const res = await toolRegistry.execute('execute_code', {
        code,
        language,
        detect_visualizations: true,
      });
      setResult(res);
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-48 p-2 font-mono text-sm border rounded"
        placeholder="Enter code..."
      />

      <div className="flex gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <Button onClick={executeCode}>Execute</Button>
      </div>

      {result && (
        <Card>
          <CardContent className="p-4">
            <pre className="text-sm whitespace-pre-wrap">
              {result.formatted_output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Voice Assistant

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, Square } from 'lucide-react';
import { toolRegistry } from '@/lib/ai-tools/registry';

function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const speak = async (text: string) => {
    await toolRegistry.execute('voice_tools', {
      action: 'speak',
      text,
      language: 'en-US',
      rate: 1.1,
      pitch: 1.2,
    });
  };

  const listen = async () => {
    setIsListening(true);
    try {
      const result = await toolRegistry.execute('voice_tools', {
        action: 'recognize',
        language: 'en-US',
      });
      setTranscript(result.transcript);
      // Process the transcript
      await speak(`You said: ${result.transcript}`);
    } catch (error) {
      console.error('Recognition failed:', error);
    } finally {
      setIsListening(false);
    }
  };

  const stop = async () => {
    await toolRegistry.execute('voice_tools', {
      action: 'stop',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={listen} disabled={isListening}>
          <Mic className="h-4 w-4 mr-2" />
          {isListening ? 'Listening...' : 'Start Listening'}
        </Button>
        <Button onClick={stop}>
          <Square className="h-4 w-4 mr-2" />
          Stop
        </Button>
      </div>

      {transcript && (
        <div className="p-4 border rounded">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Testing

### Running Tests

```bash
cd web/
bun test test/ai-tools-advanced.test.ts
```

### Test Coverage

The test suite covers:
- ✅ Tool registration
- ✅ Metadata validation
- ✅ Parameter validation
- ✅ File processing (text, CSV, images)
- ✅ Image generation (Stable Diffusion)
- ✅ Code execution (JavaScript)
- ✅ Error handling
- ✅ Timeout enforcement
- ✅ Security restrictions
- ✅ Usage tracking
- ✅ Caching support

### Security Testing

1. **File Upload:**
   - ✅ Size limit validation
   - ✅ Type detection accuracy
   - ✅ Malicious file rejection
   - ✅ Memory usage limits

2. **Code Execution:**
   - ✅ Sandbox escaping attempts
   - ✅ Timeout enforcement
   - ✅ Memory overflow protection
   - ✅ Error isolation

3. **Voice Tools:**
   - ✅ Permission handling
   - ✅ Privacy compliance
   - ✅ Error recovery

---

## Performance Metrics

### File Processing

- Small files (<1MB): <100ms
- Medium files (1-5MB): 100-500ms
- Large files (5-10MB): 500ms-2s
- Image analysis: +50-200ms
- Preview generation: +100-300ms

### Image Generation

- Stable Diffusion: 2-5 seconds
- DALL-E 2: 10-20 seconds
- DALL-E 3: 20-40 seconds

### Code Execution

- Simple JavaScript: <10ms
- Complex JavaScript: 10-100ms
- Python (first load): 5-10 seconds (Pyodide loading)
- Python (subsequent): 100-500ms

### Voice Tools

- Text-to-speech: Immediate start, duration varies
- Speech recognition: 1-10 seconds (user-dependent)
- Voice listing: <10ms

---

## Future Enhancements

### Planned Features (Phase 6+)

1. **File Processing:**
   - Full PDF text extraction (pdf.js)
   - Office document parsing (docx, xlsx)
   - Image OCR (Tesseract.js)
   - Video thumbnail generation

2. **Image Generation:**
   - Midjourney integration
   - Image editing tools
   - Style transfer
   - Inpainting/outpainting

3. **Code Execution:**
   - More languages (Ruby, Go, Rust via WASM)
   - Package installation (Python packages)
   - File I/O simulation
   - Network request simulation

4. **Voice Tools:**
   - Custom voice training
   - Real-time translation
   - Voice cloning
   - Noise cancellation

---

## Support & Resources

- **Documentation:** `/one/knowledge/ai-tools-advanced-features.md`
- **Source Code:** `/web/src/lib/ai-tools/tools/`
- **Components:** `/web/src/components/ai/`
- **Tests:** `/web/test/ai-tools-advanced.test.ts`
- **Issues:** Report bugs via GitHub issues
- **Community:** Join our Discord for support

---

**Last Updated:** 2025-11-14
**Maintainers:** ONE Platform Team
**License:** MIT
