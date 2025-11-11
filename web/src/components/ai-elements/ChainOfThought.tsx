/**
 * Chain of Thought Component
 *
 * Displays AI's reasoning process step-by-step
 * Beautiful collapsible UI with progress indicators
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ThoughtStep {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number; // milliseconds
}

interface ChainOfThoughtProps {
  steps: ThoughtStep[];
  title?: string;
  collapsed?: boolean;
}

export function ChainOfThought({
  steps,
  title = 'Thinking Process',
  collapsed: initialCollapsed = false,
}: ChainOfThoughtProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const statusIcons = {
    pending: '⏳',
    active: '🔄',
    completed: '✅',
    error: '❌',
  };

  const statusColors = {
    pending: 'text-gray-400',
    active: 'text-blue-500 animate-pulse',
    completed: 'text-green-500',
    error: 'text-red-500',
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card className="my-4 glass-card border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {completedSteps} of {steps.length} steps complete
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▼' : '▲'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative pl-8 pb-3 ${
                  index < steps.length - 1
                    ? 'border-l-2 border-gray-200 dark:border-gray-800 ml-2'
                    : ''
                }`}
              >
                {/* Step Number/Icon */}
                <div
                  className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : step.status === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>

                {/* Step Content */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className={statusColors[step.status]}>
                        {statusIcons[step.status]}
                      </span>
                      {step.title}
                    </h4>
                    {step.duration && (
                      <Badge variant="secondary" className="text-xs">
                        {step.duration}ms
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
