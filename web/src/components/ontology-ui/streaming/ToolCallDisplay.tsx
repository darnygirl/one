/**
 * ToolCallDisplay Component
 * Display tool calls with expandable details and syntax highlighting
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Wrench, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ToolCall } from './types';

interface ToolCallDisplayProps {
  toolCall: ToolCall;
  className?: string;
  defaultExpanded?: boolean;
}

export function ToolCallDisplay({
  toolCall,
  className,
  defaultExpanded = false,
}: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const statusConfig = {
    pending: {
      icon: Loader2,
      label: 'Pending',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      iconClassName: 'animate-spin',
    },
    running: {
      icon: Loader2,
      label: 'Running',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      iconClassName: 'animate-spin',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      iconClassName: '',
    },
    error: {
      icon: XCircle,
      label: 'Error',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      iconClassName: '',
    },
  };

  const config = statusConfig[toolCall.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card overflow-hidden',
        className
      )}
    >
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start gap-3 p-4 h-auto hover:bg-muted"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}

        <Wrench className="h-4 w-4 text-primary" />

        <span className="font-mono text-sm flex-1 text-left">
          {toolCall.name}
        </span>

        <Badge className={config.className}>
          <StatusIcon className={cn('h-3 w-3 mr-1', config.iconClassName)} />
          {config.label}
        </Badge>
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t p-4 space-y-4">
              {/* Arguments */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Arguments
                </p>
                <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                  <code className="text-foreground">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </code>
                </pre>
              </div>

              {/* Result */}
              {toolCall.result !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Result
                  </p>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                    <code className="text-foreground">
                      {typeof toolCall.result === 'string'
                        ? toolCall.result
                        : JSON.stringify(toolCall.result, null, 2)}
                    </code>
                  </pre>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground">
                {new Date(toolCall.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
