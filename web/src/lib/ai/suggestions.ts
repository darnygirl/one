/**
 * AI Suggestion Engine
 *
 * Generates context-aware prompt suggestions after each message
 * to guide users and keep the conversation flowing naturally
 */

import type { Message } from '@ai-sdk/react';

export interface Suggestion {
  id: string;
  text: string;
  icon?: string;
  category: 'follow-up' | 'deep-dive' | 'related' | 'action' | 'summary';
  priority: number;
}

// ============================================================================
// CONTEXT PATTERNS
// ============================================================================

const PATTERNS = {
  code: /```[\s\S]*```|`[^`]+`|function|class|const|let|var|import|export/,
  data: /\d{1,3}(,\d{3})*(\.\d+)?|chart|table|graph|data|statistics|metrics/i,
  creative: /write|create|generate|story|poem|essay|article|content/i,
  analysis: /analyze|explain|why|how|what|compare|evaluate|assess/i,
  question: /\?$/,
  positive: /thanks|great|excellent|perfect|awesome|helpful|good/i,
  negative: /error|wrong|incorrect|bad|issue|problem|fail/i,
};

// ============================================================================
// SUGGESTION TEMPLATES
// ============================================================================

const TEMPLATES = {
  // Follow-up questions
  followUp: {
    general: [
      { text: 'Can you explain that in more detail?', icon: '🔍' },
      { text: 'What else should I know about this?', icon: '💡' },
      { text: 'Can you show me an example?', icon: '📝' },
      { text: 'How would I implement this?', icon: '⚡' },
    ],
    code: [
      { text: 'Can you add comments to explain the code?', icon: '💬' },
      { text: 'Are there any edge cases I should handle?', icon: '🛡️' },
      { text: 'How would I test this?', icon: '🧪' },
      { text: 'Can you optimize this further?', icon: '⚡' },
    ],
    data: [
      { text: 'Can you visualize this data?', icon: '📊' },
      { text: 'What insights can we draw from this?', icon: '💡' },
      { text: 'Show me the trends over time', icon: '📈' },
      { text: 'Compare this to industry benchmarks', icon: '🎯' },
    ],
  },

  // Deep dives
  deepDive: {
    general: [
      { text: 'Break this down step by step', icon: '📋' },
      { text: 'What are the pros and cons?', icon: '⚖️' },
      { text: 'Compare different approaches', icon: '🔄' },
      { text: 'What are the alternatives?', icon: '🔀' },
    ],
    technical: [
      { text: 'Explain the underlying architecture', icon: '🏗️' },
      { text: 'What are the performance implications?', icon: '⚡' },
      { text: 'How does this scale?', icon: '📈' },
      { text: 'What are the security considerations?', icon: '🔒' },
    ],
  },

  // Related topics
  related: {
    learning: [
      { text: 'What should I learn next?', icon: '🎓' },
      { text: 'Recommend related resources', icon: '📚' },
      { text: 'Show me similar examples', icon: '🔗' },
      { text: 'What are the prerequisites?', icon: '📝' },
    ],
    exploration: [
      { text: 'What other use cases exist?', icon: '🌟' },
      { text: 'How is this used in production?', icon: '🚀' },
      { text: 'Show me real-world examples', icon: '🌍' },
      { text: 'What are the latest developments?', icon: '🆕' },
    ],
  },

  // Actions
  actions: {
    code: [
      { text: 'Convert this to TypeScript', icon: '🔷' },
      { text: 'Add error handling', icon: '🛡️' },
      { text: 'Write unit tests', icon: '🧪' },
      { text: 'Refactor for clarity', icon: '✨' },
    ],
    content: [
      { text: 'Make this shorter', icon: '✂️' },
      { text: 'Make this more professional', icon: '💼' },
      { text: 'Add more examples', icon: '📋' },
      { text: 'Translate to another language', icon: '🌐' },
    ],
    data: [
      { text: 'Export as CSV', icon: '💾' },
      { text: 'Create a chart', icon: '📊' },
      { text: 'Generate a report', icon: '📄' },
      { text: 'Find patterns', icon: '🔍' },
    ],
  },

  // Summaries
  summaries: [
    { text: 'Summarize our conversation', icon: '📝' },
    { text: 'Create a checklist', icon: '✅' },
    { text: 'List the key points', icon: '🎯' },
    { text: 'What are the action items?', icon: '⚡' },
  ],

  // Positive feedback follow-ups
  afterPositive: [
    { text: 'Can you help me with something else?', icon: '🙋' },
    { text: 'Show me more like this', icon: '⭐' },
    { text: 'Teach me something new', icon: '🎓' },
    { text: 'What else can you do?', icon: '✨' },
  ],

  // Error/problem follow-ups
  afterNegative: [
    { text: 'Can you try a different approach?', icon: '🔄' },
    { text: 'What went wrong?', icon: '🔍' },
    { text: 'How can I fix this?', icon: '🔧' },
    { text: 'Show me the correct way', icon: '✅' },
  ],
};

// ============================================================================
// STARTER SUGGESTIONS (Empty state)
// ============================================================================

export const STARTER_SUGGESTIONS: Suggestion[] = [
  {
    id: 'starter-1',
    text: 'Explain quantum computing like I\'m 5',
    icon: '🔬',
    category: 'related',
    priority: 10,
  },
  {
    id: 'starter-2',
    text: 'Write a Python function to analyze sales data',
    icon: '📊',
    category: 'action',
    priority: 9,
  },
  {
    id: 'starter-3',
    text: 'Help me plan a marketing campaign',
    icon: '🚀',
    category: 'action',
    priority: 8,
  },
  {
    id: 'starter-4',
    text: 'Create a beautiful landing page',
    icon: '🎨',
    category: 'action',
    priority: 7,
  },
  {
    id: 'starter-5',
    text: 'Analyze this business problem',
    icon: '💼',
    category: 'deep-dive',
    priority: 6,
  },
];

// ============================================================================
// CONTEXT ANALYZER
// ============================================================================

function analyzeContext(messages: Message[]): {
  hasCode: boolean;
  hasData: boolean;
  isCreative: boolean;
  isAnalytical: boolean;
  lastMessageType: 'question' | 'answer' | 'positive' | 'negative' | 'neutral';
  topics: string[];
} {
  const lastMessage = messages[messages.length - 1];
  const lastContent = lastMessage?.content || '';
  const allContent = messages.map(m => m.content).join(' ');

  // Detect patterns
  const hasCode = PATTERNS.code.test(allContent);
  const hasData = PATTERNS.data.test(allContent);
  const isCreative = PATTERNS.creative.test(allContent);
  const isAnalytical = PATTERNS.analysis.test(allContent);

  // Determine last message type
  let lastMessageType: 'question' | 'answer' | 'positive' | 'negative' | 'neutral' = 'neutral';
  if (PATTERNS.question.test(lastContent)) lastMessageType = 'question';
  else if (PATTERNS.positive.test(lastContent)) lastMessageType = 'positive';
  else if (PATTERNS.negative.test(lastContent)) lastMessageType = 'negative';
  else if (lastMessage?.role === 'assistant') lastMessageType = 'answer';

  // Extract topics (simple keyword extraction)
  const topics = extractKeywords(lastContent);

  return {
    hasCode,
    hasData,
    isCreative,
    isAnalytical,
    lastMessageType,
    topics,
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP
  const commonWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'about',
    'can', 'you', 'please', 'help', 'me', 'my', 'i', 'what', 'how',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 5);
}

// ============================================================================
// SUGGESTION GENERATOR
// ============================================================================

export function generateSuggestions(
  messages: Message[],
  maxSuggestions = 5
): Suggestion[] {
  // Empty state
  if (messages.length === 0) {
    return STARTER_SUGGESTIONS;
  }

  const context = analyzeContext(messages);
  const suggestions: Suggestion[] = [];

  // Priority-based selection
  const pools: { templates: any[]; category: Suggestion['category']; priority: number }[] = [];

  // 1. Handle specific states
  if (context.lastMessageType === 'positive') {
    pools.push({
      templates: TEMPLATES.afterPositive,
      category: 'follow-up',
      priority: 10,
    });
  } else if (context.lastMessageType === 'negative') {
    pools.push({
      templates: TEMPLATES.afterNegative,
      category: 'action',
      priority: 10,
    });
  }

  // 2. Context-specific follow-ups
  if (context.hasCode) {
    pools.push({
      templates: TEMPLATES.followUp.code,
      category: 'follow-up',
      priority: 9,
    });
    pools.push({
      templates: TEMPLATES.actions.code,
      category: 'action',
      priority: 8,
    });
  } else if (context.hasData) {
    pools.push({
      templates: TEMPLATES.followUp.data,
      category: 'follow-up',
      priority: 9,
    });
    pools.push({
      templates: TEMPLATES.actions.data,
      category: 'action',
      priority: 8,
    });
  } else {
    pools.push({
      templates: TEMPLATES.followUp.general,
      category: 'follow-up',
      priority: 9,
    });
  }

  // 3. Deep dives
  if (context.isAnalytical || context.lastMessageType === 'answer') {
    pools.push({
      templates: context.hasCode ? TEMPLATES.deepDive.technical : TEMPLATES.deepDive.general,
      category: 'deep-dive',
      priority: 7,
    });
  }

  // 4. Related topics
  pools.push({
    templates: TEMPLATES.related.learning,
    category: 'related',
    priority: 6,
  });

  // 5. Always include summary option after 3+ messages
  if (messages.length >= 6) {
    pools.push({
      templates: TEMPLATES.summaries,
      category: 'summary',
      priority: 5,
    });
  }

  // Generate suggestions from pools
  let id = 0;
  for (const pool of pools) {
    const remaining = maxSuggestions - suggestions.length;
    if (remaining <= 0) break;

    const count = Math.min(remaining, 2); // Max 2 per category
    const selected = pool.templates
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, count);

    for (const template of selected) {
      suggestions.push({
        id: `suggestion-${id++}`,
        text: template.text,
        icon: template.icon,
        category: pool.category,
        priority: pool.priority,
      });
    }
  }

  // Sort by priority and return
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, maxSuggestions);
}

// ============================================================================
// SUGGESTION LEARNING (Future enhancement)
// ============================================================================

export function trackSuggestionClick(suggestionId: string): void {
  // Store in localStorage or analytics
  if (typeof window !== 'undefined') {
    const key = 'suggestion-clicks';
    const clicks = JSON.parse(localStorage.getItem(key) || '{}');
    clicks[suggestionId] = (clicks[suggestionId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(clicks));
  }
}

export function getSuggestionStats(): Record<string, number> {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('suggestion-clicks') || '{}');
  }
  return {};
}
