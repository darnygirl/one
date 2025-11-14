/**
 * RealtimeSearch - Search with live results as you type
 *
 * Debounced Convex queries with highlighted matching text.
 */

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Clock } from "lucide-react";
import { useDebounce, useLocalStorage } from "../hooks";
import type { OntologyComponentProps } from "../types";

export interface RealtimeSearchProps extends OntologyComponentProps {
  /**
   * Convex query path for search
   */
  queryPath: any;

  /**
   * Additional query arguments
   */
  args?: Record<string, any>;

  /**
   * Debounce delay in milliseconds
   */
  debounceDelay?: number;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Render function for each result
   */
  renderResult: (result: any, query: string) => React.ReactNode;

  /**
   * Show recent searches
   */
  showRecentSearches?: boolean;

  /**
   * Maximum recent searches to store
   */
  maxRecentSearches?: number;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Minimum query length
   */
  minQueryLength?: number;
}

/**
 * Highlight matching text in a string
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 text-foreground">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * RealtimeSearch - Live search with debouncing
 *
 * @example
 * ```tsx
 * <RealtimeSearch
 *   queryPath={api.queries.things.search}
 *   args={{ groupId, type: "product" }}
 *   debounceDelay={300}
 *   placeholder="Search products..."
 *   showRecentSearches
 *   renderResult={(product, query) => (
 *     <ProductSearchResult product={product} query={query} />
 *   )}
 * />
 * ```
 */
export function RealtimeSearch({
  queryPath,
  args = {},
  debounceDelay = 300,
  placeholder = "Search...",
  renderResult,
  showRecentSearches = true,
  maxRecentSearches = 5,
  emptyMessage = "No results found",
  minQueryLength = 2,
  className,
}: RealtimeSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    "ontology-ui-recent-searches",
    []
  );

  // Debounce query for API calls
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Real-time search query (only if query meets minimum length)
  const shouldSearch = debouncedQuery.length >= minQueryLength;
  const results = useQuery(
    queryPath,
    shouldSearch ? { ...args, query: debouncedQuery } : "skip"
  );

  const displayResults = Array.isArray(results) ? results : [];

  // Handle search
  const handleSearch = (value: string) => {
    setQuery(value);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  // Handle result selection
  const handleResultClick = () => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches].slice(0, maxRecentSearches);
      setRecentSearches(updated);
    }
    setIsFocused(false);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Show recent searches or results
  const showResults = isFocused && (query.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative ${className || ''}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsFocused(false)}
            />

            {/* Results panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 w-full z-50"
            >
              <Card>
                <CardContent className="p-0 max-h-96 overflow-y-auto">
                  {/* Recent searches */}
                  {query.length === 0 && showRecentSearches && recentSearches.length > 0 && (
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Recent searches
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-6 text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(search)}
                            className="flex items-center gap-2 w-full text-left text-sm p-2 hover:bg-muted rounded transition-colors"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search results */}
                  {query.length >= minQueryLength && (
                    <div className="divide-y">
                      {results === undefined ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : displayResults.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          {emptyMessage}
                        </div>
                      ) : (
                        displayResults.map((result, index) => (
                          <motion.div
                            key={result._id || index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={handleResultClick}
                            className="cursor-pointer"
                          >
                            {renderResult(result, query)}
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Hint for minimum query length */}
                  {query.length > 0 && query.length < minQueryLength && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Type at least {minQueryLength} characters to search
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Export highlightText utility for use in custom renderResult functions
 */
export { highlightText };
