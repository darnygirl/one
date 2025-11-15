/**
 * MarkdownStreaming Component
 * Markdown with live rendering as it streams, supporting all markdown features
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { CodeBlockStreaming } from './CodeBlockStreaming';

interface MarkdownStreamingProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  speed?: number; // ms per character
  showCursor?: boolean;
}

export function MarkdownStreaming({
  content,
  isStreaming = false,
  className,
  speed = 20,
  showCursor = false,
}: MarkdownStreamingProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderedHtml, setRenderedHtml] = useState('');

  // Configure marked with custom renderer
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  // Streaming effect - stream word by word for smoother rendering
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        // Find next word boundary (space, newline, or punctuation)
        let nextIndex = currentIndex + 1;
        const char = content[currentIndex];

        if (char === ' ' || char === '\n' || char === '.' || char === ',' || char === '!') {
          // Stream to next word
          const nextSpace = content.indexOf(' ', currentIndex + 1);
          const nextNewline = content.indexOf('\n', currentIndex + 1);
          const boundaries = [nextSpace, nextNewline].filter(i => i !== -1);
          nextIndex = boundaries.length > 0 ? Math.min(...boundaries) + 1 : content.length;
        }

        setDisplayedContent(content.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [content, currentIndex, isStreaming, speed]);

  // Reset when content changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedContent('');
  }, [content]);

  // Render markdown to HTML
  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const html = await marked.parse(displayedContent || '');
        setRenderedHtml(html);
      } catch (error) {
        console.error('Markdown rendering error:', error);
        setRenderedHtml(displayedContent);
      }
    };

    if (displayedContent) {
      renderMarkdown();
    }
  }, [displayedContent]);

  return (
    <div className={cn('relative', className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="prose prose-sm dark:prose-invert max-w-none"
      >
        <div
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          className={cn(
            'markdown-content',
            '[&>*:first-child]:mt-0',
            '[&>*:last-child]:mb-0',
            '[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-4',
            '[&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-3',
            '[&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2',
            '[&>p]:my-3 [&>p]:leading-7',
            '[&>ul]:my-3 [&>ul]:list-disc [&>ul]:pl-6',
            '[&>ol]:my-3 [&>ol]:list-decimal [&>ol]:pl-6',
            '[&>li]:my-1',
            '[&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4',
            '[&>pre]:my-4 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:bg-muted [&>pre]:overflow-x-auto',
            '[&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:bg-muted [&>code]:text-sm [&>code]:font-mono',
            '[&>table]:my-4 [&>table]:w-full [&>table]:border-collapse',
            '[&>table>thead]:border-b',
            '[&>table>thead>tr>th]:p-2 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold',
            '[&>table>tbody>tr]:border-b',
            '[&>table>tbody>tr>td]:p-2',
            '[&>hr]:my-6 [&>hr]:border-t',
            '[&>a]:text-primary [&>a]:underline [&>a]:underline-offset-4 [&>a]:hover:text-primary/80',
            '[&>img]:rounded-lg [&>img]:my-4'
          )}
        />

        {isStreaming && showCursor && (
          <motion.span
            className="inline-block w-2 h-4 ml-1 bg-primary"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

/**
 * Extract code blocks from markdown for custom rendering
 */
export function extractCodeBlocks(markdown: string) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string; index: number }> = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2],
      index: match.index,
    });
  }

  return blocks;
}
