/**
 * Modern Chat Client with Centered Prompt UI
 *
 * Features:
 * - Centered prompt input on empty state
 * - Smooth transition to bottom after first message
 * - Clean, production-ready code
 * - Multiple AI models support
 * - Generative UI components
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Brain, GlobeIcon, CopyIcon, CheckCheckIcon, Plus, Play, Unlock, Mic
} from 'lucide-react';

// Components
import { DemoCard } from './DemoCard';
import { HeroSection } from './HeroSection';
import { CenteredPrompt } from './CenteredPrompt';
import { AgentMessage } from '@/components/ai/AgentMessage';
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from '@/components/ai/elements/message';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai/elements/conversation';
import { ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorTrigger } from '@/components/ai/elements/model-selector';
import { PromptInputSpeechButton } from '@/components/ai/elements/prompt-input';

// Config
import { ALL_MODELS, FREE_MODELS, DEFAULT_MODEL, isModelFree, type Model } from '@/lib/chat/models';
import { DEMO_SUGGESTIONS, DEMO_CATEGORIES } from '@/lib/chat/demos';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/lib/chat/constants';
import type { Message as MessageType } from '@/lib/chat/types';

export function ChatClient() {
  // State
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasApiKey = !!apiKey;
  const hasMessages = messages.length > 0;
  const selectedModelData = ALL_MODELS.find(m => m.id === selectedModel);

  // Load saved settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
      if (savedKey) setApiKey(savedKey);
      if (savedModel) setSelectedModel(savedModel);
    }
  }, []);

  // Save API key
  const handleSaveApiKey = () => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
      localStorage.setItem(STORAGE_KEYS.MODEL, selectedModel);
      toast({
        title: "API Key Saved",
        description: "All premium features unlocked!",
      });
      setShowSettings(false);
    }
  };

  // Clear API key
  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      localStorage.removeItem(STORAGE_KEYS.MODEL);
    }
    setApiKey('');
    setMessages([]);
    toast({
      title: "API Key Removed",
      description: "Switched back to free tier",
    });
  };

  // Copy message
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({ title: "Copied!", description: "Message copied to clipboard" });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  // Submit message
  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Check if premium model requires API key
    if (!isModelFree(selectedModel) && !apiKey) {
      setShowSettings(true);
      toast({
        title: "API Key Required",
        description: `${selectedModelData?.name} requires an OpenRouter API key.`,
      });
      return;
    }

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      type: 'text',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text.trim() }
      ];

      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          apiKey,
          model: selectedModel,
          premium: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // UI component messages
              if (parsed.type && parsed.type !== 'text') {
                const uiMessage: MessageType = {
                  id: `ui-${crypto.randomUUID()}`,
                  role: 'assistant',
                  content: '',
                  type: parsed.type as any,
                  payload: parsed.payload,
                  timestamp: Date.now(),
                };
                setMessages(prev => [...prev, uiMessage]);
              }
              // Regular text content
              else if (parsed.choices?.[0]?.delta?.content) {
                assistantContent += parsed.choices[0].delta.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setIsLoading(false);
    }
  };

  // Render message
  const renderMessage = (msg: MessageType) => {
    const isCopied = copiedMessageId === msg.id;

    return (
      <Message key={msg.id} from={msg.role}>
        <div>
          {msg.type && msg.type !== 'text' && (
            <div className="mb-4">
              <AgentMessage
                message={{
                  type: msg.type as any,
                  payload: msg.payload,
                  timestamp: msg.timestamp || Date.now(),
                }}
              />
            </div>
          )}

          {msg.content && (
            <MessageContent
              className={cn(
                "group-[.is-user]:rounded-[24px] group-[.is-user]:bg-[#2f2f2f] group-[.is-user]:text-[#ececec]",
                "group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground"
              )}
            >
              <MessageResponse>{msg.content}</MessageResponse>
            </MessageContent>
          )}

          {msg.content && msg.role === 'assistant' && (
            <MessageActions className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageAction
                tooltip={isCopied ? "Copied!" : "Copy message"}
                onClick={() => handleCopyMessage(msg.id, msg.content)}
              >
                {isCopied ? <CheckCheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </MessageAction>
            </MessageActions>
          )}
        </div>
      </Message>
    );
  };

  return (
    <div className="relative flex size-full flex-col overflow-hidden items-center justify-center bg-background">
      <div className="w-full max-w-[1200px] h-full flex flex-col relative">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Unlock Premium Features</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem(STORAGE_KEYS.API_KEY);
                    localStorage.removeItem(STORAGE_KEYS.MODEL);
                  }
                  setApiKey('');
                  setSelectedModel(DEFAULT_MODEL);
                  setMessages([]);
                  setShowSettings(false);
                }}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription className="text-xs">
                    ✨ <strong>Chat is 100% FREE with Gemini Flash Lite!</strong> No API key required.
                    Add an OpenRouter key only if you want access to GPT-4, Claude, and 50+ other models.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenRouter API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Get a free key from{' '}
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      OpenRouter
                    </a>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveApiKey} className="flex-1">
                    Unlock Features
                  </Button>
                  {apiKey && (
                    <Button variant="destructive" size="sm" onClick={handleClearKey}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 px-6 py-2 bg-destructive/10">
            <Alert variant="destructive">
              <AlertDescription><strong>Error:</strong> {error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages Area */}
        <Conversation className={cn(hasMessages ? "pb-[200px]" : "pb-0")}>
          <ConversationContent>
            {!hasMessages && !isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-4">
                <HeroSection hasApiKey={hasApiKey} />

                {/* Demo Cards Grid */}
                <div className="w-full max-w-4xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Try These Demos</h2>
                    {!hasApiKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        className="gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Add API Key
                      </Button>
                    )}
                  </div>

                  {/* Category tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {Object.entries(DEMO_CATEGORIES).map(([key, cat]) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap"
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Demo cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DEMO_SUGGESTIONS.map((suggestion) => (
                      <DemoCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onSelect={(prompt) => {
                          const cleanPrompt = prompt.replace(/📊|📋|📝|⏱️/g, '').trim();
                          handleSubmit(cleanPrompt);
                        }}
                        isLocked={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map(msg => renderMessage(msg))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-zinc-400 px-4">
                    <Brain className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Prompt Input - Centered when empty, bottom when has messages */}
        <CenteredPrompt isVisible={!hasMessages && !isLoading}>
          <div className="relative flex flex-col bg-[hsl(var(--color-sidebar))] rounded-2xl p-3 gap-3 border-2 border-border">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ring-0 text-base resize-none min-h-[80px] px-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleSubmit(value);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <PromptInputSpeechButton
                  textareaRef={textareaRef}
                  onTranscriptionChange={(text) => {
                    if (textareaRef.current) textareaRef.current.value = text;
                  }}
                  className="h-9 w-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                  <ModelSelectorTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {selectedModelData?.name || 'Select Model'}
                    </Button>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>

                      {/* Free Models */}
                      <ModelSelectorGroup heading="Free Models">
                        {FREE_MODELS.map((m) => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => {
                              setSelectedModel(m.id);
                              setModelSelectorOpen(false);
                            }}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>

                <Button
                  disabled={isLoading}
                  onClick={() => {
                    const textarea = textareaRef.current;
                    if (textarea && textarea.value.trim()) {
                      handleSubmit(textarea.value);
                      textarea.value = '';
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CenteredPrompt>
      </div>
    </div>
  );
}
