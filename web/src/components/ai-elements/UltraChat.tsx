/**
 * UltraChat - Main Chat Component
 *
 * The most polished AI chat interface ever created
 * Everything above the fold, mobile-first, beautiful animations
 */

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useStore } from '@nanostores/react';
import {
  $currentModel,
  $apiKey,
  $messages,
  $suggestions,
  $isApiKeyModalOpen,
  initChatStore,
  setModel,
} from '@/stores/chatStore';
import {
  initAnalytics,
  trackMessageSent,
  trackMessageReceived,
  trackModelSwitch,
  ChatEvents,
  trackEvent,
} from '@/lib/ai/analytics';
import { generateSuggestions, STARTER_SUGGESTIONS } from '@/lib/ai/suggestions';
import { ApiKeyModal } from './ApiKeyModal';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import { SuggestionCarousel } from './SuggestionCarousel';
import { ModelSelector } from './ModelSelector';
import { ChatHeader } from './ChatHeader';
import { getModel } from '@/lib/ai/models';

export function UltraChat() {
  const currentModel = useStore($currentModel);
  const apiKey = useStore($apiKey);
  const [startTime, setStartTime] = useState<number>(0);

  // Initialize stores and analytics
  useEffect(() => {
    initChatStore();
    initAnalytics();
  }, []);

  // Initialize AI SDK useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: '/api/chat',
    body: {
      apiKey: apiKey || '',
      model: currentModel,
    },
    onFinish: (message) => {
      const elapsed = Date.now() - startTime;
      trackMessageReceived(currentModel, message.content.length, elapsed);

      // Generate suggestions after assistant response
      const newSuggestions = generateSuggestions([...messages, message]);
      $suggestions.set(newSuggestions);
    },
    onError: (error) => {
      trackEvent(ChatEvents.MESSAGE_ERROR, {
        error: error.message,
        model: currentModel,
      });
    },
  });

  // Update global messages store
  useEffect(() => {
    $messages.set(messages);
  }, [messages]);

  // Show API key modal if no key is set
  useEffect(() => {
    if (!apiKey && messages.length === 0) {
      // Give user a moment to see the UI first
      const timer = setTimeout(() => {
        $isApiKeyModalOpen.set(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [apiKey, messages.length]);

  // Set starter suggestions
  useEffect(() => {
    if (messages.length === 0) {
      $suggestions.set(STARTER_SUGGESTIONS);
    }
  }, [messages.length]);

  // Handle message submission
  const handleSend = (value: string) => {
    if (!value.trim()) return;

    setStartTime(Date.now());
    trackMessageSent(currentModel, value.length);

    // Submit via AI SDK
    const event = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(event);
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setInput(text);
    // Auto-submit the suggestion
    setTimeout(() => {
      handleSend(text);
    }, 100);
  };

  // Handle model change
  const handleModelChange = (modelId: string) => {
    const oldModel = currentModel;
    setModel(modelId);
    trackModelSwitch(oldModel, modelId);
  };

  const modelInfo = getModel(currentModel);

  return (
    <>
      {/* API Key Modal */}
      <ApiKeyModal />

      {/* Main Chat Interface */}
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Header */}
        <ChatHeader
          currentModel={modelInfo}
          onModelChange={handleModelChange}
          hasApiKey={!!apiKey}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Input Area - Always visible, above the fold */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <div className="container max-w-4xl mx-auto px-4 py-4 space-y-4">
            {/* Suggestions */}
            <SuggestionCarousel
              suggestions={useStore($suggestions)}
              onSuggestionClick={handleSuggestionClick}
            />

            {/* Prompt Input */}
            <PromptInput
              value={input}
              onChange={(e) => handleInputChange(e)}
              onSubmit={handleSend}
              isLoading={isLoading}
              disabled={!apiKey && currentModel !== 'google/gemini-2.5-flash-lite'}
              placeholder={
                !apiKey && currentModel !== 'google/gemini-2.5-flash-lite'
                  ? 'Add API key to start chatting...'
                  : 'Type your message...'
              }
            />

            {/* Footer info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {modelInfo?.name || 'No model selected'}
                </span>
                {messages.length > 0 && (
                  <span>
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
                  Enter
                </kbd>
                <span>to send</span>
                <span className="mx-1">•</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
                  Shift+Enter
                </kbd>
                <span>for new line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
