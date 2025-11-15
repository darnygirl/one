/**
 * PortfolioPnL - Profit/loss calculator
 *
 * Features:
 * - Overall P&L (USD, %)
 * - Per-token P&L
 * - Realized vs unrealized gains
 * - Cost basis tracking
 * - ROI calculator
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TokenPnL {
  symbol: string;
  name: string;
  amount: number;
  costBasis: number; // Average purchase price
  currentPrice: number;
  realizedGains: number; // From sold tokens
  unrealizedGains: number; // From held tokens
  totalGains: number;
  roi: number; // Return on investment %
}

interface PortfolioPnLProps {
  tokens: TokenPnL[];
  className?: string;
}

export function PortfolioPnL({ tokens, className }: PortfolioPnLProps) {
  const [viewMode, setViewMode] = useState<"usd" | "percent">("usd");

  // Calculate overall stats
  const totalInvested = tokens.reduce((sum, t) => sum + t.amount * t.costBasis, 0);
  const totalCurrentValue = tokens.reduce((sum, t) => sum + t.amount * t.currentPrice, 0);
  const totalRealizedGains = tokens.reduce((sum, t) => sum + t.realizedGains, 0);
  const totalUnrealizedGains = tokens.reduce((sum, t) => sum + t.unrealizedGains, 0);
  const totalGains = totalRealizedGains + totalUnrealizedGains;
  const totalROI = totalInvested > 0 ? ((totalGains / totalInvested) * 100).toFixed(2) : "0.00";

  const isPositive = totalGains >= 0;

  // Get top gainers and losers
  const sortedByGains = [...tokens].sort((a, b) => b.totalGains - a.totalGains);
  const topGainers = sortedByGains.filter((t) => t.totalGains > 0).slice(0, 3);
  const topLosers = sortedByGains.filter((t) => t.totalGains < 0).slice(-3).reverse();

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value >= 0 ? `$${formatted}` : `-$${formatted}`;
  };

  const formatPercent = (value: number) => {
    return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Profit & Loss</CardTitle>
            <CardDescription>Track your gains and losses</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={viewMode === "usd" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setViewMode("usd")}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              USD
            </Badge>
            <Badge
              variant={viewMode === "percent" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setViewMode("percent")}
            >
              <Percent className="h-3 w-3 mr-1" />
              %
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Current Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p className={cn("text-2xl font-bold", isPositive ? "text-green-500" : "text-red-500")}>
                {formatCurrency(totalGains)}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">ROI</p>
            <p className={cn("text-2xl font-bold", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? "+" : ""}
              {totalROI}%
            </p>
          </div>
        </div>

        {/* Realized vs Unrealized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Realized Gains</p>
              <Badge variant="secondary">Locked In</Badge>
            </div>
            <p
              className={cn(
                "text-xl font-bold",
                totalRealizedGains >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatCurrency(totalRealizedGains)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">From sold positions</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Unrealized Gains</p>
              <Badge variant="outline">Open</Badge>
            </div>
            <p
              className={cn(
                "text-xl font-bold",
                totalUnrealizedGains >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatCurrency(totalUnrealizedGains)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">From current holdings</p>
          </div>
        </div>

        {/* Tabs for All/Gainers/Losers */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Tokens ({tokens.length})</TabsTrigger>
            <TabsTrigger value="gainers">
              Top Gainers ({topGainers.length})
            </TabsTrigger>
            <TabsTrigger value="losers">
              Top Losers ({topLosers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2 mt-4">
            {tokens.map((token) => (
              <TokenPnLRow key={token.symbol} token={token} viewMode={viewMode} />
            ))}
          </TabsContent>

          <TabsContent value="gainers" className="space-y-2 mt-4">
            {topGainers.length > 0 ? (
              topGainers.map((token) => (
                <TokenPnLRow key={token.symbol} token={token} viewMode={viewMode} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No gains yet</p>
            )}
          </TabsContent>

          <TabsContent value="losers" className="space-y-2 mt-4">
            {topLosers.length > 0 ? (
              topLosers.map((token) => (
                <TokenPnLRow key={token.symbol} token={token} viewMode={viewMode} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No losses</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TokenPnLRow({ token, viewMode }: { token: TokenPnL; viewMode: "usd" | "percent" }) {
  const isPositive = token.totalGains >= 0;

  return (
    <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{token.symbol}</p>
            <Badge variant="outline" className="text-xs">
              {token.amount} tokens
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
        <div className="text-right">
          <p className={cn("font-bold", isPositive ? "text-green-500" : "text-red-500")}>
            {viewMode === "usd"
              ? `${isPositive ? "+" : ""}$${Math.abs(token.totalGains).toLocaleString()}`
              : `${isPositive ? "+" : ""}${token.roi.toFixed(2)}%`}
          </p>
          <p className="text-sm text-muted-foreground">
            Cost: ${token.costBasis.toFixed(2)} → Now: ${token.currentPrice.toFixed(2)}
          </p>
        </div>
      </div>
      {(token.realizedGains !== 0 || token.unrealizedGains !== 0) && (
        <div className="flex gap-4 mt-2 pt-2 border-t text-xs text-muted-foreground">
          <span>
            Realized: ${token.realizedGains >= 0 ? "+" : ""}
            {token.realizedGains.toLocaleString()}
          </span>
          <span>
            Unrealized: ${token.unrealizedGains >= 0 ? "+" : ""}
            {token.unrealizedGains.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
