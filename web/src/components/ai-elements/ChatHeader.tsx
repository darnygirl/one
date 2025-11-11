/**
 * Chat Header Component
 *
 * Beautiful header with model selector and settings
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { $isApiKeyModalOpen, $isModelSelectorOpen } from '@/stores/chatStore';
import type { ModelInfo } from '@/lib/ai/models';

interface ChatHeaderProps {
  currentModel?: ModelInfo;
  onModelChange: (modelId: string) => void;
  hasApiKey: boolean;
}

export function ChatHeader({ currentModel, onModelChange, hasApiKey }: ChatHeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">💬</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold gradient-text">
              UltraChat
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by {currentModel?.provider || 'AI'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Model Selector Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => $isModelSelectorOpen.set(true)}
          >
            <span className="mr-2 hidden sm:inline">🤖</span>
            <span className="max-w-[120px] sm:max-w-none truncate">
              {currentModel?.name || 'Select Model'}
            </span>
          </Button>

          {/* API Key Button */}
          {!hasApiKey && (
            <Button
              size="sm"
              className="h-9 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => $isApiKeyModalOpen.set(true)}
            >
              <span className="mr-2">🔑</span>
              <span className="hidden sm:inline">Add API Key</span>
              <span className="sm:hidden">Key</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
