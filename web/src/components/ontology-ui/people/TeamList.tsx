/**
 * TeamList Component
 *
 * List of teams with search and pagination
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Group, Person, ListProps } from "../types";
import { useSearch, usePagination } from "../hooks";
import { TeamCard } from "./TeamCard";
import { cn } from "../utils";

export interface TeamListProps extends ListProps {
  teams: Group[];
  teamMembers?: Record<string, Person[]>;
  onTeamClick?: (teamId: string) => void;
}

export function TeamList({
  teams,
  teamMembers = {},
  onTeamClick,
  searchable = true,
  paginated = true,
  pageSize = 12,
  className,
}: TeamListProps) {
  const { searchedData, query, setQuery } = useSearch(teams, ["name", "description"]);

  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(searchedData, pageSize);

  const displayTeams = paginated ? paginatedData : searchedData;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          {query && (
            <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Team Grid */}
      {displayTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTeams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              members={teamMembers[team._id] || []}
              showMemberCount
              onClick={() => onTeamClick?.(team._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {query ? `No teams found matching "${query}"` : "No teams yet"}
        </div>
      )}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages} ({pagination.total} teams)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
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
