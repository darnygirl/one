/**
 * OntologyTable - Universal data table with sorting and filtering
 *
 * Renders any ontology data in a sortable, filterable table format.
 * Includes pagination and column customization.
 */

import { useState } from "react";
import type { Dimension, SortConfig, FilterConfig } from "../types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSort, useFilter, usePagination } from "../hooks";
import { cn, formatDate, getDimensionIcon } from "../utils";

export interface OntologyTableProps {
  items: any[];
  dimension: Dimension;
  columns: string[];
  onRowClick?: (item: any) => void;
  className?: string;
  // Display options
  showPagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
  compact?: boolean;
}

/**
 * Universal table component with sorting, filtering, and pagination
 *
 * @example
 * ```tsx
 * // Table of products with custom columns
 * <OntologyTable
 *   items={products}
 *   dimension="things"
 *   columns={["name", "type", "status", "createdAt"]}
 *   onRowClick={(product) => console.log(product)}
 *   showPagination
 *   pageSize={20}
 * />
 *
 * // Compact table of events
 * <OntologyTable
 *   items={events}
 *   dimension="events"
 *   columns={["type", "timestamp", "actorId"]}
 *   compact
 * />
 * ```
 */
export function OntologyTable({
  items,
  dimension,
  columns,
  onRowClick,
  className,
  showPagination = true,
  pageSize = 10,
  showSearch = true,
  searchPlaceholder = "Search...",
  compact = false,
}: OntologyTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on search query
  const searchedItems = searchQuery
    ? items.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return columns.some((col) => {
          const value = item[col];
          return String(value).toLowerCase().includes(searchLower);
        });
      })
    : items;

  // Apply sorting
  const { sortedData, sortConfig, setSort } = useSort(searchedItems);

  // Apply pagination
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, pageSize);

  const displayItems = showPagination ? paginatedData : sortedData;

  // Format cell value based on column type
  const formatCellValue = (item: any, column: string) => {
    const value = item[column];

    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">—</span>;
    }

    // Special formatting for common column types
    if (column.includes("At") || column === "timestamp") {
      return <span className="text-sm">{formatDate(value)}</span>;
    }

    if (column === "type") {
      return <Badge variant="secondary">{String(value)}</Badge>;
    }

    if (column === "status") {
      return <Badge variant="outline">{String(value)}</Badge>;
    }

    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }

    if (typeof value === "object") {
      return <span className="text-xs font-mono">{JSON.stringify(value)}</span>;
    }

    return <span className="truncate max-w-xs">{String(value)}</span>;
  };

  // Format column header
  const formatColumnHeader = (column: string) => {
    return column
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search */}
      {showSearch && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getDimensionIcon(dimension)}</span>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            {displayItems.length} of {items.length} items
          </Badge>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 select-none",
                    compact && "py-2"
                  )}
                  onClick={() => setSort(column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{formatColumnHeader(column)}</span>
                    {sortConfig?.field === column && (
                      <span className="text-xs">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((item, index) => (
                <TableRow
                  key={item._id || index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    compact && "py-1"
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      className={cn(compact && "py-2")}
                    >
                      {formatCellValue(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
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
            <div className="flex items-center gap-1">
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
