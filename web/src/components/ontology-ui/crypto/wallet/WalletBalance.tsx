/**
 * WalletBalance Component
 *
 * Display native token balance with real-time updates
 * Shows ETH/MATIC/SOL balance and USD value
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { WalletBalanceProps } from "./types";

const NATIVE_SYMBOLS: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  42161: "ETH",
  10: "ETH",
  8453: "ETH",
};

export function WalletBalance({
  address,
  chainId = 1,
  showUsd = true,
  refreshInterval = 10000,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletBalanceProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const symbol = NATIVE_SYMBOLS[chainId] || "ETH";

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);

      try {
        // Mock balance fetch (replace with actual viem/wagmi integration)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockBalance = (Math.random() * 10).toFixed(6);
        const mockUsdPrice = chainId === 1 ? 2400 : chainId === 137 ? 0.85 : 2400;
        const mockUsdValue = parseFloat(mockBalance) * mockUsdPrice;

        setBalance(mockBalance);
        setUsdValue(mockUsdValue);
        setLastUpdated(Date.now());
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [address, chainId, refreshInterval]);

  if (!address) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          No wallet connected
        </p>
      </Card>
    );
  }

  if (isLoading && balance === null) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        interactive && "cursor-pointer hover:shadow-lg",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>Balance</span>
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </CardDescription>
          </div>
          <Badge variant="outline">{symbol}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-3xl font-bold">
            {balance ? formatNumber(parseFloat(balance)) : "0.000000"}
          </div>
          <div className="text-sm text-muted-foreground">{symbol}</div>
        </div>

        {showUsd && usdValue !== null && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">USD Value</span>
            <span className="text-lg font-bold">
              {formatCurrency(usdValue)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Chain ID: {chainId}</span>
          {interactive && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              Refresh →
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
