/**
 * Code Formatter Tool
 * Format and beautify code in 10+ programming languages
 */

import type { ToolDefinition } from '../types';

// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript: /\b(const|let|var|function|=>|console\.log)\b/,
  typescript: /\b(interface|type|enum|as|implements|extends)\b/,
  python: /\b(def|import|class|if __name__|print)\b/,
  rust: /\b(fn|let mut|impl|pub|use)\b/,
  go: /\b(package|func|import|type|struct)\b/,
  java: /\b(public class|private|protected|extends|implements)\b/,
  cpp: /\b(#include|using namespace|std::)\b/,
  ruby: /\b(def|end|class|require|puts)\b/,
  php: /<\?php|echo\s+|function\s+/,
  swift: /\b(func|var|let|import|class|struct)\b/,
} as const;

// Detect language from code
function detectLanguage(code: string): string | null {
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  // Check for JSON
  try {
    JSON.parse(code);
    return 'json';
  } catch {
    // Not JSON
  }

  return null;
}

// Basic linting suggestions
function getLintingSuggestions(code: string, language: string): string[] {
  const suggestions: string[] = [];

  // Universal suggestions
  if (code.includes('\t')) {
    suggestions.push('Consider using spaces instead of tabs for consistency');
  }

  const lines = code.split('\n');
  const longLines = lines.filter(l => l.length > 120);
  if (longLines.length > 0) {
    suggestions.push(`${longLines.length} line(s) exceed 120 characters`);
  }

  // Language-specific suggestions
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('var ')) {
      suggestions.push('Use "const" or "let" instead of "var"');
    }
    if (code.includes('==') && !code.includes('===')) {
      suggestions.push('Use strict equality (===) instead of loose equality (==)');
    }
    if (!code.includes(';') && code.split('\n').length > 3) {
      suggestions.push('Consider adding semicolons for clarity');
    }
  }

  if (language === 'python') {
    const hasInconsistentIndent = lines.some(l => l.startsWith('  ') && l.includes('\t'));
    if (hasInconsistentIndent) {
      suggestions.push('Inconsistent indentation detected (mixing spaces and tabs)');
    }
  }

  return suggestions;
}

// Minify code (basic implementation)
function minifyCode(code: string, language: string): string {
  let minified = code;

  // Remove comments
  if (language === 'javascript' || language === 'typescript' || language === 'java' || language === 'cpp') {
    minified = minified.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  } else if (language === 'python' || language === 'ruby') {
    minified = minified.replace(/#.*/g, '');
  } else if (language === 'php') {
    minified = minified.replace(/\/\*[\s\S]*?\*\/|\/\/.*|#.*/g, '');
  }

  // Remove extra whitespace (but preserve strings)
  minified = minified
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('');

  return minified;
}

// Format code with intelligent indentation
function formatCode(code: string, language: string): string {
  // JSON special handling
  if (language === 'json') {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }

  // For other languages, do intelligent indentation
  const lines = code.split('\n');
  let indent = 0;
  const indentSize = 2;
  const openBraces = /[{[(]\s*$/;
  const closeBraces = /^\s*[}\])]/;
  const formatted: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Decrease indent for closing braces
    if (closeBraces.test(trimmed)) {
      indent = Math.max(0, indent - 1);
    }

    // Add formatted line
    formatted.push(' '.repeat(indent * indentSize) + trimmed);

    // Increase indent for opening braces
    if (openBraces.test(trimmed) && !closeBraces.test(trimmed)) {
      indent++;
    }

    // Special handling for language-specific keywords
    if (language === 'python' && trimmed.endsWith(':')) {
      indent++;
    }
  }

  return formatted.join('\n');
}

export const codeFormatterTool: ToolDefinition = {
  name: 'format_code',
  description: 'Format and beautify code in 10+ programming languages with syntax analysis',
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
      description: 'Programming language (javascript, typescript, python, rust, go, java, cpp, ruby, php, swift, json, html, css, etc.)',
      required: false,
    },
    {
      name: 'minify',
      type: 'boolean',
      description: 'Minify code instead of formatting (removes comments and whitespace)',
      required: false,
    },
    {
      name: 'lint',
      type: 'boolean',
      description: 'Include linting suggestions',
      required: false,
    },
  ],
  async execute({ code, language, minify = false, lint = true }) {
    try {
      // Detect language if not provided
      const detectedLanguage = language?.toLowerCase() || detectLanguage(code) || 'unknown';

      // Format or minify
      const formatted = minify
        ? minifyCode(code, detectedLanguage)
        : formatCode(code, detectedLanguage);

      // Get linting suggestions
      const suggestions = lint ? getLintingSuggestions(code, detectedLanguage) : [];

      // Calculate metrics
      const originalLines = code.split('\n').length;
      const formattedLines = formatted.split('\n').length;
      const originalSize = code.length;
      const formattedSize = formatted.length;
      const reduction = minify
        ? Math.round(((originalSize - formattedSize) / originalSize) * 100)
        : 0;

      return {
        original: code,
        formatted,
        language: detectedLanguage,
        minified: minify,
        suggestions,
        metrics: {
          original_lines: originalLines,
          formatted_lines: formattedLines,
          original_size: originalSize,
          formatted_size: formattedSize,
          size_reduction: reduction,
        },
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to format code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
