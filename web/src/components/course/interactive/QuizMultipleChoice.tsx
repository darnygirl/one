/**
 * Quiz Multiple Choice Component
 * Displays multiple choice question with radio buttons
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { QuizQuestionData, QuizOption } from '@/types/course';

interface QuizMultipleChoiceProps {
  question: QuizQuestionData;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  showResult?: boolean;
  disabled?: boolean;
}

export function QuizMultipleChoice({
  question,
  onAnswer,
  showResult = false,
  disabled = false,
}: QuizMultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;

    const selected = question.options?.find((opt) => opt.id === selectedOption);
    const isCorrect = selected?.isCorrect || false;

    setSubmitted(true);
    onAnswer(selectedOption, isCorrect);
  };

  const getOptionColor = (option: QuizOption) => {
    if (!submitted && !showResult) return '';

    if (option.isCorrect) {
      return 'border-green-500 bg-green-50 dark:bg-green-950';
    }

    if (option.id === selectedOption && !option.isCorrect) {
      return 'border-red-500 bg-red-50 dark:bg-red-950';
    }

    return 'opacity-50';
  };

  const getOptionIcon = (option: QuizOption) => {
    if (!submitted && !showResult) return null;

    if (option.isCorrect) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (option.id === selectedOption && !option.isCorrect) {
      return <XCircle className="h-5 w-5 text-red-600" />;
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
          Select the correct answer
        </p>
      </div>

      {/* Options */}
      <RadioGroup
        value={selectedOption}
        onValueChange={setSelectedOption}
        disabled={disabled || submitted || showResult}
        className="space-y-3"
      >
        {question.options?.map((option) => (
          <div key={option.id} className={`relative ${getOptionColor(option)}`}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg transition-colors hover:bg-muted/50">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-normal"
              >
                {option.text}
              </Label>
              {getOptionIcon(option)}
            </div>
          </div>
        ))}
      </RadioGroup>

      {/* Submit Button */}
      {!submitted && !showResult && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
          className="mt-6 w-full sm:w-auto"
        >
          Submit Answer
        </Button>
      )}

      {/* Explanation */}
      {(submitted || showResult) && question.explanation && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-1">Explanation:</p>
          <p className="text-sm">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}
