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
    <header className="border-b bg-white dark:bg-[#343541]" style={{ borderColor: 'var(--chat-border)', height: 'var(--header-height)' }}>
      <div className="container max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10a37f] flex items-center justify-center" style={{ borderRadius: 'var(--border-radius)' }}>
            <span className="text-xl">💬</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              UltraChat
            </h1>
            <p className="text-xs" style={{ color: 'var(--chat-text-secondary)' }}>
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
            className="h-9 border hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ borderColor: 'var(--chat-border)' }}
            onClick={() => $isModelSelectorOpen.set(true)}
          >
            <span className="mr-2 hidden sm:inline">🤖</span>
            <span className="max-w-[120px] sm:max-w-none truncate text-gray-900 dark:text-white">
              {currentModel?.name || 'Select Model'}
            </span>
          </Button>

          {/* API Key Button */}
          {!hasApiKey && (
            <Button
              size="sm"
              className="h-9 bg-[#10a37f] hover:bg-[#0d8f6f] text-white"
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
