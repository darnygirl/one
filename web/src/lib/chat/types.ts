/**
 * Message Types and Interfaces
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType = 'text' | 'reasoning' | 'tool_call' | 'ui' | 'error' | 'action';

export interface ReasoningData {
  content: string;
  duration?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type?: MessageType;
  payload?: any;
  timestamp?: number;
  reasoning?: ReasoningData;
  isReasoningComplete?: boolean;
  isReasoningStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageParams {
  text: string;
  files?: File[];
  model?: string;
  apiKey?: string;
}
