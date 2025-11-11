/**
 * Prompt Input Component
 *
 * Advanced input with auto-resize, keyboard shortcuts, and beautiful styling
 */

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
  placeholder = 'Type your message...',
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isLoading && value.trim()) {
        onSubmit(value);
      }
    }
  };

  const handleSubmitClick = () => {
    if (!disabled && !isLoading && value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex gap-2 items-end p-2 bg-white dark:bg-[#40414f] border transition-shadow"
        style={{
          borderRadius: 'var(--border-radius)',
          borderColor: 'var(--chat-border)'
        }}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[52px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 dark:text-white"
          rows={1}
        />
        <Button
          onClick={handleSubmitClick}
          disabled={disabled || isLoading || !value.trim()}
          className="h-10 w-10 bg-[#10a37f] hover:bg-[#0d8f6f] disabled:bg-gray-300 dark:disabled:bg-gray-600 flex-shrink-0 text-white"
          style={{ borderRadius: 'var(--border-radius)' }}
          size="icon"
        >
          {isLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span className="text-lg">↑</span>
          )}
        </Button>
      </div>
    </div>
  );
}
