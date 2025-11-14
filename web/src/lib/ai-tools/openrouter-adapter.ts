/**
 * OpenRouter Adapter for AI Tools
 * Converts tool definitions to OpenRouter function calling format
 */

import type { ToolDefinition, ToolParameter } from './types';

// Convert tool parameter type to JSON Schema type
function convertParameterType(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'array',
    'object': 'object',
  };

  return typeMap[type.toLowerCase()] || 'string';
}

// Convert ToolDefinition to OpenRouter function format
export function toolToOpenRouterFunction(tool: ToolDefinition) {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  tool.parameters.forEach(param => {
    properties[param.name] = {
      type: convertParameterType(param.type),
      description: param.description,
    };

    if (param.enum) {
      properties[param.name].enum = param.enum;
    }

    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      },
    },
  };
}

// Convert all tools to OpenRouter format
export function convertToolsForOpenRouter(tools: ToolDefinition[]) {
  return tools.map(tool => toolToOpenRouterFunction(tool));
}
