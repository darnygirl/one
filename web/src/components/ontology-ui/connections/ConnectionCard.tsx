/**
 * ConnectionCard - Card showing a connection relationship
 *
 * Renders a single connection between two things with type, strength, and metadata.
 * Part of CONNECTIONS dimension (ontology-ui)
 */

import type { Connection, Thing, CardProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getConnectionTypeDisplay, formatDate, cn } from "../utils";

interface ConnectionCardProps extends CardProps {
  connection: Connection;
  fromThing?: Thing;
  toThing?: Thing;
  showStrength?: boolean;
}

export function ConnectionCard({
  connection,
  fromThing,
  toThing,
  showStrength = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: ConnectionCardProps) {
  const typeDisplay = getConnectionTypeDisplay(connection.type);

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantClasses = {
    default: "",
    outline: "border-2",
    ghost: "border-0 shadow-none",
  };

  // Strength color (0-100)
  const getStrengthColor = (strength?: number) => {
    if (!strength) return "bg-gray-200 dark:bg-gray-700";
    if (strength >= 75) return "bg-green-500 dark:bg-green-600";
    if (strength >= 50) return "bg-blue-500 dark:bg-blue-600";
    if (strength >= 25) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-red-500 dark:bg-red-600";
  };

  return (
    <Card
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        interactive && "cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl" aria-label="Connection">
              🔗
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">
                {fromThing?.name || "Thing"} → {toThing?.name || "Thing"}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                {typeDisplay}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Connection details */}
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium truncate">{fromThing?.name || connection.fromId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium truncate">{toThing?.name || connection.toId}</span>
          </div>
        </div>

        {/* Strength indicator */}
        {showStrength && connection.strength !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Strength</span>
              <span className="font-medium">{connection.strength}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={cn("h-full transition-all", getStrengthColor(connection.strength))}
                style={{ width: `${connection.strength}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        {connection.metadata && Object.keys(connection.metadata).length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(connection.metadata).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="truncate ml-2">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Created {formatDate(connection.createdAt)}</span>
          {connection.updatedAt && <span>Updated {formatDate(connection.updatedAt)}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
