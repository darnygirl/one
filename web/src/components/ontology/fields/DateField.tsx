/**
 * DateField Component
 * Renders dates with relative or absolute formatting
 */

import { cn } from "@/lib/utils";
import { formatDistanceToNow, format as formatDate } from "date-fns";

interface DateFieldProps {
  value: number | Date;
  format?: "relative" | "full" | "short";
  icon?: string;
  size?: "xs" | "sm" | "md";
  color?: "default" | "muted";
  className?: string;
}

export function DateField({
  value,
  format = "relative",
  icon,
  size = "sm",
  color = "muted",
  className,
}: DateFieldProps) {
  const date = typeof value === "number" ? new Date(value) : value;

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  const colorClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
  };

  let formattedDate: string;
  switch (format) {
    case "relative":
      formattedDate = formatDistanceToNow(date, { addSuffix: true });
      break;
    case "full":
      formattedDate = formatDate(date, "PPP");
      break;
    case "short":
      formattedDate = formatDate(date, "PP");
      break;
    default:
      formattedDate = formatDate(date, "PP");
  }

  return (
    <span
      className={cn(sizeClasses[size], colorClasses[color], className)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {formattedDate}
    </span>
  );
}
