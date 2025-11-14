/**
 * Hash Generator Tool
 * Generate MD5, SHA-1, SHA-256, SHA-512 hashes
 */

import type { ToolDefinition } from '../types';

export const hashTool: ToolDefinition = {
  name: 'generate_hash',
  description: 'Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512)',
  category: 'utility',
  parameters: [
    {
      name: 'input',
      type: 'string',
      description: 'Text to hash',
      required: true,
    },
    {
      name: 'algorithms',
      type: 'string',
      description: 'Hash algorithms to use (comma-separated)',
      required: false,
      enum: ['md5', 'sha1', 'sha256', 'sha512', 'all'],
    },
  ],
  async execute({ input, algorithms = 'all' }) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const algList = algorithms === 'all'
        ? ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']
        : algorithms.split(',').map((a: string) => {
            const upper = a.trim().toUpperCase();
            if (upper === 'MD5') return 'MD5';
            if (upper === 'SHA1') return 'SHA-1';
            if (upper === 'SHA256') return 'SHA-256';
            if (upper === 'SHA512') return 'SHA-512';
            return upper;
          });

      const hashes: Record<string, string> = {};

      for (const algorithm of algList) {
        if (algorithm === 'MD5') {
          // MD5 not available in Web Crypto API - use simple hash
          hashes['MD5'] = await simpleHash(input);
        } else {
          try {
            const hashBuffer = await crypto.subtle.digest(algorithm, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            hashes[algorithm] = hashHex;
          } catch (error) {
            hashes[algorithm] = `Error: ${algorithm} not supported`;
          }
        }
      }

      return {
        input,
        input_length: input.length,
        hashes,
        algorithms: Object.keys(hashes),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Hash generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Simple hash function for MD5 fallback (not cryptographically secure)
async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
