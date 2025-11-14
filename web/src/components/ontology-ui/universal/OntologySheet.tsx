/**
 * OntologySheet - Bottom sheet component for any dimension
 *
 * Mobile-optimized sheet with swipe to dismiss
 */

import type { ReactNode } from "react";
import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "../utils";

interface OntologySheetProps {
  dimension: Dimension;
  trigger: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OntologySheet({
  dimension,
  trigger,
  title,
  description,
  children,
  className,
  defaultOpen,
  open,
  onOpenChange,
}: OntologySheetProps) {
  const dimensionMeta = DIMENSIONS[dimension];
  const dimColor = `text-${dimensionMeta.color}-600 dark:text-${dimensionMeta.color}-400`;
  const dimBorder = `border-t-4 border-${dimensionMeta.color}-500`;

  return (
    <Sheet
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side="bottom"
        className={cn(
          dimBorder,
          "max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dimensionMeta.icon}</span>
            <div className="flex-1">
              {title && <SheetTitle className={dimColor}>{title}</SheetTitle>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export type { OntologySheetProps };
