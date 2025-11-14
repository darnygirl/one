import type { APIRoute } from 'astro';
import { toolRegistry } from '@/lib/ai-tools/registry';
import { registerAllTools } from '@/lib/ai-tools/registerAllTools';
import { convertToolsForOpenRouter } from '@/lib/ai-tools/openrouter-adapter';

// Initialize tools on first import
registerAllTools();

/**
 * Unified Chat API Endpoint (OpenRouter)
 *
 * Two modes:
 * 1. Client provides their own OpenRouter API key → Use that
 * 2. No key provided → Use backend default key from env (OPENROUTER_API_KEY)
 *
 * Access to all models: Gemini Flash Lite (free), GPT-4, Claude, Llama, etc.
 * Enhanced with AI tool calling (calculator, weather, etc.)
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
      // FREE TIER - Works without API key
      return handleFreeTier(messages, premium, model);
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

    // Use messages as-is without system prompts
    const messagesWithSystem = messages;

    // Get all registered AI tools and convert to OpenRouter format
    const registeredTools = toolRegistry.list();
    const tools = convertToolsForOpenRouter(registeredTools);

    // Log the request for debugging
    console.log('OpenRouter request:', {
      model,
      messageCount: messagesWithSystem.length,
      premium,
      toolsCount: tools.length,
      usingClientKey: !!apiKey,
      usingBackendKey: !apiKey,
      keyPrefix: effectiveApiKey.substring(0, 10) + '...'
    });

    // Call OpenRouter API directly with tool definitions
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4321', // Optional: for OpenRouter analytics
        'X-Title': 'ONE Platform Chat' // Optional: shows in OpenRouter dashboard
      },
      body: JSON.stringify({
        model: model,
        messages: messagesWithSystem,
        tools: tools, // Include AI tool definitions
        tool_choice: 'auto', // Let the model decide when to use tools
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // Parse error message if possible
      let errorMessage = `OpenRouter API error: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text directly
        if (errorText) errorMessage = errorText;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse streaming response for UI components
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let fullContent = '';

        try {
          console.log('[CHAT API] Stream started');

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[CHAT API] Stream done naturally (after [DONE] was sent)');
              // Stream already closed by [DONE] handler
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Log every chunk to see what we're getting
            if (chunk.includes('[DONE]')) {
              console.log('[CHAT API] FOUND DONE CHUNK:', JSON.stringify(chunk));
            }

            // Extract content from SSE format
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  console.log('[CHAT API] Found [DONE] in line processing');
                  continue; // Don't forward [DONE] yet
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // Check if this chunk contains [DONE]
            const hasDone = chunk.includes('[DONE]');
            console.log('[CHAT API] Chunk check - hasDone:', hasDone, 'fullContent length:', fullContent.length);

            if (hasDone) {
              console.log('[CHAT API] Detected [DONE] in chunk, processing UI components now');

              // Send UI messages BEFORE [DONE]
              // Check for UI components in the complete response
              const chartMatches = [...fullContent.matchAll(/```ui-chart\s*\n([\s\S]*?)\n```/g)];
              console.log('[CHAT API] Found', chartMatches.length, 'charts in content');

              for (const match of chartMatches) {
                try {
                  const chartData = JSON.parse(match[1]);
                  const uiMessage = {
                    type: 'ui',
                    payload: {
                      component: 'chart',
                      data: chartData
                    }
                  };
                  console.log('[CHAT API] Sending chart UI message');
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiMessage)}\n\n`));
                } catch (e) {
                  console.error('[CHAT API] Failed to parse chart JSON:', e);
                }
              }

              // Now forward the chunk with [DONE]
              controller.enqueue(encoder.encode(chunk));
            } else {
              // Forward chunk as-is
              controller.enqueue(encoder.encode(chunk));
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Free tier chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Free tier handler - Direct passthrough to OpenRouter (no fake responses)
async function handleFreeTier(messages: any[], premium: boolean, model: string = 'google/gemini-2.5-flash-lite') {
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
    // Get all registered AI tools and convert to OpenRouter format
    const registeredTools = toolRegistry.list();
    const tools = convertToolsForOpenRouter(registeredTools);

    console.log('[FREE TIER] Calling OpenRouter with', tools.length, 'tools');

    // Call OpenRouter API directly (same as premium tier) with tools
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
        tools: tools, // Include AI tool definitions
        tool_choice: 'auto', // Let the model decide when to use tools
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to call API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Legacy functions for genui page (keep for backward compatibility)
function generateDataVisualization(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('sales') || lower.includes('revenue')) {
    return `I'll create a sales visualization for you!

Here's a comprehensive sales analysis:

\`\`\`ui-chart
{
  "title": "Monthly Sales Performance",
  "chartType": "line",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  "datasets": [
    { "label": "Revenue 2024", "data": [42000, 48000, 45000, 52000, 58000, 61000, 67000, 72000], "color": "#3b82f6" },
    { "label": "Revenue 2023", "data": [38000, 41000, 42000, 43000, 47000, 49000, 51000, 54000], "color": "#10b981" }
  ]
}
\`\`\`

Key insights:
- Revenue is up 33% year-over-year`;
  }

  return `\`\`\`ui-chart
{
  "title": "Sample Data",
  "chartType": "line",
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "datasets": [{ "label": "Data", "data": [65, 78, 82, 91], "color": "#3b82f6" }]
}
\`\`\``;
}

function generateTableResponse(message: string): string {
  return `\`\`\`ui-table
{
  "title": "Data Table",
  "columns": ["ID", "Name", "Value"],
  "rows": [["001", "Item A", "$1,250"], ["002", "Item B", "$980"]]
}
\`\`\``;
}

function generateCodeResponse(message: string): string {
  return `\`\`\`javascript
function example() {
  console.log("Example code");
}
\`\`\``;
}

function generateConversationalResponse(message: string, modelName: string = 'AI'): string {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return `Hello! How can I help you today?`;
  }

  if (lower.includes('help')) {
    return `I can help with various tasks. What would you like to do?`;
  }

  return `I understand. How can I assist you with that?`;
}

function generateExplanation(message: string): string {
  return "Let me explain that concept for you.";
}

function generateContextualResponse(message: string): string {
  return "Here's some information about that topic.";
}

// Legacy streaming function (not used anymore, but keep for genui compatibility)
async function legacyHandleFreeTier(messages: any[], premium: boolean, model: string = 'google/gemini-2.5-flash-lite') {
  const lastMessage = messages[messages.length - 1];
  const userMessage = typeof lastMessage.content === 'string'
    ? lastMessage.content
    : Array.isArray(lastMessage.content) && lastMessage.content[0]?.text
      ? lastMessage.content[0].text
      : '';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let response = '';
        const lowerMessage = userMessage.toLowerCase();

        // Check for chart/visualization requests
        if (premium && (lowerMessage.includes('chart') || lowerMessage.includes('graph'))) {
          response = generateDataVisualization(userMessage);
        }
        // Check for table requests
        else if (premium && lowerMessage.includes('table')) {
          response = generateTableResponse(userMessage);
        }
        // Programming/code requests
        else if (lowerMessage.includes('code')) {
          response = generateCodeResponse(userMessage);
        }
        // General conversation
        else {
          response = generateConversationalResponse(userMessage, 'AI');
        }

        // Stream the response word by word for realistic typing effect
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          const data = JSON.stringify({
            choices: [{
              delta: { content: word }
            }]
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // Simulate typing delay
          await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20));
        }

        // BEFORE sending [DONE], check for and send UI components
        const chartMatches = [...response.matchAll(/```ui-chart\s*\n([\s\S]*?)\n```/g)];
        console.log('[FREE TIER] Found', chartMatches.length, 'charts in response');

        for (const match of chartMatches) {
          try {
            const chartData = JSON.parse(match[1]);
            const uiMessage = {
              type: 'ui',
              payload: {
                component: 'chart',
                data: chartData
              }
            };
            console.log('[FREE TIER] Sending chart UI message:', chartData.title);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiMessage)}\n\n`));
          } catch (e) {
            console.error('[FREE TIER] Failed to parse chart JSON:', e);
          }
        }

        // Check for tables
        const tableMatches = [...response.matchAll(/```ui-table\s*\n([\s\S]*?)\n```/g)];
        console.log('[FREE TIER] Found', tableMatches.length, 'tables in response');

        for (const match of tableMatches) {
          try {
            const tableData = JSON.parse(match[1]);
            const uiMessage = {
              type: 'ui',
              payload: {
                component: 'table',
                data: tableData
              }
            };
            console.log('[FREE TIER] Sending table UI message:', tableData.title);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiMessage)}\n\n`));
          } catch (e) {
            console.error('[FREE TIER] Failed to parse table JSON:', e);
          }
        }

        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Free tier streaming error:', error);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
