/**
 * PortfolioTracker - Track portfolio value over time
 *
 * Features:
 * - Historical portfolio value chart
 * - Time range selector (1D, 1W, 1M, 3M, 1Y, ALL)
 * - Compare to BTC/ETH
 * - Export historical data
 * - Store snapshots in Convex
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortfolioSnapshot {
  timestamp: number;
  totalValue: number;
  btcPrice: number;
  ethPrice: number;
  tokens: {
    symbol: string;
    amount: number;
    price: number;
    value: number;
  }[];
}

interface PortfolioTrackerProps {
  groupId: string;
  walletAddress: string;
  className?: string;
  onExport?: (data: PortfolioSnapshot[]) => void;
}

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export function PortfolioTracker({
  groupId,
  walletAddress,
  className,
  onExport,
}: PortfolioTrackerProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [compareAsset, setCompareAsset] = useState<"none" | "btc" | "eth">("btc");
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch historical snapshots from Convex
    fetchSnapshots(timeRange);
  }, [timeRange, walletAddress]);

  const fetchSnapshots = async (range: TimeRange) => {
    setLoading(true);
    try {
      // In production: fetch from Convex
      // const data = await convex.query(api.crypto.portfolio.getSnapshots, {
      //   groupId,
      //   walletAddress,
      //   timeRange: range,
      // });

      // Mock data for demonstration
      const mockData = generateMockSnapshots(range);
      setSnapshots(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSnapshots = (range: TimeRange): PortfolioSnapshot[] => {
    const now = Date.now();
    const intervals = {
      "1D": 24,
      "1W": 7 * 24,
      "1M": 30,
      "3M": 90,
      "1Y": 365,
      "ALL": 730,
    };

    const count = intervals[range];
    const interval = range === "1D" || range === "1W" ? 3600000 : 86400000; // 1 hour or 1 day

    return Array.from({ length: count }, (_, i) => ({
      timestamp: now - (count - i) * interval,
      totalValue: 10000 + Math.random() * 2000 + i * 10,
      btcPrice: 45000 + Math.random() * 5000,
      ethPrice: 3000 + Math.random() * 500,
      tokens: [],
    }));
  };

  const chartData = snapshots.map((snapshot) => {
    const data: any = {
      timestamp: new Date(snapshot.timestamp).toLocaleDateString(),
      portfolio: snapshot.totalValue,
    };

    if (compareAsset === "btc") {
      // Normalize BTC to portfolio starting value
      const initialBtc = snapshots[0]?.btcPrice || 1;
      const initialPortfolio = snapshots[0]?.totalValue || 1;
      data.btc = (snapshot.btcPrice / initialBtc) * initialPortfolio;
    } else if (compareAsset === "eth") {
      const initialEth = snapshots[0]?.ethPrice || 1;
      const initialPortfolio = snapshots[0]?.totalValue || 1;
      data.eth = (snapshot.ethPrice / initialEth) * initialPortfolio;
    }

    return data;
  });

  const currentValue = snapshots[snapshots.length - 1]?.totalValue || 0;
  const previousValue = snapshots[0]?.totalValue || 0;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(2);
  const isPositive = change >= 0;

  const handleExport = () => {
    if (onExport) {
      onExport(snapshots);
    } else {
      // Default CSV export
      const csv = generateCSV(snapshots);
      downloadCSV(csv, `portfolio-${timeRange}-${Date.now()}.csv`);
    }
  };

  const generateCSV = (data: PortfolioSnapshot[]) => {
    const headers = ["Timestamp", "Total Value", "BTC Price", "ETH Price"];
    const rows = data.map((s) => [
      new Date(s.timestamp).toISOString(),
      s.totalValue,
      s.btcPrice,
      s.ethPrice,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Portfolio Tracker</CardTitle>
            <CardDescription>Track your portfolio value over time</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-2xl font-bold">${currentValue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Change ({timeRange})</p>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p className={cn("text-2xl font-bold", isPositive ? "text-green-500" : "text-red-500")}>
                {isPositive ? "+" : ""}${change.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Change %</p>
            <p className={cn("text-2xl font-bold", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? "+" : ""}{changePercent}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Select value={compareAsset} onValueChange={(v: any) => setCompareAsset(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Compare to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="btc">Compare to BTC</SelectItem>
              <SelectItem value="eth">Compare to ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="w-full h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="timestamp" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Portfolio"
                  dot={false}
                />
                {compareAsset === "btc" && (
                  <Line
                    type="monotone"
                    dataKey="btc"
                    stroke="#f7931a"
                    strokeWidth={2}
                    name="BTC"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {compareAsset === "eth" && (
                  <Line
                    type="monotone"
                    dataKey="eth"
                    stroke="#627eea"
                    strokeWidth={2}
                    name="ETH"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
