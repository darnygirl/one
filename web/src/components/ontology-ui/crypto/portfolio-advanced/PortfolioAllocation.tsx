/**
 * PortfolioAllocation - Asset allocation visualization
 *
 * Features:
 * - Pie chart of token distribution
 * - Donut chart with percentages
 * - Rebalancing suggestions
 * - Target allocation vs current
 * - Diversification score
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TokenAllocation {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  percentage: number;
  targetPercentage?: number;
  color: string;
}

interface PortfolioAllocationProps {
  tokens: TokenAllocation[];
  totalValue: number;
  className?: string;
  showTargets?: boolean;
}

const COLORS = [
  "#f7931a", // BTC orange
  "#627eea", // ETH blue
  "#26a17b", // USDC green
  "#2775ca", // USDT blue
  "#8247e5", // Polygon purple
  "#fc3", // BNB yellow
  "#e84142", // SOL gradient
  "#0052ff", // Coinbase blue
];

export function PortfolioAllocation({
  tokens,
  totalValue,
  className,
  showTargets = false,
}: PortfolioAllocationProps) {
  const [viewMode, setViewMode] = useState<"pie" | "donut">("donut");

  // Calculate diversification score (0-100)
  const calculateDiversificationScore = (): number => {
    if (tokens.length === 0) return 0;
    if (tokens.length === 1) return 0;

    // Shannon Diversity Index adapted for portfolio
    const entropy = tokens.reduce((sum, token) => {
      const p = token.percentage / 100;
      return sum - p * Math.log2(p || 0.0001);
    }, 0);

    const maxEntropy = Math.log2(tokens.length);
    return Math.round((entropy / maxEntropy) * 100);
  };

  const diversificationScore = calculateDiversificationScore();

  // Get rebalancing suggestions
  const getRebalancingSuggestions = () => {
    if (!showTargets) return [];

    return tokens
      .filter((token) => token.targetPercentage !== undefined)
      .map((token) => {
        const diff = token.percentage - (token.targetPercentage || 0);
        const diffValue = (diff / 100) * totalValue;

        return {
          symbol: token.symbol,
          currentPercentage: token.percentage,
          targetPercentage: token.targetPercentage || 0,
          diff,
          diffValue,
          action: diff > 0 ? "sell" : "buy",
        };
      })
      .filter((s) => Math.abs(s.diff) > 1) // Only show if >1% difference
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  };

  const suggestions = getRebalancingSuggestions();

  const chartData = tokens.map((token, index) => ({
    name: token.symbol,
    value: token.value,
    percentage: token.percentage,
    color: token.color || COLORS[index % COLORS.length],
  }));

  const getDiversificationLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500", icon: CheckCircle };
    if (score >= 60) return { label: "Good", color: "text-blue-500", icon: TrendingUp };
    if (score >= 40) return { label: "Moderate", color: "text-yellow-500", icon: AlertTriangle };
    return { label: "Poor", color: "text-red-500", icon: AlertTriangle };
  };

  const diversificationInfo = getDiversificationLabel(diversificationScore);
  const DiversificationIcon = diversificationInfo.icon;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Asset distribution and diversification</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={viewMode === "pie" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setViewMode("pie")}
            >
              Pie
            </Badge>
            <Badge
              variant={viewMode === "donut" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setViewMode("donut")}
            >
              Donut
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Diversification Score */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DiversificationIcon className={cn("h-5 w-5", diversificationInfo.color)} />
              <p className="font-medium">Diversification Score</p>
            </div>
            <p className={cn("text-2xl font-bold", diversificationInfo.color)}>
              {diversificationScore}/100
            </p>
          </div>
          <Progress value={diversificationScore} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {diversificationInfo.label} diversification across {tokens.length} assets
          </p>
        </div>

        {/* Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                outerRadius={viewMode === "donut" ? 100 : 120}
                innerRadius={viewMode === "donut" ? 60 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Token List */}
        <div className="space-y-2">
          <h3 className="font-medium">Holdings</h3>
          {tokens.map((token, index) => (
            <div key={token.symbol} className="flex items-center gap-3 p-3 rounded-lg border">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: token.color || COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{token.symbol}</p>
                  <p className="text-sm font-medium">${token.value.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{token.name}</p>
                  <p className="text-sm text-muted-foreground">{token.percentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rebalancing Suggestions */}
        {showTargets && suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Rebalancing Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div key={suggestion.symbol} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={suggestion.action === "buy" ? "default" : "destructive"}>
                        {suggestion.action.toUpperCase()}
                      </Badge>
                      <p className="font-medium">{suggestion.symbol}</p>
                    </div>
                    <p className="text-sm font-medium">
                      ${Math.abs(suggestion.diffValue).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">
                      Current: {suggestion.currentPercentage.toFixed(1)}% → Target:{" "}
                      {suggestion.targetPercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.diff > 0 ? "+" : ""}
                      {suggestion.diff.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
