/**
 * Plan Component
 *
 * Displays AI's plan before execution
 * Shows steps, dependencies, and estimated time
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlanStep {
  id: string;
  title: string;
  description: string;
  dependencies?: string[];
  estimatedTime?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
}

interface PlanProps {
  steps: PlanStep[];
  title?: string;
  totalTime?: string;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function Plan({
  steps,
  title = 'Execution Plan',
  totalTime,
  onApprove,
  onReject,
  showActions = true,
}: PlanProps) {
  const complexityColors = {
    simple: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    complex: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const complexityIcons = {
    simple: '✓',
    moderate: '⚡',
    complex: '🔥',
  };

  return (
    <Card className="my-4 glass-card border-2 border-cyan-200 dark:border-cyan-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{steps.length} steps</span>
                {totalTime && (
                  <>
                    <span>•</span>
                    <span>Est. {totalTime}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative pl-8"
            >
              {/* Step Number */}
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Step Content */}
              <Card className="ml-2 bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {step.complexity && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${complexityColors[step.complexity]}`}
                        >
                          {complexityIcons[step.complexity]} {step.complexity}
                        </Badge>
                      )}
                      {step.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          ⏱️ {step.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>

                  {step.dependencies && step.dependencies.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Depends on:</span>
                      <div className="flex gap-1">
                        {step.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-3 top-6 w-0.5 h-4 bg-gradient-to-b from-cyan-500 to-blue-500" />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {showActions && (onApprove || onReject) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {onReject && (
              <Button
                variant="outline"
                onClick={onReject}
                className="flex-1"
              >
                ✗ Modify Plan
              </Button>
            )}
            {onApprove && (
              <Button
                onClick={onApprove}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                ✓ Approve & Execute
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
