/**
 * ConnectionList - List of connections with type filtering
 *
 * Displays connections with search, filter by type, sort, and pagination.
 * Part of CONNECTIONS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectionCard } from "./ConnectionCard";
import type { Connection, ConnectionType, ListProps } from "../types";
import { useSearch, useSort, useFilter, usePagination } from "../hooks";
import { cn, getConnectionTypeDisplay } from "../utils";

export interface ConnectionListProps extends ListProps {
  connections: Connection[];
  onConnectionClick?: (connection: Connection) => void;
  typeFilter?: ConnectionType;
}

export function ConnectionList({
  connections,
  onConnectionClick,
  typeFilter,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  className,
}: ConnectionListProps) {
  const [selectedType, setSelectedType] = useState<string>(typeFilter || "all");

  // Search functionality (search by connection type)
  const { searchedData, query, setQuery } = useSearch(connections, ["type"]);

  // Filter by connection type
  const { filteredData, addFilter, clearFilters } = useFilter(searchedData);

  // Apply type filter
  React.useEffect(() => {
    clearFilters();
    if (selectedType !== "all") {
      addFilter({
        field: "type",
        operator: "eq",
        value: selectedType,
      });
    }
  }, [selectedType, clearFilters, addFilter]);

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

  // Get unique connection types for filter
  const connectionTypes = Array.from(
    new Set(connections.map((c) => c.type))
  ).sort();

  // Handle connection click
  const handleConnectionClick = (connection: Connection) => {
    if (onConnectionClick) {
      onConnectionClick(connection);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search, Filter, and Sort Controls */}
      {(searchable || filterable || sortable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                type="search"
                placeholder="Search by connection type..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {/* Type Filter */}
            {filterable && (
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {connectionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getConnectionTypeDisplay(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort Buttons */}
            {sortable && (
              <>
                <Button
                  variant={
                    sortConfig?.field === "createdAt" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSort("createdAt")}
                >
                  Created{" "}
                  {sortConfig?.field === "createdAt" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant={
                    sortConfig?.field === "strength" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSort("strength")}
                >
                  Strength{" "}
                  {sortConfig?.field === "strength" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {sortedData.length === connections.length ? (
          <span>{sortedData.length} connections</span>
        ) : (
          <span>
            {sortedData.length} of {connections.length} connections
          </span>
        )}
      </div>

      {/* Connection List */}
      <div className="space-y-3">
        {displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No connections found</p>
            {(query || selectedType !== "all") && (
              <p className="text-sm mt-2">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        ) : (
          displayData.map((connection) => (
            <ConnectionCard
              key={connection._id}
              connection={connection}
              onClick={() => handleConnectionClick(connection)}
              interactive={!!onConnectionClick}
            />
          ))
        )}
      </div>

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
