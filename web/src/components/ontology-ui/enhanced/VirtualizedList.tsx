/**
 * VirtualizedList - Virtualized list for large datasets
 *
 * Features:
 * - react-window integration for efficient rendering
 * - Dynamic row heights
 * - Smooth scrolling
 * - Search within list
 * - Handles thousands of items efficiently
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { FixedSizeList, VariableSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "../utils";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  itemHeight?: number | ((index: number) => number);
  height?: number;
  width?: string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  title?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  getItemKey,
  itemHeight = 80,
  height = 600,
  width = "100%",
  searchable = true,
  searchPlaceholder = "Search...",
  searchFilter,
  emptyMessage = "No items found",
  loading = false,
  className,
  title,
}: VirtualizedListProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef<any>(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery || !searchFilter) return items;
    return items.filter((item) => searchFilter(item, searchQuery));
  }, [items, searchQuery, searchFilter]);

  // Reset scroll position when search changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [searchQuery]);

  // Determine if we should use fixed or variable size list
  const isFixedSize = typeof itemHeight === "number";

  // Row renderer for react-window
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = filteredItems[index];
    return renderItem(item, index, style);
  };

  // Default key extractor
  const defaultGetItemKey = (index: number) => {
    const item = filteredItems[index];
    if (getItemKey) return getItemKey(item, index);
    if (item && typeof item === "object") {
      const obj = item as any;
      return obj._id || obj.id || index;
    }
    return index;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </span>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {/* Search bar */}
        {searchable && searchFilter && (
          <div className="mb-4">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Virtualized list */}
        {filteredItems.length > 0 ? (
          <>
            {isFixedSize ? (
              <FixedSizeList
                ref={listRef}
                height={height}
                itemCount={filteredItems.length}
                itemSize={itemHeight as number}
                width={width}
                itemKey={defaultGetItemKey}
                className="border rounded-lg"
              >
                {Row}
              </FixedSizeList>
            ) : (
              <VariableSizeList
                ref={listRef}
                height={height}
                itemCount={filteredItems.length}
                itemSize={itemHeight as (index: number) => number}
                width={width}
                itemKey={defaultGetItemKey}
                className="border rounded-lg"
              >
                {Row}
              </VariableSizeList>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <p>No items match your search</p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Performance stats */}
        {filteredItems.length > 100 && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            ⚡ Rendering {filteredItems.length} items efficiently with virtualization
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to create a default search filter
 */
export function createSearchFilter<T>(searchableFields: (keyof T)[]) {
  return (item: T, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return searchableFields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (typeof value === "number") {
        return value.toString().includes(lowerQuery);
      }
      return false;
    });
  };
}
