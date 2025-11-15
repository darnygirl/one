/**
 * MultiSelect - Advanced multi-select with search
 *
 * Features:
 * - Checkbox groups
 * - Select all/none
 * - Tag display
 * - Keyboard navigation
 * - Search filtering
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, CheckSquare, Square } from "lucide-react";
import { cn } from "../utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showSelectAll?: boolean;
  showSelectedCount?: boolean;
  maxHeight?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  showSelectAll = true,
  showSelectedCount = true,
  maxHeight = "300px",
  className,
}: MultiSelectProps) {
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.description?.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  // Check if all filtered options are selected
  const allSelected = useMemo(() => {
    const selectableOptions = filteredOptions.filter((opt) => !opt.disabled);
    return (
      selectableOptions.length > 0 &&
      selectableOptions.every((opt) => value.includes(opt.value))
    );
  }, [filteredOptions, value]);

  // Handle select/deselect individual option
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered options
      const filteredValues = new Set(filteredOptions.map((opt) => opt.value));
      const newValue = value.filter((v) => !filteredValues.has(v));
      onChange?.(newValue);
    } else {
      // Select all filtered non-disabled options
      const selectableValues = filteredOptions
        .filter((opt) => !opt.disabled)
        .map((opt) => opt.value);
      const newValue = [...new Set([...value, ...selectableValues])];
      onChange?.(newValue);
    }
  };

  // Remove selected tag
  const removeTag = (optionValue: string) => {
    onChange?.(value.filter((v) => v !== optionValue));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredOptions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const option = filteredOptions[focusedIndex];
          if (!option.disabled) {
            toggleOption(option.value);
          }
        }
        break;
      case "Escape":
        setSearch("");
        setFocusedIndex(-1);
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  // Get label for value
  const getLabel = (val: string) => {
    return options.find((opt) => opt.value === val)?.label || val;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            {placeholder}
          </CardTitle>
          {showSelectedCount && value.length > 0 && (
            <Badge variant="secondary">{value.length} selected</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Selected tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md min-h-[40px]">
            {value.map((val) => (
              <Badge key={val} variant="secondary" className="gap-1">
                {getLabel(val)}
                <button
                  type="button"
                  onClick={() => removeTag(val)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  aria-label={`Remove ${getLabel(val)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>

        {/* Select all/none */}
        {showSelectAll && filteredOptions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="w-full"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        )}

        {/* Options list */}
        <ScrollArea style={{ maxHeight }} className="rounded-md border">
          <div
            ref={listRef}
            role="listbox"
            aria-multiselectable="true"
            className="p-2 space-y-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                const isFocused = index === focusedIndex;

                return (
                  <label
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors",
                      "hover:bg-muted",
                      isFocused && "bg-muted ring-2 ring-ring",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
                        if (!option.disabled) {
                          toggleOption(option.value);
                        }
                      }}
                      disabled={option.disabled}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
