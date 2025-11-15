/**
 * DynamicTable - Tables generated from data
 *
 * Features:
 * - Sorting, filtering, pagination
 * - Export to CSV
 * - Column customization
 * - Responsive design
 */

import { useState, useMemo } from "react";
import type { OntologyComponentProps, SortConfig } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSort, useFilter, usePagination, useSearch } from "../hooks";
import { cn } from "../utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Settings,
  Search,
  Filter,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DynamicTableProps extends OntologyComponentProps {
  title: string;
  description?: string;
  data: Record<string, any>[];
  columns: Column[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;
  onRowClick?: (row: any) => void;
}

export function DynamicTable({
  title,
  description,
  data,
  columns,
  searchable = true,
  sortable = true,
  filterable = true,
  paginated = true,
  pageSize = 10,
  exportable = true,
  onRowClick,
  className,
}: DynamicTableProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((c) => c.key)
  );
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  // Search
  const searchFields = columns.map((c) => c.key);
  const { searchedData, query, setQuery } = useSearch(data, searchFields);

  // Filtering
  const { filteredData, filters, addFilter, removeFilter, clearFilters } = useFilter(searchedData);

  // Sorting
  const { sortedData, sortConfig, setSort } = useSort(filteredData);

  // Pagination
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setPageSize: updatePageSize,
  } = usePagination(sortedData, pageSize);

  const displayData = paginated ? paginatedData : sortedData;

  const visibleColumns = useMemo(
    () => columns.filter((c) => selectedColumns.includes(c.key)),
    [columns, selectedColumns]
  );

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    setSort(columnKey);
  };

  const handleAddFilter = () => {
    if (filterColumn && filterValue) {
      addFilter({
        field: filterColumn,
        operator: "contains",
        value: filterValue,
      });
      setFilterValue("");
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = visibleColumns.map((c) => c.label).join(",");
    const csvRows = sortedData
      .map((row) =>
        visibleColumns.map((col) => {
          const value = row[col.key];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        }).join(",")
      )
      .join("\n");

    const csv = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((k) => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{sortedData.length} rows</Badge>
            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Search and filters */}
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {filterable && (
            <>
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  {columns
                    .filter((c) => c.filterable !== false)
                    .map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-[200px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFilter}
                disabled={!filterColumn || !filterValue}
              >
                <Filter className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </>
          )}

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Active filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeFilter(index)}
              >
                {filter.field}: {filter.value} ×
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Column selector */}
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <div key={col.key} className="flex items-center gap-2">
              <Checkbox
                id={`col-${col.key}`}
                checked={selectedColumns.includes(col.key)}
                onCheckedChange={() => toggleColumn(col.key)}
              />
              <label htmlFor={`col-${col.key}`} className="text-sm cursor-pointer">
                {col.label}
              </label>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable !== false && sortable && "cursor-pointer hover:bg-muted/50",
                      col.width && `w-${col.width}`
                    )}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {sortable && col.sortable !== false && (
                        <div className="text-muted-foreground">
                          {sortConfig?.field === col.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-30" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <p className="text-muted-foreground">No data to display</p>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {paginated && totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Rows per page:</p>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => updatePageSize(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {totalPages}
              </p>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
