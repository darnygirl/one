/**
 * Code Formatter Tool
 * Format and beautify code in various languages
 */

import type { ToolDefinition } from '../types';

export const codeFormatterTool: ToolDefinition = {
  name: 'format_code',
  description: 'Format and beautify code in various programming languages',
  category: 'productivity',
  parameters: [
    {
      name: 'code',
      type: 'string',
      description: 'The code to format',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Programming language (javascript, typescript, python, json, html, css, etc.)',
      required: true,
    },
  ],
  async execute({ code, language }) {
    try {
      // Simple formatting for common languages
      const lang = language.toLowerCase();

      if (lang === 'json') {
        try {
          const parsed = JSON.parse(code);
          const formatted = JSON.stringify(parsed, null, 2);
          return {
            original: code,
            formatted,
            language: 'json',
            success: true,
          };
        } catch (e) {
          throw new Error('Invalid JSON');
        }
      }

      // For other languages, do basic indentation cleanup
      const lines = code.split('\n');
      let indent = 0;
      const formatted = lines.map(line => {
        const trimmed = line.trim();

        // Decrease indent for closing braces/brackets
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          indent = Math.max(0, indent - 1);
        }

        const result = '  '.repeat(indent) + trimmed;

        // Increase indent for opening braces/brackets
        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
          indent++;
        }

        return result;
      }).join('\n');

      return {
        original: code,
        formatted,
        language,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to format code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
