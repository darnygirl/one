/**
 * Text Component
 * Renders text with optional icon, line clamping, and expandable content
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useState } from "react";

interface TextProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  color?: "default" | "muted" | "primary" | "destructive";
  lines?: number; // Clamp to N lines
  icon?: string;
  italic?: boolean;
  weight?: "normal" | "medium" | "semibold";
  expandable?: boolean;
  className?: string;
}

export function Text({
  children,
  size = "sm",
  color = "default",
  lines,
  icon,
  italic = false,
  weight = "normal",
  expandable = false,
  className,
}: TextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const colorClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
    destructive: "text-destructive",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
  };

  const shouldClamp = lines && !isExpanded;

  return (
    <div className="space-y-1">
      <p
        className={cn(
          sizeClasses[size],
          colorClasses[color],
          weightClasses[weight],
          italic && "italic",
          shouldClamp && `line-clamp-${lines}`,
          className
        )}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </p>
      {expandable && lines && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:underline"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
