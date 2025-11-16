/**
 * Image Generation Tool
 * Generate images using DALL-E or Stable Diffusion APIs
 */

import type { ToolDefinition } from '../types';

interface ImageGenParams {
  prompt: string;
  provider?: 'dalle' | 'stable-diffusion';
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  style?: 'vivid' | 'natural' | 'artistic' | 'photorealistic' | 'anime' | 'sketch';
  quality?: 'standard' | 'hd';
  n?: number; // Number of images to generate
  enhance_prompt?: boolean;
}

interface GeneratedImage {
  url: string;
  revised_prompt?: string;
  width: number;
  height: number;
  format: string;
  provider: string;
}

// Prompt enhancement helpers
const STYLE_ENHANCEMENTS: Record<string, string> = {
  vivid: 'highly detailed, vibrant colors, dramatic lighting, cinematic quality',
  natural: 'natural lighting, realistic colors, high definition',
  artistic: 'artistic composition, creative interpretation, unique perspective',
  photorealistic: 'photorealistic, ultra high definition, professional photography',
  anime: 'anime style, vibrant colors, cel shading, Japanese animation aesthetic',
  sketch: 'pencil sketch, hand-drawn, artistic linework, monochrome',
};

function enhancePrompt(prompt: string, style?: string): string {
  if (!style || !STYLE_ENHANCEMENTS[style]) {
    return prompt;
  }

  // Add style enhancement if not already present
  const enhancement = STYLE_ENHANCEMENTS[style];
  if (prompt.toLowerCase().includes(enhancement.split(',')[0].toLowerCase())) {
    return prompt;
  }

  return `${prompt}, ${enhancement}`;
}

// Parse size to dimensions
function parseSize(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
}

