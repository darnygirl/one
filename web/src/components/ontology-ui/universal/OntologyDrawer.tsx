/**
 * OntologyDrawer - Slide-out drawer for any dimension
 *
 * Dimension-aware sheet component with side selection
 */

import type { ReactNode } from "react";
import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "../utils";

interface OntologyDrawerProps {
  dimension: Dimension;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function OntologyDrawer({
  dimension,
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className,
}: OntologyDrawerProps) {
  const dimensionMeta = DIMENSIONS[dimension];
  const dimColor = `text-${dimensionMeta.color}-600 dark:text-${dimensionMeta.color}-400`;
  const dimBorder = `border-l-4 border-${dimensionMeta.color}-500`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          side === "right" && dimBorder,
          side === "left" && `border-r-4 border-${dimensionMeta.color}-500`,
          side === "top" && `border-b-4 border-${dimensionMeta.color}-500`,
          side === "bottom" && `border-t-4 border-${dimensionMeta.color}-500`,
          className
        )}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dimensionMeta.icon}</span>
            <div className="flex-1">
              {title && <SheetTitle className={dimColor}>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export type { OntologyDrawerProps };
