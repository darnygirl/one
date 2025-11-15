/**
 * GroupList Component
 *
 * Scrollable list of groups with filtering
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GroupCard } from "./GroupCard";
import type { Group, ListProps } from "../types";
import { useSearch, useSort, useFilter, usePagination } from "../hooks";
import { cn } from "../utils";

export interface GroupListProps extends ListProps {
  groups: Group[];
  onGroupClick?: (group: Group) => void;
  emptyMessage?: string;
}

export function GroupList({
  groups,
  onGroupClick,
  searchable = true,
  filterable = false,
  sortable = true,
  paginated = true,
  pageSize = 10,
  emptyMessage = "No groups found",
  className,
}: GroupListProps) {
  const { searchedData, query, setQuery } = useSearch(groups, ["name", "description"]);
  const { sortedData, sortConfig, setSort } = useSort(searchedData, {
    field: "createdAt",
    direction: "desc",
  });
  const { paginatedData, pagination, totalPages, nextPage, prevPage } = usePagination(
    sortedData,
    pageSize
  );

  const displayData = paginated ? paginatedData : sortedData;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
            <Input
              type="text"
              placeholder="Search groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {sortable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort("name")}
              className="whitespace-nowrap"
            >
              {sortConfig?.field === "name" ? (
                sortConfig.direction === "asc" ? "↑ Name" : "↓ Name"
              ) : (
                "Sort by Name"
              )}
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {displayData.length} of {groups.length} groups
      </div>

      {/* Group List */}
      {displayData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">🏢</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayData.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onClick={() => onGroupClick?.(group)}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
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
