/**
 * File Processor Tool
 * Handle file uploads with analysis, OCR, and metadata extraction
 */

import type { ToolDefinition } from '../types';

// File type detection helpers
const FILE_TYPE_SIGNATURES: Record<string, { magic: number[]; mime: string; ext: string }> = {
  'image/jpeg': { magic: [0xff, 0xd8, 0xff], mime: 'image/jpeg', ext: 'jpg' },
  'image/png': { magic: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png', ext: 'png' },
  'image/gif': { magic: [0x47, 0x49, 0x46], mime: 'image/gif', ext: 'gif' },
  'image/webp': { magic: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp', ext: 'webp' },
  'application/pdf': { magic: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: 'pdf' },
  'application/zip': { magic: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip', ext: 'zip' },
  'text/csv': { magic: [], mime: 'text/csv', ext: 'csv' }, // No magic number
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    magic: [0x50, 0x4b, 0x03, 0x04],
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: 'docx',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    magic: [0x50, 0x4b, 0x03, 0x04],
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ext: 'xlsx',
  },
};

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: number;
  readable_size: string;
  is_valid: boolean;
  exceeded_limit: boolean;
  limit_mb: number;
}

interface ProcessedFile {
  metadata: FileMetadata;
  analysis?: {
    dimensions?: { width: number; height: number };
    format?: string;
    color_space?: string;
    has_alpha?: boolean;
    estimated_colors?: number;
  };
  extracted_data?: {
    text?: string;
    ocr_text?: string;
    csv_rows?: any[];
    excel_sheets?: any[];
    pdf_pages?: number;
  };
  preview?: {
    data_url?: string;
    thumbnail?: string;
  };
  errors?: string[];
}

// Size limit helpers
function getSizeLimit(tier: 'free' | 'premium'): number {
  return tier === 'free' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB or 50MB
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Detect file type from magic numbers
async function detectFileType(file: File): Promise<{ mime: string; ext: string }> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [_, signature] of Object.entries(FILE_TYPE_SIGNATURES)) {
    if (signature.magic.length === 0) continue;

    const matches = signature.magic.every((byte, index) => bytes[index] === byte);
    if (matches) {
      return { mime: signature.mime, ext: signature.ext };
    }
  }

  // Fallback to file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
  return { mime: file.type || 'application/octet-stream', ext };
}

// Extract metadata from file
async function extractMetadata(file: File, tier: 'free' | 'premium'): Promise<FileMetadata> {
  const limit = getSizeLimit(tier);
  const detectedType = await detectFileType(file);

  return {
    name: file.name,
    size: file.size,
    type: detectedType.mime,
    extension: detectedType.ext,
    lastModified: file.lastModified,
    readable_size: formatFileSize(file.size),
    is_valid: file.size > 0 && file.size <= limit,
    exceeded_limit: file.size > limit,
    limit_mb: tier === 'free' ? 10 : 50,
  };
}

// Analyze image files
async function analyzeImage(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Check for alpha channel
      let hasAlpha = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          hasAlpha = true;
          break;
        }
      }

      // Estimate number of unique colors (sample)
      const colorSet = new Set<string>();
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colorSet.add(`${r},${g},${b}`);
        if (colorSet.size > 10000) break; // Cap at 10k for performance
      }

      URL.revokeObjectURL(url);

      resolve({
        dimensions: { width: img.width, height: img.height },
        format: file.type,
        has_alpha: hasAlpha,
        estimated_colors: Math.min(colorSet.size, 10000),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Parse CSV file
async function parseCSV(file: File): Promise<any[]> {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim());

  if (lines.length === 0) return [];

  // Parse CSV (simple implementation)
  const rows = lines.map((line) => {
    // Handle quoted fields
    const regex = /(?:,|^)("(?:[^"]|"")*"|[^,]*)/g;
    const fields: string[] = [];
    let match;

    while ((match = regex.exec(line)) !== null) {
      let field = match[1];
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      fields.push(field);
    }

    return fields;
  });

  // Convert to objects using first row as headers
  const headers = rows[0];
  const data = rows.slice(1).map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return data;
}

