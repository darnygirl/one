/**
 * Tool Registration with Metadata
 * Registers all tools with enhanced metadata
 */

import { registerTools } from './registry';
import type { ToolDefinition, ToolMetadata } from './types';

// Import all tools
import { weatherTool } from './tools/weather';
import { websearchTool } from './tools/websearch';
import { calculatorTool } from './tools/calculator';
import { translationTool } from './tools/translation';
import { timeTool } from './tools/time';
import { currencyTool } from './tools/currency';
import { codeFormatterTool } from './tools/code-formatter';
import { uuidTool } from './tools/uuid';
import { encodingTool } from './tools/encoding';
import { hashTool } from './tools/hash';
import { jsonToolsTool } from './tools/json-tools';
import { regexTool } from './tools/regex';
import { qrCodeTool } from './tools/qr-code';
import { urlShortenerTool } from './tools/url-shortener';
import { colorToolsTool } from './tools/color-tools';
// Advanced tools (Phase 5)
import { fileProcessorTool } from './tools/file-processor';
import { imageGenTool } from './tools/image-gen';
import { codeExecutorTool } from './tools/code-executor';
import { voiceTool } from './tools/voice';

// Metadata for each tool
const toolMetadata: Record<string, ToolMetadata> = {
  get_weather: {
    version: '2.0.0',
    author: 'ONE Platform',
    tags: ['weather', 'forecast', 'climate', 'data'],
    examples: [
      {
        description: 'Get weather for a city',
        params: { location: 'San Francisco', units: 'imperial', forecast_days: 3 },
      },
      {
        description: 'Get weather by coordinates',
        params: { location: '37.7749,-122.4194', units: 'metric' },
      },
    ],
  },
  web_search: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['search', 'web', 'internet', 'information'],
    examples: [
      {
        description: 'Search the web',
        params: { query: 'latest AI news', num_results: 5 },
      },
    ],
  },
  calculator: {
    version: '2.0.0',
    author: 'ONE Platform',
    tags: ['math', 'calculation', 'science', 'unit conversion'],
    examples: [
      {
        description: 'Basic calculation',
        params: { expression: '2 + 2', mode: 'standard' },
      },
      {
        description: 'Scientific calculation',
        params: { expression: 'sqrt(16) + sin(45)', mode: 'scientific' },
      },
      {
        description: 'Unit conversion',
        params: { expression: '100', mode: 'unit_conversion', unit_from: 'm', unit_to: 'ft' },
      },
    ],
  },
  translate: {
    version: '2.0.0',
    author: 'ONE Platform',
    tags: ['translation', 'language', 'i18n', 'multilingual'],
    examples: [
      {
        description: 'Translate with auto-detect',
        params: { text: 'Hello world', from: 'auto', to: 'es' },
      },
      {
        description: 'Translate with phonetics',
        params: { text: 'Thank you', from: 'en', to: 'fr', include_phonetics: true },
      },
    ],
  },
  get_time: {
    version: '2.0.0',
    author: 'ONE Platform',
    tags: ['time', 'date', 'timezone', 'calendar', 'world clock'],
    examples: [
      {
        description: 'Current time',
        params: { mode: 'current', timezone: 'America/New_York' },
      },
      {
        description: 'World clock',
        params: { mode: 'world_clock', timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'] },
      },
      {
        description: 'Countdown timer',
        params: { mode: 'countdown', target_date: '2025-12-31' },
      },
    ],
  },
  currency: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['currency', 'money', 'exchange', 'finance'],
    examples: [
      {
        description: 'Convert currency',
        params: { amount: 100, from: 'USD', to: 'EUR' },
      },
    ],
  },
  format_code: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['code', 'formatting', 'dev', 'programming'],
    examples: [
      {
        description: 'Format JavaScript code',
        params: { code: 'function hello(){console.log("hi")}', language: 'javascript' },
      },
    ],
  },
  generate_uuid: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['uuid', 'id', 'generator', 'dev'],
    examples: [
      {
        description: 'Generate UUIDs',
        params: { count: 5, version: 4 },
      },
    ],
  },
  encoding: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['encoding', 'base64', 'hex', 'conversion'],
    examples: [
      {
        description: 'Encode to base64',
        params: { text: 'Hello World', operation: 'encode', format: 'base64' },
      },
      {
        description: 'Decode from base64',
        params: { text: 'SGVsbG8gV29ybGQ=', operation: 'decode', format: 'base64' },
      },
    ],
  },
  hash: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['hash', 'crypto', 'security', 'checksum'],
    examples: [
      {
        description: 'Generate hash',
        params: { text: 'password123', algorithm: 'sha256' },
      },
    ],
  },
  json_tools: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['json', 'formatting', 'validation', 'dev'],
    examples: [
      {
        description: 'Format JSON',
        params: { json: '{"name":"John","age":30}', operation: 'format' },
      },
      {
        description: 'Validate JSON',
        params: { json: '{"valid": true}', operation: 'validate' },
      },
    ],
  },
  regex: {
    version: '1.5.0',
    author: 'ONE Platform',
    tags: ['regex', 'pattern', 'matching', 'dev'],
    examples: [
      {
        description: 'Test regex pattern',
        params: { pattern: '\\d+', text: 'Hello 123 World', operation: 'test' },
      },
      {
        description: 'Replace with regex',
        params: { pattern: '\\d+', text: 'Price: $123', replacement: '999', operation: 'replace' },
      },
    ],
  },
  qr_code: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['qr', 'barcode', 'generator', 'creative'],
    examples: [
      {
        description: 'Generate QR code',
        params: { text: 'https://one.ie', size: 300 },
      },
    ],
  },
  url_shortener: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['url', 'shortener', 'links', 'utility'],
    examples: [
      {
        description: 'Shorten URL',
        params: { url: 'https://example.com/very/long/path', service: 'tinyurl' },
      },
    ],
  },
  color_tools: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['color', 'design', 'conversion', 'creative'],
    examples: [
      {
        description: 'Convert color',
        params: { color: '#FF5733', operation: 'convert', to_format: 'rgb' },
      },
      {
        description: 'Generate palette',
        params: { color: '#3498db', operation: 'palette', scheme: 'complementary' },
      },
    ],
  },
  // Advanced tools metadata
  process_file: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['file', 'upload', 'ocr', 'image', 'document', 'csv', 'pdf'],
    examples: [
      {
        description: 'Process image with analysis',
        params: { file: 'File object', tier: 'free', analyze_image: true, generate_preview: true },
      },
      {
        description: 'Parse CSV file',
        params: { file: 'File object', tier: 'premium' },
      },
    ],
  },
  generate_image: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['image', 'ai', 'generation', 'dalle', 'stable-diffusion', 'art', 'creative'],
    examples: [
      {
        description: 'Generate with Stable Diffusion (free)',
        params: {
          prompt: 'A serene mountain landscape at sunset',
          provider: 'stable-diffusion',
          size: '1024x1024',
          style: 'photorealistic',
        },
      },
      {
        description: 'Generate with DALL-E (requires API key)',
        params: {
          prompt: 'A futuristic city with flying cars',
          provider: 'dalle',
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
        },
      },
    ],
  },
  execute_code: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['code', 'execution', 'sandbox', 'javascript', 'python', 'dev', 'programming'],
    examples: [
      {
        description: 'Execute JavaScript',
        params: {
          code: 'const result = [1, 2, 3].map(x => x * 2);\nconsole.log(result);\nreturn result;',
          language: 'javascript',
        },
      },
      {
        description: 'Execute Python',
        params: {
          code: 'import math\nresult = [math.sqrt(x) for x in range(1, 10)]\nprint(result)\nresult',
          language: 'python',
        },
      },
    ],
  },
  voice_tools: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['voice', 'tts', 'speech', 'audio', 'accessibility', 'multilingual'],
    examples: [
      {
        description: 'Speak text',
        params: {
          action: 'speak',
          text: 'Hello, how can I help you today?',
          language: 'en-US',
          rate: 1,
          pitch: 1,
        },
      },
      {
        description: 'List available voices',
        params: { action: 'list_voices' },
      },
      {
        description: 'Voice recognition',
        params: { action: 'recognize', language: 'en-US' },
      },
    ],
  },
};

