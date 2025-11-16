/**
 * UUID Generator Tool
 * Generate and validate UUIDs with multiple formats
 */

import type { ToolDefinition } from '../types';

// Generate UUID v1 (timestamp-based)
function generateUUIDv1(): string {
  const timestamp = Date.now();
  const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHi = ((timestamp >> 48) & 0x0fff | 0x1000).toString(16).padStart(4, '0');

  const clockSeq = Math.floor(Math.random() * 0x3fff | 0x8000).toString(16).padStart(4, '0');
  const node = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
}

// Generate UUID v4 (random)
function generateUUIDv4(): string {
  return crypto.randomUUID();
}

// Generate UUID v5 (name-based with SHA-1)
async function generateUUIDv5(name: string, namespace: string = 'dns'): Promise<string> {
  // Using a simple hash-based approach for v5
  const encoder = new TextEncoder();
  const data = encoder.encode(`${namespace}:${name}`);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Format as UUID v5
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Generate short code (8 characters, alphanumeric)
function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Generate nanoid (21 characters, URL-safe)
function generateNanoId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from(crypto.getRandomValues(new Uint8Array(21)))
    .map(byte => chars[byte % chars.length])
    .join('');
}

// Generate URL-safe UUID (base64 encoded)
function generateUrlSafeUUID(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(uuid.substr(i * 2, 2), 16);
  }
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Validate UUID
function validateUUID(uuid: string): { valid: boolean; version?: number; variant?: string } {
  const v1Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const v4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const v5Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (v1Pattern.test(uuid)) {
    return { valid: true, version: 1, variant: 'RFC 4122' };
  } else if (v4Pattern.test(uuid)) {
    return { valid: true, version: 4, variant: 'RFC 4122' };
  } else if (v5Pattern.test(uuid)) {
    return { valid: true, version: 5, variant: 'RFC 4122' };
  }

  return { valid: false };
}

// Extract timestamp from UUID v1
function extractTimestamp(uuid: string): { timestamp: number; date: string } | null {
  const validation = validateUUID(uuid);
  if (!validation.valid || validation.version !== 1) {
    return null;
  }

  const parts = uuid.split('-');
  const timeLow = parseInt(parts[0], 16);
  const timeMid = parseInt(parts[1], 16);
  const timeHi = parseInt(parts[2].substring(1), 16);

  const timestamp = (timeHi << 48) | (timeMid << 32) | timeLow;
  const date = new Date(timestamp);

  return {
    timestamp,
    date: date.toISOString(),
  };
}

// Generate QR code data URL for UUID
async function generateQRCode(text: string): Promise<string> {
  // Simple QR code generation using data URL
  // In a real implementation, use a library like qrcode
  const size = 200;
  const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  return qrData;
}

export const uuidTool: ToolDefinition = {
  name: 'generate_uuid',
  description: 'Generate, validate, and analyze UUIDs with multiple formats and bulk generation',
  category: 'utility',
  parameters: [
    {
      name: 'count',
      type: 'number',
      description: 'Number of UUIDs to generate (1-1000, default: 1)',
      required: false,
    },
    {
      name: 'format',
      type: 'string',
      description: 'Format: "v1" (timestamp), "v4" (random), "v5" (name-based), "short" (8 chars), "nano" (21 chars), "url-safe"',
      required: false,
      enum: ['v1', 'v4', 'v5', 'short', 'nano', 'url-safe'],
    },
    {
      name: 'validate',
      type: 'string',
      description: 'UUID to validate (instead of generating)',
      required: false,
    },
    {
      name: 'extract_timestamp',
      type: 'string',
      description: 'UUID v1 to extract timestamp from',
      required: false,
    },
    {
      name: 'generate_qr',
      type: 'boolean',
      description: 'Generate QR code for the UUID(s)',
      required: false,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Name for UUID v5 generation',
      required: false,
    },
  ],
  async execute({ count = 1, format = 'v4', validate, extract_timestamp, generate_qr = false, name }) {
    try {
      // Validation mode
      if (validate) {
        const validation = validateUUID(validate);
        const timestampInfo = validation.version === 1 ? extractTimestamp(validate) : null;
        const qrCode = generate_qr ? await generateQRCode(validate) : undefined;

        return {
          uuid: validate,
          validation,
          timestamp_info: timestampInfo,
          qr_code: qrCode,
        };
      }

      // Timestamp extraction mode
      if (extract_timestamp) {
        const validation = validateUUID(extract_timestamp);
        if (!validation.valid) {
          throw new Error('Invalid UUID format');
        }
        if (validation.version !== 1) {
          throw new Error('Only UUID v1 contains timestamp information');
        }

        const timestampInfo = extractTimestamp(extract_timestamp);
        return {
          uuid: extract_timestamp,
          validation,
          timestamp_info: timestampInfo,
        };
      }

      // Generation mode
      const actualCount = Math.min(Math.max(1, count), 1000);
      const ids: string[] = [];

      for (let i = 0; i < actualCount; i++) {
        let id: string;

        switch (format) {
          case 'v1':
            id = generateUUIDv1();
            break;
          case 'v4':
            id = generateUUIDv4();
            break;
          case 'v5':
            id = await generateUUIDv5(name || `id-${i}`, 'dns');
            break;
          case 'short':
            id = generateShortCode();
            break;
          case 'nano':
            id = generateNanoId();
            break;
          case 'url-safe':
            id = generateUrlSafeUUID();
            break;
          default:
            id = generateUUIDv4();
        }

        ids.push(id);
      }

      // Validate first UUID
      const firstValidation = ['v1', 'v4', 'v5'].includes(format)
        ? validateUUID(ids[0])
        : null;

      // Extract timestamp from first UUID if v1
      const timestampInfo = format === 'v1' ? extractTimestamp(ids[0]) : null;

      // Generate QR codes if requested (only for first ID or single ID)
      const qrCode = generate_qr && ids.length === 1 ? await generateQRCode(ids[0]) : undefined;
      const qrCodes = generate_qr && ids.length > 1
        ? await Promise.all(ids.slice(0, 10).map(id => generateQRCode(id)))
        : undefined;

      return {
        ids,
        count: ids.length,
        format,
        validation: firstValidation,
        timestamp_info: timestampInfo,
        qr_code: qrCode,
        qr_codes: qrCodes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to process UUID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
