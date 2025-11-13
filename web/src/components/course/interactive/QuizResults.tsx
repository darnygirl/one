/**
 * Quiz Results Component
 * Displays quiz score, summary, and detailed results
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import type { QuizQuestionData, QuizAnswer } from '@/types/course';

interface QuizResultsProps {
  questions: QuizQuestionData[];
  answers: QuizAnswer[];
  passingScore: number; // percentage
  onRetry?: () => void;
  onContinue?: () => void;
  showDetailedResults?: boolean;
}

export function QuizResults({
  questions,
  answers,
  passingScore,
  onRetry,
  onContinue,
  showDetailedResults = true,
}: QuizResultsProps) {
  // Calculate score
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = answers.reduce((sum, a) => {
    return sum + (a.isCorrect ? questions.find((q) => q.id === a.questionId)?.points || 0 : 0);
  }, 0);
  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = percentage >= passingScore;

  // Count correct/incorrect
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  // Get performance message
  const getPerformanceMessage = () => {
    if (percentage === 100) return 'Perfect Score!';
    if (percentage >= 90) return 'Excellent Work!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Effort!';
    if (percentage >= passingScore) return 'You Passed!';
    return 'Keep Practicing!';
  };

  // Get grade letter
  const getGrade = () => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="p-8">
        <div className="text-center">
          {/* Trophy Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`p-4 rounded-full ${
                passed
                  ? 'bg-green-100 dark:bg-green-950'
                  : 'bg-orange-100 dark:bg-orange-950'
              }`}
            >
              <Trophy
                className={`h-12 w-12 ${
                  passed ? 'text-green-600' : 'text-orange-600'
                }`}
              />
            </div>
          </div>

          {/* Performance Message */}
          <h2 className="text-3xl font-bold mb-2">{getPerformanceMessage()}</h2>
          <p className="text-muted-foreground mb-6">
            {passed
              ? `You've passed with ${percentage.toFixed(0)}%`
              : `You need ${passingScore}% to pass`}
          </p>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Percentage */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {percentage.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>

            {/* Grade */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {getGrade()}
              </div>
              <div className="text-sm text-muted-foreground">Grade</div>
            </div>

            {/* Points */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {earnedPoints}/{totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">Passing: {passingScore}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">{correctCount}</span>
              <span className="text-sm text-muted-foreground">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold">{incorrectCount}</span>
              <span className="text-sm text-muted-foreground">Incorrect</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onContinue && (
              <Button onClick={onContinue} size="lg">
                <span>Continue Learning</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Detailed Results */}
      {showDetailedResults && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Question Review</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const answer = answers.find((a) => a.questionId === question.id);
              const isCorrect = answer?.isCorrect || false;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:bg-green-950'
                      : 'border-red-200 bg-red-50 dark:bg-red-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      {/* Question */}
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold">
                          {index + 1}. {question.question}
                        </p>
                        <span className="text-sm font-medium ml-2">
                          {isCorrect ? question.points : 0}/{question.points} pts
                        </span>
                      </div>

                      {/* Answer Status */}
                      <p className="text-sm">
                        <span className="font-medium">
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        {answer?.timeSpent && (
                          <span className="text-muted-foreground ml-2">
                            • {answer.timeSpent}s
                          </span>
                        )}
                      </p>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-2 p-3 bg-background rounded text-sm">
                          <p className="font-medium mb-1">Explanation:</p>
                          <p className="text-muted-foreground">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
