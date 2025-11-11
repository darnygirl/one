/**
 * Chat Store (Nanostores)
 *
 * Global state management for the ultra-polished chat interface
 * Using nanostores for lightweight, reactive state
 */

import { atom, map, computed } from 'nanostores';
import type { Message } from '@ai-sdk/react';
import type { ModelInfo } from '@/lib/ai/models';
import { getDefaultModel, getModel } from '@/lib/ai/models';

// ============================================================================
// ATOMS (Single values)
// ============================================================================

/**
 * Current selected model
 */
export const $currentModel = atom<string>(getDefaultModel().id);

/**
 * OpenRouter API key (encrypted in localStorage)
 */
export const $apiKey = atom<string>('');

/**
 * Whether chat is actively streaming
 */
export const $isStreaming = atom<boolean>(false);

/**
 * Current input text
 */
export const $inputText = atom<string>('');

/**
 * Whether model selector is open
 */
export const $isModelSelectorOpen = atom<boolean>(false);

/**
 * Whether API key modal is open
 */
export const $isApiKeyModalOpen = atom<boolean>(false);

/**
 * Current theme (light/dark/auto)
 */
export const $theme = atom<'light' | 'dark' | 'auto'>('auto');

/**
 * Whether settings panel is open
 */
export const $isSettingsOpen = atom<boolean>(false);

/**
 * Current temperature (creativity) setting
 */
export const $temperature = atom<number>(0.7);

/**
 * System prompt (custom instructions)
 */
export const $systemPrompt = atom<string>('');

/**
 * Token usage for current session
 */
export const $tokenUsage = atom<{
  input: number;
  output: number;
  total: number;
  cost: number;
}>({
  input: 0,
  output: 0,
  total: 0,
  cost: 0,
});

// ============================================================================
// MAPS (Complex objects)
// ============================================================================

/**
 * Current chat messages
 */
export const $messages = atom<Message[]>([]);

/**
 * Suggestion chips to display
 */
export const $suggestions = atom<Array<{
  id: string;
  text: string;
  icon?: string;
  category: string;
}>>([]);

/**
 * Error state
 */
export const $error = atom<{
  message: string;
  type: 'warning' | 'error' | 'info';
} | null>(null);

/**
 * User preferences
 */
export const $preferences = map<{
  soundEnabled: boolean;
  reducedMotion: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  codeTheme: 'github' | 'dracula' | 'monokai';
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
}>({
  soundEnabled: false,
  reducedMotion: false,
  fontSize: 'md',
  codeTheme: 'github',
  autoScroll: true,
  showTimestamps: false,
  compactMode: false,
});

/**
 * Chat sessions (for multi-chat support)
 */
