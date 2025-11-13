/**
 * Translation Tool
 * Translate text between languages
 */

import type { ToolDefinition } from '../types';

export const translationTool: ToolDefinition = {
  name: 'translate',
  description: 'Translate text between different languages',
  category: 'utility',
  parameters: [
    {
      name: 'text',
      type: 'string',
      description: 'The text to translate',
      required: true,
    },
    {
      name: 'from',
      type: 'string',
      description: 'Source language code (e.g., "en", "es", "fr", "auto" for auto-detect)',
      required: false,
    },
    {
      name: 'to',
      type: 'string',
      description: 'Target language code (e.g., "en", "es", "fr", "de", "ja", "zh")',
      required: true,
    },
  ],
  async execute({ text, from = 'auto', to }) {
    try {
      // Using LibreTranslate API (free and open source)
      // Note: This is a demo. In production, you'd use a paid API or self-hosted instance
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();

      return {
        original: text,
        translated: data.translatedText,
        from: from === 'auto' ? data.detectedLanguage?.language || 'auto' : from,
        to,
      };
    } catch (error) {
      throw new Error(`Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
