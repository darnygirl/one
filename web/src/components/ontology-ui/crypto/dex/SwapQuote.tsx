/**
 * SwapQuote Component
 *
 * Get best swap rates with:
 * - Compare quotes from multiple DEXes (Uniswap, Sushiswap, 1inch, Jupiter)
 * - Show best rate with savings
 * - Route visualization (A → B or A → C → B)
 * - Gas cost comparison
 * - Price impact calculation
 * - Refresh quotes every 30s
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { SwapQuoteProps, SwapQuoteData } from "./types";
import { Effect } from "effect";
import * as DEXService from "@/lib/services/crypto/DEXService";
import { RefreshCw, TrendingUp, Zap } from "lucide-react";

const DEX_LOGOS: Record<string, string> = {
  Uniswap: "🦄",
  Sushiswap: "🍣",
  Curve: "⚫",
  "1inch": "🔷",
  Jupiter: "🪐",
};

export function SwapQuote({
  fromToken,
  toToken,
  amount = "100",
  dexes,
  onQuoteSelect,
  autoRefresh = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SwapQuoteProps) {
  const [quotes, setQuotes] = useState<SwapQuoteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeToRefresh, setTimeToRefresh] = useState(30);

  const fetchQuotes = async () => {
    if (!fromToken || !toToken || !amount) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        DEXService.getQuotes({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount,
          chainId: fromToken.chainId || 1,
          dexes,
        })
      );

      // Add logos to quotes
      const quotesWithLogos = result.map((q) => ({
        ...q,
        logo: DEX_LOGOS[q.dex] || "🔀",
      }));

      setQuotes(quotesWithLogos);
      setLastRefresh(new Date());
      setTimeToRefresh(30);
    } catch (err: any) {
      setError("Failed to fetch quotes from DEXes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [fromToken, toToken, amount]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setTimeToRefresh((prev) => {
        if (prev <= 1) {
          fetchQuotes();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const bestQuote = quotes.length > 0 ? quotes[0] : null;
  const savings =
    quotes.length > 1
      ? ((parseFloat(bestQuote!.outputAmount) - parseFloat(quotes[quotes.length - 1].outputAmount)) /
          parseFloat(quotes[quotes.length - 1].outputAmount)) *
        100
      : 0;

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
              <span className="text-2xl">💱</span>
              <span>Best Swap Rates</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Compare quotes from {quotes.length} DEXes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQuotes}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              <span className="ml-1 text-xs">{timeToRefresh}s</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Best Quote Highlight */}
        {bestQuote && !isLoading && (
          <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{bestQuote.logo}</span>
                <div>
                  <div className="font-semibold">{bestQuote.dex}</div>
                  <div className="text-xs text-muted-foreground">Best Rate</div>
                </div>
              </div>
              <Badge variant="default" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Save {savings.toFixed(2)}%
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">You Get</div>
                <div className="text-lg font-bold">
                  {formatNumber(parseFloat(bestQuote.outputAmount), 6)} {toToken?.symbol}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gas Cost</div>
                <div className="text-sm font-medium">
                  ≈ {formatCurrency(parseFloat(bestQuote.gasEstimate))}
                </div>
              </div>
            </div>
            {bestQuote.route.length > 2 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Route</div>
                <div className="flex items-center gap-1 text-xs font-mono">
                  {bestQuote.route.map((token, i) => (
                    <React.Fragment key={i}>
                      <span>{token.slice(0, 6)}...</span>
                      {i < bestQuote.route.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            <Button
              className="w-full mt-3"
              onClick={() => onQuoteSelect?.(bestQuote)}
            >
              Use This Quote
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}

        {/* All Quotes */}
        {!isLoading && quotes.length > 1 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Other Quotes
            </div>
            {quotes.slice(1).map((quote, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => onQuoteSelect?.(quote)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{quote.logo}</span>
                    <div className="font-medium">{quote.dex}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatNumber(parseFloat(quote.outputAmount), 6)} {toToken?.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gas: {formatCurrency(parseFloat(quote.gasEstimate))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Impact: {quote.priceImpact.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">
                    Fee: {quote.fee}%
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {quote.estimatedTime}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && quotes.length === 0 && !error && (
          <Alert>
            <AlertDescription>
              No quotes available. Check token selection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quote Details */}
        {quotes.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
            {autoRefresh && ` • Auto-refresh in ${timeToRefresh}s`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
