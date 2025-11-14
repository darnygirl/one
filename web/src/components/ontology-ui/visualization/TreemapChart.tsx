import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
  color?: string;
  data?: Record<string, unknown>;
}

export interface TreemapChartProps {
  data: TreemapNode[];
  title?: string;
  enableDrilldown?: boolean;
  showTooltip?: boolean;
  colorScheme?: string[];
  aspectRatio?: number;
  onNodeClick?: (node: TreemapNode) => void;
}

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  depth?: number;
  root?: TreemapNode;
  colors?: string[];
  onClick?: (node: TreemapNode) => void;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function CustomizedContent({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = "",
  value = 0,
  depth = 0,
  colors = COLORS,
  onClick,
  root,
}: CustomContentProps) {
  const fontSize = width < 100 || height < 40 ? 10 : 12;
  const showValue = width > 60 && height > 30;
  const showName = width > 40 && height > 20;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[depth % colors.length],
          stroke: "hsl(var(--background))",
          strokeWidth: 2,
          cursor: "pointer",
        }}
        className="transition-opacity hover:opacity-80"
        onClick={() => onClick?.(root as TreemapNode)}
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 8 : 0)}
          textAnchor="middle"
          fill="hsl(var(--background))"
          fontSize={fontSize}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="hsl(var(--background))"
          fontSize={fontSize - 2}
        >
          {value.toLocaleString()}
        </text>
      )}
    </g>
  );
}

export function TreemapChart({
  data,
  title = "Treemap",
  enableDrilldown = true,
  showTooltip = true,
  colorScheme = COLORS,
  aspectRatio = 16 / 9,
  onNodeClick,
}: TreemapChartProps) {
  const [currentData, setCurrentData] = useState<TreemapNode[]>(data);
  const [navigationStack, setNavigationStack] = useState<TreemapNode[][]>([data]);

  // Transform data for recharts treemap
  const transformData = (nodes: TreemapNode[]): TreemapNode[] => {
    return nodes.map((node) => ({
      ...node,
      size: node.value || 0,
      children: node.children ? transformData(node.children) : undefined,
    }));
  };

  const handleNodeClick = (node: TreemapNode) => {
    onNodeClick?.(node);

    if (enableDrilldown && node.children && node.children.length > 0) {
      setCurrentData(node.children);
      setNavigationStack([...navigationStack, node.children]);
    }
  };

  const handleBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      setCurrentData(newStack[newStack.length - 1]);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
          <div className="font-medium">{data.name}</div>
          <div className="text-muted-foreground">
            Value: {data.value?.toLocaleString()}
          </div>
          {data.children && (
            <div className="text-muted-foreground text-xs mt-1">
              {data.children.length} children
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const transformedData = transformData(currentData);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {navigationStack.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="w-full rounded-lg overflow-hidden border"
          style={{ aspectRatio }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={transformedData}
              dataKey="size"
              aspectRatio={aspectRatio}
              stroke="hsl(var(--background))"
              fill="hsl(var(--primary))"
              content={
                <CustomizedContent
                  colors={colorScheme}
                  onClick={handleNodeClick}
                />
              }
            >
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Breadcrumb navigation */}
        {navigationStack.length > 1 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="font-medium mb-1">Current Path:</div>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => {
                  setNavigationStack([data]);
                  setCurrentData(data);
                }}
                className="hover:text-foreground transition-colors"
              >
                Root
              </button>
              {navigationStack.slice(1).map((level, index) => {
                const levelName =
                  level[0]?.name || `Level ${index + 1}`;
                return (
                  <React.Fragment key={index}>
                    <span>/</span>
                    <button
                      onClick={() => {
                        const newStack = navigationStack.slice(0, index + 2);
                        setNavigationStack(newStack);
                        setCurrentData(newStack[newStack.length - 1]);
                      }}
                      className="hover:text-foreground transition-colors"
                    >
                      {levelName}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Items</div>
            <div className="font-medium">{currentData.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Value</div>
            <div className="font-medium">
              {currentData
                .reduce((sum, node) => sum + (node.value || 0), 0)
                .toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Depth</div>
            <div className="font-medium">{navigationStack.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
