/**
 * Tool Component
 *
 * Visualizes AI tool/function calls
 * Shows parameters, execution, and results
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ToolCallProps {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: string;
  executionTime?: number;
}

export function Tool({
  toolName,
  parameters,
  result,
  status,
  error,
  executionTime,
}: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: {
      icon: '⏳',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30',
      label: 'Pending',
    },
    executing: {
      icon: '⚡',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 animate-pulse',
      label: 'Executing',
    },
    completed: {
      icon: '✓',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30',
      label: 'Completed',
    },
    failed: {
      icon: '✗',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30',
      label: 'Failed',
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="my-3 border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🔧</span>
                </div>
                <div className="text-left">
                  <CardTitle className="text-sm font-mono">{toolName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Object.keys(parameters).length} parameter{Object.keys(parameters).length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={config.color}>
                  {config.icon} {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-3">
            {/* Parameters */}
            <div>
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                Parameters
              </h4>
              <div className="bg-white dark:bg-gray-950 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(parameters, null, 2)}
                </pre>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                  Result
                </h4>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <pre className="text-xs font-mono overflow-x-auto">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-red-600 dark:text-red-400 uppercase">
                  Error
                </h4>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Execution Time */}
            {executionTime !== undefined && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>⏱️</span>
                <span>Executed in {executionTime}ms</span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
