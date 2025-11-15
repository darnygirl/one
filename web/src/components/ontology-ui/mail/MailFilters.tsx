/**
 * MailFilters Component (Cycle 88)
 *
 * Advanced email filtering UI
 *
 * Features:
 * - Advanced filtering UI
 * - Filter by sender, subject, has attachment, date range
 * - Save filters as views
 * - Smart folders (auto-categorize)
 */

"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Filter,
  X,
  Plus,
  Save,
  Trash2,
  Star,
  Paperclip,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "before"
  | "after"
  | "between";

export interface FilterRule {
  id: string;
  field: "from" | "to" | "subject" | "body" | "date" | "has_attachment" | "is_read" | "is_starred" | "label";
  operator: FilterOperator;
  value: string | boolean | Date | [Date, Date];
}

export interface SavedFilter {
  id: string;
  name: string;
  rules: FilterRule[];
  matchAll: boolean; // AND vs OR
}

interface MailFiltersProps {
  /** Current filter rules */
  rules?: FilterRule[];
  /** Callback when rules change */
  onRulesChange?: (rules: FilterRule[]) => void;
  /** Match all rules (AND) or any rule (OR) */
  matchAll?: boolean;
  /** Callback when match mode changes */
  onMatchModeChange?: (matchAll: boolean) => void;
  /** Saved filters/views */
  savedFilters?: SavedFilter[];
  /** Callback when filter is saved */
  onFilterSave?: (filter: SavedFilter) => void;
  /** Callback when filter is deleted */
  onFilterDelete?: (id: string) => void;
  /** Callback when filter is loaded */
  onFilterLoad?: (filter: SavedFilter) => void;
  /** Available labels for filtering */
  labels?: Array<{ id: string; name: string; color?: string }>;
  /** Show as popover */
  asPopover?: boolean;
  /** Popover trigger button */
  triggerButton?: React.ReactNode;
}

