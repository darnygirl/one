/**
 * Pre-built Chain Presets
 * Useful chains demonstrating tool composition with categories, difficulty levels, and versioning
 */

import type { Chain, ChainCategory, ChainDifficulty } from './types';

/**
 * Chain categories for organization
 */
export const CHAIN_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  DATA: 'data',
  SECURITY: 'security',
  INTERNATIONAL: 'international',
  FINANCE: 'finance',
  MARKETING: 'marketing',
} as const;

/**
 * Chain difficulty levels
 */
export const CHAIN_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

/**
 * Chain 1: Weather Research Chain
 * Search for location info → Get weather forecast
 */
export const weatherResearchChain: Chain = {
  id: 'weather-research',
  name: 'Weather Research',
  description: 'Search for a location and get detailed weather forecast',
  category: CHAIN_CATEGORIES.PRODUCTIVITY,
  difficulty: CHAIN_DIFFICULTY.BEGINNER,
  version: '1.0.0',
  nodes: [
    {
      id: 'search-location',
      toolName: 'websearch',
      label: 'Search Location',
      parameters: {
        query: 'Paris France coordinates',
        num_results: 3,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'get-weather',
      toolName: 'get_weather',
      label: 'Get Weather',
      parameters: {
        location: '', // Will be filled from search results
        units: 'metric',
        forecast_days: 7,
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'search-to-weather',
      sourceNodeId: 'search-location',
      targetNodeId: 'get-weather',
      sourceOutputKey: 'results.0.snippet',
      targetInputKey: 'location',
    },
  ],
  parameterTemplates: [
    {
      key: 'query',
      label: 'Location Search',
      type: 'string',
      required: true,
      defaultValue: 'Paris France coordinates',
    },
    {
      key: 'units',
      label: 'Temperature Units',
      type: 'select',
      required: true,
      defaultValue: 'metric',
      options: [
        { label: 'Celsius', value: 'metric' },
        { label: 'Fahrenheit', value: 'imperial' },
      ],
    },
    {
      key: 'forecast_days',
      label: 'Forecast Days',
      type: 'number',
      required: true,
      defaultValue: 7,
      validation: { min: 1, max: 14, message: 'Must be between 1 and 14 days' },
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['weather', 'search', 'research'],
  },
};

/**
 * Chain 2: Translation QR Code Chain
 * Translate text → Generate QR code with translation
 */
export const translationQRChain: Chain = {
  id: 'translation-qr',
  name: 'Translation QR Code',
  description: 'Translate text and create a QR code of the translation',
  category: CHAIN_CATEGORIES.INTERNATIONAL,
  difficulty: CHAIN_DIFFICULTY.BEGINNER,
  version: '1.0.0',
  nodes: [
    {
      id: 'translate-text',
      toolName: 'translate',
      label: 'Translate',
      parameters: {
        text: 'Welcome to our restaurant',
        from: 'en',
        to: 'es',
        include_phonetics: true,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'create-qr',
      toolName: 'generate_qr_code',
      label: 'Generate QR Code',
      parameters: {
        data: '', // Will be filled from translation
        size: 256,
        error_correction: 'M',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'translate-to-qr',
      sourceNodeId: 'translate-text',
      targetNodeId: 'create-qr',
      sourceOutputKey: 'translated',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'text',
      label: 'Text to Translate',
      type: 'string',
      required: true,
      defaultValue: 'Welcome to our restaurant',
    },
    {
      key: 'from',
      label: 'Source Language',
      type: 'string',
      required: true,
      defaultValue: 'en',
    },
    {
      key: 'to',
      label: 'Target Language',
      type: 'string',
      required: true,
      defaultValue: 'es',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['translation', 'qr-code', 'international'],
  },
};

/**
 * Chain 3: URL Shortener QR Chain
 * Shorten URL → Generate QR code
 */
export const urlQRChain: Chain = {
  id: 'url-qr',
  name: 'URL to QR Code',
  description: 'Shorten a URL and create a scannable QR code',
  category: CHAIN_CATEGORIES.MARKETING,
  difficulty: CHAIN_DIFFICULTY.BEGINNER,
  version: '1.0.0',
  nodes: [
    {
      id: 'shorten-url',
      toolName: 'url_shortener',
      label: 'Shorten URL',
      parameters: {
        url: 'https://example.com',
        custom_alias: '',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'create-qr',
      toolName: 'generate_qr_code',
      label: 'Generate QR Code',
      parameters: {
        data: '', // Will be filled from shortened URL
        size: 512,
        error_correction: 'H',
        foreground: '000000',
        background: 'ffffff',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'shorten-to-qr',
      sourceNodeId: 'shorten-url',
      targetNodeId: 'create-qr',
      sourceOutputKey: 'short_url',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'url',
      label: 'URL to Shorten',
      type: 'string',
      required: true,
      defaultValue: 'https://example.com',
      validation: {
        pattern: '^https?://',
        message: 'Must be a valid URL starting with http:// or https://',
      },
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['url', 'qr-code', 'sharing'],
  },
};

/**
 * Chain 4: Color Palette with Accessibility Check
 * Convert color → Generate palette → Check accessibility
 */
export const colorAccessibilityChain: Chain = {
  id: 'color-accessibility',
  name: 'Color Palette Accessibility',
  description: 'Create a color palette and check WCAG accessibility',
  category: CHAIN_CATEGORIES.DESIGN,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'convert-color',
      toolName: 'color_tools',
      label: 'Convert Color',
      parameters: {
        color: '#FF5733',
        action: 'convert',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'generate-palette',
      toolName: 'color_tools',
      label: 'Generate Palette',
      parameters: {
        color: '#FF5733',
        action: 'palette',
        palette_type: 'complementary',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'check-accessibility',
      toolName: 'color_tools',
      label: 'Check Accessibility',
      parameters: {
        color: '#FF5733',
        action: 'accessibility',
        compare_color: '#FFFFFF',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'convert-to-palette',
      sourceNodeId: 'convert-color',
      targetNodeId: 'generate-palette',
      sourceOutputKey: 'conversions.hex',
      targetInputKey: 'color',
    },
    {
      id: 'palette-to-accessibility',
      sourceNodeId: 'generate-palette',
      targetNodeId: 'check-accessibility',
      sourceOutputKey: 'conversions.hex',
      targetInputKey: 'color',
    },
  ],
  parameterTemplates: [
    {
      key: 'color',
      label: 'Base Color',
      type: 'string',
      required: true,
      defaultValue: '#FF5733',
      validation: {
        pattern: '^#[0-9A-Fa-f]{6}$',
        message: 'Must be a valid hex color code',
      },
    },
    {
      key: 'palette_type',
      label: 'Palette Type',
      type: 'select',
      required: true,
      defaultValue: 'complementary',
      options: [
        { label: 'Complementary', value: 'complementary' },
        { label: 'Analogous', value: 'analogous' },
        { label: 'Triadic', value: 'triadic' },
        { label: 'Monochromatic', value: 'monochromatic' },
      ],
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['color', 'design', 'accessibility', 'wcag'],
  },
};

/**
 * Chain 5: Secure Data Chain
 * Hash data → Encode to Base64
 */
export const secureDataChain: Chain = {
  id: 'secure-data',
  name: 'Hash and Encode',
  description: 'Hash sensitive data and encode the result',
  category: CHAIN_CATEGORIES.SECURITY,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'hash-data',
      toolName: 'hash',
      label: 'Hash Data',
      parameters: {
        data: 'sensitive-information',
        algorithm: 'sha256',
        output_format: 'hex',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'encode-hash',
      toolName: 'encoding',
      label: 'Encode to Base64',
      parameters: {
        action: 'encode',
        data: '', // Will be filled from hash
        encoding: 'base64',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'hash-to-encode',
      sourceNodeId: 'hash-data',
      targetNodeId: 'encode-hash',
      sourceOutputKey: 'hash',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'data',
      label: 'Data to Hash',
      type: 'string',
      required: true,
      defaultValue: 'sensitive-information',
    },
    {
      key: 'algorithm',
      label: 'Hash Algorithm',
      type: 'select',
      required: true,
      defaultValue: 'sha256',
      options: [
        { label: 'SHA-256', value: 'sha256' },
        { label: 'SHA-512', value: 'sha512' },
        { label: 'MD5', value: 'md5' },
      ],
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['security', 'hash', 'encoding'],
  },
};

/**
 * Chain 6: Multi-Currency Calculator
 * Calculate amount → Convert to different currency
 */
export const currencyCalculatorChain: Chain = {
  id: 'currency-calculator',
  name: 'Currency Calculator',
  description: 'Calculate values and convert between currencies',
  category: CHAIN_CATEGORIES.FINANCE,
  difficulty: CHAIN_DIFFICULTY.BEGINNER,
  version: '1.0.0',
  nodes: [
    {
      id: 'calculate',
      toolName: 'calculator',
      label: 'Calculate Amount',
      parameters: {
        expression: '1500 * 1.2',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'convert-currency',
      toolName: 'currency_convert',
      label: 'Convert Currency',
      parameters: {
        amount: 0, // Will be filled from calculation
        from: 'USD',
        to: 'EUR',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'calc-to-currency',
      sourceNodeId: 'calculate',
      targetNodeId: 'convert-currency',
      sourceOutputKey: 'result',
      targetInputKey: 'amount',
    },
  ],
  parameterTemplates: [
    {
      key: 'expression',
      label: 'Calculation Expression',
      type: 'string',
      required: true,
      defaultValue: '1500 * 1.2',
    },
    {
      key: 'from',
      label: 'From Currency',
      type: 'string',
      required: true,
      defaultValue: 'USD',
    },
    {
      key: 'to',
      label: 'To Currency',
      type: 'string',
      required: true,
      defaultValue: 'EUR',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['calculator', 'currency', 'finance'],
  },
};

/**
 * Chain 7: Code Analysis Chain
 * Format code → Generate hash for verification
 */
export const codeAnalysisChain: Chain = {
  id: 'code-analysis',
  name: 'Code Format and Hash',
  description: 'Format code and generate integrity hash',
  category: CHAIN_CATEGORIES.DEVELOPMENT,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'format-code',
      toolName: 'code_formatter',
      label: 'Format Code',
      parameters: {
        code: 'function hello(){return "world"}',
        language: 'javascript',
        style: 'standard',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'hash-code',
      toolName: 'hash',
      label: 'Hash Code',
      parameters: {
        data: '', // Will be filled from formatted code
        algorithm: 'sha256',
        output_format: 'hex',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'format-to-hash',
      sourceNodeId: 'format-code',
      targetNodeId: 'hash-code',
      sourceOutputKey: 'formatted_code',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'code',
      label: 'Code to Format',
      type: 'string',
      required: true,
      defaultValue: 'function hello(){return "world"}',
    },
    {
      key: 'language',
      label: 'Programming Language',
      type: 'select',
      required: true,
      defaultValue: 'javascript',
      options: [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'Python', value: 'python' },
        { label: 'JSON', value: 'json' },
      ],
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['code', 'formatting', 'hash', 'integrity'],
  },
};

/**
 * Chain 8: Data Validation Chain
 * Validate JSON → Extract with regex → Hash result
 */
export const dataValidationChain: Chain = {
  id: 'data-validation',
  name: 'Data Validation Pipeline',
  description: 'Validate JSON, extract data with regex, and hash',
  category: CHAIN_CATEGORIES.DATA,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'validate-json',
      toolName: 'json_tools',
      label: 'Validate JSON',
      parameters: {
        action: 'validate',
        data: '{"user": "john@example.com"}',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'extract-email',
      toolName: 'regex',
      label: 'Extract Email',
      parameters: {
        action: 'match',
        text: '', // Will be filled from JSON
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: 'g',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'hash-email',
      toolName: 'hash',
      label: 'Hash Email',
      parameters: {
        data: '', // Will be filled from regex match
        algorithm: 'sha256',
        output_format: 'hex',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'json-to-regex',
      sourceNodeId: 'validate-json',
      targetNodeId: 'extract-email',
      sourceOutputKey: 'data',
      targetInputKey: 'text',
    },
    {
      id: 'regex-to-hash',
      sourceNodeId: 'extract-email',
      targetNodeId: 'hash-email',
      sourceOutputKey: 'matches.0',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'data',
      label: 'JSON Data',
      type: 'string',
      required: true,
      defaultValue: '{"user": "john@example.com"}',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['validation', 'json', 'regex', 'security'],
  },
};

/**
 * Chain 9: Content Localization
 * Translate → Format time → Generate locale-specific QR
 */
export const contentLocalizationChain: Chain = {
  id: 'content-localization',
  name: 'Content Localization',
  description: 'Translate content and format it for different locales',
  category: CHAIN_CATEGORIES.INTERNATIONAL,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'translate',
      toolName: 'translate',
      label: 'Translate Text',
      parameters: {
        text: 'Welcome! Our store opens at 9:00 AM',
        from: 'en',
        to: 'ja',
        include_phonetics: true,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'format-time',
      toolName: 'time_tools',
      label: 'Format Time',
      parameters: {
        action: 'format',
        timestamp: Date.now(),
        format: 'full',
        timezone: 'Asia/Tokyo',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [],
  parameterTemplates: [
    {
      key: 'text',
      label: 'Text to Translate',
      type: 'string',
      required: true,
      defaultValue: 'Welcome! Our store opens at 9:00 AM',
    },
    {
      key: 'to',
      label: 'Target Language',
      type: 'select',
      required: true,
      defaultValue: 'ja',
      options: [
        { label: 'Japanese', value: 'ja' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Chinese', value: 'zh' },
      ],
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['internationalization', 'translation', 'localization'],
  },
};

/**
 * Chain 10: Password Generator with QR
 * Generate secure password → Hash for storage → Create QR for sharing
 */
export const passwordSecurityChain: Chain = {
  id: 'password-security',
  name: 'Secure Password Generation',
  description: 'Generate strong passwords with secure hashing and QR codes',
  category: CHAIN_CATEGORIES.SECURITY,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'generate-password',
      toolName: 'password_generator',
      label: 'Generate Password',
      parameters: {
        length: 16,
        include_uppercase: true,
        include_lowercase: true,
        include_numbers: true,
        include_symbols: true,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'hash-password',
      toolName: 'hash',
      label: 'Hash Password',
      parameters: {
        data: '',
        algorithm: 'sha256',
        output_format: 'hex',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'create-qr',
      toolName: 'generate_qr_code',
      label: 'Generate QR Code',
      parameters: {
        data: '',
        size: 256,
        error_correction: 'H',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'generate-to-hash',
      sourceNodeId: 'generate-password',
      targetNodeId: 'hash-password',
      sourceOutputKey: 'password',
      targetInputKey: 'data',
    },
    {
      id: 'generate-to-qr',
      sourceNodeId: 'generate-password',
      targetNodeId: 'create-qr',
      sourceOutputKey: 'password',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'length',
      label: 'Password Length',
      type: 'number',
      required: true,
      defaultValue: 16,
      validation: { min: 8, max: 128, message: 'Length must be between 8 and 128' },
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['security', 'password', 'qr-code'],
  },
};

/**
 * Chain 11: API Response Parser
 * Fetch web content → Parse JSON → Extract specific fields
 */
export const apiParserChain: Chain = {
  id: 'api-parser',
  name: 'API Response Parser',
  description: 'Search and parse API responses for specific data',
  category: CHAIN_CATEGORIES.DEVELOPMENT,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'search-api',
      toolName: 'websearch',
      label: 'Search API',
      parameters: {
        query: 'REST API documentation',
        num_results: 5,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'parse-json',
      toolName: 'json_tools',
      label: 'Parse JSON',
      parameters: {
        action: 'parse',
        data: '',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'search-to-parse',
      sourceNodeId: 'search-api',
      targetNodeId: 'parse-json',
      sourceOutputKey: 'results.0.snippet',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'query',
      label: 'Search Query',
      type: 'string',
      required: true,
      defaultValue: 'REST API documentation',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['api', 'json', 'parsing', 'development'],
  },
};

/**
 * Chain 12: Marketing Content Generator
 * Generate lorem ipsum → Translate → Create short URL → Generate QR
 */
export const marketingContentChain: Chain = {
  id: 'marketing-content',
  name: 'Marketing Content Pipeline',
  description: 'Generate, translate, and share marketing content',
  category: CHAIN_CATEGORIES.MARKETING,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'generate-text',
      toolName: 'lorem_generator',
      label: 'Generate Content',
      parameters: {
        type: 'paragraphs',
        count: 3,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'translate',
      toolName: 'translate',
      label: 'Translate',
      parameters: {
        text: '',
        from: 'en',
        to: 'es',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'generate-to-translate',
      sourceNodeId: 'generate-text',
      targetNodeId: 'translate',
      sourceOutputKey: 'text',
      targetInputKey: 'text',
    },
  ],
  parameterTemplates: [
    {
      key: 'count',
      label: 'Number of Paragraphs',
      type: 'number',
      required: true,
      defaultValue: 3,
      validation: { min: 1, max: 10, message: 'Must be between 1 and 10 paragraphs' },
    },
    {
      key: 'to',
      label: 'Target Language',
      type: 'string',
      required: true,
      defaultValue: 'es',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['marketing', 'content', 'translation'],
  },
};

/**
 * Chain 13: Financial Report Generator
 * Calculate values → Convert currency → Format for reporting
 */
export const financialReportChain: Chain = {
  id: 'financial-report',
  name: 'Financial Report Generator',
  description: 'Calculate financial metrics and format reports',
  category: CHAIN_CATEGORIES.FINANCE,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'calculate-total',
      toolName: 'calculator',
      label: 'Calculate Total',
      parameters: {
        expression: '(1200 + 3400 + 5600) * 1.08',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'convert-currency',
      toolName: 'currency_convert',
      label: 'Convert to EUR',
      parameters: {
        amount: 0,
        from: 'USD',
        to: 'EUR',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'format-json',
      toolName: 'json_tools',
      label: 'Format Report',
      parameters: {
        action: 'format',
        data: '',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'calc-to-convert',
      sourceNodeId: 'calculate-total',
      targetNodeId: 'convert-currency',
      sourceOutputKey: 'result',
      targetInputKey: 'amount',
    },
  ],
  parameterTemplates: [
    {
      key: 'expression',
      label: 'Calculation Expression',
      type: 'string',
      required: true,
      defaultValue: '(1200 + 3400 + 5600) * 1.08',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['finance', 'reporting', 'calculations'],
  },
};

/**
 * Chain 14: Design Asset Generator
 * Generate UUID → Create color palette → Generate QR code
 */
export const designAssetChain: Chain = {
  id: 'design-asset',
  name: 'Design Asset Generator',
  description: 'Generate unique design assets with consistent branding',
  category: CHAIN_CATEGORIES.DESIGN,
  difficulty: CHAIN_DIFFICULTY.INTERMEDIATE,
  version: '1.0.0',
  nodes: [
    {
      id: 'generate-id',
      toolName: 'uuid_generator',
      label: 'Generate UUID',
      parameters: {
        version: 4,
        count: 1,
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'create-palette',
      toolName: 'color_tools',
      label: 'Create Palette',
      parameters: {
        color: '#3B82F6',
        action: 'palette',
        palette_type: 'monochromatic',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [],
  parameterTemplates: [
    {
      key: 'color',
      label: 'Brand Color',
      type: 'string',
      required: true,
      defaultValue: '#3B82F6',
      validation: {
        pattern: '^#[0-9A-Fa-f]{6}$',
        message: 'Must be a valid hex color',
      },
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['design', 'branding', 'assets'],
  },
};

/**
 * Chain 15: Data Processing Pipeline
 * Validate JSON → Transform with regex → Encode result
 */
export const dataProcessingChain: Chain = {
  id: 'data-processing',
  name: 'Data Processing Pipeline',
  description: 'Advanced data validation, transformation, and encoding',
  category: CHAIN_CATEGORIES.DATA,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'validate',
      toolName: 'json_tools',
      label: 'Validate JSON',
      parameters: {
        action: 'validate',
        data: '{"items": [1, 2, 3]}',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'transform',
      toolName: 'regex',
      label: 'Transform Data',
      parameters: {
        action: 'replace',
        text: '',
        pattern: '\\d+',
        replacement: 'X',
        flags: 'g',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'encode',
      toolName: 'encoding',
      label: 'Encode Result',
      parameters: {
        action: 'encode',
        data: '',
        encoding: 'base64',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'validate-to-transform',
      sourceNodeId: 'validate',
      targetNodeId: 'transform',
      sourceOutputKey: 'data',
      targetInputKey: 'text',
    },
    {
      id: 'transform-to-encode',
      sourceNodeId: 'transform',
      targetNodeId: 'encode',
      sourceOutputKey: 'result',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'data',
      label: 'Input JSON',
      type: 'string',
      required: true,
      defaultValue: '{"items": [1, 2, 3]}',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['data', 'processing', 'transformation'],
  },
};

/**
 * Chain 16: Multi-language Documentation
 * Format code → Translate comments → Generate markdown documentation
 */
export const documentationChain: Chain = {
  id: 'documentation',
  name: 'Multi-language Documentation',
  description: 'Generate and translate code documentation',
  category: CHAIN_CATEGORIES.DEVELOPMENT,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'format-code',
      toolName: 'code_formatter',
      label: 'Format Code',
      parameters: {
        code: 'const add = (a, b) => a + b;',
        language: 'javascript',
        style: 'standard',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'generate-markdown',
      toolName: 'markdown_tools',
      label: 'Generate Markdown',
      parameters: {
        action: 'parse',
        content: '',
      },
      position: { x: 400, y: 100 },
    },
  ],
  edges: [
    {
      id: 'format-to-markdown',
      sourceNodeId: 'format-code',
      targetNodeId: 'generate-markdown',
      sourceOutputKey: 'formatted_code',
      targetInputKey: 'content',
    },
  ],
  parameterTemplates: [
    {
      key: 'code',
      label: 'Code to Document',
      type: 'string',
      required: true,
      defaultValue: 'const add = (a, b) => a + b;',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['documentation', 'development', 'markdown'],
  },
};

/**
 * Chain 17: E-commerce Product Setup
 * Calculate pricing → Convert currencies → Generate product QR → Hash product ID
 */
export const ecommerceSetupChain: Chain = {
  id: 'ecommerce-setup',
  name: 'E-commerce Product Setup',
  description: 'Complete product setup with pricing, QR codes, and tracking',
  category: CHAIN_CATEGORIES.PRODUCTIVITY,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.1.0',
  nodes: [
    {
      id: 'calculate-price',
      toolName: 'calculator',
      label: 'Calculate Price',
      parameters: {
        expression: '99.99 * 1.2',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'convert-price',
      toolName: 'currency_convert',
      label: 'Convert to EUR',
      parameters: {
        amount: 0,
        from: 'USD',
        to: 'EUR',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'generate-uuid',
      toolName: 'uuid_generator',
      label: 'Product ID',
      parameters: {
        version: 4,
        count: 1,
      },
      position: { x: 100, y: 300 },
    },
    {
      id: 'create-qr',
      toolName: 'generate_qr_code',
      label: 'Product QR',
      parameters: {
        data: '',
        size: 512,
        error_correction: 'H',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'calc-to-convert',
      sourceNodeId: 'calculate-price',
      targetNodeId: 'convert-price',
      sourceOutputKey: 'result',
      targetInputKey: 'amount',
    },
    {
      id: 'uuid-to-qr',
      sourceNodeId: 'generate-uuid',
      targetNodeId: 'create-qr',
      sourceOutputKey: 'uuids.0',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'expression',
      label: 'Base Price Calculation',
      type: 'string',
      required: true,
      defaultValue: '99.99 * 1.2',
    },
    {
      key: 'from',
      label: 'Base Currency',
      type: 'string',
      required: true,
      defaultValue: 'USD',
    },
    {
      key: 'to',
      label: 'Target Currency',
      type: 'string',
      required: true,
      defaultValue: 'EUR',
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['ecommerce', 'product', 'setup', 'qr-code'],
  },
};

/**
 * Chain 18: Security Audit Chain
 * Hash sensitive data → Validate JSON structure → Encode for transmission
 */
export const securityAuditChain: Chain = {
  id: 'security-audit',
  name: 'Security Audit Pipeline',
  description: 'Comprehensive security validation and encoding',
  category: CHAIN_CATEGORIES.SECURITY,
  difficulty: CHAIN_DIFFICULTY.ADVANCED,
  version: '1.0.0',
  nodes: [
    {
      id: 'hash-input',
      toolName: 'hash',
      label: 'Hash Sensitive Data',
      parameters: {
        data: 'user-password-123',
        algorithm: 'sha512',
        output_format: 'hex',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'validate-structure',
      toolName: 'json_tools',
      label: 'Validate Structure',
      parameters: {
        action: 'validate',
        data: '{"hash": "", "timestamp": 0}',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'encode-audit',
      toolName: 'encoding',
      label: 'Encode for Transmission',
      parameters: {
        action: 'encode',
        data: '',
        encoding: 'base64',
      },
      position: { x: 700, y: 100 },
    },
  ],
  edges: [
    {
      id: 'hash-to-validate',
      sourceNodeId: 'hash-input',
      targetNodeId: 'validate-structure',
      sourceOutputKey: 'hash',
      targetInputKey: 'data',
    },
    {
      id: 'validate-to-encode',
      sourceNodeId: 'validate-structure',
      targetNodeId: 'encode-audit',
      sourceOutputKey: 'data',
      targetInputKey: 'data',
    },
  ],
  parameterTemplates: [
    {
      key: 'data',
      label: 'Sensitive Data',
      type: 'string',
      required: true,
      defaultValue: 'user-password-123',
    },
    {
      key: 'algorithm',
      label: 'Hash Algorithm',
      type: 'select',
      required: true,
      defaultValue: 'sha512',
      options: [
        { label: 'SHA-512', value: 'sha512' },
        { label: 'SHA-256', value: 'sha256' },
      ],
    },
  ],
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['security', 'audit', 'encryption', 'validation'],
  },
};

/**
 * All preset chains (18 total)
 */
export const presetChains: Chain[] = [
  weatherResearchChain,
  translationQRChain,
  urlQRChain,
  colorAccessibilityChain,
  secureDataChain,
  currencyCalculatorChain,
  codeAnalysisChain,
  dataValidationChain,
  contentLocalizationChain,
  passwordSecurityChain,
  apiParserChain,
  marketingContentChain,
  financialReportChain,
  designAssetChain,
  dataProcessingChain,
  documentationChain,
  ecommerceSetupChain,
  securityAuditChain,
];

/**
 * Get preset chain by ID
 */
export function getPresetChain(id: string): Chain | undefined {
  return presetChains.find((chain) => chain.id === id);
}

/**
 * Get preset chains by tag
 */
export function getPresetChainsByTag(tag: string): Chain[] {
  return presetChains.filter((chain) =>
    chain.metadata?.tags?.includes(tag)
  );
}

/**
 * Get preset chains by category
 */
export function getPresetChainsByCategory(category: ChainCategory): Chain[] {
  return presetChains.filter((chain) => chain.category === category);
}

/**
 * Get preset chains by difficulty
 */
export function getPresetChainsByDifficulty(difficulty: ChainDifficulty): Chain[] {
  return presetChains.filter((chain) => chain.difficulty === difficulty);
}

/**
 * Get all preset chain categories
 */
export function getPresetCategories(): string[] {
  const tags = new Set<string>();
  presetChains.forEach((chain) => {
    chain.metadata?.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get chain statistics
 */
export function getChainStatistics() {
  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  presetChains.forEach((chain) => {
    if (chain.category) {
      byCategory[chain.category] = (byCategory[chain.category] || 0) + 1;
    }
    if (chain.difficulty) {
      byDifficulty[chain.difficulty] = (byDifficulty[chain.difficulty] || 0) + 1;
    }
  });

  return {
    total: presetChains.length,
    byCategory,
    byDifficulty,
    averageNodesPerChain: presetChains.reduce((sum, chain) => sum + chain.nodes.length, 0) / presetChains.length,
  };
}

/**
 * Validate chain parameter templates
 */
export function validateChainParameters(
  chain: Chain,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!chain.parameterTemplates) {
    return { valid: true, errors: [] };
  }

  for (const template of chain.parameterTemplates) {
    const value = parameters[template.key];

    // Check required
    if (template.required && (value === undefined || value === null || value === '')) {
      errors.push(`${template.label} is required`);
      continue;
    }

    // Skip validation if value not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (template.type === 'number' && typeof value !== 'number') {
      errors.push(`${template.label} must be a number`);
    }

    // Range validation
    if (template.validation) {
      if (template.type === 'number') {
        if (template.validation.min !== undefined && value < template.validation.min) {
          errors.push(template.validation.message || `${template.label} must be at least ${template.validation.min}`);
        }
        if (template.validation.max !== undefined && value > template.validation.max) {
          errors.push(template.validation.message || `${template.label} must be at most ${template.validation.max}`);
        }
      }

      // Pattern validation
      if (template.validation.pattern && typeof value === 'string') {
        const regex = new RegExp(template.validation.pattern);
        if (!regex.test(value)) {
          errors.push(template.validation.message || `${template.label} format is invalid`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a copy of a preset chain with a new ID
 * Useful for users to customize presets
 */
export function clonePresetChain(chain: Chain, newName?: string): Chain {
  return {
    ...chain,
    id: crypto.randomUUID(),
    name: newName || `${chain.name} (Copy)`,
    metadata: {
      ...chain.metadata,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  };
}
