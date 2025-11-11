/**
 * OpenRouter Model Registry
 *
 * Comprehensive list of all available AI models on OpenRouter
 * with metadata for intelligent selection and display
 */

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  costPer1M: {
    input: number;
    output: number;
  };
  speed: 'instant' | 'fast' | 'medium' | 'slow';
  quality: 'excellent' | 'high' | 'good' | 'standard';
  capabilities: string[];
  free: boolean;
  recommended?: boolean;
  featured?: boolean;
}

export const MODELS: Record<string, ModelInfo> = {
  // ============================================================================
  // FREE TIER MODELS (No API key required for basic access)
  // ============================================================================

  'google/gemini-2.5-flash-lite': {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    description: 'Lightning-fast free model, perfect for conversations and quick tasks',
    contextLength: 1000000,
    costPer1M: { input: 0, output: 0 },
    speed: 'instant',
    quality: 'good',
    capabilities: ['text', 'conversation', 'analysis'],
    free: true,
    recommended: true,
    featured: true,
  },

  // ============================================================================
  // ANTHROPIC MODELS (Claude)
  // ============================================================================

  'anthropic/claude-opus-4-20250514': {
    id: 'anthropic/claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Most capable Claude model for complex reasoning and analysis',
    contextLength: 200000,
    costPer1M: { input: 15, output: 75 },
    speed: 'medium',
    quality: 'excellent',
    capabilities: ['reasoning', 'analysis', 'code', 'writing', 'research'],
    free: false,
    recommended: true,
    featured: true,
  },

  'anthropic/claude-sonnet-4-20250514': {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Balanced performance and speed for most tasks',
    contextLength: 200000,
    costPer1M: { input: 3, output: 15 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['conversation', 'code', 'analysis', 'writing'],
    free: false,
    recommended: true,
    featured: true,
  },

  'anthropic/claude-3.5-sonnet-20241022': {
    id: 'anthropic/claude-3.5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Previous generation, still excellent for most tasks',
    contextLength: 200000,
    costPer1M: { input: 3, output: 15 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'code', 'analysis'],
    free: false,
  },

  // ============================================================================
  // OPENAI MODELS (GPT)
  // ============================================================================

  'openai/gpt-5': {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Next-generation reasoning and creative capabilities',
    contextLength: 128000,
    costPer1M: { input: 20, output: 60 },
    speed: 'medium',
    quality: 'excellent',
    capabilities: ['reasoning', 'creative', 'code', 'analysis', 'multimodal'],
    free: false,
    featured: true,
  },

  'openai/gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Fast and capable, with vision support',
    contextLength: 128000,
    costPer1M: { input: 10, output: 30 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['conversation', 'code', 'vision', 'analysis'],
    free: false,
    recommended: true,
  },

  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Omni model with multimodal capabilities',
    contextLength: 128000,
    costPer1M: { input: 5, output: 15 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['text', 'vision', 'audio', 'multimodal'],
    free: false,
    recommended: true,
    featured: true,
  },

  'openai/gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Affordable and fast for everyday tasks',
    contextLength: 128000,
    costPer1M: { input: 0.15, output: 0.6 },
    speed: 'instant',
    quality: 'high',
    capabilities: ['conversation', 'analysis', 'code'],
    free: false,
    recommended: true,
  },

  'openai/gpt-3.5-turbo': {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and economical for simple tasks',
    contextLength: 16000,
    costPer1M: { input: 0.5, output: 1.5 },
    speed: 'instant',
    quality: 'good',
    capabilities: ['conversation', 'text'],
    free: false,
  },

  // ============================================================================
  // GOOGLE MODELS (Gemini)
  // ============================================================================

  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning with massive context window',
    contextLength: 2000000,
    costPer1M: { input: 2.5, output: 10 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['reasoning', 'analysis', 'code', 'massive-context'],
    free: false,
    recommended: true,
    featured: true,
  },

  'google/gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    description: 'Previous generation with excellent capabilities',
    contextLength: 1000000,
    costPer1M: { input: 1.25, output: 5 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'analysis', 'code'],
    free: false,
  },

  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Ultra-fast with great quality',
    contextLength: 1000000,
    costPer1M: { input: 0.15, output: 0.6 },
    speed: 'instant',
    quality: 'high',
    capabilities: ['conversation', 'analysis', 'speed'],
    free: false,
    recommended: true,
  },

  // ============================================================================
  // X.AI MODELS (Grok)
  // ============================================================================

  'x-ai/grok-4': {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    description: 'Latest Grok with real-time knowledge and wit',
    contextLength: 131000,
    costPer1M: { input: 5, output: 15 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['conversation', 'real-time', 'humor', 'analysis'],
    free: false,
    featured: true,
  },

  'x-ai/grok-3': {
    id: 'x-ai/grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Previous generation, still powerful',
    contextLength: 131000,
    costPer1M: { input: 3, output: 9 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'analysis'],
    free: false,
  },

  // ============================================================================
  // DEEPSEEK MODELS
  // ============================================================================

  'deepseek/deepseek-v3': {
    id: 'deepseek/deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Exceptional reasoning at incredible value',
    contextLength: 64000,
    costPer1M: { input: 0.27, output: 1.1 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['reasoning', 'code', 'math', 'analysis'],
    free: false,
    recommended: true,
    featured: true,
  },

  'deepseek/deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Optimized for conversation and general tasks',
    contextLength: 32000,
    costPer1M: { input: 0.14, output: 0.28 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'analysis'],
    free: false,
  },

  // ============================================================================
  // MOONSHOT MODELS (Kimi)
  // ============================================================================

  'moonshot/kimi-k2': {
    id: 'moonshot/kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot',
    description: 'Ultra-long context for processing entire books',
    contextLength: 8000000,
    costPer1M: { input: 1.5, output: 6 },
    speed: 'medium',
    quality: 'high',
    capabilities: ['ultra-long-context', 'analysis', 'research'],
    free: false,
    featured: true,
  },

  'moonshot/moonshot-v1-8k': {
    id: 'moonshot/moonshot-v1-8k',
    name: 'Moonshot V1 8K',
    provider: 'Moonshot',
    description: 'Standard context for general tasks',
    contextLength: 8000,
    costPer1M: { input: 1, output: 2 },
    speed: 'fast',
    quality: 'good',
    capabilities: ['conversation', 'analysis'],
    free: false,
  },

  // ============================================================================
  // META MODELS (Llama)
  // ============================================================================

  'meta-llama/llama-3.3-70b-instruct': {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'Open-source powerhouse for all tasks',
    contextLength: 128000,
    costPer1M: { input: 0.5, output: 0.75 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'code', 'analysis'],
    free: false,
    recommended: true,
  },

  'meta-llama/llama-3.1-405b-instruct': {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    description: 'Largest open model with exceptional capabilities',
    contextLength: 131000,
    costPer1M: { input: 2.5, output: 2.5 },
    speed: 'medium',
    quality: 'excellent',
    capabilities: ['reasoning', 'code', 'analysis', 'complex-tasks'],
    free: false,
  },

  // ============================================================================
  // MISTRAL MODELS
  // ============================================================================

  'mistralai/mistral-large': {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'Flagship model for complex reasoning',
    contextLength: 128000,
    costPer1M: { input: 3, output: 9 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['reasoning', 'code', 'multilingual'],
    free: false,
  },

  'mistralai/mistral-medium': {
    id: 'mistralai/mistral-medium',
    name: 'Mistral Medium',
    provider: 'Mistral',
    description: 'Balanced performance and cost',
    contextLength: 32000,
    costPer1M: { input: 2.5, output: 7.5 },
    speed: 'fast',
    quality: 'high',
    capabilities: ['conversation', 'analysis'],
    free: false,
  },

  // ============================================================================
  // COHERE MODELS
  // ============================================================================

  'cohere/command-r-plus': {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    description: 'Optimized for RAG and enterprise use',
    contextLength: 128000,
    costPer1M: { input: 2.5, output: 10 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['rag', 'search', 'analysis', 'enterprise'],
    free: false,
  },

  // ============================================================================
  // PERPLEXITY MODELS
  // ============================================================================

  'perplexity/llama-3.1-sonar-huge-128k-online': {
    id: 'perplexity/llama-3.1-sonar-huge-128k-online',
    name: 'Sonar Huge Online',
    provider: 'Perplexity',
    description: 'Real-time web search and analysis',
    contextLength: 128000,
    costPer1M: { input: 5, output: 5 },
    speed: 'fast',
    quality: 'excellent',
    capabilities: ['web-search', 'real-time', 'research', 'citations'],
    free: false,
    featured: true,
  },
};

// ============================================================================
// MODEL CATEGORIES
// ============================================================================

export const MODEL_CATEGORIES = {
  free: Object.values(MODELS).filter(m => m.free),
  featured: Object.values(MODELS).filter(m => m.featured),
  recommended: Object.values(MODELS).filter(m => m.recommended),
  byProvider: {
    anthropic: Object.values(MODELS).filter(m => m.provider === 'Anthropic'),
    openai: Object.values(MODELS).filter(m => m.provider === 'OpenAI'),
    google: Object.values(MODELS).filter(m => m.provider === 'Google'),
    xai: Object.values(MODELS).filter(m => m.provider === 'xAI'),
    deepseek: Object.values(MODELS).filter(m => m.provider === 'DeepSeek'),
    moonshot: Object.values(MODELS).filter(m => m.provider === 'Moonshot'),
    meta: Object.values(MODELS).filter(m => m.provider === 'Meta'),
    mistral: Object.values(MODELS).filter(m => m.provider === 'Mistral'),
    cohere: Object.values(MODELS).filter(m => m.provider === 'Cohere'),
    perplexity: Object.values(MODELS).filter(m => m.provider === 'Perplexity'),
  },
  bySpeed: {
    instant: Object.values(MODELS).filter(m => m.speed === 'instant'),
    fast: Object.values(MODELS).filter(m => m.speed === 'fast'),
    medium: Object.values(MODELS).filter(m => m.speed === 'medium'),
    slow: Object.values(MODELS).filter(m => m.speed === 'slow'),
  },
  byQuality: {
    excellent: Object.values(MODELS).filter(m => m.quality === 'excellent'),
    high: Object.values(MODELS).filter(m => m.quality === 'high'),
    good: Object.values(MODELS).filter(m => m.quality === 'good'),
    standard: Object.values(MODELS).filter(m => m.quality === 'standard'),
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getModel(id: string): ModelInfo | undefined {
  return MODELS[id];
}

export function getModelsByProvider(provider: string): ModelInfo[] {
  return Object.values(MODELS).filter(m => m.provider === provider);
}

export function searchModels(query: string): ModelInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(MODELS).filter(
    m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.provider.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.capabilities.some(c => c.toLowerCase().includes(lowerQuery))
  );
}

export function getDefaultModel(): ModelInfo {
  return MODELS['google/gemini-2.5-flash-lite'];
}

export function getFeaturedModels(): ModelInfo[] {
  return MODEL_CATEGORIES.featured;
}

export function getRecommendedModels(): ModelInfo[] {
  return MODEL_CATEGORIES.recommended;
}

export function getFreeModels(): ModelInfo[] {
  return MODEL_CATEGORIES.free;
}

export function estimateCost(
  model: ModelInfo,
  inputTokens: number,
  outputTokens: number
): number {
  return (
    (model.costPer1M.input * inputTokens) / 1000000 +
    (model.costPer1M.output * outputTokens) / 1000000
  );
}
