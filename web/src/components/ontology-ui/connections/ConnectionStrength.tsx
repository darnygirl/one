/**
 * ConnectionStrength - Visual indicator of connection strength
 *
 * Displays connection strength as a progress bar with color gradient
 * and optional labels (Weak, Medium, Strong).
 */

import type { Connection } from "../types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";

export interface ConnectionStrengthProps {
  connection: Connection;
  showLabel?: boolean;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ConnectionStrength({
  connection,
  showLabel = true,
  showPercentage = false,
  className,
  size = "md",
}: ConnectionStrengthProps) {
  const strength = connection.strength ?? 50; // Default to 50 if not set

  // Determine strength level
  const getStrengthLevel = (value: number): "weak" | "medium" | "strong" => {
    if (value < 33) return "weak";
    if (value < 67) return "medium";
    return "strong";
  };

  const level = getStrengthLevel(strength);

  // Color schemes for each strength level
  const colors = {
    weak: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-800 dark:text-red-100",
      progress: "bg-red-500",
      border: "border-red-500",
    },
    medium: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-800 dark:text-yellow-100",
      progress: "bg-yellow-500",
      border: "border-yellow-500",
    },
    strong: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-100",
      progress: "bg-green-500",
      border: "border-green-500",
    },
  };

  const labels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between gap-2">
          {showLabel && (
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                colors[level].bg,
                colors[level].text,
                colors[level].border
              )}
            >
              {labels[level]}
            </Badge>
          )}
          {showPercentage && (
            <span className={cn("text-sm font-medium", colors[level].text)}>
              {strength}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="relative">
        <Progress
          value={strength}
          className={cn(
            "w-full",
            sizeClasses[size],
            "transition-all duration-300"
          )}
          indicatorClassName={colors[level].progress}
        />
      </div>

      {/* Optional metadata display */}
      {connection.metadata?.strengthReason && (
        <p className="text-xs text-muted-foreground">
          {connection.metadata.strengthReason}
        </p>
      )}
    </div>
  );
}

/**
 * ConnectionStrengthBadge - Compact badge version
 *
 * Simplified version showing just the strength as a colored badge
 */
export interface ConnectionStrengthBadgeProps {
  strength: number;
  className?: string;
}

export function ConnectionStrengthBadge({
  strength,
  className,
}: ConnectionStrengthBadgeProps) {
  const getStrengthLevel = (value: number): "weak" | "medium" | "strong" => {
    if (value < 33) return "weak";
    if (value < 67) return "medium";
    return "strong";
  };

  const level = getStrengthLevel(strength);

  const colors = {
    weak: "bg-red-100 text-red-800 border-red-500 dark:bg-red-900 dark:text-red-100",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900 dark:text-yellow-100",
    strong: "bg-green-100 text-green-800 border-green-500 dark:bg-green-900 dark:text-green-100",
  };

  const labels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        colors[level],
        className
      )}
    >
      {labels[level]} ({strength}%)
    </Badge>
  );
}
