/**
 * TokenPrice - Real-time token price display
 *
 * Features:
 * - Current price (USD, ETH, BTC)
 * - 24h high/low
 * - Mini sparkline chart
 * - Live price updates (30s interval)
 * - Price change indicator
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import type { TokenPrice as TokenPriceType } from "@/lib/services/CryptoService";
import {
  formatPriceChange,
  getPriceChangeColor,
} from "@/lib/services/CryptoService";

export interface TokenPriceProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  initialPrice?: TokenPriceType;
  showSparkline?: boolean;
  showMultipleCurrencies?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onPriceUpdate?: (price: TokenPriceType) => void;
}

export function TokenPrice({
  tokenId,
  tokenName,
  tokenSymbol,
  initialPrice,
  showSparkline = true,
  showMultipleCurrencies = false,
  autoRefresh = true,
  refreshInterval = 30000,
  onPriceUpdate,
}: TokenPriceProps) {
  const [price, setPrice] = useState<TokenPriceType | null>(initialPrice || null);
  const [loading, setLoading] = useState(!initialPrice);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch price data
  const fetchPrice = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd,eth,btc&include_24hr_change=true&include_last_updated_at=true`
      );
      const data = await response.json();
      const tokenPrice = data[tokenId];

      if (tokenPrice) {
        const newPrice: TokenPriceType = {
          usd: tokenPrice.usd,
          eth: tokenPrice.eth,
          btc: tokenPrice.btc,
          usd_24h_change: tokenPrice.usd_24h_change,
          last_updated_at: tokenPrice.last_updated_at,
        };

        setPrice(newPrice);
        setPriceHistory((prev) => [...prev.slice(-29), newPrice.usd]);
        setLastUpdate(new Date());
        onPriceUpdate?.(newPrice);
      }
    } catch (error) {
      console.error("Failed to fetch price:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!initialPrice) {
      fetchPrice();
    }
  }, [tokenId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tokenId]);

  if (loading || !price) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const changeColor = getPriceChangeColor(price.usd_24h_change);
  const sparklineColor =
    price.usd_24h_change >= 0
      ? "rgb(34, 197, 94)"
      : "rgb(239, 68, 68)";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{tokenName}</CardTitle>
            <CardDescription>{tokenSymbol.toUpperCase()}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold">
              ${price.usd.toLocaleString()}
            </span>
            <div className={`flex items-center gap-1 text-lg font-medium ${changeColor}`}>
              {price.usd_24h_change > 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : price.usd_24h_change < 0 ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              {formatPriceChange(price.usd_24h_change)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">24h change</p>
        </div>

        {/* Multiple Currencies */}
        {showMultipleCurrencies && price.eth && price.btc && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ETH Price</p>
              <p className="font-mono font-medium">
                {price.eth.toFixed(6)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">BTC Price</p>
              <p className="font-mono font-medium">
                {price.btc.toFixed(8)} BTC
              </p>
            </div>
          </div>
        )}

        {/* Sparkline Chart */}
        {showSparkline && priceHistory.length > 1 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Price History (Last {priceHistory.length} updates)
            </p>
            <div className="border rounded-lg p-2 bg-muted/20">
              <Sparklines data={priceHistory} width={400} height={80}>
                <SparklinesLine color={sparklineColor} style={{ strokeWidth: 2 }} />
              </Sparklines>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          {autoRefresh && (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Auto-refreshing every {refreshInterval / 1000}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
