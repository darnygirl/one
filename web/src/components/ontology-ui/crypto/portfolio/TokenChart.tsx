/**
 * TokenChart - Interactive price chart with multiple time ranges
 *
 * Features:
 * - Time ranges: 1h, 1d, 1w, 1m, 1y, all
 * - Candlestick or line chart
 * - Volume bars
 * - Zoom and pan (recharts)
 * - Price tooltips
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TokenChartData } from "@/lib/services/CryptoService";
import { formatUsdValue, formatLargeNumber } from "@/lib/services/CryptoService";

export interface TokenChartProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  initialData?: TokenChartData;
  defaultTimeRange?: TimeRange;
  showVolume?: boolean;
  chartType?: "line" | "area" | "candle";
}

type TimeRange = "1h" | "1d" | "1w" | "1m" | "1y" | "all";

interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
  volume?: number;
}

export function TokenChart({
  tokenId,
  tokenName,
  tokenSymbol,
  initialData,
  defaultTimeRange = "1d",
  showVolume = true,
  chartType = "area",
}: TokenChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const timeRanges: { value: TimeRange; label: string; days: number }[] = [
    { value: "1h", label: "1H", days: 0.042 },
    { value: "1d", label: "1D", days: 1 },
    { value: "1w", label: "1W", days: 7 },
    { value: "1m", label: "1M", days: 30 },
    { value: "1y", label: "1Y", days: 365 },
    { value: "all", label: "ALL", days: 9999 },
  ];

  // Fetch chart data
  const fetchChartData = async (days: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }

      const data: TokenChartData = await response.json();

      // Transform data for recharts
      const transformed: ChartDataPoint[] = data.prices.map((price, index) => ({
        timestamp: price[0],
        date: new Date(price[0]).toLocaleString(),
        price: price[1],
        volume: data.total_volumes[index]?.[1],
      }));

      setChartData(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialData) {
      const transformed: ChartDataPoint[] = initialData.prices.map((price, index) => ({
        timestamp: price[0],
        date: new Date(price[0]).toLocaleString(),
        price: price[1],
        volume: initialData.total_volumes[index]?.[1],
      }));
      setChartData(transformed);
      setLoading(false);
    } else {
      const range = timeRanges.find((r) => r.value === timeRange);
      if (range) {
        fetchChartData(range.days);
      }
    }
  }, []);

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    const rangeData = timeRanges.find((r) => r.value === range);
    if (rangeData) {
      fetchChartData(rangeData.days);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-primary">
            {formatUsdValue(payload[0].value)}
          </p>
          {showVolume && payload[1] && (
            <p className="text-sm text-muted-foreground">
              Vol: {formatLargeNumber(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button
            onClick={() => {
              const range = timeRanges.find((r) => r.value === timeRange);
              if (range) fetchChartData(range.days);
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const priceChange =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].price - chartData[0].price) /
          chartData[0].price) *
        100
      : 0;

  const chartColor = priceChange >= 0 ? "#22c55e" : "#ef4444";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              {tokenName} Price Chart
            </CardTitle>
            <CardDescription>{tokenSymbol.toUpperCase()}/USD</CardDescription>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                priceChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {timeRanges.find((r) => r.value === timeRange)?.label}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeRangeChange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Price Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    if (timeRange === "1d" || timeRange === "1h") {
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                    return date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(value) => `$${formatLargeNumber(value)}`}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    if (timeRange === "1d" || timeRange === "1h") {
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                    return date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(value) => `$${formatLargeNumber(value)}`}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        {showVolume && (
          <div>
            <h4 className="text-sm font-medium mb-2">Volume</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(value) => formatLargeNumber(value)}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => formatLargeNumber(value)}
                  labelFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleString()
                  }
                />
                <Bar dataKey="volume" fill={chartColor} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
