/**
 * VectorSearch Component
 *
 * Semantic search interface with AI-powered similarity matching
 * Part of the KNOWLEDGE dimension
 */

import { useState } from "react";
import type { SearchResult } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResults } from "./SearchResults";
import { Search, Sparkles, Loader2 } from "lucide-react";

interface VectorSearchProps {
  onSearch?: (query: string) => void | Promise<void>;
  results?: SearchResult[];
  loading?: boolean;
  className?: string;
}

export function VectorSearch({
  onSearch,
  results = [],
  loading = false,
  className = ""
}: VectorSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await onSearch?.(query);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Semantic Search
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by meaning, not just keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Finding similar content...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Found {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear search
              </Button>
            </div>
            <SearchResults
              results={results}
              query={query}
              groupByType={false}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground">No similar content found</p>
            <p className="text-xs text-muted-foreground">
              Try rephrasing your query or using different keywords
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !query && results.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">AI-Powered Search</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Search by meaning instead of exact keywords. Our AI understands context
                and finds semantically similar content.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
