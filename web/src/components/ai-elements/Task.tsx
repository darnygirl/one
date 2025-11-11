/**
 * Task Component
 *
 * Tracks task completion with progress indicators
 * Shows status, subtasks, and time tracking
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskProps {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  subtasks?: Subtask[];
  startTime?: number;
  endTime?: number;
  error?: string;
}

export function Task({
  title,
  description,
  status,
  subtasks = [],
  startTime,
  endTime,
  error,
}: TaskProps) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      label: 'Pending',
    },
    in_progress: {
      icon: '🔄',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      label: 'In Progress',
    },
    completed: {
      icon: '✅',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      label: 'Completed',
    },
    failed: {
      icon: '❌',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      label: 'Failed',
    },
  };

  const config = statusConfig[status];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const duration = startTime && endTime ? endTime - startTime : null;
  const elapsed = startTime && !endTime ? Date.now() - startTime : null;

  return (
    <Card className="my-4 glass-card border-2 border-teal-200 dark:border-teal-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{title}</CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className={`${config.color} flex-shrink-0`}>
            {config.icon} {config.label}
          </Badge>
        </div>

        {/* Progress Bar (if subtasks exist) */}
        {subtasks.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                {completedSubtasks} of {subtasks.length} subtasks complete
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      {(subtasks.length > 0 || error) && (
        <CardContent>
          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="space-y-2 mb-4">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                      subtask.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {subtask.completed ? '✓' : ''}
                  </div>
                  <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 flex-shrink-0">❌</span>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Task Failed
                  </p>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timing */}
          {(duration || elapsed) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-gray-200 dark:border-gray-800">
              {duration && (
                <span>Completed in {(duration / 1000).toFixed(1)}s</span>
              )}
              {elapsed && (
                <span className="animate-pulse">
                  Running for {(elapsed / 1000).toFixed(0)}s
                </span>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
