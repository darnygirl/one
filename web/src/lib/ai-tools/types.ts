/**
 * AI Tools Type Definitions
 */

import type { z } from 'zod';

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: 'data' | 'search' | 'productivity' | 'creativity' | 'utility';
  parameters: ToolParameter[];
  execute: (params: any) => Promise<any>;
  render?: (result: any) => React.ReactNode;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
  timestamp: number;
}

export interface ToolRegistry {
  tools: Map<string, ToolDefinition>;
  register: (tool: ToolDefinition) => void;
  get: (name: string) => ToolDefinition | undefined;
  execute: (name: string, params: any) => Promise<any>;
  list: () => ToolDefinition[];
}
