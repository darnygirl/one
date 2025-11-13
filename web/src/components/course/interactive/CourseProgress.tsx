/**
 * Course Progress Component
 * Displays overall course progress with stats and milestones
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  Trophy,
  Calendar,
  Target,
  Flame,
} from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import type { CourseProgressData, LearningStreak, ProgressMilestone } from '@/types/course';

interface CourseProgressProps {
  courseTitle: string;
  progress: CourseProgressData;
  streak?: LearningStreak;
  milestones?: ProgressMilestone[];
  onContinue?: () => void;
  onGetCertificate?: () => void;
  showDetailedStats?: boolean;
}

export function CourseProgress({
  courseTitle,
  progress,
  streak,
  milestones,
  onContinue,
  onGetCertificate,
  showDetailedStats = true,
}: CourseProgressProps) {
  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate days since enrollment
  const daysSinceEnrollment = Math.floor(
    (Date.now() - new Date(progress.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get completion status
  const isCompleted = progress.overallProgress === 100;
  const canGetCertificate = progress.certificateEligible && !progress.certificateEarned;

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Progress Ring */}
          <div className="flex justify-center md:justify-start">
            <ProgressRing
              progress={progress.overallProgress}
              size={160}
              strokeWidth={12}
            />
          </div>

          {/* Stats */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{courseTitle}</h2>
            <p className="text-muted-foreground mb-4">
              {isCompleted
                ? 'Congratulations on completing this course!'
                : 'Keep up the great work!'}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {progress.lessonsCompleted}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {progress.lessonsTotal} lessons
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-primary">
                  {progress.quizzesCompleted}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {progress.quizzesTotal} quizzes
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(progress.averageQuizScore)}%
                </div>
                <div className="text-sm text-muted-foreground">avg quiz score</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatTime(progress.timeSpent)}
                </div>
                <div className="text-sm text-muted-foreground">time spent</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {!isCompleted && onContinue && (
                <Button onClick={onContinue} size="lg">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              )}
              {canGetCertificate && onGetCertificate && (
                <Button onClick={onGetCertificate} size="lg" variant="default">
                  <Award className="h-4 w-4 mr-2" />
                  Get Certificate
                </Button>
              )}
              {progress.certificateEarned && (
                <Badge variant="secondary" className="py-2 px-4 text-sm">
                  <Award className="h-4 w-4 mr-2" />
                  Certificate Earned
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {showDetailedStats && (
        <>
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Learning Streak */}
            {streak && (
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                    <Flame className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Learning Streak</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep it going!
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-semibold">
                      {streak.currentStreak} days 🔥
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Longest:</span>
                    <span className="font-semibold">{streak.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total active:</span>
                    <span className="font-semibold">
                      {streak.totalActiveDays} days
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Enrollment Info */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Enrollment</h3>
                  <p className="text-sm text-muted-foreground">Your journey</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-semibold">
                    {formatDate(progress.enrolledAt)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days enrolled:</span>
                  <span className="font-semibold">{daysSinceEnrollment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last active:</span>
                  <span className="font-semibold">
                    {formatDate(progress.lastAccessedAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-sm text-muted-foreground">Your stats</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion:</span>
                  <span className="font-semibold">
                    {Math.round(progress.overallProgress)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quiz average:</span>
                  <span className="font-semibold">
                    {Math.round(progress.averageQuizScore)}%
                  </span>
                </div>
                {progress.estimatedCompletion && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. completion:</span>
                    <span className="font-semibold">
                      {formatDate(progress.estimatedCompletion)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Milestones</h3>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone) => {
                  const isUnlocked = progress.overallProgress >= milestone.threshold;
                  const isReached = !!milestone.unlockedAt;

                  return (
                    <div
                      key={milestone.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isReached
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                          : isUnlocked
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-muted bg-muted/50 opacity-60'
                      }`}
                    >
                      <div className="flex-shrink-0 text-2xl">
                        {milestone.icon || '🎯'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          {isReached && (
                            <Badge variant="secondary" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                        {!isReached && (
                          <div className="mt-2">
                            <Progress
                              value={(progress.overallProgress / milestone.threshold) * 100}
                              className="h-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.threshold}% required
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
