/**
 * EventFilter Component
 *
 * Advanced event filtering with multiple criteria
 */

import { useState } from "react";
import type { Event, EventType, FilterConfig } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EventTypeSelector } from "./EventTypeSelector";
import { cn } from "../utils";

interface EventFilterProps {
  onFilterChange?: (filters: FilterConfig[]) => void;
  activeFilters?: FilterConfig[];
  className?: string;
}

export function EventFilter({
  onFilterChange,
  activeFilters = [],
  className
}: EventFilterProps) {
  // Filter form state
  const [filterField, setFilterField] = useState<string>("type");
  const [filterOperator, setFilterOperator] = useState<FilterConfig["operator"]>("eq");
  const [filterValue, setFilterValue] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  });

  // Add a new filter
  const addFilter = () => {
    if (!filterValue && filterField !== "timestamp") return;

    let value: any = filterValue;

    // Handle date range for timestamp filters
    if (filterField === "timestamp" && dateRange.start) {
      value = new Date(dateRange.start).getTime();
    }

    const newFilter: FilterConfig = {
      field: filterField,
      operator: filterOperator,
      value
    };

    const updatedFilters = [...activeFilters, newFilter];
    onFilterChange?.(updatedFilters);

    // Reset form
    setFilterValue("");
    setDateRange({ start: "", end: "" });
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const updatedFilters = activeFilters.filter((_, i) => i !== index);
    onFilterChange?.(updatedFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange?.([]);
  };

  // Add date range filter
  const addDateRangeFilter = () => {
    if (!dateRange.start || !dateRange.end) return;

    const startTime = new Date(dateRange.start).getTime();
    const endTime = new Date(dateRange.end).getTime();

    const newFilters: FilterConfig[] = [
      { field: "timestamp", operator: "gte", value: startTime },
      { field: "timestamp", operator: "lte", value: endTime }
    ];

    const updatedFilters = [...activeFilters, ...newFilters];
    onFilterChange?.(updatedFilters);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Event Filters</span>
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Active Filters ({activeFilters.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pr-1 gap-1"
                >
                  <span className="font-mono text-xs">
                    {filter.field} {filter.operator} {String(filter.value)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(index)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter by field */}
        <div className="space-y-2">
          <Label htmlFor="filter-field">Filter by</Label>
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger id="filter-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type">Event Type</SelectItem>
              <SelectItem value="actorId">Actor ID</SelectItem>
              <SelectItem value="targetId">Target ID</SelectItem>
              <SelectItem value="groupId">Group ID</SelectItem>
              <SelectItem value="timestamp">Timestamp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional rendering based on field type */}
        {filterField === "type" ? (
          /* Event type selector */
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <EventTypeSelector
              value={filterValue as EventType}
              onValueChange={setFilterValue}
              placeholder="Select event type..."
            />
          </div>
        ) : filterField === "timestamp" ? (
          /* Date range picker */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-start">Start Date</Label>
              <Input
                id="date-start"
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-end">End Date</Label>
              <Input
                id="date-end"
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <Button
              onClick={addDateRangeFilter}
              disabled={!dateRange.start || !dateRange.end}
              className="w-full"
            >
              Add Date Range Filter
            </Button>
          </div>
        ) : (
          /* Text input for IDs */
          <>
            <div className="space-y-2">
              <Label htmlFor="filter-operator">Operator</Label>
              <Select
                value={filterOperator}
                onValueChange={(value) => setFilterOperator(value as FilterConfig["operator"])}
              >
                <SelectTrigger id="filter-operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eq">Equals</SelectItem>
                  <SelectItem value="ne">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-value">Value</Label>
              <Input
                id="filter-value"
                placeholder="Enter filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>

            <Button
              onClick={addFilter}
              disabled={!filterValue}
              className="w-full"
            >
              Add Filter
            </Button>
          </>
        )}

        {/* Quick filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFilterChange?.([
                  { field: "timestamp", operator: "gte", value: Date.now() - 86400000 }
                ]);
              }}
            >
              Last 24h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFilterChange?.([
                  { field: "timestamp", operator: "gte", value: Date.now() - 604800000 }
                ]);
              }}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFilterChange?.([
                  { field: "type", operator: "eq", value: "created" }
                ]);
              }}
            >
              Created only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFilterChange?.([
                  { field: "type", operator: "eq", value: "updated" }
                ]);
              }}
            >
              Updated only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
