/**
 * Streaming & Real-time Component Types
 * Shared types for AI streaming components
 */

export interface StreamingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
}

export interface ThinkingState {
  isThinking: boolean;
  message?: string;
  progress?: number;
  stage?: string;
}

export interface CodeBlock {
  code: string;
  language: string;
  filename?: string;
  isStreaming?: boolean;
}

export interface StreamingError {
  message: string;
  code?: string;
  timestamp: Date;
}
