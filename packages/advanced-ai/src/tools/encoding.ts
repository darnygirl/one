/**
 * Encoding/Decoding Tool
 * Text ↔ Base64, URL encoding, JWT decoder, HTML entities
 */

import type { ToolDefinition } from '../types';

export const encodingTool: ToolDefinition = {
  name: 'encode_decode',
  description: 'Encode/decode text, Base64, URLs, JWT tokens, and HTML entities',
  category: 'utility',
  parameters: [
    {
      name: 'operation',
      type: 'string',
      description: 'Operation to perform',
      required: true,
      enum: ['base64_encode', 'base64_decode', 'url_encode', 'url_decode', 'jwt_decode', 'html_encode', 'html_decode'],
    },
    {
      name: 'input',
      type: 'string',
      description: 'Input text to encode/decode',
      required: true,
    },
  ],
  async execute({ operation, input }) {
    try {
      switch (operation) {
        case 'base64_encode': {
          const encoded = btoa(input);
          return {
            operation: 'Base64 Encode',
            input,
            output: encoded,
            length: encoded.length,
          };
        }

        case 'base64_decode': {
          try {
            const decoded = atob(input);
            return {
              operation: 'Base64 Decode',
              input,
              output: decoded,
              length: decoded.length,
            };
          } catch (error) {
            throw new Error('Invalid Base64 string');
          }
        }

        case 'url_encode': {
          const encoded = encodeURIComponent(input);
          return {
            operation: 'URL Encode',
            input,
            output: encoded,
            length: encoded.length,
          };
        }

        case 'url_decode': {
          try {
            const decoded = decodeURIComponent(input);
            return {
              operation: 'URL Decode',
              input,
              output: decoded,
              length: decoded.length,
            };
          } catch (error) {
            throw new Error('Invalid URL-encoded string');
          }
        }

        case 'jwt_decode': {
          try {
            const parts = input.split('.');
            if (parts.length !== 3) {
              throw new Error('Invalid JWT format (expected 3 parts separated by dots)');
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));

            return {
              operation: 'JWT Decode',
              input,
              header,
              payload,
              signature: parts[2],
              note: 'Signature not verified - this is for inspection only',
            };
          } catch (error) {
            throw new Error(`Invalid JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        case 'html_encode': {
          const encoded = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

          return {
            operation: 'HTML Encode',
            input,
            output: encoded,
            length: encoded.length,
          };
        }

        case 'html_decode': {
          const decoded = input
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

          return {
            operation: 'HTML Decode',
            input,
            output: decoded,
            length: decoded.length,
          };
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`Encoding/decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
