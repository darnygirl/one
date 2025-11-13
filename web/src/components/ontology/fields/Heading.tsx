/**
 * Heading Component
 * Renders headings with configurable size and weight
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  truncate?: boolean;
  className?: string;
}

export function Heading({
  children,
  size = "lg",
  weight = "semibold",
  truncate = false,
  className,
}: HeadingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <h3
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        truncate && "truncate",
        className
      )}
    >
      {children}
    </h3>
  );
}