// DALL-E integration (requires API key)
async function generateWithDALLE(params: ImageGenParams, apiKey?: string): Promise<GeneratedImage[]> {
  if (!apiKey) {
    throw new Error(
      'DALL-E API key required. Set OPENAI_API_KEY environment variable or pass as parameter. Get your key at: https://platform.openai.com/api-keys'
    );
  }

  const { prompt, size = '1024x1024', quality = 'standard', n = 1, enhance_prompt = true, style = 'natural' } = params;

  const enhancedPrompt = enhance_prompt ? enhancePrompt(prompt, style) : prompt;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: quality === 'hd' ? 'dall-e-3' : 'dall-e-2',
        prompt: enhancedPrompt,
        n: quality === 'hd' ? 1 : Math.min(n, 10), // DALL-E 3 only supports n=1
        size,
        quality,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `DALL-E API error: ${response.status}`);
    }

    const data = await response.json();
    const dimensions = parseSize(size);

    return data.data.map((img: any) => ({
      url: img.url,
      revised_prompt: img.revised_prompt,
      width: dimensions.width,
      height: dimensions.height,
      format: 'png',
      provider: 'dalle',
    }));
  } catch (error) {
    throw new Error(`DALL-E generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Stable Diffusion fallback (using public API - free but limited)
async function generateWithStableDiffusion(params: ImageGenParams): Promise<GeneratedImage[]> {
  const { prompt, size = '512x512', enhance_prompt = true, style = 'natural' } = params;

  const enhancedPrompt = enhance_prompt ? enhancePrompt(prompt, style) : prompt;
  const dimensions = parseSize(size);

  try {
    // Using Pollinations AI (free, no API key needed)
    // Note: This is a simplified fallback - production should use proper SD API
    const width = dimensions.width;
    const height = dimensions.height;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true`;

    // Verify the image is accessible
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('Image generation service unavailable');
    }

    return [
      {
        url,
        width,
        height,
        format: 'jpeg',
        provider: 'stable-diffusion',
      },
    ];
  } catch (error) {
    throw new Error(
      `Stable Diffusion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Prompt suggestions
function getPromptSuggestions(basePrompt: string): string[] {
  const suggestions = [
    `${basePrompt}, professional photography, 8k resolution`,
    `${basePrompt}, digital art, vibrant colors, trending on artstation`,
    `${basePrompt}, cinematic lighting, dramatic composition`,
    `${basePrompt}, minimalist design, clean aesthetic`,
    `${basePrompt}, fantasy art, magical atmosphere, ethereal lighting`,
  ];

  return suggestions;
}

export const imageGenTool: ToolDefinition = {
  name: 'generate_image',
  description:
    'Generate images using AI. Supports DALL-E (requires API key) and Stable Diffusion (free, no key needed). Includes prompt enhancement and style presets.',
  category: 'creative',
  parameters: [
    {
      name: 'prompt',
      type: 'string',
      description: 'Text description of the image to generate',
      required: true,
    },
    {
      name: 'provider',
      type: 'string',
      description: 'AI provider to use (dalle requires API key, stable-diffusion is free)',
      required: false,
      enum: ['dalle', 'stable-diffusion'],
    },
    {
      name: 'size',
      type: 'string',
      description: 'Image dimensions',
      required: false,
      enum: ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'],
    },
    {
      name: 'style',
      type: 'string',
      description: 'Visual style preset',
      required: false,
      enum: ['vivid', 'natural', 'artistic', 'photorealistic', 'anime', 'sketch'],
    },
    {
      name: 'quality',
      type: 'string',
      description: 'Image quality (DALL-E only, hd requires DALL-E 3)',
      required: false,
      enum: ['standard', 'hd'],
    },
    {
      name: 'n',
      type: 'number',
      description: 'Number of images to generate (1-10, DALL-E 3 only supports 1)',
      required: false,
    },
    {
      name: 'enhance_prompt',
      type: 'boolean',
      description: 'Automatically enhance prompt with style descriptors',
      required: false,
    },
    {
      name: 'api_key',
      type: 'string',
      description: 'OpenAI API key (required for DALL-E, get at https://platform.openai.com/api-keys)',
      required: false,
    },
  ],
  async execute({
    prompt,
    provider = 'stable-diffusion',
    size = '1024x1024',
    style = 'natural',
    quality = 'standard',
    n = 1,
    enhance_prompt = true,
    api_key,
  }) {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    // Get API key from environment if not provided
    const apiKey = api_key || (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY);

    let images: GeneratedImage[];
    let provider_used = provider;

    try {
      if (provider === 'dalle') {
        images = await generateWithDALLE(
          { prompt, size, style, quality, n, enhance_prompt },
          apiKey
        );
      } else {
        // Use Stable Diffusion (free fallback)
        images = await generateWithStableDiffusion({ prompt, size, style, enhance_prompt });
        provider_used = 'stable-diffusion';
      }
    } catch (error) {
      // If DALL-E fails and it's an API key issue, suggest Stable Diffusion
      if (provider === 'dalle' && error instanceof Error && error.message.includes('API key')) {
        throw new Error(
          `${error.message}\n\nTip: Use provider='stable-diffusion' for free image generation (no API key needed)`
        );
      }
      throw error;
    }

    const enhancedPrompt = enhance_prompt ? enhancePrompt(prompt, style) : prompt;

    return {
      success: true,
      images,
      metadata: {
        original_prompt: prompt,
        enhanced_prompt: enhancedPrompt,
        provider: provider_used,
        style,
        quality,
        size,
        count: images.length,
        total_pixels: images.reduce((sum, img) => sum + img.width * img.height, 0),
      },
      prompt_suggestions: getPromptSuggestions(prompt),
      tips: [
        'Use specific details for better results (colors, lighting, composition)',
        'Combine multiple concepts with commas',
        'Try different styles to see which works best',
        provider_used === 'stable-diffusion'
          ? 'For higher quality, use DALL-E with an API key'
          : 'DALL-E 3 with HD quality produces the best results',
      ],
    };
  },
  metadata: {
    version: '1.0.0',
    author: 'ONE Platform',
    tags: ['image', 'ai', 'generation', 'dalle', 'stable-diffusion', 'art', 'creative'],
    examples: [
      {
        description: 'Generate with Stable Diffusion (free)',
        params: {
          prompt: 'A serene mountain landscape at sunset',
          provider: 'stable-diffusion',
          size: '1024x1024',
          style: 'photorealistic',
        },
      },
      {
        description: 'Generate with DALL-E (requires API key)',
        params: {
          prompt: 'A futuristic city with flying cars',
          provider: 'dalle',
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
        },
      },
      {
        description: 'Generate anime-style art',
        params: { prompt: 'A magical girl with pink hair', provider: 'stable-diffusion', style: 'anime' },
      },
    ],
  },
};
