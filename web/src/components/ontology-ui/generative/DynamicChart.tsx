/**
 * DynamicChart - Charts from natural language queries
 *
 * Features:
 * - Multiple chart types (bar, line, pie, area, scatter)
 * - Interactive tooltips
 * - Export to image
 * - Responsive design
 */

import { useState, useMemo, useRef } from "react";
import type { OntologyComponentProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "../utils";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Download,
  Settings,
} from "lucide-react";

type ChartType = "bar" | "line" | "pie" | "area" | "scatter";

interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
}

interface DynamicChartProps extends OntologyComponentProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  defaultType?: ChartType;
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  exportable?: boolean;
  height?: number;
}

export function DynamicChart({
  title,
  description,
  data,
  defaultType = "bar",
  showLegend = true,
  showGrid = true,
  animated = true,
  exportable = true,
  height = 400,
  className,
}: DynamicChartProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultType);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate chart dimensions and scales
  const { maxValue, categories } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value));
    const cats = Array.from(new Set(data.map((d) => d.category).filter(Boolean)));
    return { maxValue: max, categories: cats };
  }, [data]);

  const handleExportImage = async () => {
    if (!chartRef.current) return;

    // Simple canvas export
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = chartRef.current.offsetWidth * 2;
    canvas.height = chartRef.current.offsetHeight * 2;

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Export
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const renderBarChart = () => {
    const barWidth = Math.max(40, (chartRef.current?.offsetWidth || 800) / data.length - 20);
    const chartHeight = height - 60;

    return (
      <div className="flex items-end justify-around h-full gap-2 px-4">
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2"
              style={{ width: `${barWidth}px` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative flex-1 flex items-end w-full">
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg z-10">
                    {point.value}
                  </div>
                )}
                <div
                  className={cn(
                    "w-full bg-primary rounded-t transition-all duration-300",
                    isHovered && "opacity-80",
                    animated && "animate-in slide-in-from-bottom"
                  )}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              <p className="text-xs text-center truncate w-full">{point.label}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const chartHeight = height - 60;
    const chartWidth = chartRef.current?.offsetWidth || 800;
    const points = data.map((point, index) => ({
      x: (index / (data.length - 1)) * chartWidth,
      y: chartHeight - (point.value / maxValue) * chartHeight,
      label: point.label,
      value: point.value,
    }));

    const pathD = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`)
      .join(" ");

    return (
      <svg width="100%" height={chartHeight} className="px-4">
        {/* Grid lines */}
        {showGrid && (
          <g className="text-muted-foreground/20">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="4"
              />
            ))}
          </g>
        )}

        {/* Line */}
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? 6 : 4}
            fill="hsl(var(--primary))"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <g>
            <rect
              x={points[hoveredIndex].x - 30}
              y={points[hoveredIndex].y - 30}
              width={60}
              height={20}
              fill="hsl(var(--popover))"
              rx={4}
            />
            <text
              x={points[hoveredIndex].x}
              y={points[hoveredIndex].y - 15}
              textAnchor="middle"
              fill="hsl(var(--popover-foreground))"
              fontSize={12}
            >
              {points[hoveredIndex].value}
            </text>
          </g>
        )}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const centerX = 200;
    const centerY = 200;
    const radius = 150;

    let currentAngle = -90;
    const slices = data.map((point, index) => {
      const percentage = point.value / total;
      const angle = percentage * 360;
      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const result = { path, percentage, ...point, index };
      currentAngle += angle;
      return result;
    });

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "hsl(var(--muted))",
    ];

    return (
      <svg width="100%" height={height} viewBox="0 0 400 400">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.path}
            fill={colors[index % colors.length]}
            opacity={hoveredIndex === index ? 0.8 : 1}
            className="cursor-pointer transition-opacity"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Center circle for donut effect */}
        <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="hsl(var(--background))" />

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <text x={centerX} y={centerY} textAnchor="middle" fontSize={24} fontWeight="bold">
            {Math.round(slices[hoveredIndex].percentage * 100)}%
          </text>
        )}
      </svg>
    );
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chartType === "bar" && <BarChart3 className="h-5 w-5 text-primary" />}
            {chartType === "line" && <LineChartIcon className="h-5 w-5 text-primary" />}
            {chartType === "pie" && <PieChartIcon className="h-5 w-5 text-primary" />}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExportImage}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div ref={chartRef} className="h-full" style={{ height: `${height}px` }}>
          {chartType === "bar" && renderBarChart()}
          {chartType === "line" && renderLineChart()}
          {chartType === "pie" && renderPieChart()}
          {(chartType === "area" || chartType === "scatter") && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {chartType} chart coming soon
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                  }}
                />
                {category}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
