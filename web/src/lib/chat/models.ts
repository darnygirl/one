/**
 * AI Models Configuration
 * Defines available models from different providers via OpenRouter
 */

export interface Model {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
  free: boolean;
  context: string;
  description?: string;
}

export const FREE_MODELS: Model[] = [
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: true,
    context: '1M',
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'openrouter/polaris-alpha',
    name: 'Polaris Alpha',
    chef: 'OpenRouter',
    chefSlug: 'openrouter',
    providers: ['openrouter'],
    free: true,
    context: '256K'
  },
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    name: 'DeepSeek R1T2 Chimera',
    chef: 'TNG',
    chefSlug: 'tng',
    providers: ['tng'],
    free: true,
    context: '164K'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    chef: 'Z.AI',
    chefSlug: 'z-ai',
    providers: ['z-ai'],
    free: true,
    context: '131K'
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'DeepSeek R1T Chimera',
    chef: 'TNG',
    chefSlug: 'tng',
    providers: ['tng'],
    free: true,
    context: '164K'
  },
];

export const PREMIUM_MODELS: Model[] = [
  // Frontier Models
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '1M',
    description: 'Most capable model for complex tasks'
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '400K'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '1M'
  },
  // Fast Models
  {
    id: 'x-ai/grok-code-fast-1',
    name: 'Grok Code Fast 1',
    chef: 'xAI',
    chefSlug: 'x-ai',
    providers: ['x-ai'],
    free: false,
    context: '256K'
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    chef: 'xAI',
    chefSlug: 'x-ai',
    providers: ['x-ai'],
    free: false,
    context: '2M'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  // Efficient Models
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '400K'
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '200K'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '128K'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek V3.1',
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    providers: ['deepseek'],
    free: false,
    context: '164K'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    chef: 'Meta',
    chefSlug: 'meta',
    providers: ['meta'],
    free: false,
    context: '131K'
  },
];

export const ALL_MODELS = [...FREE_MODELS, ...PREMIUM_MODELS];

export const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite';

export const MODEL_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'xAI', 'DeepSeek', 'Meta'] as const;

/**
 * Get model by ID
 */
export function getModelById(id: string): Model | undefined {
  return ALL_MODELS.find(model => model.id === id);
}

/**
 * Check if model is free
 */
export function isModelFree(modelId: string): boolean {
  return FREE_MODELS.some(model => model.id === modelId);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): Model[] {
  return ALL_MODELS.filter(model => model.chef === provider);
}

/**
 * Group models by provider
 */
export function getModelsByProviders(): Record<string, Model[]> {
  const groups: Record<string, Model[]> = {};

  MODEL_PROVIDERS.forEach(provider => {
    const models = getModelsByProvider(provider);
    if (models.length > 0) {
      groups[provider] = models;
    }
  });

  return groups;
}
