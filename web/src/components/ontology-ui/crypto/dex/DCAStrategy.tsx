/**
 * DCAStrategy Component
 *
 * Dollar-cost averaging setup with:
 * - Token pair selection
 * - Frequency (daily/weekly/monthly)
 * - Amount per purchase
 * - Total duration
 * - Historical DCA simulation
 * - Start/pause/stop DCA
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { DCAStrategyProps, Token, DCAStrategyData } from "./types";
import { Effect } from "effect";
import * as DEXService from "@/lib/services/crypto/DEXService";
import { Play, Pause, TrendingUp, Calendar } from "lucide-react";

const MOCK_TOKENS: Token[] = [
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    balance: "10000",
    usdValue: 1,
    icon: "💵",
  },
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    balance: "2.5",
    usdValue: 2000,
    icon: "⟠",
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    balance: "0.15",
    usdValue: 43000,
    icon: "₿",
  },
];

const MOCK_STRATEGIES: DCAStrategyData[] = [
  {
    id: "dca_1",
    fromToken: MOCK_TOKENS[0],
    toToken: MOCK_TOKENS[1],
    amount: "100",
    frequency: "weekly",
    startDate: Date.now() - 30 * 86400000,
    totalInvested: 400,
    totalReceived: 0.205,
    averagePrice: 1951.22,
    executionCount: 4,
    status: "active",
  },
];

export function DCAStrategy({
  walletAddress,
  chainId = 1,
  fromToken: defaultFrom,
  toToken: defaultTo,
  strategies = MOCK_STRATEGIES,
  onStrategyCreate,
  onStrategyPause,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: DCAStrategyProps) {
  const [fromToken, setFromToken] = useState<Token | null>(defaultFrom || MOCK_TOKENS[0]);
  const [toToken, setToToken] = useState<Token | null>(defaultTo || MOCK_TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"hourly" | "daily" | "weekly">("weekly");
  const [duration, setDuration] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateStrategy = async () => {
    if (!fromToken || !toToken || !amount || !walletAddress) return;

    setIsCreating(true);
    setError(null);

    try {
      const startDate = Date.now();
      const endDate = startDate + parseInt(duration) * 86400000;

      const result = await Effect.runPromise(
        DEXService.createDCAStrategy({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount,
          frequency,
          startDate,
          endDate,
          chainId,
          walletAddress,
        })
      );

      onStrategyCreate?.(result.strategyId);

      // Reset form
      setAmount("");
    } catch (err: any) {
      const errorMsg =
        err._tag === "InvalidRoute"
          ? err.reason
          : "Failed to create DCA strategy";

      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStrategy = async (strategyId: string, currentStatus: string) => {
    try {
      if (currentStatus === "active") {
        await Effect.runPromise(DEXService.pauseDCAStrategy(strategyId));
        onStrategyPause?.(strategyId);
      }
    } catch (err) {
      setError("Failed to update strategy");
    }
  };

  const frequencyTimes = {
    hourly: 24,
    daily: 1,
    weekly: 1 / 7,
  };

  const executionsPerDuration =
    parseInt(duration) * frequencyTimes[frequency];
  const totalInvestment = parseFloat(amount || "0") * executionsPerDuration;

  const canCreateStrategy =
    fromToken &&
    toToken &&
    amount &&
    parseFloat(amount) > 0;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "hover:shadow-lg",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <span>DCA Strategies</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Automate dollar-cost averaging purchases
            </CardDescription>
          </div>
          <Badge variant="outline">Chain {chainId}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Strategy Form */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Create DCA Strategy</h3>

          {/* Token Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Buy</Label>
              <Select
                value={toToken?.address}
                onValueChange={(addr) =>
                  setToToken(MOCK_TOKENS.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.icon} {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>With</Label>
              <Select
                value={fromToken?.address}
                onValueChange={(addr) =>
                  setFromToken(MOCK_TOKENS.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.icon} {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount per purchase */}
          <div className="space-y-2">
            <Label>Amount per Purchase</Label>
            <Input
              type="number"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="1"
            />
            <p className="text-xs text-muted-foreground">
              {fromToken?.symbol} to spend each time
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (days)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="p-3 bg-secondary rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Executions</span>
              <span className="font-medium">
                {formatNumber(executionsPerDuration, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Investment</span>
              <span className="font-medium">
                {formatCurrency(totalInvestment)}
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleCreateStrategy}
            disabled={!canCreateStrategy || isCreating}
          >
            {isCreating ? "Creating..." : "Start DCA Strategy"}
          </Button>
        </div>

        <Separator />

        {/* Active Strategies */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">
            Active Strategies ({strategies.length})
          </h3>

          {strategies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active DCA strategies
            </div>
          ) : (
            <div className="space-y-3">
              {strategies.map((strategy) => {
                const progress = (strategy.executionCount / 10) * 100; // Assuming 10 total executions for demo
                const roi = ((strategy.totalReceived * (strategy.toToken.usdValue || 0) - strategy.totalInvested) / strategy.totalInvested) * 100;

                return (
                  <div
                    key={strategy.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{strategy.toToken.icon}</span>
                        <div>
                          <div className="font-medium text-sm">
                            Buy {strategy.toToken.symbol} with {strategy.fromToken.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {strategy.amount} {strategy.fromToken.symbol} • {strategy.frequency}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            strategy.status === "active"
                              ? "default"
                              : strategy.status === "paused"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {strategy.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStrategy(strategy.id, strategy.status)}
                        >
                          {strategy.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{strategy.executionCount} executions</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Invested</div>
                        <div className="font-medium">
                          {formatCurrency(strategy.totalInvested)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Received</div>
                        <div className="font-medium">
                          {formatNumber(strategy.totalReceived, 4)} {strategy.toToken.symbol}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Avg Price</div>
                        <div className="font-medium">
                          {formatCurrency(strategy.averagePrice)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        roi >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>ROI: {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
