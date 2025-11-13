/**
 * UUID Generator Tool
 * Generate UUIDs and random IDs
 */

import type { ToolDefinition } from '../types';

export const uuidTool: ToolDefinition = {
  name: 'generate_uuid',
  description: 'Generate UUIDs, random IDs, and other identifiers',
  category: 'utility',
  parameters: [
    {
      name: 'count',
      type: 'number',
      description: 'Number of UUIDs to generate (default: 1)',
      required: false,
    },
    {
      name: 'format',
      type: 'string',
      description: 'Format: "uuid" (standard UUID v4), "short" (8 chars), "nano" (21 chars)',
      required: false,
      enum: ['uuid', 'short', 'nano'],
    },
  ],
  async execute({ count = 1, format = 'uuid' }) {
    try {
      const ids: string[] = [];

      for (let i = 0; i < Math.min(count, 10); i++) {
        let id: string;

        if (format === 'uuid') {
          // Generate UUID v4
          id = crypto.randomUUID();
        } else if (format === 'short') {
          // Generate 8-character short ID
          id = Math.random().toString(36).substring(2, 10);
        } else if (format === 'nano') {
          // Generate 21-character nano ID
          const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          id = Array.from(crypto.getRandomValues(new Uint8Array(21)))
            .map(byte => chars[byte % chars.length])
            .join('');
        } else {
          id = crypto.randomUUID();
        }

        ids.push(id);
      }

      return {
        ids,
        count: ids.length,
        format,
      };
    } catch (error) {
      throw new Error(`Failed to generate ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
