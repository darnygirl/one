import React from "react";
import { Button } from "@/components/ui/button";

export interface SuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function Suggestions({ suggestions, onSuggestionClick }: SuggestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Suggested prompts:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-left"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
