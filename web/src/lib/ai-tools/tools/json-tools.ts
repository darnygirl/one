/**
 * JSON Tools
 * Validate, format, minify, and convert JSON
 */

import type { ToolDefinition } from '../types';

export const jsonToolsTool: ToolDefinition = {
  name: 'json_tools',
  description: 'Validate, format, minify, and convert JSON to YAML',
  category: 'utility',
  parameters: [
    {
      name: 'operation',
      type: 'string',
      description: 'Operation to perform',
      required: true,
      enum: ['validate', 'format', 'minify', 'to_yaml', 'generate_schema'],
    },
    {
      name: 'input',
      type: 'string',
      description: 'JSON input',
      required: true,
    },
    {
      name: 'indent',
      type: 'number',
      description: 'Indentation spaces (for format operation)',
      required: false,
    },
  ],
  async execute({ operation, input, indent = 2 }) {
    try {
      switch (operation) {
        case 'validate': {
          try {
            const parsed = JSON.parse(input);
            return {
              operation: 'Validate',
              valid: true,
              message: 'Valid JSON',
              type: Array.isArray(parsed) ? 'array' : typeof parsed,
              keys: typeof parsed === 'object' && !Array.isArray(parsed)
                ? Object.keys(parsed).length
                : undefined,
              length: Array.isArray(parsed) ? parsed.length : undefined,
            };
          } catch (error) {
            return {
              operation: 'Validate',
              valid: false,
              error: error instanceof Error ? error.message : 'Invalid JSON',
              message: 'JSON parsing failed',
            };
          }
        }

        case 'format': {
          const parsed = JSON.parse(input);
          const formatted = JSON.stringify(parsed, null, indent);
          return {
            operation: 'Format',
            input,
            output: formatted,
            original_length: input.length,
            formatted_length: formatted.length,
            indent,
          };
        }

        case 'minify': {
          const parsed = JSON.parse(input);
          const minified = JSON.stringify(parsed);
          return {
            operation: 'Minify',
            input,
            output: minified,
            original_length: input.length,
            minified_length: minified.length,
            reduction: `${(((input.length - minified.length) / input.length) * 100).toFixed(1)}%`,
          };
        }

        case 'to_yaml': {
          const parsed = JSON.parse(input);
          const yaml = jsonToYaml(parsed);
          return {
            operation: 'JSON to YAML',
            input,
            output: yaml,
            original_length: input.length,
            yaml_length: yaml.length,
          };
        }

        case 'generate_schema': {
          const parsed = JSON.parse(input);
          const schema = generateSchema(parsed);
          return {
            operation: 'Generate Schema',
            input,
            schema: JSON.stringify(schema, null, 2),
            schema_type: 'JSON Schema Draft 7',
          };
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`JSON operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Convert JSON to YAML (simple implementation)
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') {
    // Escape special characters and quote if needed
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj.map(item =>
      `${spaces}- ${jsonToYaml(item, indent + 1).trimStart()}`
    ).join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return '\n' + keys.map(key => {
      const value = obj[key];
      const valueStr = jsonToYaml(value, indent + 1);
      if (valueStr.startsWith('\n')) {
        return `${spaces}${key}:${valueStr}`;
      }
      return `${spaces}${key}: ${valueStr}`;
    }).join('\n');
  }

  return String(obj);
}

// Generate JSON Schema from example
function generateSchema(obj: any): any {
  const schema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
  };

  if (obj === null) {
    schema.type = 'null';
  } else if (typeof obj === 'boolean') {
    schema.type = 'boolean';
  } else if (typeof obj === 'number') {
    schema.type = Number.isInteger(obj) ? 'integer' : 'number';
  } else if (typeof obj === 'string') {
    schema.type = 'string';
  } else if (Array.isArray(obj)) {
    schema.type = 'array';
    if (obj.length > 0) {
      schema.items = generateSchema(obj[0]);
    }
  } else if (typeof obj === 'object') {
    schema.type = 'object';
    schema.properties = {};
    schema.required = [];

    for (const key of Object.keys(obj)) {
      schema.properties[key] = generateSchema(obj[key]);
      schema.required.push(key);
    }
  }

  return schema;
}
