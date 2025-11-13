/**
 * Search Results Component
 * Displays web search results
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search } from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface SearchResultsData {
  query: string;
  results: SearchResult[];
  total: number;
}

export function SearchResults({ data }: { data: SearchResultsData }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Results
        </CardTitle>
        <CardDescription>
          Found {data.total} results for "{data.query}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.results.map((result, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline flex items-center gap-1"
                >
                  {result.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.snippet}
                </p>
                <Badge variant="outline" className="text-xs">
                  {result.source}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
