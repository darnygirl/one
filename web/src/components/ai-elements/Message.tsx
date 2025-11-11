/**
 * Message Component
 *
 * Enhanced message display with markdown, code blocks, and actions
 */

import { useState } from 'react';
import type { Message as AIMessage } from '@ai-sdk/react';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trackEvent, ChatEvents } from '@/lib/ai/analytics';

interface MessageProps {
  message: AIMessage;
  isLatest?: boolean;
}

export function Message({ message, isLatest }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      trackEvent(ChatEvents.MESSAGE_COPIED, {
        role: message.role,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Render markdown for assistant messages
  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }

    try {
      const html = marked.parse(message.content, {
        breaks: true,
        gfm: true,
      });
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      );
    } catch (err) {
      return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${
        isUser ? 'message-user' : 'message-assistant'
      }`}
    >
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🤖</span>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
            : 'glass-card'
        } rounded-2xl px-4 py-3 shadow-lg`}
      >
        {renderContent()}

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <span className="mr-1">✓</span>
                  Copied
                </>
              ) : (
                <>
                  <span className="mr-1">📋</span>
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                // TODO: Implement regenerate
                trackEvent(ChatEvents.MESSAGE_REGENERATED);
              }}
            >
              <span className="mr-1">🔄</span>
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {/* Avatar (user only) */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
