/**
 * ThinkingIndicator Component
 * Animated thinking/reasoning display with progress
 */

import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  isThinking?: boolean;
  message?: string;
  progress?: number; // 0-100
  stage?: string;
  variant?: 'dots' | 'spinner' | 'pulse';
  className?: string;
}

export function ThinkingIndicator({
  isThinking = true,
  message = 'AI is thinking...',
  progress,
  stage,
  variant = 'dots',
  className,
}: ThinkingIndicatorProps) {
  if (!isThinking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border bg-muted/50',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {variant === 'spinner' && (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        )}

        {variant === 'pulse' && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Brain className="h-5 w-5 text-primary" />
          </motion.div>
        )}

        {variant === 'dots' && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {stage && (
            <p className="text-xs text-muted-foreground mt-0.5">{stage}</p>
          )}
        </div>
      </div>

      {progress !== undefined && (
        <div className="w-32">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </motion.div>
  );
}
