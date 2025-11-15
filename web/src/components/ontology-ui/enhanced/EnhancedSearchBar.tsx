/**
 * EnhancedSearchBar - Advanced search with AI suggestions and voice input
 *
 * Features:
 * - AI-powered search suggestions
 * - Recent searches persistence (localStorage)
 * - Search analytics tracking
 * - Voice search support
 * - Advanced filters
 */

import { useEffect, useState, useCallback, useRef } from "react";
import type { SearchResult, FilterConfig } from "../types";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getThingTypeIcon } from "../utils";

interface EnhancedSearchBarProps {
  onSearch?: (query: string, filters?: FilterConfig[]) => void;
  placeholder?: string;
  suggestions?: SearchResult[];
  aiSuggestions?: string[];
  enableVoice?: boolean;
  enableAnalytics?: boolean;
  enableFilters?: boolean;
  className?: string;
  variant?: "simple" | "command" | "advanced";
}

export function EnhancedSearchBar({
  onSearch,
  placeholder = "Search...",
  suggestions = [],
  aiSuggestions = [],
  enableVoice = true,
  enableAnalytics = true,
  enableFilters = true,
  className,
  variant = "advanced",
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Load search analytics
    if (enableAnalytics) {
      const count = localStorage.getItem("search-count");
      if (count) {
        setSearchCount(parseInt(count, 10));
      }
    }
  }, [enableAnalytics]);

  // Initialize voice recognition
  useEffect(() => {
    if (!enableVoice) return;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enableVoice]);

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => {
          const input = document.querySelector(
            '[data-search-input="true"]'
          ) as HTMLInputElement;
          input?.focus();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save to recent searches
  const saveToRecent = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setRecentSearches((prev) => {
      const updated = [searchQuery, ...prev.filter((q) => q !== searchQuery)].slice(0, 10);
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track search analytics
  const trackSearch = useCallback(() => {
    if (!enableAnalytics) return;

    setSearchCount((prev) => {
      const newCount = prev + 1;
      localStorage.setItem("search-count", newCount.toString());
      return newCount;
    });
  }, [enableAnalytics]);

  // Handle search submission
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim()) {
        saveToRecent(value);
        trackSearch();
        onSearch?.(value, filters);
      }
    },
    [onSearch, saveToRecent, trackSearch, filters]
  );

  // Handle voice search
  const handleVoiceSearch = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent-searches");
  };

  // Simple variant (just an input field)
  if (variant === "simple") {
    return (
      <div className={cn("relative", className)}>
        <Input
          data-search-input="true"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query);
            }
          }}
          className="w-full pr-20"
        />
        {enableVoice && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-12 top-1/2 -translate-y-1/2"
            onClick={handleVoiceSearch}
          >
            {isListening ? "🎤" : "🎙️"}
          </Button>
        )}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    );
  }

  // Advanced variant (with all features)
  return (
    <div className={cn("relative", className)}>
      <Command
        className="rounded-lg border shadow-md"
        shouldFilter={false}
      >
        <div className="flex items-center gap-2 px-3">
          <CommandInput
            data-search-input="true"
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(query);
                setIsOpen(false);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 200);
            }}
            className="flex-1"
          />
          {enableVoice && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className={cn(isListening && "text-red-500 animate-pulse")}
            >
              {isListening ? "🎤" : "🎙️"}
            </Button>
          )}
          {enableFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  🔍 Filters
                  {filters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Search Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced filtering coming soon
                  </p>
                  {filters.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters([])}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {isOpen && (
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && query !== "" && (
              <>
                <CommandGroup heading="🤖 AI Suggestions">
                  {aiSuggestions.map((suggestion, idx) => (
                    <CommandItem
                      key={idx}
                      onSelect={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                    >
                      <span className="mr-2">✨</span>
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query === "" && (
              <>
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search, idx) => (
                    <CommandItem
                      key={idx}
                      onSelect={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <span className="mr-2">🕐</span>
                      {search}
                    </CommandItem>
                  ))}
                  <CommandItem onSelect={clearRecentSearches}>
                    <span className="mr-2">🗑️</span>
                    Clear History
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && query !== "" && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion._id}
                    onSelect={() => {
                      handleSearch(suggestion.name);
                    }}
                  >
                    <span className="mr-2">
                      {getThingTypeIcon(suggestion.type as any)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.description && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Search Analytics */}
            {enableAnalytics && searchCount > 0 && query === "" && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Analytics">
                  <CommandItem disabled>
                    <span className="text-xs text-muted-foreground">
                      Total searches: {searchCount}
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        )}
      </Command>

      <kbd className="absolute right-3 top-3 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
