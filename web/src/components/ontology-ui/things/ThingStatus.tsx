/**
 * ThingStatus - Status indicator with state transitions
 *
 * Displays the current status of a thing with color-coded badges.
 * Optionally shows possible state transitions with arrows.
 */

import type { Thing } from "../types";
import { Badge } from "@/components/ui/badge";

interface ThingStatusProps {
  thing: Thing;
  status: string;
  showTransitions?: boolean;
  className?: string;
}

// Status configuration with colors and allowed transitions
const statusConfig = {
  draft: {
    label: "Draft",
    variant: "secondary" as const,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "📝",
    transitions: ["active", "archived"],
  },
  active: {
    label: "Active",
    variant: "default" as const,
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "✓",
    transitions: ["draft", "archived"],
  },
  archived: {
    label: "Archived",
    variant: "outline" as const,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "📦",
    transitions: ["active", "deleted"],
  },
  deleted: {
    label: "Deleted",
    variant: "destructive" as const,
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "🗑️",
    transitions: [],
  },
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: "⏳",
    transitions: ["active", "archived"],
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "✓",
    transitions: ["archived"],
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "✗",
    transitions: ["draft", "archived"],
  },
  published: {
    label: "Published",
    variant: "default" as const,
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "🌐",
    transitions: ["draft", "archived"],
  },
};

export function ThingStatus({
  thing,
  status,
  showTransitions = false,
  className = "",
}: ThingStatusProps) {
  // Get status configuration or use default
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "outline" as const,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "•",
    transitions: [],
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge
        variant={config.variant}
        className={`${config.color} flex items-center gap-1`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>

      {showTransitions && config.transitions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">→</span>
          <div className="flex gap-1">
            {config.transitions.map((nextStatus) => {
              const nextConfig = statusConfig[nextStatus as keyof typeof statusConfig];
              if (!nextConfig) return null;

              return (
                <Badge
                  key={nextStatus}
                  variant="outline"
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Can transition to ${nextConfig.label}`}
                >
                  <span>{nextConfig.icon}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to get all available statuses
 */
export function getAvailableStatuses(): string[] {
  return Object.keys(statusConfig);
}

/**
 * Helper function to check if a status transition is valid
 */
export function isValidTransition(
  fromStatus: string,
  toStatus: string
): boolean {
  const config = statusConfig[fromStatus as keyof typeof statusConfig];
  if (!config) return false;
  return config.transitions.includes(toStatus);
}

/**
 * Helper function to get possible transitions for a status
 */
export function getStatusTransitions(status: string): string[] {
  const config = statusConfig[status as keyof typeof statusConfig];
  return config?.transitions || [];
}
