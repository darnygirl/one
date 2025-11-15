/**
 * ThingList - List of things with filtering, search, sort, and pagination
 *
 * Provides a complete data table experience for things.
 */

import { useState, useMemo } from "react";
import type { Thing, ThingType, ListProps } from "../types";
import { ThingCard } from "./ThingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch, useSort, useFilter, usePagination } from "../hooks";
import { getThingTypeDisplay, cn } from "../utils";

interface ThingListProps extends ListProps {
  things: Thing[];
  onThingClick?: (thing: Thing) => void;
  typeFilter?: ThingType[];
}

export function ThingList({
  things,
  onThingClick,
  typeFilter,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 12,
  className,
}: ThingListProps) {
  const [selectedType, setSelectedType] = useState<ThingType | "all">("all");

  // Get unique types from things
  const availableTypes = useMemo(() => {
    const types = new Set(things.map((t) => t.type));
    return Array.from(types).sort();
  }, [things]);

  // Search
  const { searchedData, query, setQuery } = useSearch(things, ["name", "description"]);

  // Filter by type
  const typeFilteredData = useMemo(() => {
    if (selectedType === "all") return searchedData;
    return searchedData.filter((t) => t.type === selectedType);
  }, [searchedData, selectedType]);

  // Sort
  const { sortedData, sortConfig, setSort } = useSort(typeFilteredData, {
    field: "createdAt",
    direction: "desc",
  });

  // Paginate
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, pageSize);

  // Empty state
  if (things.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-lg text-muted-foreground">No things found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first thing to get started
        </p>
      </div>
    );
  }

  // No results after filtering
  const hasNoResults = paginatedData.length === 0 && (query || selectedType !== "all");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {searchable && (
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search things..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {filterable && (
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as ThingType | "all")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getThingTypeDisplay(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {sortable && (
          <Select
            value={`${sortConfig?.field}-${sortConfig?.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-");
              setSort(field, direction as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedData.length} of {sortedData.length} things
        </span>
        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear search
          </Button>
        )}
      </div>

      {/* Empty results */}
      {hasNoResults && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No things match your filters</p>
          <div className="flex gap-2 justify-center mt-4">
            {query && (
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            )}
            {selectedType !== "all" && (
              <Button variant="outline" size="sm" onClick={() => setSelectedType("all")}>
                Clear type filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Thing cards */}
      {!hasNoResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((thing) => (
            <ThingCard
              key={thing._id}
              thing={thing}
              interactive={!!onThingClick}
              onClick={() => onThingClick?.(thing)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-1">...</span>
                <Button
                  variant={pagination.page === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pagination.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
