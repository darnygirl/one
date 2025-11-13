/**
 * Centered Prompt Layout
 * Shows prompt input centered on screen until first message
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CenteredPromptProps {
  isVisible: boolean;
  children: React.ReactNode;
}

export function CenteredPrompt({ isVisible, children }: CenteredPromptProps) {
  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out",
        isVisible
          ? "fixed inset-0 flex items-center justify-center z-10"
          : "fixed bottom-0 left-0 right-0 z-10"
      )}
    >
      <div className={cn(
        "w-full transition-all duration-500",
        isVisible ? "max-w-3xl px-4" : "max-w-[1200px] mx-auto px-4 py-4"
      )}>
        {children}
      </div>
    </div>
  );
}
