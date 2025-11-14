/**
 * OntologyModal - Modal dialog for any dimension
 *
 * Dimension-aware dialog with adaptive styling
 */

import type { ReactNode } from "react";
import type { Dimension } from "../types";
import { DIMENSIONS } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "../utils";

interface OntologyModalProps {
  dimension: Dimension;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function OntologyModal({
  dimension,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}: OntologyModalProps) {
  const dimensionMeta = DIMENSIONS[dimension];
  const dimColor = `text-${dimensionMeta.color}-600 dark:text-${dimensionMeta.color}-400`;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size], className)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dimensionMeta.icon}</span>
            <div className="flex-1">
              {title && (
                <DialogTitle className={dimColor}>{title}</DialogTitle>
              )}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export type { OntologyModalProps };
