/**
 * ThingFilter Component
 *
 * Advanced filtering interface for things
 * Part of THINGS dimension (ontology-ui)
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterConfig, ThingType } from "../types";
import { cn, getThingTypeIcon, getThingTypeDisplay } from "../utils";

export interface ThingFilterProps {
  onFilterChange?: (filters: FilterConfig[]) => void;
  activeFilters?: FilterConfig[];
  className?: string;
}

export function ThingFilter({
  onFilterChange,
  activeFilters = [],
  className,
}: ThingFilterProps) {
  const [filters, setFilters] = useState<FilterConfig[]>(activeFilters);
  const [showAddFilter, setShowAddFilter] = useState(false);

  // New filter state
  const [newFilterField, setNewFilterField] = useState<string>("type");
  const [newFilterValue, setNewFilterValue] = useState<string>("");

  const handleAddFilter = () => {
    if (!newFilterValue) return;

    const newFilter: FilterConfig = {
      field: newFilterField,
      operator: newFilterField === "tags" ? "contains" : "eq",
      value: newFilterValue,
    };

    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);

    // Reset
    setNewFilterValue("");
    setShowAddFilter(false);
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleClearAll = () => {
    setFilters([]);
    onFilterChange?.([]);
  };

  const getFilterLabel = (filter: FilterConfig): string => {
    const fieldLabels: Record<string, string> = {
      type: "Type",
      status: "Status",
      tags: "Tag",
      name: "Name",
    };

    const operatorLabels: Record<string, string> = {
      eq: "is",
      ne: "is not",
      contains: "contains",
      startsWith: "starts with",
      endsWith: "ends with",
    };

    return `${fieldLabels[filter.field] || filter.field} ${operatorLabels[filter.operator]} "${filter.value}"`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <span className="text-xs">{getFilterLabel(filter)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFilter(index)}
                  className="ml-1 hover:bg-muted rounded-sm p-0.5 transition-colors"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add Filter Button */}
        {!showAddFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddFilter(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        )}

        {/* Add Filter Form */}
        {showAddFilter && (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="filter-field">Field</Label>
              <select
                id="filter-field"
                value={newFilterField}
                onChange={(e) => setNewFilterField(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="type">Type</option>
                <option value="status">Status</option>
                <option value="tags">Tags</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-value">Value</Label>
              {newFilterField === "type" ? (
                <Select
                  value={newFilterValue}
                  onValueChange={setNewFilterValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type...">
                      {newFilterValue && (
                        <span className="flex items-center gap-2">
                          <span>{getThingTypeIcon(newFilterValue as ThingType)}</span>
                          <span>{getThingTypeDisplay(newFilterValue as ThingType)}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "creator", "user", "agent", "content", "course", "lesson",
                      "video", "quiz", "token", "nft", "product", "service",
                      "post", "comment", "file", "folder", "project", "task",
                      "note", "bookmark", "subscription", "payment", "invoice",
                      "transaction", "wallet", "organization", "team", "role",
                      "permission", "webhook", "integration", "api_key"
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <span>{getThingTypeIcon(type as ThingType)}</span>
                          <span>{getThingTypeDisplay(type as ThingType)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="filter-value"
                  type="text"
                  placeholder={`Enter ${newFilterField}...`}
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFilter();
                    }
                  }}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddFilter}
                disabled={!newFilterValue}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddFilter(false);
                  setNewFilterValue("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tips */}
        {filters.length === 0 && !showAddFilter && (
          <p className="text-xs text-muted-foreground text-center">
            Add filters to narrow down results
          </p>
        )}
      </CardContent>
    </Card>
  );
}
