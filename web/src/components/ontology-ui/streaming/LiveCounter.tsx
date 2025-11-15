/**
 * LiveCounter - Real-time counter with animations
 *
 * Displays animated count values with optional sparkline chart.
 */

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { OntologyComponentProps } from "../types";

export interface LiveCounterProps extends OntologyComponentProps {
  /**
   * Convex query path that returns a number or object with count property
   */
  queryPath: any;

  /**
   * Query arguments
   */
  args?: Record<string, any>;

  /**
   * Label for the counter
   */
  label: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Format large numbers (e.g., 1,234,567 → 1.2M)
   */
  formatLargeNumbers?: boolean;

  /**
   * Show trend indicator (up/down/neutral)
   */
  showTrend?: boolean;

  /**
   * Previous value for trend comparison
   */
  previousValue?: number;

  /**
   * Prefix (e.g., "$" for currency)
   */
  prefix?: string;

  /**
   * Suffix (e.g., "%" for percentage)
   */
  suffix?: string;

  /**
   * Color variant
   */
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantColors = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  destructive: "text-red-600 dark:text-red-400",
};

function formatNumber(num: number, formatLarge: boolean = false): string {
  if (!formatLarge) {
    return num.toLocaleString();
  }

  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * LiveCounter - Animated counter with real-time updates
 *
 * @example
 * ```tsx
 * <LiveCounter
 *   queryPath={api.queries.analytics.getTotalUsers}
 *   args={{ groupId }}
 *   label="Total Users"
 *   description="All registered users"
 *   formatLargeNumbers
 *   showTrend
 *   variant="success"
 * />
 * ```
 */
export function LiveCounter({
  queryPath,
  args = {},
  label,
  description,
  formatLargeNumbers = false,
  showTrend = false,
  previousValue,
  prefix = "",
  suffix = "",
  variant = "default",
  className,
}: LiveCounterProps) {
  // Real-time Convex query
  const data = useQuery(queryPath, args);

  // Extract count value
  const currentValue = typeof data === 'number' ? data : (data?.count ?? 0);

  // Animated count
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (latest) =>
    Math.round(latest)
  );

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(currentValue);
  }, [currentValue, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(formatNumber(latest, formatLargeNumbers));
    });
    return unsubscribe;
  }, [display, formatLargeNumbers]);

  // Calculate trend
  const trend = showTrend && previousValue !== undefined
    ? currentValue > previousValue ? "up" : currentValue < previousValue ? "down" : "neutral"
    : null;

  const trendChange = previousValue !== undefined
    ? ((currentValue - previousValue) / previousValue * 100).toFixed(1)
    : null;

  // Loading state
  if (data === undefined) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <motion.div
            className={`text-3xl font-bold ${variantColors[variant]}`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            key={currentValue}
          >
            {prefix}{displayValue}{suffix}
          </motion.div>

          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === "up" ? "text-green-600" :
              trend === "down" ? "text-red-600" :
              "text-muted-foreground"
            }`}>
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "neutral" && <Minus className="h-4 w-4" />}
              {trendChange && `${trendChange}%`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