export function MailFilters({
  rules = [],
  onRulesChange,
  matchAll = true,
  onMatchModeChange,
  savedFilters = [],
  onFilterSave,
  onFilterDelete,
  onFilterLoad,
  labels = [],
  asPopover = false,
  triggerButton,
}: MailFiltersProps) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [filterName, setFilterName] = React.useState("");

  // Add new rule
  const addRule = () => {
    const newRule: FilterRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: "from",
      operator: "contains",
      value: "",
    };
    onRulesChange?.([...rules, newRule]);
  };

  // Remove rule
  const removeRule = (id: string) => {
    onRulesChange?.(rules.filter((r) => r.id !== id));
  };

  // Update rule
  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    onRulesChange?.(
      rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // Clear all rules
  const clearRules = () => {
    onRulesChange?.([]);
  };

  // Save current filter
  const saveFilter = () => {
    if (!filterName.trim()) return;

    const filter: SavedFilter = {
      id: Math.random().toString(36).substr(2, 9),
      name: filterName,
      rules,
      matchAll,
    };

    onFilterSave?.(filter);
    setFilterName("");
    setShowSaveDialog(false);
  };

  // Get operators for field type
  const getOperatorsForField = (field: FilterRule["field"]): FilterOperator[] => {
    switch (field) {
      case "date":
        return ["before", "after", "between"];
      case "has_attachment":
      case "is_read":
      case "is_starred":
        return ["is"];
      default:
        return ["is", "is_not", "contains", "not_contains", "starts_with", "ends_with"];
    }
  };

  // Render rule value input
  const renderValueInput = (rule: FilterRule) => {
    switch (rule.field) {
      case "has_attachment":
      case "is_read":
      case "is_starred":
        return (
          <Select
            value={rule.value === true ? "true" : "false"}
            onValueChange={(value) =>
              updateRule(rule.id, { value: value === "true" })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      case "date":
        if (rule.operator === "between") {
          const dateRange = Array.isArray(rule.value) ? rule.value : [new Date(), new Date()];
          return (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 size-4" />
                    {format(dateRange[0], "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange[0]}
                    onSelect={(date) =>
                      date && updateRule(rule.id, { value: [date, dateRange[1]] })
                    }
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 size-4" />
                    {format(dateRange[1], "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange[1]}
                    onSelect={(date) =>
                      date && updateRule(rule.id, { value: [dateRange[0], date] })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          );
        } else {
          const date = rule.value instanceof Date ? rule.value : new Date();
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 size-4" />
                  {format(date, "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && updateRule(rule.id, { value: date })}
                />
              </PopoverContent>
            </Popover>
          );
        }

      case "label":
        return (
          <Select
            value={typeof rule.value === "string" ? rule.value : ""}
            onValueChange={(value) => updateRule(rule.id, { value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select label..." />
            </SelectTrigger>
            <SelectContent>
              {labels.map((label) => (
                <SelectItem key={label.id} value={label.id}>
                  {label.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            placeholder="Enter value..."
            value={typeof rule.value === "string" ? rule.value : ""}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
            className="w-64"
          />
        );
    }
  };

  const filterContent = (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4" />
          <h3 className="font-semibold">Filter Emails</h3>
        </div>
        {rules.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearRules}>
            Clear all
          </Button>
        )}
      </div>

      {/* Saved filters */}
      {savedFilters.length > 0 && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Saved Filters</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => onFilterLoad?.(filter)}
                >
                  {filter.name}
                  <button
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterDelete?.(filter.id);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Match mode */}
      {rules.length > 1 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Match:</Label>
          <Select
            value={matchAll ? "all" : "any"}
            onValueChange={(value) => onMatchModeChange?.(value === "all")}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules (AND)</SelectItem>
              <SelectItem value="any">Any rule (OR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filter rules */}
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              {/* Field selector */}
              <Select
                value={rule.field}
                onValueChange={(value) =>
                  updateRule(rule.id, {
                    field: value as FilterRule["field"],
                    operator: getOperatorsForField(value as FilterRule["field"])[0],
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="from">From</SelectItem>
                  <SelectItem value="to">To</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="body">Body</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="has_attachment">Has attachment</SelectItem>
                  <SelectItem value="is_read">Is read</SelectItem>
                  <SelectItem value="is_starred">Is starred</SelectItem>
                  <SelectItem value="label">Label</SelectItem>
                </SelectContent>
              </Select>

              {/* Operator selector */}
              <Select
                value={rule.operator}
                onValueChange={(value) =>
                  updateRule(rule.id, { operator: value as FilterOperator })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorsForField(rule.field).map((op) => (
                    <SelectItem key={op} value={op}>
                      {op.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value input */}
              {renderValueInput(rule)}

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(rule.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add rule button */}
      <Button variant="outline" size="sm" onClick={addRule} className="w-full">
        <Plus className="mr-2 size-4" />
        Add filter rule
      </Button>

      {/* Save filter button */}
      {rules.length > 0 && onFilterSave && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="w-full"
        >
          <Save className="mr-2 size-4" />
          Save as filter
        </Button>
      )}

      {/* Save filter dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter name</Label>
              <Input
                id="filter-name"
                placeholder="My custom filter"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This filter will be saved and can be reused later.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveFilter} disabled={!filterName.trim()}>
              Save filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (asPopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {triggerButton || (
            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" />
              Filter
              {rules.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {rules.length}
                </Badge>
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          {filterContent}
        </PopoverContent>
      </Popover>
    );
  }

  return filterContent;
}

/**
 * Usage Example:
 *
 * ```tsx
 * import { MailFilters } from '@/components/ontology-ui/mail/MailFilters';
 *
 * export function EmailFilters() {
 *   const [rules, setRules] = useState<FilterRule[]>([]);
 *   const [matchAll, setMatchAll] = useState(true);
 *
 *   return (
 *     <MailFilters
 *       asPopover
 *       rules={rules}
 *       onRulesChange={setRules}
 *       matchAll={matchAll}
 *       onMatchModeChange={setMatchAll}
 *       onFilterSave={(filter) => console.log('Save:', filter)}
 *       labels={[
 *         { id: '1', name: 'Work' },
 *         { id: '2', name: 'Personal' },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */
