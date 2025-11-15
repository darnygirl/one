/**
 * SearchBar Component - Universal search bar for KNOWLEDGE dimension
 *
 * Features:
 * - Real-time search with autocomplete
 * - Keyboard shortcuts (⌘K to focus)
 * - Recent searches tracking
 * - Suggestions dropdown
 */

import { useEffect, useState, useCallback } from "react";
import type { SearchResult } from "../types";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn, getThingTypeIcon } from "../utils";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchResult[];
  className?: string;
  variant?: "simple" | "command";
}

export function SearchBar({
  onSearch,
  placeholder = "Search...",
  suggestions = [],
  className,
  variant = "simple",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
  }, []);

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        // Focus input after state update
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
      const updated = [searchQuery, ...prev.filter((q) => q !== searchQuery)].slice(0, 5);
      localStorage.setItem("recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle search submission
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim()) {
        saveToRecent(value);
        onSearch?.(value);
      }
    },
    [onSearch, saveToRecent]
  );

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(
    (result: SearchResult) => {
      setQuery(result.name);
      saveToRecent(result.name);
      onSearch?.(result.name);
      setIsOpen(false);
    },
    [onSearch, saveToRecent]
  );

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
          className="w-full"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    );
  }

  // Command variant (with autocomplete and suggestions)
  return (
    <div className={cn("relative", className)}>
      <Command
        className="rounded-lg border shadow-md"
        shouldFilter={false}
      >
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
            // Delay to allow clicking on suggestions
            setTimeout(() => setIsOpen(false), 200);
          }}
        />

        {isOpen && (
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Recent Searches */}
            {recentSearches.length > 0 && query === "" && (
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
              </CommandGroup>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && query !== "" && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion._id}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                  >
                    <span className="mr-2">{getThingTypeIcon(suggestion.type as any)}</span>
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
          </CommandList>
        )}
      </Command>

      <kbd className="absolute right-3 top-3 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
