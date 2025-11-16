/**
 * Chain Executor
 * Executes chains of AI tools with dependency resolution
 */

import type {
  Chain,
  ChainNode,
  ChainEdge,
  ExecutionContext,
  ExecutionResult,
  NodeExecutionResult,
  ChainExecutionOptions,
} from './types';
import { toolRegistry } from '../registry';

export class ChainExecutor {
  private context: ExecutionContext | null = null;

  /**
   * Execute a chain of tools
   */
  async execute(
    chain: Chain,
    initialInputs: Record<string, any> = {},
    options: ChainExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Initialize execution context
    this.context = {
      chainId: chain.id,
      startTime,
      nodeResults: new Map(),
      errors: new Map(),
      status: 'running',
    };

    const nodeResults: NodeExecutionResult[] = [];
    const errors: Array<{ nodeId: string; error: Error }> = [];

    try {
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(chain);

      // Determine execution order
      const executionOrder = this.topologicalSort(chain.nodes, dependencyGraph);

      // Execute nodes in order
      for (let i = 0; i < executionOrder.length; i++) {
        const node = executionOrder[i];

        options.onProgress?.(i, executionOrder.length);

        try {
          const result = await this.executeNode(
            node,
            chain.edges,
            initialInputs,
            options
          );
          nodeResults.push(result);

          if (result.status === 'completed') {
            this.context.nodeResults.set(node.id, result.result);
          }
        } catch (error) {
          const nodeError = error instanceof Error ? error : new Error(String(error));
          this.context.errors.set(node.id, nodeError);
          errors.push({ nodeId: node.id, error: nodeError });

          nodeResults.push({
            nodeId: node.id,
            toolName: node.toolName,
            status: 'error',
            error: nodeError,
          });

          options.onNodeError?.(node.id, nodeError);
        }
      }

      // Determine final status
      const status =
        errors.length === 0
          ? 'success'
          : errors.length < nodeResults.length
          ? 'partial'
          : 'failed';

      this.context.status = status === 'success' ? 'completed' : 'failed';

      // Get final output (from last successful node)
      const finalOutput = this.getFinalOutput(chain, nodeResults);

      const totalDuration = Date.now() - startTime;

      return {
        chainId: chain.id,
        status,
        nodeResults,
        finalOutput,
        totalDuration,
        errors,
      };
    } catch (error) {
      this.context.status = 'failed';
      throw error;
    }
  }

