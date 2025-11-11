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
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} message-enter`}
    >
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
          <span className="text-sm text-white">🤖</span>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 ${
          isUser
            ? 'bg-[#f7f7f8] dark:bg-[#444654] text-gray-900 dark:text-white'
            : 'bg-white dark:bg-[#343541] text-gray-900 dark:text-white'
        }`}
        style={{ borderRadius: 'var(--border-radius)' }}
      >
        {renderContent()}

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--chat-border)' }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="h-7 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm text-white">👤</span>
        </div>
      )}
    </div>
  );
}
