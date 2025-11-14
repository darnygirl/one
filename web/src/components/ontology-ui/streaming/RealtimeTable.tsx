/**
 * RealtimeTable - Streaming Component (Cycle 21)
 *
 * Data table with live updates, sorting, filtering, and CSV export
 */

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface RealtimeTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  highlightChanges?: boolean;
  onExportCSV?: () => void;
  className?: string;
}

export function RealtimeTable<TData>({
  data,
  columns,
  searchable = true,
  sortable = true,
  filterable = true,
  paginated = true,
  pageSize = 10,
  highlightChanges = true,
  onExportCSV,
  className,
}: RealtimeTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  // Track changes to highlight cells
  useEffect(() => {
    if (!highlightChanges) return;

    const newChanges = new Set<string>();

    // Mark all cells as changed (in real implementation, you'd track specific changes)
    data.forEach((row: any, rowIndex) => {
      Object.keys(row).forEach((key) => {
        newChanges.add(`${rowIndex}-${key}`);
      });
    });

    setChangedCells(newChanges);

    // Clear highlights after 2 seconds
    const timeout = setTimeout(() => {
      setChangedCells(new Set());
    }, 2000);

    return () => clearTimeout(timeout);
  }, [data, highlightChanges]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: filterable ? getFilteredRowModel() : undefined,
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }

    // Default CSV export implementation
    const headers = table.getAllColumns().map((col) => col.id);
    const rows = table.getRowModel().rows.map((row) =>
      headers.map((header) => {
        const value = row.getValue(header);
        return typeof value === "string" ? `"${value}"` : value;
      })
    );

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          sortable && header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && header.column.getCanSort() && (
                          <SortIcon sorted={header.column.getIsSorted()} />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="border-b"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellKey = `${rowIndex}-${cell.column.id}`;
                      const isChanged = changedCells.has(cellKey);

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "transition-colors duration-500",
                            isChanged && "bg-yellow-100 dark:bg-yellow-900/20"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)} of{" "}
            {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") {
    return <ArrowUp className="h-4 w-4" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="h-4 w-4" />;
  }
  return <ArrowUpDown className="h-4 w-4 opacity-50" />;
}
