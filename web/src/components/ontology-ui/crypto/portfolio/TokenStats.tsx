/**
 * TokenStats - Market statistics display
 *
 * Features:
 * - Market cap and rank
 * - 24h volume
 * - Circulating/total/max supply
 * - Holder count (if available)
 * - ATH/ATL prices with dates
 * - Formatted large numbers
 */

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Coins,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import type { MarketStats } from "@/lib/services/CryptoService";
import { formatLargeNumber, formatUsdValue } from "@/lib/services/CryptoService";

export interface TokenStatsProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  initialStats?: MarketStats;
  showSupply?: boolean;
  showATH?: boolean;
}

export function TokenStats({
  tokenId,
  tokenName,
  tokenSymbol,
  initialStats,
  showSupply = true,
  showATH = true,
}: TokenStatsProps) {
  const [stats, setStats] = useState<MarketStats | null>(initialStats || null);
  const [loading, setLoading] = useState(!initialStats);
  const [error, setError] = useState<string | null>(null);

  // Fetch token stats
  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch token stats");
      }

      const data = await response.json();
      const marketData = data.market_data;

      const newStats: MarketStats = {
        market_cap: marketData.market_cap.usd,
        market_cap_rank: marketData.market_cap_rank,
        total_volume: marketData.total_volume.usd,
        circulating_supply: marketData.circulating_supply,
        total_supply: marketData.total_supply,
        max_supply: marketData.max_supply,
        ath: marketData.ath.usd,
        ath_date: marketData.ath_date.usd,
        ath_change_percentage: marketData.ath_change_percentage.usd,
        atl: marketData.atl.usd,
        atl_date: marketData.atl_date.usd,
        atl_change_percentage: marketData.atl_change_percentage.usd,
      };

      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [tokenId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || "No stats available"}</p>
        </CardContent>
      </Card>
    );
  }

  const supplyPercentage = stats.max_supply
    ? (stats.circulating_supply / stats.max_supply) * 100
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Statistics
        </CardTitle>
        <CardDescription>
          {tokenName} ({tokenSymbol.toUpperCase()})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Cap and Rank */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Market Cap Rank</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg font-bold">
                #{stats.market_cap_rank}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
            <p className="text-2xl font-bold">
              {formatUsdValue(stats.market_cap)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Volume */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
          <p className="text-2xl font-bold">
            {formatUsdValue(stats.total_volume)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Volume/Market Cap Ratio:{" "}
            {((stats.total_volume / stats.market_cap) * 100).toFixed(2)}%
          </p>
        </div>

        {/* Supply Information */}
        {showSupply && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Supply Information</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Circulating Supply
                  </p>
                  <p className="font-medium">
                    {formatLargeNumber(stats.circulating_supply)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Supply
                  </p>
                  <p className="font-medium">
                    {formatLargeNumber(stats.total_supply)}
                  </p>
                </div>
              </div>

              {stats.max_supply && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Max Supply
                  </p>
                  <p className="font-medium mb-2">
                    {formatLargeNumber(stats.max_supply)}
                  </p>
                  {supplyPercentage !== null && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(supplyPercentage, 100)}%` }}
                      />
                    </div>
                  )}
                  {supplyPercentage !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {supplyPercentage.toFixed(1)}% of max supply in circulation
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* All-Time High and Low */}
        {showATH && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-medium">All-Time High</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ATH Price</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatUsdValue(stats.ath)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">ATH Date</p>
                  <p className="text-sm">
                    {new Date(stats.ath_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {stats.ath_change_percentage.toFixed(1)}% down from ATH
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-medium">All-Time Low</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ATL Price</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatUsdValue(stats.atl)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">ATL Date</p>
                  <p className="text-sm">
                    {new Date(stats.atl_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {Math.abs(stats.atl_change_percentage).toFixed(1)}% up from ATL
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