  /**
   * Execute a single node in the chain
   */
  private async executeNode(
    node: ChainNode,
    edges: ChainEdge[],
    initialInputs: Record<string, any>,
    options: ChainExecutionOptions
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    options.onNodeStart?.(node.id);

    try {
      // Get tool definition
      const tool = toolRegistry.get(node.toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${node.toolName}`);
      }

      // Build parameters for this node
      const parameters = this.buildNodeParameters(
        node,
        edges,
        initialInputs
      );

      // Execute tool
      const result = await tool.execute(parameters);

      const endTime = Date.now();

      options.onNodeComplete?.(node.id, result);

      return {
        nodeId: node.id,
        toolName: node.toolName,
        status: 'completed',
        result,
        startTime,
        endTime,
        duration: endTime - startTime,
      };
    } catch (error) {
      const endTime = Date.now();
      throw error;
    }
  }

  /**
   * Build parameters for a node by mapping outputs from previous nodes
   */
  private buildNodeParameters(
    node: ChainNode,
    edges: ChainEdge[],
    initialInputs: Record<string, any>
  ): Record<string, any> {
    const parameters = { ...node.parameters };

    // Find incoming edges to this node
    const incomingEdges = edges.filter((edge) => edge.targetNodeId === node.id);

    for (const edge of incomingEdges) {
      // Get result from source node
      const sourceResult = this.context?.nodeResults.get(edge.sourceNodeId);

      if (sourceResult !== undefined) {
        // Map output to input parameter
        const value = this.extractValue(sourceResult, edge.sourceOutputKey);

        if (value !== undefined) {
          parameters[edge.targetInputKey] = value;
        }
      }
    }

    // Apply initial inputs (override if provided)
    for (const [key, value] of Object.entries(initialInputs)) {
      if (value !== undefined) {
        parameters[key] = value;
      }
    }

    return parameters;
  }

  /**
   * Extract a value from a result object using a key path
   * Supports dot notation: "location.coordinates.lat"
   */
  private extractValue(obj: any, keyPath: string): any {
    const keys = keyPath.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Build dependency graph from edges
   */
  private buildDependencyGraph(chain: Chain): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    // Initialize all nodes
    for (const node of chain.nodes) {
      graph.set(node.id, new Set());
    }

    // Add dependencies from edges
    for (const edge of chain.edges) {
      const deps = graph.get(edge.targetNodeId);
      if (deps) {
        deps.add(edge.sourceNodeId);
      }
    }

    return graph;
  }

  /**
   * Topological sort for execution order
   * Returns nodes in dependency order
   */
  private topologicalSort(
    nodes: ChainNode[],
    dependencyGraph: Map<string, Set<string>>
  ): ChainNode[] {
    const sorted: ChainNode[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected at node: ${nodeId}`);
      }

      visiting.add(nodeId);

      const deps = dependencyGraph.get(nodeId);
      if (deps) {
        for (const depId of deps) {
          visit(depId);
        }
      }

      visiting.delete(nodeId);
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        sorted.push(node);
      }
    };

    for (const node of nodes) {
      visit(node.id);
    }

    return sorted;
  }

  /**
   * Get the final output from the chain
   * Uses the last node's result by default
   */
  private getFinalOutput(
    chain: Chain,
    nodeResults: NodeExecutionResult[]
  ): any {
    // Find nodes with no outgoing edges (leaf nodes)
    const nodeIds = new Set(chain.nodes.map((n) => n.id));
    const nodesWithOutgoing = new Set(
      chain.edges.map((e) => e.sourceNodeId)
    );
    const leafNodes = Array.from(nodeIds).filter(
      (id) => !nodesWithOutgoing.has(id)
    );

    // If there's exactly one leaf node, use its output
    if (leafNodes.length === 1) {
      const leafResult = nodeResults.find(
        (r) => r.nodeId === leafNodes[0] && r.status === 'completed'
      );
      return leafResult?.result;
    }

    // Otherwise, return all leaf node outputs
    const outputs: Record<string, any> = {};
    for (const nodeId of leafNodes) {
      const result = nodeResults.find(
        (r) => r.nodeId === nodeId && r.status === 'completed'
      );
      if (result) {
        outputs[nodeId] = result.result;
      }
    }

    return Object.keys(outputs).length > 0 ? outputs : undefined;
  }

  /**
   * Validate chain structure before execution
   */
  validateChain(chain: Chain): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for empty chain
    if (chain.nodes.length === 0) {
      errors.push('Chain has no nodes');
    }

    // Check for invalid tool references
    for (const node of chain.nodes) {
      const tool = toolRegistry.get(node.toolName);
      if (!tool) {
        errors.push(`Node ${node.id} references unknown tool: ${node.toolName}`);
      }
    }

    // Check for invalid edge references
    const nodeIds = new Set(chain.nodes.map((n) => n.id));
    for (const edge of chain.edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        errors.push(`Edge ${edge.id} references unknown source node: ${edge.sourceNodeId}`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        errors.push(`Edge ${edge.id} references unknown target node: ${edge.targetNodeId}`);
      }
    }

    // Check for circular dependencies
    try {
      const dependencyGraph = this.buildDependencyGraph(chain);
      this.topologicalSort(chain.nodes, dependencyGraph);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Circular dependency detected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Create and execute a chain
 */
export async function executeChain(
  chain: Chain,
  initialInputs?: Record<string, any>,
  options?: ChainExecutionOptions
): Promise<ExecutionResult> {
  const executor = new ChainExecutor();

  // Validate chain first
  const validation = executor.validateChain(chain);
  if (!validation.valid) {
    throw new Error(`Invalid chain: ${validation.errors.join(', ')}`);
  }

  return executor.execute(chain, initialInputs, options);
}
