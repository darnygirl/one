/**
 * ThingTags Component
 *
 * Tag manager for things with add/remove functionality
 * Part of THINGS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import type { Thing } from "../types";
import { cn } from "../utils";

export interface ThingTagsProps {
  thing: Thing;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  editable?: boolean;
  suggestions?: string[];
  className?: string;
}

export function ThingTags({
  thing,
  onAddTag,
  onRemoveTag,
  editable = false,
  suggestions = [],
  className,
}: ThingTagsProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tags = thing.tags || [];

  const handleAddTag = () => {
    if (inputValue.trim() && onAddTag) {
      onAddTag(inputValue.trim());
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tag Display */}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && !editable && (
          <span className="text-sm text-muted-foreground">No tags</span>
        )}

        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn(
              "gap-1",
              editable && "pr-1"
            )}
          >
            <span>{tag}</span>
            {editable && onRemoveTag && (
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-1 hover:bg-muted rounded-sm p-0.5 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Tag Input (if editable) */}
      {editable && onAddTag && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add tag..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddTag}
              disabled={!inputValue.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    onAddTag(suggestion);
                    setInputValue("");
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