export const $sessions = map<{
  currentSessionId: string;
  sessions: Record<string, {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
  }>;
}>({
  currentSessionId: 'default',
  sessions: {
    default: {
      id: 'default',
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
});

// ============================================================================
// COMPUTED VALUES
// ============================================================================

/**
 * Get current model info
 */
export const $currentModelInfo = computed($currentModel, (modelId) => {
  return getModel(modelId) || getDefaultModel();
});

/**
 * Whether user has API key configured
 */
export const $hasApiKey = computed($apiKey, (key) => {
  return key.length > 0;
});

/**
 * Whether chat is ready to send messages
 */
export const $canSendMessage = computed(
  [$inputText, $isStreaming, $hasApiKey],
  (input, streaming, hasKey) => {
    return input.trim().length > 0 && !streaming && hasKey;
  }
);

/**
 * Message count
 */
export const $messageCount = computed($messages, (messages) => {
  return messages.length;
});

/**
 * Estimated session cost
 */
export const $sessionCost = computed(
  [$tokenUsage, $currentModelInfo],
  (usage, model) => {
    return (
      (model.costPer1M.input * usage.input) / 1000000 +
      (model.costPer1M.output * usage.output) / 1000000
    );
  }
);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Set current model
 */
export function setModel(modelId: string): void {
  $currentModel.set(modelId);
  if (typeof window !== 'undefined') {
    localStorage.setItem('chat:model', modelId);
  }
}

/**
 * Set API key
 */
export function setApiKey(key: string): void {
  $apiKey.set(key);
  if (typeof window !== 'undefined') {
    // In production, encrypt this!
    localStorage.setItem('chat:apiKey', key);
  }
}

/**
 * Clear API key
 */
export function clearApiKey(): void {
  $apiKey.set('');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chat:apiKey');
  }
}

/**
 * Add message
 */
export function addMessage(message: Message): void {
  $messages.set([...$messages.get(), message]);
}

/**
 * Update last message (for streaming)
 */
export function updateLastMessage(content: string): void {
  const messages = $messages.get();
  if (messages.length === 0) return;

  const updated = [...messages];
  updated[updated.length - 1] = {
    ...updated[updated.length - 1],
    content,
  };
  $messages.set(updated);
}

/**
 * Clear all messages
 */
export function clearMessages(): void {
  $messages.set([]);
  $tokenUsage.set({ input: 0, output: 0, total: 0, cost: 0 });
}

/**
 * Set suggestions
 */
export function setSuggestions(suggestions: Array<{ id: string; text: string; icon?: string; category: string }>): void {
  $suggestions.set(suggestions);
}

/**
 * Set error
 */
export function setError(message: string, type: 'warning' | 'error' | 'info' = 'error'): void {
  $error.set({ message, type });
}

/**
 * Clear error
 */
export function clearError(): void {
  $error.set(null);
}

/**
 * Update token usage
 */
export function updateTokenUsage(input: number, output: number): void {
  const current = $tokenUsage.get();
  $tokenUsage.set({
    input: current.input + input,
    output: current.output + output,
    total: current.total + input + output,
    cost: current.cost + (input + output) * 0.000001, // Rough estimate
  });
}

/**
 * Load preferences from localStorage
 */
export function loadPreferences(): void {
  if (typeof window === 'undefined') return;

  const saved = localStorage.getItem('chat:preferences');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      $preferences.set({ ...$preferences.get(), ...parsed });
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }

  // Load API key
  const savedKey = localStorage.getItem('chat:apiKey');
  if (savedKey) {
    $apiKey.set(savedKey);
  }

  // Load model
  const savedModel = localStorage.getItem('chat:model');
  if (savedModel) {
    $currentModel.set(savedModel);
  }

  // Load theme
  const savedTheme = localStorage.getItem('chat:theme');
  if (savedTheme) {
    $theme.set(savedTheme as 'light' | 'dark' | 'auto');
  }
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('chat:preferences', JSON.stringify($preferences.get()));
  localStorage.setItem('chat:theme', $theme.get());
}

/**
 * Create new session
 */
export function createNewSession(): string {
  const sessionId = `session-${Date.now()}`;
  const sessions = $sessions.get();

  $sessions.set({
    currentSessionId: sessionId,
    sessions: {
      ...sessions.sessions,
      [sessionId]: {
        id: sessionId,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  });

  $messages.set([]);
  return sessionId;
}

/**
 * Switch to session
 */
export function switchToSession(sessionId: string): void {
  const sessions = $sessions.get();
  if (!sessions.sessions[sessionId]) return;

  $sessions.setKey('currentSessionId', sessionId);
  $messages.set(sessions.sessions[sessionId].messages);
}

/**
 * Delete session
 */
export function deleteSession(sessionId: string): void {
  const sessions = $sessions.get();
  const { [sessionId]: deleted, ...remaining } = sessions.sessions;

  $sessions.set({
    ...sessions,
    sessions: remaining,
  });

  // Switch to another session if current was deleted
  if (sessions.currentSessionId === sessionId) {
    const firstId = Object.keys(remaining)[0];
    if (firstId) {
      switchToSession(firstId);
    } else {
      createNewSession();
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize store (call on app startup)
 */
export function initChatStore(): void {
  loadPreferences();
}
