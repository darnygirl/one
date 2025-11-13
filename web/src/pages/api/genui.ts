import type { APIRoute } from 'astro';

const SYSTEM_PROMPT = `You are a helpful AI assistant with the ability to generate interactive visualizations.

IMPORTANT: When users ask about charts, data, or visualizations, ALWAYS generate sample data and charts immediately. DO NOT ask them to provide data - create realistic example data based on their request.

**For CHARTS** - Wrap JSON in \`\`\`ui-chart:\n{your json}\n\`\`\`

Example:
\`\`\`ui-chart
{
  "title": "Sales Growth",
  "chartType": "line",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    { "label": "Revenue", "data": [12000, 15000, 18000, 22000, 25000, 30000], "color": "#3b82f6" },
    { "label": "Profit", "data": [3000, 4500, 5400, 7700, 9000, 12000], "color": "#10b981" }
  ]
}
\`\`\`

Chart types: "line", "bar", "pie", "doughnut", "area"

**For TABLES** - Wrap JSON in \`\`\`ui-table:\n{your json}\n\`\`\`

Example:
\`\`\`ui-table
{
  "title": "Product List",
  "columns": ["Product", "Price", "Stock"],
  "rows": [
    ["Widget A", "$19.99", "50"],
    ["Gadget B", "$29.99", "30"]
  ]
}
\`\`\`

**For BUTTONS** - Wrap JSON in \`\`\`ui-button:\n{your json}\n\`\`\`

Example:
\`\`\`ui-button
{
  "label": "Click Me!",
  "variant": "default",
  "size": "default",
  "action": "alert('Hello from the button!')"
}
\`\`\`

Variants: "default", "destructive", "outline", "secondary", "ghost", "link"
Sizes: "default", "sm", "lg", "icon"

**For CARDS** - Wrap JSON in \`\`\`ui-card:\n{your json}\n\`\`\`

Example:
\`\`\`ui-card
{
  "title": "Feature Card",
  "description": "This is a cool feature",
  "icon": "rocket",
  "content": "Here's some detailed information about the feature."
}
\`\`\`

RULES:
1. If user mentions "sales", "revenue", "growth", "analytics" - generate charts with realistic business data
2. If user doesn't provide specific data - CREATE sample data that matches their request
3. ALWAYS include multiple charts when appropriate (e.g., "analyze sales" = revenue chart + profit chart + comparison chart)
4. Use diverse chart types (line for trends, bar for comparisons, pie for distribution)
5. Generate data that tells a story (growth trends, seasonal patterns, comparisons)

Example response for "Analyze sales data":
Here's an analysis of sales performance with interactive charts:

\`\`\`ui-chart
{
  "title": "Monthly Revenue Trend",
  "chartType": "line",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    { "label": "2024", "data": [45000, 52000, 48000, 61000, 58000, 67000], "color": "#3b82f6" },
    { "label": "2023", "data": [38000, 42000, 41000, 47000, 51000, 54000], "color": "#10b981" }
  ]
}
\`\`\`

\`\`\`ui-chart
{
  "title": "Sales by Category",
  "chartType": "bar",
  "labels": ["Electronics", "Clothing", "Home", "Books", "Sports"],
  "datasets": [
    { "label": "Q2 Sales", "data": [28000, 19000, 15000, 12000, 8000], "color": "#f59e0b" }
  ]
}
\`\`\`

Key insights: Revenue up 24% year-over-year, Electronics leading category, strong growth in May-June.`;

