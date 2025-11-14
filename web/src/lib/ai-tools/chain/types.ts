/**
 * Chain Architecture Types
 * Defines types for chaining AI tools together
 */

export interface ChainNode {
  id: string;
  toolName: string;
  label?: string;
  parameters: Record<string, any>;
  position?: { x: number; y: number }; // For visual editor
}

export interface ChainEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutputKey: string;
  targetInputKey: string;
}

export interface ParameterMapping {
  sourceNodeId: string;
  sourceOutputKey: string;
  targetInputKey: string;
  transform?: (value: any) => any; // Optional transformation function
}

export interface Chain {
  id: string;
  name: string;
  description: string;
  nodes: ChainNode[];
  edges: ChainEdge[];
  metadata?: {
    created: string;
    updated: string;
    author?: string;
    tags?: string[];
  };
}

export interface ExecutionContext {
  chainId: string;
  startTime: number;
  nodeResults: Map<string, any>;
  errors: Map<string, Error>;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export interface NodeExecutionResult {
  nodeId: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: Error;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export interface ExecutionResult {
  chainId: string;
  status: 'success' | 'partial' | 'failed';
  nodeResults: NodeExecutionResult[];
  finalOutput?: any;
  totalDuration: number;
  errors: Array<{ nodeId: string; error: Error }>;
}

export type ExecutionMode = 'sequential' | 'parallel' | 'auto';

export interface ChainExecutionOptions {
  mode?: ExecutionMode;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: any) => void;
  onNodeError?: (nodeId: string, error: Error) => void;
  onProgress?: (completed: number, total: number) => void;
}
