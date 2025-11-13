/**
 * Quiz Short Answer Component
 * Displays short answer question with text input
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { QuizQuestionData } from '@/types/course';

interface QuizShortAnswerProps {
  question: QuizQuestionData;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export function QuizShortAnswer({
  question,
  onAnswer,
  showResult = false,
  disabled = false,
}: QuizShortAnswerProps) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const correctAnswer = question.correctAnswer as string;

  const checkAnswer = (userAnswer: string): boolean => {
    // Case-insensitive comparison, trim whitespace
    const normalized = userAnswer.trim().toLowerCase();
    const correctNormalized = correctAnswer.trim().toLowerCase();

    // Exact match
    if (normalized === correctNormalized) return true;

    // Allow for common variations (plurals, etc.)
    // This is a simple check - could be enhanced
    if (
      normalized + 's' === correctNormalized ||
      normalized === correctNormalized + 's'
    ) {
      return true;
    }

    return false;
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const correct = checkAnswer(answer);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(answer, correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitted && !showResult) {
      handleSubmit();
    }
  };

  return (
    <Card className="p-6">
      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <h3 className="text-lg font-semibold">{question.question}</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-7">
          Type your answer below
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || submitted || showResult}
          placeholder="Type your answer here..."
          className={`text-lg ${
            submitted || showResult
              ? isCorrect
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
              : ''
          }`}
        />

        {/* Submit Button */}
        {!submitted && !showResult && (
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || disabled}
            className="w-full sm:w-auto"
          >
            Submit Answer
          </Button>
        )}
      </div>

      {/* Result Message */}
      {(submitted || showResult) && (
        <div
          className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            {!isCorrect && (
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Your answer:</span> {answer}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Correct answer:</span> {correctAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explanation */}
      {(submitted || showResult) && question.explanation && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-1">Explanation:</p>
          <p className="text-sm">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}
