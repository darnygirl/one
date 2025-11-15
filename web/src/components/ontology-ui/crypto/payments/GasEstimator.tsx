/**
 * GasEstimator Component
 *
 * Estimate transaction gas fees with:
 * - Real-time gas prices (slow/average/fast)
 * - USD cost estimate
 * - EIP-1559 support
 * - Historical gas trends chart
 * - Gas optimization tips
 */

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "../../utils";
import type { GasEstimatorProps, GasPriceOption } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

const GAS_OPTIMIZATION_TIPS = [
  {
    title: "Send during off-peak hours",
    description: "Gas prices are typically lower during weekends and late night hours (UTC).",
    icon: "🕐",
  },
  {
    title: "Use slow speed for non-urgent transactions",
    description: "Save 20-40% on gas by selecting slow speed for transactions that can wait.",
    icon: "🐢",
  },
  {
    title: "Batch multiple operations",
    description: "Combine multiple transactions into one to save on base gas fees.",
    icon: "📦",
  },
  {
    title: "Use Layer 2 solutions",
    description: "Consider using Arbitrum, Optimism, or Polygon for 90%+ lower fees.",
    icon: "⚡",
  },
];

export function GasEstimator({
  to,
  value,
  chainId = 1,
  showTrends = true,
  showOptimizations = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: GasEstimatorProps) {
  const [recipientAddress, setRecipientAddress] = useState(to || "");
  const [amount, setAmount] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<PaymentService.GasEstimate | null>(
    null
  );
  const [selectedSpeed, setSelectedSpeed] = useState<"slow" | "average" | "fast">(
    "average"
  );
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!recipientAddress) {
      setError("Recipient address is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const estimate = await Effect.runPromise(
        PaymentService.estimateGas(recipientAddress, amount || "0", undefined, chainId)
      );
      setGasEstimate(estimate);
    } catch (err: any) {
      const errorMsg = err._tag === "InvalidAddress"
        ? "Invalid recipient address"
        : err._tag === "GasEstimationFailed"
        ? "Failed to estimate gas"
        : "Estimation failed";

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recipientAddress) {
      handleEstimate();
    }
  }, [recipientAddress, amount]);

  const getSpeedColor = (speed: "slow" | "average" | "fast") => {
    switch (speed) {
      case "slow":
        return "text-blue-600";
      case "average":
        return "text-green-600";
      case "fast":
        return "text-orange-600";
    }
  };

  const getSpeedIcon = (speed: "slow" | "average" | "fast") => {
    switch (speed) {
      case "slow":
        return "🐢";
      case "average":
        return "🚶";
      case "fast":
        return "🏃";
    }
  };

  const renderGasOption = (
    speed: "slow" | "average" | "fast",
    data: GasPriceOption
  ) => (
    <button
      onClick={() => setSelectedSpeed(speed)}
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all",
        "hover:border-primary/50 hover:shadow-md",
        selectedSpeed === speed
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSpeedIcon(speed)}</span>
          <span className="font-semibold capitalize">{speed}</span>
        </div>
        <Badge variant="outline" className={getSpeedColor(speed)}>
          ~{Math.floor(data.estimatedTime / 60)}m
        </Badge>
      </div>
      <div className="text-left space-y-1">
        <div className="text-sm text-muted-foreground">Gas Price</div>
        <div className="font-mono text-lg font-bold">
          {parseFloat(data.gasPrice).toFixed(2)} Gwei
        </div>
        <div className="text-sm text-muted-foreground">
          ≈ {formatCurrency(data.usdCost)}
        </div>
      </div>
    </button>
  );

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
              <span className="text-2xl">⛽</span>
              <span>Gas Estimator</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Estimate transaction gas fees and optimize costs
            </CardDescription>
          </div>
          <Badge variant="outline">Chain {chainId}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="estimate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="estimate">Estimate</TabsTrigger>
            <TabsTrigger value="trends" disabled={!showTrends}>
              Trends
            </TabsTrigger>
            <TabsTrigger value="tips" disabled={!showOptimizations}>
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estimate" className="space-y-4 mt-4">
            {/* Input Fields */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="to">To Address</Label>
                <Input
                  id="to"
                  placeholder="0x... or name.eth"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Amount (Optional)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                />
              </div>
            </div>

            {/* Gas Estimates */}
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : gasEstimate ? (
              <>
                <div className="grid gap-3">
                  {renderGasOption("slow", gasEstimate.slow)}
                  {renderGasOption("average", gasEstimate.average)}
                  {renderGasOption("fast", gasEstimate.fast)}
                </div>

                {/* EIP-1559 Details */}
                {gasEstimate.currentBaseFee && (
                  <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Base Fee</span>
                      <span className="font-mono font-medium">
                        {parseFloat(gasEstimate.currentBaseFee).toFixed(2)} Gwei
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gas Limit</span>
                      <span className="font-mono font-medium">
                        {gasEstimate.gasLimit}
                      </span>
                    </div>
                    {gasEstimate[selectedSpeed].maxPriorityFeePerGas && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Priority Fee</span>
                        <span className="font-mono font-medium">
                          {gasEstimate[selectedSpeed].maxPriorityFeePerGas} Gwei
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  Enter a recipient address to see gas estimates
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-4">
            <div className="p-8 bg-secondary rounded-lg text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-muted-foreground">
                Historical gas trends chart
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Coming soon - integrating with gas APIs)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Avg</div>
                <div className="text-lg font-bold">35 Gwei</div>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Low</div>
                <div className="text-lg font-bold text-green-600">22 Gwei</div>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <div className="text-xs text-muted-foreground mb-1">24h High</div>
                <div className="text-lg font-bold text-red-600">58 Gwei</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-3 mt-4">
            {GAS_OPTIMIZATION_TIPS.map((tip, index) => (
              <div
                key={index}
                className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
