/**
 * Web Search Tool
 * Search the web using DuckDuckGo
 */

import type { ToolDefinition } from '../types';

export const websearchTool: ToolDefinition = {
  name: 'web_search',
  description: 'Search the web for information using DuckDuckGo',
  category: 'search',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The search query',
      required: true,
    },
    {
      name: 'max_results',
      type: 'number',
      description: 'Maximum number of results to return (default: 5)',
      required: false,
    },
  ],
  async execute({ query, max_results = 5 }) {
    try {
      // Using DuckDuckGo Instant Answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();

      // Extract results
      const results = [];

      // Abstract (main answer)
      if (data.Abstract) {
        results.push({
          title: data.Heading || 'Answer',
          snippet: data.Abstract,
          url: data.AbstractURL,
          source: data.AbstractSource,
        });
      }

      // Related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics.slice(0, max_results - 1)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0],
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo',
            });
          }
        }
      }

      return {
        query,
        results: results.slice(0, max_results),
        total: results.length,
      };
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
