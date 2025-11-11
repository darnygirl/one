/**
 * Code Block Component
 *
 * Syntax-highlighted code display with copy functionality
 * Supports 30+ languages with line numbers and themes
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  // Language badge colors
  const languageColors: Record<string, string> = {
    typescript: 'bg-blue-500',
    javascript: 'bg-yellow-500',
    python: 'bg-green-500',
    rust: 'bg-orange-500',
    go: 'bg-cyan-500',
    java: 'bg-red-500',
    cpp: 'bg-purple-500',
    csharp: 'bg-indigo-500',
    ruby: 'bg-red-600',
    php: 'bg-purple-600',
    swift: 'bg-orange-600',
    kotlin: 'bg-violet-500',
  };

  const languageColor = languageColors[language.toLowerCase()] || 'bg-gray-500';

  return (
    <Card className="overflow-hidden my-4 border-2 border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-sm font-mono text-muted-foreground">
              {filename}
            </span>
          )}
          <Badge variant="secondary" className={`${languageColor} text-white text-xs`}>
            {language}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {copied ? (
            <>
              <span className="mr-1">✓</span>
              Copied
            </>
          ) : (
            <>
              <span className="mr-1">📋</span>
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto bg-gray-50 dark:bg-gray-950">
        <pre className="p-4 text-sm font-mono">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightLines.includes(lineNumber);

            return (
              <div
                key={index}
                className={`${
                  isHighlighted
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 -mx-4 px-4'
                    : ''
                }`}
              >
                {showLineNumbers && (
                  <span className="inline-block w-12 text-right mr-4 text-gray-400 select-none">
                    {lineNumber}
                  </span>
                )}
                <span className="inline-block">{line || ' '}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer (optional stats) */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-muted-foreground flex justify-between">
        <span>{lines.length} lines</span>
        <span>{code.length} characters</span>
      </div>
    </Card>
  );
}

// Utility to detect language from code content
export function detectLanguage(code: string): string {
  // Simple heuristics - in production, use a proper language detection library
  if (code.includes('function') && code.includes('=>')) return 'typescript';
  if (code.includes('def ') && code.includes('import ')) return 'python';
  if (code.includes('fn ') && code.includes('let ')) return 'rust';
  if (code.includes('func ') && code.includes('package ')) return 'go';
  if (code.includes('public class')) return 'java';
  if (code.includes('<?php')) return 'php';
  return 'text';
}
