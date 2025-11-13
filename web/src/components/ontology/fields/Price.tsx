/**
 * Price Component
 * Renders prices with currency formatting and optional badge
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriceProps {
  value: number;
  currency?: string;
  format?: "full" | "compact";
  badge?: boolean;
  size?: "sm" | "md" | "lg";
  strikethrough?: boolean;
  free?: { label: string; badge: boolean };
  className?: string;
}

export function Price({
  value,
  currency = "USD",
  format = "compact",
  badge = false,
  size = "md",
  strikethrough = false,
  free,
  className,
}: PriceProps) {
  // Show "Free" if value is 0 and free config provided
  if (value === 0 && free) {
    return free.badge ? (
      <Badge variant="secondary">{free.label}</Badge>
    ) : (
      <span className="text-sm font-medium text-muted-foreground">
        {free.label}
      </span>
    );
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: format === "compact" ? 0 : 2,
    maximumFractionDigits: format === "compact" ? 0 : 2,
  }).format(value);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const content = (
    <span
      className={cn(
        "font-semibold",
        sizeClasses[size],
        strikethrough && "line-through text-muted-foreground",
        className
      )}
    >
      {formatted}
    </span>
  );

  return badge ? (
    <Badge variant="default" className="font-semibold">
      {formatted}
    </Badge>
  ) : (
    content
  );
}
