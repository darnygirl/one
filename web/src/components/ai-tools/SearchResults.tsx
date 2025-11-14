/**
 * Search Results Component (Enhanced)
 * Rich result cards with thumbnails, credibility indicators, and related searches
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink, Search, Image as ImageIcon, Newspaper,
  Shield, ShieldAlert, ShieldQuestion, ChevronLeft, ChevronRight
} from 'lucide-react';

interface SearchResult {
  type?: 'answer' | 'web' | 'image' | 'news';
  title: string;
  snippet: string;
  url: string;
  source: string;
  thumbnail?: string | null;
  credibility?: 'high' | 'medium' | 'low';
}

interface SearchResultsData {
  query: string;
  original_query?: string;
  search_type?: 'web' | 'images' | 'news';
  site_filter?: string | null;
  results: SearchResult[];
  total_results?: number;
  page?: number;
  pages?: number;
  has_more?: boolean;
  related_searches?: string[];
  timestamp?: string;
  // Legacy support
  total?: number;
}

export function SearchResults({ data }: { data: SearchResultsData }) {
  const totalResults = data.total_results ?? data.total ?? data.results.length;
  const searchType = data.search_type ?? 'web';
  const currentPage = data.page ?? 1;
  const totalPages = data.pages ?? 1;

  // Get search type icon and label
  const getSearchTypeInfo = () => {
    switch (searchType) {
      case 'images':
        return { icon: ImageIcon, label: 'Image Search' };
      case 'news':
        return { icon: Newspaper, label: 'News Search' };
      default:
        return { icon: Search, label: 'Web Search' };
    }
  };

  const { icon: SearchIcon, label: searchLabel } = getSearchTypeInfo();

  // Get credibility badge
  const getCredibilityBadge = (credibility?: 'high' | 'medium' | 'low') => {
    switch (credibility) {
      case 'high':
        return (
          <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
            <Shield className="w-3 h-3 mr-1" />
            Trusted Source
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-400">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Verify Information
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5" />
            {searchLabel}
          </CardTitle>
          <CardDescription className="space-y-1">
            <div>Found {totalResults} results for "{data.original_query || data.query}"</div>
            {data.site_filter && (
              <div className="text-xs">
                Filtered to: <Badge variant="secondary">{data.site_filter}</Badge>
              </div>
            )}
            {totalPages > 1 && (
              <div className="text-xs">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </CardDescription>
        </CardHeader>

        {/* Results */}
        <CardContent className="space-y-4">
          {data.results.map((result, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                {result.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-20 h-20 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 space-y-2 min-w-0">
                  {/* Title */}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-lg hover:underline flex items-start gap-2 group"
                  >
                    <span className="flex-1">{result.title}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {/* URL */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{result.url}</span>
                  </div>

                  {/* Snippet */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {result.snippet}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {result.source}
                    </Badge>

                    {result.type === 'answer' && (
                      <Badge variant="default" className="text-xs">
                        Direct Answer
                      </Badge>
                    )}

                    {result.type === 'news' && (
                      <Badge variant="secondary" className="text-xs">
                        <Newspaper className="w-3 h-3 mr-1" />
                        News
                      </Badge>
                    )}

                    {result.type === 'image' && (
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Image
                      </Badge>
                    )}

                    {getCredibilityBadge(result.credibility)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {data.results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found for "{data.query}"</p>
              <p className="text-sm mt-1">Try different keywords or check your spelling</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!data.has_more}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Searches */}
      {data.related_searches && data.related_searches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Related Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.related_searches.map((query, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  {query}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {data.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Search completed: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
