import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

export interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}

export interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title?: string;
  colorScale?: {
    min: string;
    mid: string;
    max: string;
  };
  minValue?: number;
  maxValue?: number;
  cellWidth?: number;
  cellHeight?: number;
  showLabels?: boolean;
  showTooltip?: boolean;
  onCellClick?: (point: HeatmapDataPoint) => void;
  exportable?: boolean;
}

export function HeatmapChart({
  data,
  title = "Heatmap",
  colorScale = {
    min: "hsl(var(--muted))",
    mid: "hsl(var(--primary) / 0.5)",
    max: "hsl(var(--primary))",
  },
  minValue,
  maxValue,
  cellWidth = 60,
  cellHeight = 40,
  showLabels = true,
  showTooltip = true,
  onCellClick,
  exportable = true,
}: HeatmapChartProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);

  // Calculate min/max values from data if not provided
  const dataMin = minValue ?? Math.min(...data.map((d) => d.value));
  const dataMax = maxValue ?? Math.max(...data.map((d) => d.value));

  // Get unique x and y values
  const xValues = Array.from(new Set(data.map((d) => d.x)));
  const yValues = Array.from(new Set(data.map((d) => d.y)));

  // Color interpolation function
  const getColor = (value: number): string => {
    const normalized = (value - dataMin) / (dataMax - dataMin);

    if (normalized < 0.5) {
      // Interpolate between min and mid
      return colorScale.mid;
    } else {
      // Interpolate between mid and max
      return colorScale.max;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["X", "Y", "Value"];
    const csvContent = [
      headers.join(","),
      ...data.map((d) => `${d.x},${d.y},${d.value}`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PNG
  const exportToPNG = () => {
    const svg = document.getElementById("heatmap-svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {exportable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPNG}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <svg
            id="heatmap-svg"
            width={xValues.length * cellWidth * zoom + 100}
            height={yValues.length * cellHeight * zoom + 100}
            className="mx-auto"
          >
            {/* Y-axis labels */}
            {showLabels &&
              yValues.map((y, yi) => (
                <text
                  key={`y-label-${yi}`}
                  x={40}
                  y={yi * cellHeight * zoom + cellHeight * zoom / 2 + 60}
                  textAnchor="end"
                  className="fill-foreground text-xs"
                  dominantBaseline="middle"
                >
                  {y}
                </text>
              ))}

            {/* X-axis labels */}
            {showLabels &&
              xValues.map((x, xi) => (
                <text
                  key={`x-label-${xi}`}
                  x={xi * cellWidth * zoom + cellWidth * zoom / 2 + 60}
                  y={30}
                  textAnchor="middle"
                  className="fill-foreground text-xs"
                >
                  {x}
                </text>
              ))}

            {/* Heatmap cells */}
            {data.map((point, i) => {
              const xi = xValues.indexOf(point.x);
              const yi = yValues.indexOf(point.y);

              return (
                <rect
                  key={`cell-${i}`}
                  x={xi * cellWidth * zoom + 60}
                  y={yi * cellHeight * zoom + 50}
                  width={cellWidth * zoom - 2}
                  height={cellHeight * zoom - 2}
                  fill={getColor(point.value)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => onCellClick?.(point)}
                  onMouseEnter={() => showTooltip && setHoveredCell(point)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}

            {/* Cell value labels */}
            {showLabels &&
              data.map((point, i) => {
                const xi = xValues.indexOf(point.x);
                const yi = yValues.indexOf(point.y);

                return (
                  <text
                    key={`value-${i}`}
                    x={xi * cellWidth * zoom + cellWidth * zoom / 2 + 60}
                    y={yi * cellHeight * zoom + cellHeight * zoom / 2 + 50}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-background text-xs font-medium pointer-events-none"
                  >
                    {point.value.toFixed(1)}
                  </text>
                );
              })}
          </svg>
        </div>

        {/* Tooltip */}
        {showTooltip && hoveredCell && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <div className="font-medium">
              {hoveredCell.x} × {hoveredCell.y}
            </div>
            <div className="text-muted-foreground">
              Value: {hoveredCell.value.toFixed(2)}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">
            {dataMin.toFixed(1)}
          </span>
          <div className="flex h-4 w-48 rounded overflow-hidden">
            <div
              className="flex-1"
              style={{ backgroundColor: colorScale.min }}
            />
            <div
              className="flex-1"
              style={{ backgroundColor: colorScale.mid }}
            />
            <div
              className="flex-1"
              style={{ backgroundColor: colorScale.max }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {dataMax.toFixed(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
