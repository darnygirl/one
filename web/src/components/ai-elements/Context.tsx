/**
 * Context Display Component
 *
 * Shows conversation context information
 * Token usage, model details, response time, cost
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ModelInfo } from '@/lib/ai/models';

interface ContextProps {
  model: ModelInfo;
  inputTokens: number;
  outputTokens: number;
  responseTime?: number;
  contextRemaining?: number;
}

export function Context({
  model,
  inputTokens,
  outputTokens,
  responseTime,
  contextRemaining,
}: ContextProps) {
  const totalTokens = inputTokens + outputTokens;
  const cost = (model.costPer1M.input * inputTokens + model.costPer1M.output * outputTokens) / 1000000;
  const contextUsage = contextRemaining ? ((totalTokens / model.contextLength) * 100) : 0;

  return (
    <Card className="my-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800">
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Model */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Model:</span>
            <Badge variant="secondary" className="text-xs">
              {model.name}
            </Badge>
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-mono font-semibold">
              {totalTokens.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              ({inputTokens.toLocaleString()} in, {outputTokens.toLocaleString()} out)
            </span>
          </div>

          {/* Cost */}
          {cost > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-mono font-semibold">
                ${cost.toFixed(6)}
              </span>
            </div>
          )}

          {/* Response Time */}
          {responseTime && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-mono font-semibold">
                {(responseTime / 1000).toFixed(2)}s
              </span>
            </div>
          )}

          {/* Context Usage */}
          {contextRemaining !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Context:</span>
              <Badge variant={contextUsage > 80 ? 'destructive' : 'secondary'} className="text-xs">
                {contextUsage.toFixed(0)}% used
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
