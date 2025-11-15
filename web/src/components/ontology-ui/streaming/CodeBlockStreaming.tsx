/**
 * CodeBlockStreaming Component
 * Code blocks with syntax highlighting, streaming support, and copy functionality
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { codeToHtml } from 'shiki';

interface CodeBlockStreamingProps {
  code: string;
  language: string;
  filename?: string;
  isStreaming?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export function CodeBlockStreaming({
  code,
  language,
  filename,
  isStreaming = false,
  showLineNumbers = true,
  className,
  theme = 'dark',
}: CodeBlockStreamingProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');

  // Streaming effect
  useEffect(() => {
    if (isStreaming && currentIndex < code.length) {
      const timeout = setTimeout(() => {
        // Stream line by line for smoother rendering
        const nextLineEnd = code.indexOf('\n', currentIndex);
        const nextIndex = nextLineEnd === -1 ? code.length : nextLineEnd + 1;
        setDisplayedCode(code.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, 50);

      return () => clearTimeout(timeout);
    } else if (!isStreaming) {
      setDisplayedCode(code);
    }
  }, [code, currentIndex, isStreaming]);

  // Reset when code changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedCode('');
  }, [code]);

  // Syntax highlighting
  useEffect(() => {
    const highlight = async () => {
      try {
        const html = await codeToHtml(displayedCode || ' ', {
          lang: language,
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        });
        setHighlightedHtml(html);
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        setHighlightedHtml(`<pre><code>${displayedCode}</code></pre>`);
      }
    };

    if (displayedCode) {
      highlight();
    }
  }, [displayedCode, language, theme]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = displayedCode.split('\n');

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          {filename && (
            <span className="text-sm font-medium">{filename}</span>
          )}
          <Badge variant="outline" className="font-mono text-xs">
            {language}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="relative">
        {showLineNumbers && lines.length > 1 && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r flex flex-col font-mono text-xs text-muted-foreground">
            {lines.map((_, i) => (
              <div key={i} className="px-2 py-0.5 text-right leading-6">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            'overflow-x-auto',
            showLineNumbers && lines.length > 1 && 'pl-12'
          )}
        >
          {highlightedHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              className="[&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4 [&>pre]:text-sm [&>pre]:leading-6"
            />
          ) : (
            <pre className="p-4 text-sm leading-6 m-0">
              <code>{displayedCode}</code>
            </pre>
          )}
        </div>

        {isStreaming && (
          <motion.div
            className="absolute bottom-4 right-4 w-2 h-4 bg-primary"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        )}
      </div>
    </div>
  );
}
