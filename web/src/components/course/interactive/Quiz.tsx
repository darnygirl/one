/**
 * Quiz Component
 * Manages quiz flow with multiple questions and results
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { QuizMultipleChoice } from './QuizMultipleChoice';
import { QuizTrueFalse } from './QuizTrueFalse';
import { QuizShortAnswer } from './QuizShortAnswer';
import { QuizResults } from './QuizResults';
import type { Quiz as QuizData, QuizAnswer, QuizProgress } from '@/types/course';

interface QuizProps {
  quiz: QuizData;
  onComplete?: (
    score: number,
    percentage: number,
    answers: QuizAnswer[]
  ) => void;
  onProgress?: (progress: QuizProgress) => void;
  autoSave?: boolean;
}

export function Quiz({
  quiz,
  onComplete,
  onProgress,
  autoSave = true,
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer for time-limited quizzes
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

  // Report progress
  useEffect(() => {
    if (onProgress) {
      onProgress({
        currentQuestionIndex,
        answers,
        startTime,
        timeElapsed,
      });
    }
  }, [currentQuestionIndex, answers, timeElapsed, onProgress]);

  // Handle answer submission
  const handleAnswer = useCallback(
    (answer: string | boolean, isCorrect: boolean) => {
      const timeSpent = Math.floor(
        (Date.now() - questionStartTime.getTime()) / 1000
      );

      const quizAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        answer,
        isCorrect,
        timeSpent,
      };

      setAnswers((prev) => {
        // Replace if already answered, otherwise add
        const existingIndex = prev.findIndex(
          (a) => a.questionId === currentQuestion.id
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = quizAnswer;
          return updated;
        }
        return [...prev, quizAnswer];
      });
    },
    [currentQuestion, questionStartTime]
  );

  // Navigate to next question
  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(new Date());
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(new Date());
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = answers.some(
    (a) => a.questionId === currentQuestion.id
  );

  // Finish quiz
  const handleFinish = () => {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      return sum + (a.isCorrect && question ? question.points : 0);
    }, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    setShowResults(true);

    if (onComplete) {
      onComplete(earnedPoints, percentage, answers);
    }
  };

  // Retry quiz
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(new Date());
    setQuestionStartTime(new Date());
    setShowResults(false);
    setTimeElapsed(0);
  };

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!quiz.timeLimit) return null;
    const remaining = quiz.timeLimit * 60 - timeElapsed;
    if (remaining <= 0) return '0:00';
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results screen
  if (showResults) {
    return (
      <QuizResults
        questions={quiz.questions}
        answers={answers}
        passingScore={quiz.passingScore}
        onRetry={handleRetry}
        showDetailedResults={true}
      />
    );
  }

  // Render current question component
  const renderQuestion = () => {
    const existingAnswer = answers.find(
      (a) => a.questionId === currentQuestion.id
    );

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <QuizMultipleChoice
            question={currentQuestion}
            onAnswer={handleAnswer}
            showResult={false}
            disabled={false}
          />
        );
      case 'true-false':
        return (
          <QuizTrueFalse
            question={currentQuestion}
            onAnswer={handleAnswer as (answer: boolean, isCorrect: boolean) => void}
            showResult={false}
            disabled={false}
          />
        );
      case 'short-answer':
        return (
          <QuizShortAnswer
            question={currentQuestion}
            onAnswer={handleAnswer as (answer: string, isCorrect: boolean) => void}
            showResult={false}
            disabled={false}
          />
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

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
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              <span>{formatTimeRemaining()}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-muted-foreground">
              {answers.length} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Current Question */}
      {renderQuestion()}

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {/* Question Indicator */}
          <div className="flex gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setQuestionStartTime(new Date());
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers.some((a) => a.questionId === q.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                aria-label={`Go to question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Next/Finish Button */}
          <Button
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered}
          >
            {isLastQuestion ? (
              <>Finish Quiz</>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Quiz Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Passing score: {quiz.passingScore}%</p>
        {quiz.attemptsAllowed && (
          <p>Attempts allowed: {quiz.attemptsAllowed}</p>
        )}
      </div>
    </div>
  );
}
