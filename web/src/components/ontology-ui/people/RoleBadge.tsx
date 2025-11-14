/**
 * RoleBadge Component
 *
 * Badge showing user role with color coding
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "../types";
import { cn, getRoleDisplay, getRoleColor } from "../utils";

export interface RoleBadgeProps {
  role: UserRole;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RoleBadge({
  role,
  variant = "default",
  size = "md",
  className,
}: RoleBadgeProps) {
  const roleColor = getRoleColor(role);

  // Map role colors to Tailwind classes
  const colorClasses: Record<string, string> = {
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium",
        variant === "default" && colorClasses[roleColor],
        sizeClasses[size],
        className
      )}
    >
      {getRoleDisplay(role)}
    </Badge>
  );
}