/**
 * Unified Chat API Endpoint (OpenRouter)
 *
 * Two modes:
 * 1. Client provides their own OpenRouter API key → Use that
 * 2. No key provided → Use backend default key from env (OPENROUTER_API_KEY)
 *
 * Access to all models: Gemini Flash Lite (free), GPT-4, Claude, Llama, etc.
 * Enhanced with chart/table generation capabilities
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

    // Add system prompt for chart generation if premium mode
    const messagesWithSystem = premium
      ? [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
      : messages;

    // Log the request for debugging
    console.log('OpenRouter request:', {
      model,
      messageCount: messagesWithSystem.length,
      premium,
      usingClientKey: !!apiKey,
      usingBackendKey: !apiKey,
      keyPrefix: effectiveApiKey.substring(0, 10) + '...'
    });

    // Call OpenRouter API directly
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

// Free tier handler - Simulates free model responses
async function handleFreeTier(messages: any[], premium: boolean, model: string = 'google/gemini-2.5-flash-lite') {
  if (!messages || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No messages provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || !lastMessage.content) {
    return new Response(
      JSON.stringify({ error: 'Invalid message format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userMessage = typeof lastMessage.content === 'string'
    ? lastMessage.content
    : Array.isArray(lastMessage.content) && lastMessage.content[0]?.text
      ? lastMessage.content[0].text
      : '';

  const encoder = new TextEncoder();

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Generate appropriate response based on message content
        let response = '';
        const lowerMessage = userMessage.toLowerCase();

        // Get friendly model name
        const modelNames: Record<string, string> = {
          'google/gemini-2.5-flash-lite': 'Gemini Flash Lite',
          'openrouter/polaris-alpha': 'Polaris Alpha',
          'tngtech/deepseek-r1t2-chimera:free': 'DeepSeek R1T2 Chimera',
          'z-ai/glm-4.5-air:free': 'GLM 4.5 Air',
          'tngtech/deepseek-r1t-chimera:free': 'DeepSeek R1T Chimera'
        };
        const modelName = modelNames[model] || 'AI Assistant';

        // Check for chart/visualization requests
        if (premium && (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualiz') || lowerMessage.includes('data'))) {
          response = generateDataVisualization(userMessage);
        }
        // Check for table requests
        else if (premium && (lowerMessage.includes('table') || lowerMessage.includes('list') || lowerMessage.includes('spreadsheet'))) {
          response = generateTableResponse(userMessage);
        }
        // Programming/code requests
        else if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('component') || lowerMessage.includes('program')) {
          response = generateCodeResponse(userMessage);
        }
        // General conversation
        else {
          response = generateConversationalResponse(userMessage, modelName);
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

// Generate data visualization response
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

\`\`\`ui-chart
{
  "title": "Sales by Product Category",
  "chartType": "bar",
  "labels": ["Electronics", "Clothing", "Home & Garden", "Books", "Sports"],
  "datasets": [
    { "label": "Q3 2024", "data": [85000, 62000, 48000, 31000, 27000], "color": "#f59e0b" }
  ]
}
\`\`\`

Key insights:
- Revenue is up 33% year-over-year
- Electronics remains the top category
- Consistent month-over-month growth of ~8%
- Strong performance in summer months`;
  }

  if (lower.includes('user') || lower.includes('traffic') || lower.includes('visitor')) {
    return `Here's your user analytics dashboard:

\`\`\`ui-chart
{
  "title": "Daily Active Users",
  "chartType": "area",
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "datasets": [
    { "label": "This Week", "data": [3200, 3500, 3800, 4100, 4500, 3900, 3600], "color": "#8b5cf6" }
  ]
}
\`\`\`

\`\`\`ui-chart
{
  "title": "User Distribution by Region",
  "chartType": "pie",
  "labels": ["North America", "Europe", "Asia", "South America", "Other"],
  "datasets": [
    { "label": "Users", "data": [35, 28, 22, 10, 5], "color": "#3b82f6" }
  ]
}
\`\`\`

Traffic highlights:
- Peak usage on Fridays
- 41% week-over-week growth
- North America leads with 35% of users`;
  }

  // Default chart response
  return `I'll create a visualization based on your request:

\`\`\`ui-chart
{
  "title": "Sample Data Visualization",
  "chartType": "line",
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
  "datasets": [
    { "label": "Metric A", "data": [65, 78, 82, 91, 95, 98], "color": "#3b82f6" },
    { "label": "Metric B", "data": [45, 52, 58, 63, 71, 75], "color": "#10b981" }
  ]
}
\`\`\`

This chart shows the trend over time. Would you like me to customize this visualization with your specific data?`;
}

// Generate table response
function generateTableResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('customer') || lower.includes('client')) {
    return `Here's a customer overview table:

\`\`\`ui-table
{
  "title": "Top Customers",
  "columns": ["Customer", "Orders", "Total Revenue", "Status", "Last Order"],
  "rows": [
    ["Acme Corporation", "156", "$425,000", "Premium", "2 days ago"],
    ["TechStart Inc", "98", "$312,500", "Active", "Today"],
    ["Global Solutions", "87", "$298,000", "Active", "1 week ago"],
    ["Innovation Labs", "72", "$186,000", "Active", "3 days ago"],
    ["Digital Dynamics", "65", "$175,500", "New", "Yesterday"]
  ]
}
\`\`\`

This shows your top performing customers sorted by revenue.`;
  }

  // Default table
  return `Here's a data table for you:

\`\`\`ui-table
{
  "title": "Data Overview",
  "columns": ["ID", "Name", "Value", "Status", "Date"],
  "rows": [
    ["001", "Item Alpha", "$1,250", "Active", "2024-01-08"],
    ["002", "Item Beta", "$980", "Pending", "2024-01-07"],
    ["003", "Item Gamma", "$2,100", "Active", "2024-01-06"],
    ["004", "Item Delta", "$750", "Completed", "2024-01-05"]
  ]
}
\`\`\`

You can customize this table with your specific data requirements.`;
}

// Generate code response
function generateCodeResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('react') && lower.includes('component')) {
    return `I'll create a React component for you:

\`\`\`typescript
import React, { useState } from 'react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="todo-container">
      <h2>Todo List</h2>
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

This TodoList component includes:
- TypeScript for type safety
- State management with hooks
- Add/toggle functionality
- Clean, reusable structure

Would you like me to add more features or create a different component?`;
  }

  if (lower.includes('python') || lower.includes('function')) {
    return `Here's a Python implementation:

\`\`\`python
def analyze_data(data_list):
    """
    Analyze a list of numbers and return statistics.
    """
    if not data_list:
        return {"error": "Empty data list"}

    stats = {
        "count": len(data_list),
        "sum": sum(data_list),
        "mean": sum(data_list) / len(data_list),
        "min": min(data_list),
        "max": max(data_list),
        "range": max(data_list) - min(data_list)
    }

    # Calculate median
    sorted_data = sorted(data_list)
    n = len(sorted_data)
    if n % 2 == 0:
        stats["median"] = (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2
    else:
        stats["median"] = sorted_data[n//2]

    return stats

# Example usage
data = [23, 45, 67, 89, 12, 34, 56, 78, 90]
result = analyze_data(data)
print(f"Analysis results: {result}")
\`\`\`

This function provides comprehensive statistical analysis of your data.`;
  }

  return `I can help you with coding! Here's a simple example:

\`\`\`javascript
// A utility function for data processing
function processData(items) {
  return items
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }))
    .sort((a, b) => b.priority - a.priority);
}

// Usage
const data = [
  { id: 1, name: 'Task A', active: true, priority: 5 },
  { id: 2, name: 'Task B', active: false, priority: 3 },
  { id: 3, name: 'Task C', active: true, priority: 8 }
];

const processed = processData(data);
console.log(processed);
\`\`\`

This demonstrates data filtering, transformation, and sorting. What specific functionality would you like to implement?`;
}

// Generate conversational response
function generateConversationalResponse(message: string, modelName: string = 'AI Assistant'): string {
  const lower = message.toLowerCase();

  // Greetings
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    const greetings = [
      `Hello! I'm ${modelName}, your free AI assistant. I can help with coding, data visualization, analysis, and general questions. What would you like to explore today?`,
      `Hi there! I'm here to help with any questions or tasks you have. I can generate code, create visualizations, build tables, and much more - all for free! What can I assist you with?`,
      `Hey! Great to meet you. I'm powered by ${modelName} (free tier). Feel free to ask me anything - from coding questions to data analysis. How can I help you today?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Help requests
  if (lower.includes('help') || lower.includes('what can you')) {
    return `I'm Gemini Flash Lite, and I can help you with:

**Free Features Available Now:**
- 💻 **Code Generation** - React, Python, TypeScript, and more
- 📊 **Data Visualization** - Charts and graphs (line, bar, pie, area)
- 📋 **Table Creation** - Structured data presentation
- 🤖 **AI Conversations** - General Q&A and problem-solving
- 🎨 **UI Components** - Buttons, cards, forms
- 📝 **Content Writing** - Documentation, explanations, tutorials

**With API Key (Unlock Premium Models):**
- 🧠 GPT-4 for advanced reasoning
- 🎯 Claude for detailed analysis
- 🚀 Llama for specialized tasks
- ⚡ Faster responses with premium models

Try asking me to:
- "Create a React todo component"
- "Show me a sales chart"
- "Build a customer table"
- "Explain how async/await works"

What would you like to explore first?`;
  }

  // How/why questions
  if (lower.includes('how do') || lower.includes('how to')) {
    return `I'll explain that step by step!

${generateExplanation(message)}

Would you like me to provide code examples or create a visualization to help illustrate this concept?`;
  }

  // Thank you
  if (lower.includes('thank')) {
    return "You're welcome! I'm always here to help. Feel free to ask me anything else - whether it's coding, data analysis, or general questions. Using Gemini Flash Lite means you get unlimited free assistance!";
  }

  // API/Model questions
  if (lower.includes('model') || lower.includes('api') || lower.includes('free')) {
    return `You're currently using **Gemini Flash Lite** - completely free, no API key needed!

**Current Setup:**
- ✅ Model: Gemini Flash Lite (Free Tier)
- ✅ Features: Full chat, code generation, visualizations
- ✅ Limits: None - unlimited free usage
- ✅ Speed: Fast responses

**Want More Models?**
Add an OpenRouter API key to unlock:
- GPT-4, GPT-4 Turbo
- Claude 3 Opus, Sonnet
- Llama 2 & 3
- Mistral, and 50+ more models

Get your free API key at: openrouter.ai/keys

But honestly, Gemini Flash Lite works great for most tasks! What would you like to create?`;
  }

  // Default response
  const responses = [
    `That's an interesting question! ${generateContextualResponse(message)} What specific aspect would you like me to elaborate on?`,
    `I understand what you're asking about. ${generateContextualResponse(message)} Would you like me to provide examples or create a visualization?`,
    `Great question! ${generateContextualResponse(message)} Is there a particular use case you have in mind?`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Generate contextual explanation
function generateExplanation(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('async') || lower.includes('await')) {
    return `Async/await is a modern JavaScript pattern for handling asynchronous operations:

1. **async** declares a function that returns a Promise
2. **await** pauses execution until the Promise resolves
3. Makes asynchronous code look synchronous

Example:
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\``;
  }

  if (lower.includes('react') && lower.includes('hook')) {
    return `React Hooks are functions that let you use state and lifecycle features in functional components:

**Common Hooks:**
- **useState**: Manage component state
- **useEffect**: Handle side effects
- **useContext**: Access context values
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize functions

Example:
\`\`\`javascript
const [count, setCount] = useState(0);
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\``;
  }

  return `Let me break this down:

1. First, understand the core concept
2. Then, identify the key components
3. Finally, see how they work together

This approach helps build a solid foundation for understanding the topic.`;
}

// Generate contextual response based on keywords
function generateContextualResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('performance') || lower.includes('optimi')) {
    return "Performance optimization is crucial for user experience. Key strategies include code splitting, lazy loading, memoization, and efficient state management.";
  }

  if (lower.includes('secur')) {
    return "Security is paramount in modern applications. Important considerations include input validation, authentication, authorization, and protection against common vulnerabilities.";
  }

  if (lower.includes('database') || lower.includes('data')) {
    return "Data management involves choosing the right storage solution, designing efficient schemas, and implementing proper indexing strategies.";
  }

  if (lower.includes('deploy') || lower.includes('host')) {
    return "Deployment strategies vary based on your needs - from simple static hosting to complex containerized microservices architectures.";
  }

  return "This involves understanding the underlying principles and applying them effectively in real-world scenarios.";
}
