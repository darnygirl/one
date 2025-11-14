/**
 * EnhancedQuiz Component (Cycle 53)
 *
 * Enhanced quiz with:
 * - Real-time scoring with Effect.ts
 * - Leaderboard integration via Convex
 * - Time limits with countdown
 * - Answer explanations
 * - Performance analytics
 * - Immediate feedback
 *
 * Part of Phase 3 - Advanced UI Features
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Effect } from 'effect';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation?: string;
  points: number;
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number; // minutes
  passingScore: number;
  attemptsAllowed?: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  percentage: number;
  completedAt: Date;
  rank: number;
}

interface EnhancedQuizProps {
  quiz: QuizData;
  groupId: string;
  onComplete?: (score: number, percentage: number) => void;
  showLeaderboard?: boolean;
}

// Effect.ts service for score calculation and validation
const calculateScore = (answers: Record<string, any>, questions: Question[]) =>
  Effect.gen(function* () {
    let score = 0;
    let correct = 0;

    for (const question of questions) {
      const answer = answers[question.id];
      if (answer === question.correctAnswer) {
        score += question.points;
        correct++;
      }
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    return { score, correct, total: questions.length, percentage };
  });

export function EnhancedQuiz({
  quiz,
  groupId,
  onComplete,
  showLeaderboard = true,
}: EnhancedQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [startTime] = useState(new Date());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Leaderboard (uncomment when Convex is set up)
  // const leaderboard = useQuery(api.queries.quiz.getLeaderboard,
  //   showLeaderboard ? { quizId: quiz.id } : 'skip'
  // );
  // const submitQuiz = useMutation(api.mutations.quiz.submit);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer
  useEffect(() => {
    if (!quiz.timeLimit || showResults) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setTimeElapsed(elapsed);

      // Auto-submit if time runs out
      if (elapsed >= quiz.timeLimit * 60) {
        handleFinish();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, showResults, quiz.timeLimit]);

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    // Calculate score with Effect.ts
    const result = await Effect.runPromise(
      calculateScore(answers, quiz.questions).pipe(
        Effect.catchAll((error) => {
          console.error('Score calculation failed:', error);
          return Effect.succeed({ score: 0, correct: 0, total: 0, percentage: 0 });
        })
      )
    );

    setQuizResults(result);
    setShowResults(true);

    // Submit to backend (uncomment when Convex is set up)
    // await submitQuiz({
    //   quizId: quiz.id,
    //   score: result.score,
    //   percentage: result.percentage,
    //   answers,
    //   timeSpent: timeElapsed,
    // });

    onComplete?.(result.score, result.percentage);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowExplanation({});
    setShowResults(false);
    setQuizResults(null);
  };

  const isQuestionAnswered = (questionId: string) => answers[questionId] !== undefined;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = () => {
    if (!quiz.timeLimit) return null;
    const remaining = quiz.timeLimit * 60 - timeElapsed;
    if (remaining <= 0) return '0:00';
    return formatTime(remaining);
  };

  const isCorrect = (questionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    return question && answers[questionId] === question.correctAnswer;
  };

  // Results Screen
  if (showResults && quizResults) {
    const passed = quizResults.percentage >= quiz.passingScore;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Results Header */}
        <Card className="overflow-hidden">
          <div
            className={`p-6 text-white ${
              passed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
                </h2>
                <p className="text-white/90">
                  {passed
                    ? 'You passed the quiz!'
                    : `You need ${quiz.passingScore}% to pass. Try again!`}
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">{Math.round(quizResults.percentage)}%</div>
                <div className="text-sm text-white/80">Your Score</div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{quizResults.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{quizResults.score}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {passed && (
                <Button className="flex-1">
                  <Award className="h-4 w-4 mr-2" />
                  Continue Course
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correct = userAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: <span className={correct ? 'text-green-600' : 'text-red-600'}>
                          {String(userAnswer)}
                        </span>
                      </p>
                      {!correct && (
                        <p className="text-sm text-muted-foreground">
                          Correct answer: <span className="text-green-600">
                            {String(question.correctAnswer)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {question.explanation && (
                    <div className="ml-8 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {showLeaderboard && leaderboardData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardData.slice(0, 10).map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground">
                        #{entry.rank}
                      </div>
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(entry.percentage)}% · {entry.score} points
                        </p>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <Badge variant="secondary">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // Quiz Screen
  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-muted-foreground mt-1">{quiz.description}</p>
            )}
          </div>
          {quiz.timeLimit && (
            <motion.div
              animate={{
                scale: timeElapsed > quiz.timeLimit * 60 - 60 ? [1, 1.1, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Clock className="h-5 w-5" />
              <span className={timeElapsed > quiz.timeLimit * 60 - 60 ? 'text-red-500' : ''}>
                {formatTimeRemaining()}
              </span>
            </motion.div>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-muted-foreground">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestionIndex + 1}. {currentQuestion.question}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentQuestion.type}</Badge>
                <Badge variant="secondary">{currentQuestion.points} points</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Multiple Choice */}
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === option;
                    const isCorrectOption = option === currentQuestion.correctAnswer;
                    const showFeedback = showExplanation[currentQuestion.id];

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          isSelected
                            ? showFeedback
                              ? isCorrectOption
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : 'border-red-500 bg-red-50 dark:bg-red-950'
                              : 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showFeedback && isSelected && (
                            <div>
                              {isCorrectOption ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === 'true-false' && (
                <div className="flex gap-4">
                  {[true, false].map((value) => {
                    const isSelected = answers[currentQuestion.id] === value;
                    const isCorrectOption = value === currentQuestion.correctAnswer;
                    const showFeedback = showExplanation[currentQuestion.id];

                    return (
                      <motion.button
                        key={String(value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(currentQuestion.id, value)}
                        className={`flex-1 p-6 border-2 rounded-lg transition-all ${
                          isSelected
                            ? showFeedback
                              ? isCorrectOption
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : 'border-red-500 bg-red-50 dark:bg-red-950'
                              : 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{value ? '✓' : '✗'}</div>
                          <div className="font-semibold">{value ? 'True' : 'False'}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation[currentQuestion.id] && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Explanation
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {/* Question Indicators */}
          <div className="flex gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : isQuestionAnswered(q.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isQuestionAnswered(currentQuestion.id)}
          >
            {isLastQuestion ? 'Finish Quiz' : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
