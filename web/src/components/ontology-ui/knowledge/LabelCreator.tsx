/**
 * LabelCreator Component
 *
 * Form for creating labels with category and confidence
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormProps } from "../types";
import { cn } from "../utils";

export interface LabelCreatorProps extends FormProps {
  thingId: string;
  onSubmit?: (data: {
    label: string;
    category: string;
    confidence: number;
  }) => void;
  onCancel?: () => void;
  categorySuggestions?: string[];
}

// Default category suggestions
const DEFAULT_CATEGORIES = [
  "Classification",
  "Topic",
  "Tag",
  "Keyword",
  "Category",
  "Type",
  "Status",
  "Priority",
  "Sentiment",
  "Entity",
];

export function LabelCreator({
  thingId,
  onSubmit,
  onCancel,
  categorySuggestions = DEFAULT_CATEGORIES,
  className,
}: LabelCreatorProps) {
  const [labelText, setLabelText] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [confidence, setConfidence] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    if (!labelText.trim()) {
      setError("Label text is required");
      return false;
    }

    const finalCategory = useCustomCategory ? customCategory : category;
    if (!finalCategory.trim()) {
      setError("Category is required");
      return false;
    }

    if (confidence < 0 || confidence > 1) {
      setError("Confidence must be between 0 and 1");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const finalCategory = useCustomCategory ? customCategory.trim() : category;

    onSubmit?.({
      label: labelText.trim(),
      category: finalCategory,
      confidence,
    });

    // Reset form
    setLabelText("");
    setCategory("");
    setCustomCategory("");
    setConfidence(1.0);
    setUseCustomCategory(false);
    setError(null);
  };

  const handleCancel = () => {
    setLabelText("");
    setCategory("");
    setCustomCategory("");
    setConfidence(1.0);
    setUseCustomCategory(false);
    setError(null);
    onCancel?.();
  };

  // Calculate confidence color for preview
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return "bg-green-500";
    if (conf >= 0.6) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Create Label</CardTitle>
        <CardDescription>
          Add a new label to classify or categorize this item
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thing ID Reference */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>For Thing:</span>
          <Badge variant="outline">{thingId}</Badge>
        </div>

        {/* Label Text Input */}
        <div className="space-y-2">
          <Label htmlFor="label-text">Label Text *</Label>
          <Input
            id="label-text"
            type="text"
            placeholder="Enter label text"
            value={labelText}
            onChange={(e) => {
              setLabelText(e.target.value);
              setError(null);
            }}
            className="w-full"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>

          {!useCustomCategory ? (
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categorySuggestions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setUseCustomCategory(true)}
              >
                + Add custom category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                id="custom-category"
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setError(null);
                }}
              />

              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setUseCustomCategory(false);
                  setCustomCategory("");
                }}
              >
                ← Back to suggestions
              </Button>
            </div>
          )}
        </div>

        {/* Confidence Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="confidence">Confidence</Label>
            <span className="text-sm font-medium">{(confidence * 100).toFixed(0)}%</span>
          </div>

          <div className="space-y-2">
            <input
              id="confidence"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${getConfidenceColor(confidence)} 0%, ${getConfidenceColor(confidence)} ${confidence * 100}%, #e5e7eb ${confidence * 100}%, #e5e7eb 100%)`,
              }}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0%)</span>
              <span>High (100%)</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {labelText && (
          <div className="pt-4 border-t">
            <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <span className="text-lg">🏷️</span>
              <span className="font-medium">{labelText}</span>
              {(useCustomCategory ? customCategory : category) && (
                <Badge variant="secondary">
                  {useCustomCategory ? customCategory : category}
                </Badge>
              )}
              <span className="ml-auto text-sm text-muted-foreground">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground">
          * Required fields. The label will be associated with the specified thing.
        </p>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!labelText.trim() || (!category && !customCategory.trim())}
          type="button"
        >
          Create Label
        </Button>
      </CardFooter>
    </Card>
  );
}
