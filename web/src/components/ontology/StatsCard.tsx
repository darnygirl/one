/**
 * StatsCard Component
 * Displays aggregate statistics about things
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardData {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

interface StatsCardProps {
  stats: StatCardData[];
  className?: string;
}

export function StatsCard({ stats, className }: StatsCardProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon && (
              <div className="h-4 w-4 text-muted-foreground">{stat.icon}</div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {stat.trend === "up" && (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={cn(
                    stat.trend === "up" && "text-green-500",
                    stat.trend === "down" && "text-red-500"
                  )}
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
                {stat.changeLabel && (
                  <span className="ml-1">{stat.changeLabel}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