// Helper to add metadata to a tool
function withMetadata(tool: any, name: string): ToolDefinition {
  return {
    ...tool,
    metadata: toolMetadata[name] || {
      version: '1.0.0',
      author: 'ONE Platform',
      tags: [],
    },
  };
}

// Register all tools with metadata
export function registerAllTools() {
  registerTools(
    withMetadata(weatherTool, 'get_weather'),
    withMetadata(websearchTool, 'web_search'),
    withMetadata(calculatorTool, 'calculator'),
    withMetadata(translationTool, 'translate'),
    withMetadata(timeTool, 'get_time'),
    withMetadata(currencyTool, 'currency'),
    withMetadata(codeFormatterTool, 'format_code'),
    withMetadata(uuidTool, 'generate_uuid'),
    withMetadata(encodingTool, 'encoding'),
    withMetadata(hashTool, 'hash'),
    withMetadata(jsonToolsTool, 'json_tools'),
    withMetadata(regexTool, 'regex'),
    withMetadata(qrCodeTool, 'qr_code'),
    withMetadata(urlShortenerTool, 'url_shortener'),
    withMetadata(colorToolsTool, 'color_tools'),
    // Advanced tools (Phase 5)
    withMetadata(fileProcessorTool, 'process_file'),
    withMetadata(imageGenTool, 'generate_image'),
    withMetadata(codeExecutorTool, 'execute_code'),
    withMetadata(voiceTool, 'voice_tools')
  );
}

// Category information
export const categoryInfo = {
  data: {
    name: 'Data & Information',
    description: 'Weather, search, and real-time data',
    icon: '📊',
  },
  search: {
    name: 'Search & Discovery',
    description: 'Web search and information retrieval',
    icon: '🔍',
  },
  utility: {
    name: 'Utility Tools',
    description: 'Calculations, time, and conversions',
    icon: '🛠️',
  },
  encoding: {
    name: 'Encoding & Hashing',
    description: 'Base64, hex, and cryptographic tools',
    icon: '🔐',
  },
  dev: {
    name: 'Developer Tools',
    description: 'Code formatting, regex, and JSON tools',
    icon: '💻',
  },
  creative: {
    name: 'Creative Tools',
    description: 'QR codes, colors, and design utilities',
    icon: '🎨',
  },
};
