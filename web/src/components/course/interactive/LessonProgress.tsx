/**
 * Lesson Progress Component
 * Displays individual lesson completion status and stats
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  Trophy,
  BookOpen,
} from 'lucide-react';
import type { LessonProgressData } from '@/types/course';

interface LessonProgressProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    duration?: number; // in minutes
    hasQuiz?: boolean;
    order: number;
  };
  progress?: LessonProgressData;
  onStart?: () => void;
  onContinue?: () => void;
  onReview?: () => void;
  locked?: boolean;
  showDetails?: boolean;
}

export function LessonProgress({
  lesson,
  progress,
  onStart,
  onContinue,
  onReview,
  locked = false,
  showDetails = true,
}: LessonProgressProps) {
  const status = progress?.status || 'not-started';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in-progress';
  const progressPercent = progress?.progress || 0;

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Get status icon
  const getStatusIcon = () => {
    if (locked) {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
    if (isCompleted) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (isInProgress) {
      return <PlayCircle className="h-5 w-5 text-primary" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  // Get action button
  const getActionButton = () => {
    if (locked) {
      return (
        <Button variant="outline" disabled>
          Locked
        </Button>
      );
    }
    if (isCompleted && onReview) {
      return (
        <Button variant="outline" onClick={onReview}>
          <BookOpen className="h-4 w-4 mr-2" />
          Review
        </Button>
      );
    }
    if (isInProgress && onContinue) {
      return (
        <Button onClick={onContinue}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Continue
        </Button>
      );
    }
    if (onStart) {
      return (
        <Button onClick={onStart}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Lesson
        </Button>
      );
    }
    return null;
  };

  return (
    <Card className={`p-4 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Lesson {lesson.order}
                </span>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 rounded">
                    Completed
                  </span>
                )}
                {isInProgress && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                    In Progress
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">{getActionButton()}</div>
          </div>

          {/* Progress Bar (only if in progress) */}
          {isInProgress && progressPercent > 0 && (
            <div className="mb-3">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progressPercent)}% complete
              </p>
            </div>
          )}

          {/* Stats */}
          {showDetails && !locked && (
            <div className="flex flex-wrap gap-4 text-sm">
              {/* Duration */}
              {lesson.duration && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration} min</span>
                </div>
              )}

              {/* Time Spent */}
              {progress?.timeSpent && progress.timeSpent > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Spent: {formatTime(progress.timeSpent)}</span>
                </div>
              )}

              {/* Quiz Badge */}
              {lesson.hasQuiz && (
                <div className="flex items-center gap-1.5">
                  {progress?.quizPassed ? (
                    <>
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">
                        Quiz: {progress.quizScore}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Includes Quiz</span>
                    </>
                  )}
                </div>
              )}

              {/* Completion Date */}
              {progress?.completedAt && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Completed{' '}
                    {new Date(progress.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
