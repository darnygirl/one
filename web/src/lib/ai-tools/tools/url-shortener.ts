/**
 * URL Shortener Tool
 * Shorten URLs using TinyURL API with optional custom aliases
 */

import type { ToolDefinition } from '../types';

export const urlShortenerTool: ToolDefinition = {
  name: 'shorten_url',
  description: 'Shorten long URLs using TinyURL API with optional custom aliases and QR code generation',
  category: 'utility',
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'The long URL to shorten',
      required: true,
    },
    {
      name: 'custom_alias',
      type: 'string',
      description: 'Optional custom alias for the short URL (may not be available)',
      required: false,
    },
    {
      name: 'generate_qr',
      type: 'string',
      description: 'Whether to generate a QR code for the short URL (yes/no)',
      required: false,
      enum: ['yes', 'no'],
    },
  ],
  async execute({ url, custom_alias, generate_qr = 'yes' }) {
    try {
      // Validate URL format
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch {
        // Try adding https:// if no protocol
        validUrl = new URL(`https://${url}`);
      }

      // Using TinyURL API
      const apiUrl = custom_alias
        ? `https://tinyurl.com/api-create.php?url=${encodeURIComponent(validUrl.toString())}&alias=${encodeURIComponent(custom_alias)}`
        : `https://tinyurl.com/api-create.php?url=${encodeURIComponent(validUrl.toString())}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        // TinyURL returns error messages in the response body
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to shorten URL');
      }

      const shortUrl = await response.text();

      // Generate QR code URL for the short URL
      const qrCodeUrl = generate_qr === 'yes'
        ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shortUrl)}`
        : undefined;

      // Extract domain and path for display
      const shortUrlObj = new URL(shortUrl);
      const shortCode = shortUrlObj.pathname.substring(1); // Remove leading /

      // Generate analytics preview (mock data for demonstration)
      const analytics = {
        clicks: 0,
        created: new Date().toISOString(),
        expires: 'Never',
        status: 'Active',
      };

      return {
        original_url: validUrl.toString(),
        short_url: shortUrl,
        short_code: shortCode,
        custom_alias: custom_alias || null,
        qr_code_url: qrCodeUrl,
        analytics: analytics,
        share_methods: [
          'Copy to clipboard',
          'Email',
          'SMS',
          'Social media',
          'QR code scan',
        ],
        usage_tips: [
          'Short URLs are permanent and cannot be deleted',
          'Custom aliases are case-sensitive',
          'Test the short URL before sharing widely',
          'QR codes work best on light backgrounds',
          'Share QR code for easy mobile access',
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to shorten URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
