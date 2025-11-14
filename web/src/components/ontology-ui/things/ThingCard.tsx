/**
 * ThingCard - Universal card component for any thing type
 *
 * Renders a single thing with adaptive styling based on type.
 * Supports all 33+ thing types from the ontology.
 */

import type { Thing, CardProps, ThingType } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getThingTypeDisplay, getThingTypeIcon, formatDate, getThingTypeColor, cn } from "../utils";

interface ThingCardProps extends CardProps {
  thing: Thing;
  showType?: boolean;
  showOwner?: boolean;
  showTags?: boolean;
}

export function ThingCard({
  thing,
  showType = true,
  showOwner = false,
  showTags = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: ThingCardProps) {
  const icon = getThingTypeIcon(thing.type);
  const typeDisplay = getThingTypeDisplay(thing.type);
  const typeColor = getThingTypeColor(thing.type);

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
            <span className="text-2xl" aria-label={typeDisplay}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{thing.name}</CardTitle>
              {showType && (
                <Badge
                  variant="secondary"
                  className={cn("mt-1", `bg-${typeColor}-100 text-${typeColor}-800 dark:bg-${typeColor}-900 dark:text-${typeColor}-100`)}
                >
                  {typeDisplay}
                </Badge>
              )}
            </div>
          </div>
          {thing.status && (
            <Badge variant="outline" className="capitalize">
              {thing.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {thing.description && (
          <CardDescription className="line-clamp-2">
            {thing.description}
          </CardDescription>
        )}

        {showTags && thing.tags && thing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {thing.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {thing.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{thing.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {thing.metadata && Object.keys(thing.metadata).length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(thing.metadata).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="truncate ml-2">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Created {formatDate(thing.createdAt)}</span>
          {thing.updatedAt && <span>Updated {formatDate(thing.updatedAt)}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
