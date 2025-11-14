/**
 * Web Search Tool (Enhanced)
 * Search the web with pagination, image search, news, and site-specific filtering
 */

import type { ToolDefinition } from '../types';

export const websearchTool: ToolDefinition = {
  name: 'web_search',
  description: 'Search the web for information, images, or news. Supports pagination and site-specific searches.',
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
      description: 'Maximum number of results to return (default: 10)',
      required: false,
    },
    {
      name: 'search_type',
      type: 'string',
      description: 'Type of search: web, images, or news (default: web)',
      required: false,
      enum: ['web', 'images', 'news'],
    },
    {
      name: 'site',
      type: 'string',
      description: 'Limit search to specific site (e.g., "github.com")',
      required: false,
    },
    {
      name: 'page',
      type: 'number',
      description: 'Page number for pagination (default: 1)',
      required: false,
    },
  ],
  async execute({ query, max_results = 10, search_type = 'web', site, page = 1 }) {
    try {
      // Build search query with filters
      let searchQuery = query;
      if (site) {
        searchQuery = `site:${site} ${query}`;
      }

      // For news search, add time filter
      if (search_type === 'news') {
        searchQuery = `${searchQuery} news`;
      }

      // Using DuckDuckGo Instant Answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();

      // Extract results based on search type
      const results = [];

      // Abstract (main answer) - only for web search
      if (search_type === 'web' && data.Abstract) {
        results.push({
          type: 'answer',
          title: data.Heading || 'Answer',
          snippet: data.Abstract,
          url: data.AbstractURL,
          source: data.AbstractSource,
          thumbnail: data.Image || null,
          credibility: data.AbstractSource ? 'high' : 'medium',
        });
      }

      // Related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics) {
          // Handle nested topics
          if (topic.Topics) {
            for (const subtopic of topic.Topics) {
              if (subtopic.Text && subtopic.FirstURL) {
                results.push({
                  type: search_type === 'images' ? 'image' : search_type === 'news' ? 'news' : 'web',
                  title: subtopic.Text.split(' - ')[0],
                  snippet: subtopic.Text,
                  url: subtopic.FirstURL,
                  source: extractDomain(subtopic.FirstURL),
                  thumbnail: subtopic.Icon?.URL || null,
                  credibility: assessCredibility(subtopic.FirstURL),
                });
              }
            }
          } else if (topic.Text && topic.FirstURL) {
            results.push({
              type: search_type === 'images' ? 'image' : search_type === 'news' ? 'news' : 'web',
              title: topic.Text.split(' - ')[0],
              snippet: topic.Text,
              url: topic.FirstURL,
              source: extractDomain(topic.FirstURL),
              thumbnail: topic.Icon?.URL || null,
              credibility: assessCredibility(topic.FirstURL),
            });
          }
        }
      }

      // Pagination logic
      const startIndex = (page - 1) * max_results;
      const endIndex = startIndex + max_results;
      const paginatedResults = results.slice(startIndex, endIndex);

      // Related searches (from Definition topics)
      const relatedSearches = [];
      if (data.Results && data.Results.length > 0) {
        for (const result of data.Results.slice(0, 5)) {
          if (result.Text) {
            relatedSearches.push(result.Text.split(' - ')[0]);
          }
        }
      }

      return {
        query: searchQuery,
        original_query: query,
        search_type,
        site_filter: site || null,
        results: paginatedResults,
        total_results: results.length,
        page,
        pages: Math.ceil(results.length / max_results),
        has_more: endIndex < results.length,
        related_searches: relatedSearches,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

// Helper function to assess source credibility
function assessCredibility(url: string): 'high' | 'medium' | 'low' {
  try {
    const domain = extractDomain(url);

    // High credibility sources
    const highCredibility = [
      'wikipedia.org', 'github.com', 'stackoverflow.com',
      'nature.com', 'science.org', 'arxiv.org',
      'nytimes.com', 'reuters.com', 'apnews.com',
      'bbc.com', 'gov', 'edu'
    ];

    // Low credibility indicators
    const lowCredibility = ['blogspot.', 'wordpress.com'];

    if (highCredibility.some(trusted => domain.includes(trusted))) {
      return 'high';
    }

    if (lowCredibility.some(untrusted => domain.includes(untrusted))) {
      return 'low';
    }

    return 'medium';
  } catch {
    return 'medium';
  }
}
