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

export type ToolCategory = 'data' | 'search' | 'utility' | 'encoding' | 'dev' | 'creative';

export interface ToolMetadata {
  version: string;
  author: string;
  tags: string[];
  examples?: Array<{
    description: string;
    params: Record<string, any>;
  }>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  parameters: ToolParameter[];
  execute: (params: any) => Promise<any>;
  render?: (result: any) => React.ReactNode;
  metadata: ToolMetadata;
  lazy?: boolean; // Enable lazy loading for this tool
  moduleLoader?: () => Promise<any>; // Dynamic import function
  cacheable?: boolean; // Enable caching for this tool
  cacheTTL?: number; // Custom cache TTL in milliseconds
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

export interface ToolUsageStats {
  count: number;
  lastUsed: number;
  avgExecutionTime?: number;
  cacheHitRate?: number;
}

export interface PerformanceMetrics {
  executionTime: number;
  cacheHit: boolean;
  timestamp: number;
  tool: string;
  success: boolean;
}

export interface ToolRegistry {
  tools: Map<string, ToolDefinition>;
  favorites: Set<string>;
  usage: Map<string, ToolUsageStats>;

  register: (tool: ToolDefinition) => void;
  get: (name: string) => ToolDefinition | undefined;
  execute: (name: string, params: any) => Promise<any>;
  list: () => ToolDefinition[];
  listByCategory: (category: ToolCategory) => ToolDefinition[];
  search: (query: string) => ToolDefinition[];

  // Favorites
  addFavorite: (name: string) => void;
  removeFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
  listFavorites: () => ToolDefinition[];

  // Usage tracking
  getUsageStats: (name: string) => ToolUsageStats | undefined;
  getMostUsed: (limit?: number) => ToolDefinition[];
  getRecent: (limit?: number) => ToolDefinition[];
}
