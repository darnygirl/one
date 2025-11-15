/**
 * LiveProgressTracker - Streaming Component (Cycle 24)
 *
 * Progress tracking with real-time updates, time estimation, and history
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatRelativeTime } from "../utils";
import { cn } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  Pause,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  progress?: number; // 0-100
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface ProgressHistory {
  timestamp: number;
  step: string;
  status: string;
  progress: number;
}

export interface LiveProgressTrackerProps {
  steps: ProgressStep[];
  currentStepId?: string;
  totalProgress?: number;
  estimatedTimeRemaining?: number;
  isPaused?: boolean;
  history?: ProgressHistory[];
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: (stepId: string) => void;
  showHistory?: boolean;
  showEstimation?: boolean;
  className?: string;
}

export function LiveProgressTracker({
  steps,
  currentStepId,
  totalProgress = 0,
  estimatedTimeRemaining,
  isPaused = false,
  history = [],
  onPause,
  onResume,
  onCancel,
  onRetry,
  showHistory = true,
  showEstimation = true,
  className,
}: LiveProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate stats
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const failedSteps = steps.filter((s) => s.status === "failed").length;
  const totalSteps = steps.length;

  // Update elapsed time
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate overall progress
  const overallProgress =
    totalProgress ||
    (steps.reduce((sum, step) => sum + (step.progress || 0), 0) / totalSteps);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Tracker</CardTitle>
            <div className="flex gap-2">
              {onPause && !isPaused && (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {onResume && isPaused && (
                <Button variant="outline" size="sm" onClick={onResume}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard
              label="Completed"
              value={`${completedSteps}/${totalSteps}`}
              icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
            />
            <StatCard
              label="Failed"
              value={failedSteps}
              icon={<XCircle className="h-4 w-4 text-red-600" />}
            />
            <StatCard
              label="Elapsed Time"
              value={formatTime(elapsedTime)}
              icon={<Clock className="h-4 w-4 text-blue-600" />}
            />
            {showEstimation && estimatedTimeRemaining !== undefined && (
              <StatCard
                label="Est. Remaining"
                value={formatTime(estimatedTimeRemaining)}
                icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
              />
            )}
          </div>

          {/* Paused Indicator */}
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg"
            >
              <Pause className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Progress Paused
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                isCurrent={step.id === currentStepId}
                onRetry={onRetry}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {showHistory && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {history
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                    >
                      <div>
                        <span className="font-medium">{item.step}</span>
                        <span className="text-muted-foreground ml-2">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {item.progress}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      {icon}
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

interface StepItemProps {
  step: ProgressStep;
  index: number;
  isCurrent: boolean;
  onRetry?: (stepId: string) => void;
}

function StepItem({ step, index, isCurrent, onRetry }: StepItemProps) {
  const statusIcons = {
    pending: <Circle className="h-5 w-5 text-muted-foreground" />,
    "in-progress": <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    failed: <XCircle className="h-5 w-5 text-red-600" />,
  };

  const statusColors = {
    pending: "text-muted-foreground",
    "in-progress": "text-blue-600",
    completed: "text-green-600",
    failed: "text-red-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
        isCurrent && "bg-muted/50 border-primary"
      )}
    >
      {/* Status Icon */}
      <div className="mt-0.5">{statusIcons[step.status]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn("font-medium", statusColors[step.status])}>
            {index + 1}. {step.title}
          </h4>
          <Badge variant="outline" className={statusColors[step.status]}>
            {step.status}
          </Badge>
        </div>

        {step.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {step.description}
          </p>
        )}

        {/* Progress Bar for In-Progress Steps */}
        {step.status === "in-progress" && step.progress !== undefined && (
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{step.progress}%</span>
            </div>
            <Progress value={step.progress} className="h-1" />
          </div>
        )}

        {/* Error Message */}
        {step.status === "failed" && step.error && (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-red-600">{step.error}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(step.id)}
              >
                Retry
              </Button>
            )}
          </div>
        )}

        {/* Timing Info */}
        {(step.startedAt || step.completedAt) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            {step.startedAt && (
              <span>Started {formatRelativeTime(step.startedAt)}</span>
            )}
            {step.completedAt && (
              <span>Completed {formatRelativeTime(step.completedAt)}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
