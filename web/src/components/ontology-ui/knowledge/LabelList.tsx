/**
 * LabelList Component
 *
 * List of labels with search, sort, pagination, and category grouping
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabelCard } from "./LabelCard";
import type { Label, ListProps } from "../types";
import { useSearch, useSort, usePagination } from "../hooks";
import { cn, groupBy } from "../utils";

export interface LabelListProps extends ListProps {
  labels: Label[];
  onLabelClick?: (label: Label) => void;
  showCounts?: boolean;
  groupByCategory?: boolean;
}

export function LabelList({
  labels,
  onLabelClick,
  showCounts = true,
  groupByCategory = false,
  searchable = true,
  sortable = true,
  paginated = true,
  pageSize = 12,
  className,
}: LabelListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search functionality
  const { searchedData, query, setQuery } = useSearch(labels, ["label", "category"]);

  // Filter by category if selected
  const filteredData = useMemo(() => {
    if (!selectedCategory) return searchedData;
    return searchedData.filter(label => label.category === selectedCategory);
  }, [searchedData, selectedCategory]);

  // Sort functionality
  const { sortedData, sortConfig, setSort } = useSort(filteredData, {
    field: "createdAt",
    direction: "desc",
  });

  // Pagination functionality
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, pageSize);

  // Determine which data to display
  const displayData = paginated ? paginatedData : sortedData;

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryCounts = labels.reduce((acc, label) => {
      const cat = label.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }, [labels]);

  // Group data by category if needed
  const groupedData = useMemo(() => {
    if (!groupByCategory) return null;
    return groupBy(displayData, "category" as keyof Label);
  }, [displayData, groupByCategory]);

  // Handle label click
  const handleLabelClick = (label: Label) => {
    if (onLabelClick) {
      onLabelClick(label);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Sort Controls */}
      {(searchable || sortable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                type="search"
                placeholder="Search labels..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Sort Buttons */}
          {sortable && (
            <div className="flex gap-2">
              <Button
                variant={
                  sortConfig?.field === "label" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSort("label")}
              >
                Label{" "}
                {sortConfig?.field === "label" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={
                  sortConfig?.field === "category" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSort("category")}
              >
                Category{" "}
                {sortConfig?.field === "category" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={
                  sortConfig?.field === "confidence" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSort("confidence")}
              >
                Confidence{" "}
                {sortConfig?.field === "confidence" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Labels {showCounts && `(${labels.length})`}
          </Button>
          {categories.map(({ category, count }) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category} {showCounts && `(${count})`}
            </Button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {sortedData.length === labels.length ? (
          <span>{sortedData.length} labels</span>
        ) : (
          <span>
            {sortedData.length} of {labels.length} labels
          </span>
        )}
      </div>

      {/* Labels Display */}
      {groupByCategory && groupedData ? (
        // Grouped by Category
        <div className="space-y-6">
          {Object.entries(groupedData).map(([category, categoryLabels]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{category || "Uncategorized"}</h3>
                <Badge variant="secondary">{categoryLabels.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryLabels.map((label) => (
                  <LabelCard
                    key={label._id}
                    label={label}
                    onClick={() => handleLabelClick(label)}
                    interactive={!!onLabelClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Standard Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayData.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-lg">No labels found</p>
              {query && (
                <p className="text-sm mt-2">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            displayData.map((label) => (
              <LabelCard
                key={label._id}
                label={label}
                onClick={() => handleLabelClick(label)}
                interactive={!!onLabelClick}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
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

            {/* Page Numbers */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;

                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={
                      pagination.page === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

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
