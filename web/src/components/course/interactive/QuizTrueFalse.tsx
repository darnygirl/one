/**
 * Quiz True/False Component
 * Displays true/false question with two buttons
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { QuizQuestionData } from '@/types/course';

interface QuizTrueFalseProps {
  question: QuizQuestionData;
  onAnswer: (answer: boolean, isCorrect: boolean) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export function QuizTrueFalse({
  question,
  onAnswer,
  showResult = false,
  disabled = false,
}: QuizTrueFalseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctAnswer = question.correctAnswer as boolean;

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setSubmitted(true);
    const isCorrect = answer === correctAnswer;
    onAnswer(answer, isCorrect);
  };

  const getButtonVariant = (isTrue: boolean) => {
    if (!submitted && !showResult) {
      return selectedAnswer === isTrue ? 'default' : 'outline';
    }

    // Show correct/incorrect after submission
    const isCorrectAnswer = isTrue === correctAnswer;
    const wasSelected = selectedAnswer === isTrue;

    if (isCorrectAnswer) {
      return 'default'; // Green (correct answer)
    }

    if (wasSelected && !isCorrectAnswer) {
      return 'destructive'; // Red (wrong selection)
    }

    return 'outline'; // Gray (not selected)
  };

  const getButtonIcon = (isTrue: boolean) => {
    if (!submitted && !showResult) return null;

    const isCorrectAnswer = isTrue === correctAnswer;
    const wasSelected = selectedAnswer === isTrue;

    if (isCorrectAnswer) {
      return <CheckCircle2 className="h-5 w-5" />;
    }

    if (wasSelected && !isCorrectAnswer) {
      return <XCircle className="h-5 w-5" />;
    }

    return null;
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
          Select True or False
        </p>
      </div>

      {/* True/False Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => handleAnswer(true)}
          disabled={disabled || submitted || showResult}
          variant={getButtonVariant(true)}
          className="flex-1 h-20 text-lg"
        >
          <div className="flex items-center gap-2">
            {getButtonIcon(true)}
            <span>True</span>
          </div>
        </Button>
        <Button
          onClick={() => handleAnswer(false)}
          disabled={disabled || submitted || showResult}
          variant={getButtonVariant(false)}
          className="flex-1 h-20 text-lg"
        >
          <div className="flex items-center gap-2">
            {getButtonIcon(false)}
            <span>False</span>
          </div>
        </Button>
      </div>

      {/* Result Message */}
      {(submitted || showResult) && selectedAnswer !== null && (
        <div
          className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            selectedAnswer === correctAnswer
              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
          }`}
        >
          {selectedAnswer === correctAnswer ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {selectedAnswer === correctAnswer ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="text-sm mt-1">
              The correct answer is <strong>{correctAnswer ? 'True' : 'False'}</strong>
            </p>
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
