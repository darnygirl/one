/**
 * AI Tools Registry
 * Central registry for all AI tools
 */

import type { ToolDefinition, ToolRegistry } from './types';

class ToolRegistryImpl implements ToolRegistry {
  tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  async execute(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(params);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  listByCategory(category: string): ToolDefinition[] {
    return this.list().filter(tool => tool.category === category);
  }
}

export const toolRegistry = new ToolRegistryImpl();

// Helper to register multiple tools
export function registerTools(...tools: ToolDefinition[]) {
  tools.forEach(tool => toolRegistry.register(tool));
}
