/**
 * Pre-built Chain Presets
 * Useful chains demonstrating tool composition
 */

import type { Chain } from './types';

/**
 * Chain 1: Weather Research Chain
 * Search for location info → Get weather forecast
 */
export const weatherResearchChain: Chain = {
  id: 'weather-research',
  name: 'Weather Research',
  description: 'Search for a location and get detailed weather forecast',
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
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['validation', 'json', 'regex', 'security'],
  },
};

/**
 * All preset chains
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
