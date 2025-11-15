/**
 * AuditLog Component
 *
 * Detailed audit log with search and export functionality
 */

import { useState, useMemo } from "react";
import type { Event, EventType } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch, useFilter, usePagination } from "../hooks";
import {
  formatDateTime,
  formatRelativeTime,
  getEventTypeDisplay,
  cn
} from "../utils";

interface AuditLogProps {
  events: Event[];
  searchable?: boolean;
  exportable?: boolean;
  className?: string;
}

export function AuditLog({
  events,
  searchable = true,
  exportable = true,
  className
}: AuditLogProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Search functionality
  const { searchedData, query, setQuery } = useSearch(
    events,
    ["type", "actorId", "targetId"] as (keyof Event)[]
  );

  // Pagination
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  } = usePagination(searchedData, 10);

  // Export to CSV
  const exportToCsv = () => {
    const headers = ["Timestamp", "Event Type", "Actor ID", "Target ID", "Details"];
    const rows = events.map(event => [
      new Date(event.timestamp).toISOString(),
      event.type,
      event.actorId,
      event.targetId || "",
      JSON.stringify(event.metadata || {})
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Audit Log
            <Badge variant="secondary" className="text-xs">
              {events.length} events
            </Badge>
          </CardTitle>

          {/* Export button */}
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
            >
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Search bar */}
        {searchable && (
          <div className="mb-4">
            <Input
              placeholder="Search events by type, actor, or target..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}

        {/* Events table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[150px]">Event</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {query ? "No events found matching your search" : "No events to display"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((event) => (
                  <TableRow
                    key={event._id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Timestamp */}
                    <TableCell className="font-mono text-xs">
                      <div>{formatDateTime(event.timestamp)}</div>
                      <div className="text-muted-foreground">
                        {formatRelativeTime(event.timestamp)}
                      </div>
                    </TableCell>

                    {/* Event type */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {event.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getEventTypeDisplay(event.type)}
                      </div>
                    </TableCell>

                    {/* Actor */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {event.actorId.slice(0, 12)}...
                    </TableCell>

                    {/* Target */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {event.targetId ? `${event.targetId.slice(0, 12)}...` : "—"}
                    </TableCell>

                    {/* Details */}
                    <TableCell className="text-right">
                      {event.metadata && Object.keys(event.metadata).length > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {Object.keys(event.metadata).length} fields
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
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

        {/* Selected event details */}
        {selectedEvent && (
          <div className="mt-4 p-4 border rounded-lg bg-accent/20">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">Event Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">ID:</div>
                <div className="font-mono text-xs">{selectedEvent._id}</div>

                <div className="font-medium">Type:</div>
                <div>{selectedEvent.type}</div>

                <div className="font-medium">Timestamp:</div>
                <div>{formatDateTime(selectedEvent.timestamp)}</div>

                <div className="font-medium">Actor:</div>
                <div className="font-mono text-xs">{selectedEvent.actorId}</div>

                <div className="font-medium">Target:</div>
                <div className="font-mono text-xs">{selectedEvent.targetId || "—"}</div>

                <div className="font-medium">Group:</div>
                <div className="font-mono text-xs">{selectedEvent.groupId}</div>
              </div>

              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <>
                  <div className="font-medium mt-3">Metadata:</div>
                  <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
