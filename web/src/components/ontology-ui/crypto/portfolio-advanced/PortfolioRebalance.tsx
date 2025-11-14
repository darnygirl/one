/**
 * PortfolioRebalance - Rebalancing tool
 *
 * Features:
 * - Target allocation input
 * - Calculate trades needed
 * - Estimate gas fees
 * - One-click rebalance
 * - Rebalancing history
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RebalanceToken {
  symbol: string;
  name: string;
  currentAmount: number;
  currentValue: number;
  currentPercentage: number;
  targetPercentage: number;
  requiredAmount: number;
  requiredValue: number;
  action: "buy" | "sell" | "hold";
  actionAmount: number;
  actionValue: number;
}

interface PortfolioRebalanceProps {
  tokens: RebalanceToken[];
  totalValue: number;
  className?: string;
  onRebalance?: (trades: RebalanceTrade[]) => void;
}

export interface RebalanceTrade {
  symbol: string;
  action: "buy" | "sell";
  amount: number;
  estimatedCost: number;
}

export interface RebalanceHistory {
  timestamp: number;
  totalValue: number;
  trades: RebalanceTrade[];
  gasCost: number;
  status: "completed" | "pending" | "failed";
}

export function PortfolioRebalance({
  tokens: initialTokens,
  totalValue,
  className,
  onRebalance,
}: PortfolioRebalanceProps) {
  const [tokens, setTokens] = useState<RebalanceToken[]>(initialTokens);
  const [estimatedGas, setEstimatedGas] = useState(0);
  const [rebalanceHistory, setRebalanceHistory] = useState<RebalanceHistory[]>([]);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Calculate required trades
  useEffect(() => {
    const updatedTokens = tokens.map((token) => {
      const requiredValue = (token.targetPercentage / 100) * totalValue;
      const requiredAmount = requiredValue / (token.currentValue / token.currentAmount || 1);
      const actionAmount = requiredAmount - token.currentAmount;
      const action = actionAmount > 0 ? "buy" : actionAmount < 0 ? "sell" : "hold";

      return {
        ...token,
        requiredAmount,
        requiredValue,
        action: action as "buy" | "sell" | "hold",
        actionAmount: Math.abs(actionAmount),
        actionValue: Math.abs(actionAmount * (token.currentValue / token.currentAmount || 0)),
      };
    });

    setTokens(updatedTokens);

    // Estimate gas fees (mock calculation)
    const tradesCount = updatedTokens.filter((t) => t.action !== "hold").length;
    setEstimatedGas(tradesCount * 15); // ~$15 per trade
  }, [tokens.map((t) => t.targetPercentage).join(","), totalValue]);

  const handleTargetChange = (symbol: string, newTarget: number) => {
    setTokens((prev) =>
      prev.map((t) => (t.symbol === symbol ? { ...t, targetPercentage: newTarget } : t))
    );
  };

  const handleAutoBalance = () => {
    // Distribute evenly
    const evenPercentage = 100 / tokens.length;
    setTokens((prev) => prev.map((t) => ({ ...t, targetPercentage: evenPercentage })));
  };

  const handleExecuteRebalance = async () => {
    setIsRebalancing(true);

    const trades: RebalanceTrade[] = tokens
      .filter((t) => t.action !== "hold")
      .map((t) => ({
        symbol: t.symbol,
        action: t.action,
        amount: t.actionAmount,
        estimatedCost: t.actionValue,
      }));

    try {
      // Execute rebalancing
      if (onRebalance) {
        await onRebalance(trades);
      }

      // Add to history
      const historyEntry: RebalanceHistory = {
        timestamp: Date.now(),
        totalValue,
        trades,
        gasCost: estimatedGas,
        status: "completed",
      };

      setRebalanceHistory((prev) => [historyEntry, ...prev]);
    } catch (error) {
      console.error("Rebalancing failed:", error);
    } finally {
      setIsRebalancing(false);
    }
  };

  const totalTargetPercentage = tokens.reduce((sum, t) => sum + t.targetPercentage, 0);
  const isValidAllocation = Math.abs(totalTargetPercentage - 100) < 0.01;
  const tradesNeeded = tokens.filter((t) => t.action !== "hold").length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Portfolio Rebalancing</CardTitle>
        <CardDescription>Adjust your portfolio allocation</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoBalance}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Auto Balance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to current
              setTokens((prev) =>
                prev.map((t) => ({ ...t, targetPercentage: t.currentPercentage }))
              );
            }}
          >
            Reset to Current
          </Button>
        </div>

        {/* Target Allocation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Target Allocation</h3>
            <Badge variant={isValidAllocation ? "default" : "destructive"}>
              Total: {totalTargetPercentage.toFixed(1)}%
            </Badge>
          </div>

          {tokens.map((token) => (
            <div key={token.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{token.symbol}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {token.currentPercentage.toFixed(1)}%
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={token.targetPercentage.toFixed(1)}
                    onChange={(e) => handleTargetChange(token.symbol, parseFloat(e.target.value) || 0)}
                    className="w-20 text-right"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
              <Slider
                value={[token.targetPercentage]}
                onValueChange={([value]) => handleTargetChange(token.symbol, value)}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {!isValidAllocation && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Invalid Allocation</p>
              <p className="text-sm text-destructive/80">
                Target percentages must sum to 100%. Currently: {totalTargetPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Required Trades */}
        {isValidAllocation && tradesNeeded > 0 && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-medium">Required Trades ({tradesNeeded})</h3>
            {tokens
              .filter((t) => t.action !== "hold")
              .map((token) => (
                <div key={token.symbol} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={token.action === "buy" ? "default" : "destructive"}>
                        {token.action.toUpperCase()}
                      </Badge>
                      <p className="font-medium">{token.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.actionAmount.toFixed(6)} tokens</p>
                      <p className="text-sm text-muted-foreground">
                        ~${token.actionValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Gas Estimate */}
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Estimated Gas Fees</p>
                <p className="font-medium">${estimatedGas.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rebalancing History */}
        {rebalanceHistory.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-medium">Recent Rebalancing</h3>
            {rebalanceHistory.slice(0, 3).map((entry, index) => (
              <div key={index} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      entry.status === "completed"
                        ? "default"
                        : entry.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {entry.trades.length} trades · ${entry.gasCost} gas
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!isValidAllocation || tradesNeeded === 0 || isRebalancing}
          onClick={handleExecuteRebalance}
        >
          {isRebalancing ? "Executing..." : `Execute Rebalance (${tradesNeeded} trades)`}
        </Button>
      </CardFooter>
    </Card>
  );
}
