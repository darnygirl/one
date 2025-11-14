/**
 * Regex Tester Tool
 * Test regex patterns, extract matches, and explain patterns
 */

import type { ToolDefinition } from '../types';

export const regexTool: ToolDefinition = {
  name: 'regex_test',
  description: 'Test regex patterns, extract matches, and explain patterns',
  category: 'utility',
  parameters: [
    {
      name: 'pattern',
      type: 'string',
      description: 'Regex pattern (without delimiters)',
      required: true,
    },
    {
      name: 'text',
      type: 'string',
      description: 'Text to test against',
      required: true,
    },
    {
      name: 'flags',
      type: 'string',
      description: 'Regex flags (g, i, m, s, u, y)',
      required: false,
    },
  ],
  async execute({ pattern, text, flags = 'g' }) {
    try {
      const regex = new RegExp(pattern, flags);
      const matches: any[] = [];
      let match;

      // Extract all matches
      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            named_groups: match.groups || {},
          });
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            named_groups: match.groups || {},
          });
        }
      }

      // Test if pattern matches
      const test_regex = new RegExp(pattern, flags.replace('g', ''));
      const is_match = test_regex.test(text);

      // Explain pattern
      const explanation = explainRegex(pattern);

      return {
        pattern,
        flags,
        text,
        is_match,
        match_count: matches.length,
        matches,
        explanation,
        common_patterns: getCommonPatterns(),
      };
    } catch (error) {
      throw new Error(`Regex test failed: ${error instanceof Error ? error.message : 'Invalid regex pattern'}`);
    }
  },
};

// Explain regex pattern
function explainRegex(pattern: string): string[] {
  const explanations: string[] = [];

  if (pattern.includes('^')) {
    explanations.push('^ - Matches start of string');
  }
  if (pattern.includes('$')) {
    explanations.push('$ - Matches end of string');
  }
  if (pattern.includes('\\d')) {
    explanations.push('\\d - Matches any digit (0-9)');
  }
  if (pattern.includes('\\w')) {
    explanations.push('\\w - Matches any word character (a-z, A-Z, 0-9, _)');
  }
  if (pattern.includes('\\s')) {
    explanations.push('\\s - Matches any whitespace character');
  }
  if (pattern.includes('.')) {
    explanations.push('. - Matches any character except newline');
  }
  if (pattern.includes('*')) {
    explanations.push('* - Matches 0 or more of preceding element');
  }
  if (pattern.includes('+')) {
    explanations.push('+ - Matches 1 or more of preceding element');
  }
  if (pattern.includes('?')) {
    explanations.push('? - Matches 0 or 1 of preceding element');
  }
  if (pattern.includes('[')) {
    explanations.push('[...] - Matches any character in the set');
  }
  if (pattern.includes('(')) {
    explanations.push('(...) - Capturing group');
  }
  if (pattern.includes('(?:')) {
    explanations.push('(?:...) - Non-capturing group');
  }
  if (pattern.includes('|')) {
    explanations.push('| - Alternation (OR)');
  }

  return explanations.length > 0
    ? explanations
    : ['No special characters detected - matches literal text'];
}

// Common regex patterns
function getCommonPatterns() {
  return [
    {
      name: 'Email',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: 'Matches email addresses',
    },
    {
      name: 'URL',
      pattern: 'https?://[^\\s]+',
      description: 'Matches HTTP/HTTPS URLs',
    },
    {
      name: 'Phone (US)',
      pattern: '\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}',
      description: 'Matches US phone numbers',
    },
    {
      name: 'Date (YYYY-MM-DD)',
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      description: 'Matches ISO date format',
    },
    {
      name: 'IP Address',
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      description: 'Matches IPv4 addresses',
    },
    {
      name: 'Hex Color',
      pattern: '#[0-9a-fA-F]{6}\\b',
      description: 'Matches hex color codes',
    },
    {
      name: 'UUID',
      pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
      description: 'Matches UUIDs',
    },
    {
      name: 'Credit Card',
      pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}',
      description: 'Matches credit card numbers',
    },
  ];
}
