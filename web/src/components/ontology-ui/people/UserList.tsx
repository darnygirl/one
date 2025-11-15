/**
 * UserList Component
 *
 * Scrollable list of users with filtering, search, sort, and pagination
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCard } from "./UserCard";
import type { Person, ListProps } from "../types";
import { useSearch, useSort, usePagination } from "../hooks";
import { cn } from "../utils";

export interface UserListProps extends ListProps {
  users: Person[];
  onUserClick?: (user: Person) => void;
}

export function UserList({
  users,
  onUserClick,
  searchable = true,
  filterable = false,
  sortable = true,
  paginated = true,
  pageSize = 10,
  className,
}: UserListProps) {
  // Search functionality
  const { searchedData, query, setQuery } = useSearch(users, ["name", "email"]);

  // Sort functionality
  const { sortedData, sortConfig, setSort } = useSort(searchedData, {
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

  // Handle user click
  const handleUserClick = (user: Person) => {
    if (onUserClick) {
      onUserClick(user);
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
                placeholder="Search by name or email..."
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
                  sortConfig?.field === "name" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSort("name")}
              >
                Name{" "}
                {sortConfig?.field === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Button>
              <Button
                variant={
                  sortConfig?.field === "createdAt" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSort("createdAt")}
              >
                Joined{" "}
                {sortConfig?.field === "createdAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {sortedData.length === users.length ? (
          <span>{sortedData.length} users</span>
        ) : (
          <span>
            {sortedData.length} of {users.length} users
          </span>
        )}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No users found</p>
            {query && (
              <p className="text-sm mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          displayData.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onClick={() => handleUserClick(user)}
              interactive={!!onUserClick}
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
