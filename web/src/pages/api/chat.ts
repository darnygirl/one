import type { APIRoute } from 'astro';

/**
 * Unified Chat API Endpoint (OpenRouter)
 *
 * Two modes:
 * 1. Client provides their own OpenRouter API key → Use that
 * 2. No key provided → Use backend default key from env (OPENROUTER_API_KEY)
 *
 * Access to all models: Gemini Flash Lite (free), GPT-4, Claude, Llama, etc.
 *
 * Note: AI tools (calculator, weather, search, etc.) are executed CLIENT-SIDE
 * via toolRegistry.execute() - NOT via OpenRouter function calling
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, apiKey, model = 'google/gemini-2.5-flash-lite', premium } = await request.json();

    // List of free models that work without API key
    const FREE_MODELS = [
      'google/gemini-2.5-flash-lite',
      'openrouter/polaris-alpha',
      'tngtech/deepseek-r1t2-chimera:free',
      'z-ai/glm-4.5-air:free',
      'tngtech/deepseek-r1t-chimera:free'
    ];

    // Check if using free tier (any free model without API key)
    const isFreeTier = !apiKey && FREE_MODELS.includes(model);

    if (isFreeTier) {
      // FREE TIER - Works without API key by using backend key
      return handleFreeTier(messages, model);
    }

    // PREMIUM TIER - Requires API key for other models
    const effectiveApiKey = apiKey || import.meta.env.OPENROUTER_API_KEY;

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key required for premium models. Switch to a free model or add your OpenRouter API key.'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenRouter API directly (no tool definitions - tools run client-side)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4321',
        'X-Title': 'ONE Platform Chat'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);

      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Free tier handler - Uses backend API key to call OpenRouter for free models
async function handleFreeTier(messages: any[], model: string = 'google/gemini-2.5-flash-lite') {
  if (!messages || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No messages provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get backend API key for free models
  const backendKey = import.meta.env.OPENROUTER_API_KEY;

  if (!backendKey) {
    return new Response(
      JSON.stringify({ error: 'Backend API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('[FREE TIER] Calling OpenRouter for model:', model);

    // Call OpenRouter API with backend key (no tool definitions)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4321',
        'X-Title': 'ONE Platform Chat'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FREE TIER] OpenRouter error:', errorText);

      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward the streaming response directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[FREE TIER] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to call API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