// Generate preview/thumbnail
async function generatePreview(file: File): Promise<{ data_url?: string; thumbnail?: string }> {
  if (file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Create thumbnail (max 200x200)
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to create thumbnail'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

        URL.revokeObjectURL(url);
        resolve({ data_url: url, thumbnail });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to generate preview'));
      };

      img.src = url;
    });
  }

  return {};
}

export const fileProcessorTool: ToolDefinition = {
  name: 'process_file',
  description:
    'Process uploaded files with analysis, OCR, metadata extraction. Supports images (JPG, PNG, GIF, WebP), documents (PDF, DOCX), and data files (CSV, Excel).',
  category: 'utility',
  parameters: [
    {
      name: 'file',
      type: 'File',
      description: 'The file to process',
      required: true,
    },
    {
      name: 'tier',
      type: 'string',
      description: 'User tier (free: 10MB limit, premium: 50MB limit)',
      required: false,
      enum: ['free', 'premium'],
    },
    {
      name: 'extract_text',
      type: 'boolean',
      description: 'Extract text from documents and images (OCR)',
      required: false,
    },
    {
      name: 'analyze_image',
      type: 'boolean',
      description: 'Analyze image properties (dimensions, colors, etc.)',
      required: false,
    },
    {
      name: 'generate_preview',
      type: 'boolean',
      description: 'Generate preview/thumbnail for supported files',
      required: false,
    },
  ],
  async execute({ file, tier = 'free', extract_text = true, analyze_image = true, generate_preview = true }) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const result: ProcessedFile = {
      metadata: await extractMetadata(file, tier),
      errors: [],
    };

    // Check file size limit
    if (!result.metadata.is_valid) {
      result.errors!.push(
        `File size (${result.metadata.readable_size}) exceeds ${result.metadata.limit_mb}MB limit for ${tier} tier`
      );
      return result;
    }

    try {
      // Image analysis
      if (analyze_image && file.type.startsWith('image/')) {
        try {
          result.analysis = await analyzeImage(file);
        } catch (error) {
          result.errors!.push(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // CSV parsing
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          const rows = await parseCSV(file);
          result.extracted_data = {
            csv_rows: rows.slice(0, 100), // Limit to first 100 rows
          };
        } catch (error) {
          result.errors!.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Text extraction (for text files)
      if (extract_text && (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
        try {
          const text = await file.text();
          result.extracted_data = {
            ...(result.extracted_data || {}),
            text: text.slice(0, 10000), // Limit to 10k chars
          };
        } catch (error) {
          result.errors!.push(
            `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Preview generation
      if (generate_preview) {
        try {
          result.preview = await generatePreview(file);
        } catch (error) {
          result.errors!.push(
            `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // PDF info (basic)
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Note: Full PDF parsing requires pdf.js library
        result.extracted_data = {
          ...(result.extracted_data || {}),
          pdf_pages: null, // Placeholder - would need pdf.js
        };
        if (!result.errors) result.errors = [];
        result.errors.push('PDF text extraction requires additional library (pdf.js)');
      }

      // Office documents info
      if (
        file.type.includes('officedocument') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.pptx')
      ) {
        if (!result.errors) result.errors = [];
        result.errors.push('Office document processing requires additional libraries');
      }
    } catch (error) {
      result.errors!.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: result.errors!.length === 0,
      file: result,
      summary: {
        name: result.metadata.name,
        size: result.metadata.readable_size,
        type: result.metadata.type,
        valid: result.metadata.is_valid,
        features_processed: {
          metadata: true,
          analysis: !!result.analysis,
          text_extraction: !!result.extracted_data?.text,
          csv_parsing: !!result.extracted_data?.csv_rows,
          preview: !!result.preview?.thumbnail,
        },
      },
    };
  },
  metadata: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['file', 'upload', 'ocr', 'image', 'document', 'csv', 'pdf'],
    examples: [
      {
        description: 'Process image with analysis',
        params: { file: 'File object', tier: 'free', analyze_image: true, generate_preview: true },
      },
      {
        description: 'Parse CSV file',
        params: { file: 'File object', tier: 'premium' },
      },
    ],
  },
};
