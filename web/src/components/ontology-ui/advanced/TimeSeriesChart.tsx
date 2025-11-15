/**
 * TimeSeriesChart - Time series chart component
 *
 * Features:
 * - Real-time data updates
 * - Zoom/pan controls
 * - Multiple series
 * - Export to image
 * - Responsive design
 */

import { useState, useRef } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../utils";

export interface TimeSeriesDataPoint {
  timestamp: number;
  [key: string]: number;
}

export interface TimeSeriesSeries {
  key: string;
  name: string;
  color: string;
  type?: "line" | "area" | "bar";
}

export interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  series: TimeSeriesSeries[];
  title?: string;
  showLegend?: boolean;
  showBrush?: boolean;
  showGrid?: boolean;
  enableZoom?: boolean;
  enableExport?: boolean;
  height?: number;
  refreshInterval?: number; // Auto-refresh in ms
  onRefresh?: () => void;
  className?: string;
}

const chartTypes = [
  { value: "line", label: "Line Chart" },
  { value: "area", label: "Area Chart" },
  { value: "bar", label: "Bar Chart" },
];

export function TimeSeriesChart({
  data,
  series,
  title = "Time Series Data",
  showLegend = true,
  showBrush = true,
  showGrid = true,
  enableZoom = true,
  enableExport = true,
  height = 400,
  refreshInterval,
  onRefresh,
  className,
}: TimeSeriesChartProps) {
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");
  const [zoom, setZoom] = useState({ start: 0, end: 100 });
  const chartRef = useRef<HTMLDivElement>(null);

  // Auto-refresh
  if (refreshInterval && onRefresh) {
    setInterval(() => {
      onRefresh();
    }, refreshInterval);
  }

  // Format timestamp for X-axis
  const formatXAxis = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm");
  };

  // Format tooltip
  const formatTooltip = (value: number, name: string) => {
    const seriesInfo = series.find((s) => s.key === name);
    return [value.toFixed(2), seriesInfo?.name || name];
  };

  // Format tooltip label
  const formatTooltipLabel = (timestamp: number) => {
    return format(new Date(timestamp), "PPpp");
  };

  // Zoom in
  const handleZoomIn = () => {
    const range = zoom.end - zoom.start;
    const newRange = range * 0.7; // Zoom in 30%
    const center = (zoom.start + zoom.end) / 2;
    setZoom({
      start: Math.max(0, center - newRange / 2),
      end: Math.min(100, center + newRange / 2),
    });
  };

  // Zoom out
  const handleZoomOut = () => {
    const range = zoom.end - zoom.start;
    const newRange = Math.min(100, range * 1.3); // Zoom out 30%
    const center = (zoom.start + zoom.end) / 2;
    setZoom({
      start: Math.max(0, center - newRange / 2),
      end: Math.min(100, center + newRange / 2),
    });
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoom({ start: 0, end: 100 });
  };

  // Export to image
  const handleExport = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  // Filter data based on zoom
  const filteredData =
    zoom.start === 0 && zoom.end === 100
      ? data
      : data.slice(
          Math.floor((data.length * zoom.start) / 100),
          Math.ceil((data.length * zoom.end) / 100)
        );

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const xAxisProps = {
      dataKey: "timestamp",
      tickFormatter: formatXAxis,
      stroke: "hsl(var(--muted-foreground))",
    };

    const yAxisProps = {
      stroke: "hsl(var(--muted-foreground))",
    };

    const gridProps = showGrid
      ? {
          stroke: "hsl(var(--border))",
          strokeDasharray: "3 3",
        }
      : undefined;

    const tooltipProps = {
      formatter: formatTooltip,
      labelFormatter: formatTooltipLabel,
      contentStyle: {
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
      },
    };

    const legendProps = showLegend
      ? {
          wrapperStyle: {
            paddingTop: "20px",
          },
        }
      : undefined;

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend {...legendProps} />}
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
              />
            ))}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={formatXAxis}
              />
            )}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend {...legendProps} />}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} />
            ))}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={formatXAxis}
              />
            )}
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend {...legendProps} />}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {showBrush && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={formatXAxis}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>

          <div className="flex items-center gap-2">
            {/* Chart type selector */}
            <Select
              value={chartType}
              onValueChange={(value) =>
                setChartType(value as "line" | "area" | "bar")
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Zoom controls */}
            {enableZoom && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom.end - zoom.start < 10}
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom.start === 0 && zoom.end === 100}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  disabled={zoom.start === 0 && zoom.end === 100}
                  title="Reset Zoom"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Export button */}
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                title="Export to PNG"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Refresh button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Data summary */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Data Points:</span> {data.length}
          </div>
          <div>
            <span className="font-medium">Series:</span> {series.length}
          </div>
          {zoom.start !== 0 || zoom.end !== 100 ? (
            <div>
              <span className="font-medium">Zoom:</span> {Math.round(zoom.start)}
              % - {Math.round(zoom.end)}%
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
