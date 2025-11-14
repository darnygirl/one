/**
 * StreamingChart Component
 *
 * Charts with live data updates from Convex
 * Supports line, bar, and area chart types
 * Smooth data transitions with real-time tooltips
 */

import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "../utils";

export type ChartType = "line" | "bar" | "area";

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
  [key: string]: any;
}

interface StreamingChartProps {
  data: ChartDataPoint[];
  type?: ChartType;
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  maxDataPoints?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  className?: string;
  onDataPointClick?: (point: ChartDataPoint) => void;
}

export function StreamingChart({
  data,
  type = "line",
  title,
  xAxisKey = "timestamp",
  yAxisKey = "value",
  color = "hsl(var(--primary))",
  maxDataPoints = 50,
  showLegend = true,
  showGrid = true,
  height = 300,
  className,
  onDataPointClick,
}: StreamingChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLive, setIsLive] = useState(true);
  const previousDataRef = useRef<ChartDataPoint[]>([]);

  // Update chart data with smooth transitions
  useEffect(() => {
    if (data.length === 0) return;

    // Keep only the most recent maxDataPoints
    const recentData = data.slice(-maxDataPoints);

    // Check if new data arrived
    const hasNewData = data.length > previousDataRef.current.length;
    if (hasNewData) {
      setIsLive(true);
    }

    setChartData(recentData);
    previousDataRef.current = data;
  }, [data, maxDataPoints]);

  // Format timestamp for display
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">
          {formatXAxis(dataPoint[xAxisKey])}
        </p>
        <p className="text-sm font-semibold">
          {formatNumber(dataPoint[yAxisKey])}
        </p>
        {dataPoint.label && (
          <p className="text-xs text-muted-foreground mt-1">
            {dataPoint.label}
          </p>
        )}
      </div>
    );
  };

  // Render appropriate chart type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, left: 0, bottom: 5 },
      onClick: onDataPointClick,
    };

    const axisProps = {
      xAxis: (
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
      ),
      yAxis: (
        <YAxis
          tickFormatter={formatNumber}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
      ),
      grid: showGrid ? (
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      ) : null,
      tooltip: <Tooltip content={<CustomTooltip />} />,
      legend: showLegend ? <Legend /> : null,
    };

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Bar
              dataKey={yAxisKey}
              fill={color}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </AreaChart>
        );

      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            {axisProps.grid}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn("", className)}>
      {title && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {chartData.length} points
              </Badge>
              {isLive && (
                <Badge variant="default" className="text-xs">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {chartData.length === 0 ? (
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
