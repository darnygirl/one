/**
 * Conversation History Manager
 * Handles saving and loading chat conversations
 */

import type { Message } from './types';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  created: number;
  updated: number;
}

const STORAGE_KEY = 'chat-conversations';
const MAX_CONVERSATIONS = 50;

/**
 * Save conversation to localStorage
 */
export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return;

  try {
    const conversations = loadAllConversations();
    const existing = conversations.findIndex(c => c.id === conversation.id);

    if (existing >= 0) {
      conversations[existing] = conversation;
    } else {
      conversations.unshift(conversation);
    }

    // Keep only the most recent conversations
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

/**
 * Load all conversations from localStorage
 */
export function loadAllConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

/**
 * Load a specific conversation by ID
 */
export function loadConversation(id: string): Conversation | null {
  const conversations = loadAllConversations();
  return conversations.find(c => c.id === id) || null;
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const conversations = loadAllConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

/**
 * Generate conversation title from first message
 */
export function generateTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';

  const content = firstUserMessage.content.substring(0, 50);
  return content.length < firstUserMessage.content.length
    ? content + '...'
    : content;
}

/**
 * Create a new conversation
 */
export function createConversation(
  messages: Message[],
  model: string
): Conversation {
  return {
    id: crypto.randomUUID(),
    title: generateTitle(messages),
    messages,
    model,
    created: Date.now(),
    updated: Date.now(),
  };
}

/**
 * Export conversation to JSON
 */
export function exportToJSON(conversation: Conversation): string {
  return JSON.stringify(conversation, null, 2);
}

/**
 * Export conversation to Markdown
 */
export function exportToMarkdown(conversation: Conversation): string {
  let markdown = `# ${conversation.title}\n\n`;
  markdown += `**Model:** ${conversation.model}\n`;
  markdown += `**Created:** ${new Date(conversation.created).toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  for (const message of conversation.messages) {
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    markdown += `## ${role}\n\n`;
    markdown += `${message.content}\n\n`;
  }

  return markdown;
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
