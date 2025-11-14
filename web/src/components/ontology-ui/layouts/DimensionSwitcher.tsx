/**
 * DimensionSwitcher - Switch between 6 dimensions
 *
 * Dropdown selector for dimensions with optional compact mode (icon only).
 * Color-coded by dimension for visual clarity.
 */

import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import { getDimensionIcon, cn } from "../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DimensionSwitcherProps {
  value: Dimension;
  onChange?: (dimension: Dimension) => void;
  compact?: boolean;
  className?: string;
}

export function DimensionSwitcher({
  value,
  onChange,
  compact = false,
  className,
}: DimensionSwitcherProps) {
  const dimensions = Object.keys(DIMENSIONS) as Dimension[];
  const currentMeta = DIMENSIONS[value];

  return (
    <Select value={value} onValueChange={(val) => onChange?.(val as Dimension)}>
      <SelectTrigger className={cn("w-[200px]", compact && "w-[60px]", className)}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDimensionIcon(value)}</span>
            {!compact && <span>{currentMeta.name}</span>}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {dimensions.map((dimension) => {
          const meta = DIMENSIONS[dimension];
          const icon = getDimensionIcon(dimension);

          return (
            <SelectItem key={dimension} value={dimension}>
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg">{icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{meta.name}</div>
                  {!compact && (
                    <div className="text-xs text-muted-foreground">
                      {meta.description}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    `border-${meta.color}-500 text-${meta.color}-700 dark:text-${meta.color}-300`
                  )}
                >
                  {dimension}
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
