/**
 * StreamingResponse Component
 * AI response with token-by-token streaming and typing effect
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamingResponseProps {
  content: string;
  isStreaming?: boolean;
  onStop?: () => void;
  className?: string;
  showCursor?: boolean;
  speed?: number; // ms per character
}

export function StreamingResponse({
  content,
  isStreaming = false,
  onStop,
  className,
  showCursor = true,
  speed = 30,
}: StreamingResponseProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [content, currentIndex, isStreaming, speed]);

  // Reset when content changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedContent('');
  }, [content]);

  return (
    <div className={cn('relative', className)}>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">
          {displayedContent}
          {isStreaming && showCursor && (
            <motion.span
              className="inline-block w-2 h-4 ml-0.5 bg-primary"
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

      <AnimatePresence>
        {isStreaming && onStop && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Generating
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
