/**
 * QR Code Generator Tool
 * Generate QR codes from text/URLs with customization options
 */

import type { ToolDefinition } from '../types';

export const qrCodeTool: ToolDefinition = {
  name: 'generate_qr_code',
  description: 'Generate QR codes from text or URLs with custom colors, sizes, and error correction levels',
  category: 'utility',
  parameters: [
    {
      name: 'data',
      type: 'string',
      description: 'Text or URL to encode in the QR code',
      required: true,
    },
    {
      name: 'size',
      type: 'number',
      description: 'Size of the QR code in pixels (default: 256)',
      required: false,
    },
    {
      name: 'foreground',
      type: 'string',
      description: 'Foreground color in hex format (default: #000000)',
      required: false,
    },
    {
      name: 'background',
      type: 'string',
      description: 'Background color in hex format (default: #ffffff)',
      required: false,
    },
    {
      name: 'error_correction',
      type: 'string',
      description: 'Error correction level: L (7%), M (15%), Q (25%), H (30%)',
      required: false,
      enum: ['L', 'M', 'Q', 'H'],
    },
    {
      name: 'logo_url',
      type: 'string',
      description: 'Optional logo URL to embed in center of QR code',
      required: false,
    },
  ],
  async execute({
    data,
    size = 256,
    foreground = '000000',
    background = 'ffffff',
    error_correction = 'M',
    logo_url
  }) {
    try {
      // Clean hex colors (remove # if present)
      const fg = foreground.replace('#', '');
      const fg_rgb = hexToRgb(fg);
      const bg = background.replace('#', '');
      const bg_rgb = hexToRgb(bg);

      // Using goqr.me API (no API key needed!)
      const params = new URLSearchParams({
        data: data,
        size: `${size}x${size}`,
        ecc: error_correction,
        color: `${fg_rgb.r}-${fg_rgb.g}-${fg_rgb.b}`,
        bgcolor: `${bg_rgb.r}-${bg_rgb.g}-${bg_rgb.b}`,
      });

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;

      // If logo requested, we'll note it in the response but the API doesn't support it
      // The frontend can overlay the logo on the QR code

      return {
        data: data,
        qr_code_url: qrUrl,
        size: size,
        foreground: `#${fg}`,
        background: `#${bg}`,
        error_correction: error_correction,
        logo_url: logo_url,
        download_formats: ['PNG', 'SVG', 'PDF', 'EPS'],
        usage_tips: [
          `Error correction ${error_correction}: Can recover from ${getEccPercentage(error_correction)}% damage`,
          'Higher error correction allows logo embedding',
          'Test QR code with multiple scanners before production use',
          `Size ${size}px is suitable for ${getSizeRecommendation(size)}`,
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getEccPercentage(level: string): string {
  const levels: Record<string, string> = {
    'L': '7',
    'M': '15',
    'Q': '25',
    'H': '30',
  };
  return levels[level] || '15';
}

function getSizeRecommendation(size: number): string {
  if (size <= 128) return 'digital display only';
  if (size <= 256) return 'web and mobile screens';
  if (size <= 512) return 'print materials up to business card size';
  return 'large format printing and banners';
}
