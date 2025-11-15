/**
 * LabelCard Component
 *
 * Card for displaying labels with confidence scores
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Label, CardProps } from "../types";
import { cn, formatDate } from "../utils";

export interface LabelCardProps extends CardProps {
  label: Label;
  showThing?: boolean;
  showConfidence?: boolean;
}

export function LabelCard({
  label,
  showThing = false,
  showConfidence = true,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: LabelCardProps) {
  // Calculate confidence color
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return "text-muted-foreground";
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
    if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">🏷️</span>
            <h3 className="font-semibold truncate">{label.label}</h3>
          </div>

          {label.category && (
            <Badge variant="secondary" className="shrink-0">
              {label.category}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Confidence Score */}
        {showConfidence && label.confidence !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className={cn("font-medium", getConfidenceColor(label.confidence))}>
              {(label.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Thing Reference */}
        {showThing && (
          <div className="text-xs text-muted-foreground">
            Thing ID: {label.thingId}
          </div>
        )}

        {/* Metadata */}
        {label.metadata && Object.keys(label.metadata).length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(label.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate ml-2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground pt-1">
          Created {formatDate(label.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}
