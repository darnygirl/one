/**
 * TokenLiquidity - Liquidity pools display
 *
 * Features:
 * - All DEX pools (Uniswap, Sushiswap, etc.)
 * - Pool TVL and volume
 * - Pool APY
 * - Price impact calculator
 */

import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import {
  getLiquidityPools,
  type LiquidityPool,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types
// ============================================================================

interface TokenLiquidityProps {
  tokenAddress: string;
  showPriceImpact?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TokenLiquidity({
  tokenAddress,
  showPriceImpact = true,
  className = '',
}: TokenLiquidityProps) {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apy'>('tvl');

  useEffect(() => {
    const loadPools = async () => {
      setLoading(true);
      setError(null);

      const program = getLiquidityPools(tokenAddress);

      const result = await Effect.runPromise(
        Effect.catchAll(program, (error: EtherscanError) => {
          setError(error._tag);
          return Effect.succeed([]);
        })
      );

      setPools(result);
      setLoading(false);
    };

    loadPools();
  }, [tokenAddress]);

  if (loading) {
    return <TokenLiquiditySkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load liquidity pools: {error}</AlertDescription>
      </Alert>
    );
  }

  if (pools.length === 0) {
    return (
      <Alert>
        <AlertDescription>No liquidity pools found for this token</AlertDescription>
      </Alert>
    );
  }

  const sortedPools = [...pools].sort((a, b) => {
    switch (sortBy) {
      case 'tvl':
        return b.tvl - a.tvl;
      case 'volume':
        return b.volume24h - a.volume24h;
      case 'apy':
        return b.apy - a.apy;
      default:
        return 0;
    }
  });

  const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0);
  const avgAPY = pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Liquidity</p>
              <p className="text-2xl font-bold">${(totalTVL / 1e6).toFixed(2)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-bold">${(totalVolume / 1e6).toFixed(2)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg APY</p>
              <p className="text-2xl font-bold">{avgAPY.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pools List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liquidity Pools</CardTitle>
              <CardDescription>{pools.length} pools across multiple DEXes</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'tvl' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('tvl')}
              >
                TVL
              </Button>
              <Button
                variant={sortBy === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('volume')}
              >
                Volume
              </Button>
              <Button
                variant={sortBy === 'apy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('apy')}
              >
                APY
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedPools.map((pool) => (
            <PoolCard key={pool.address} pool={pool} />
          ))}
        </CardContent>
      </Card>

      {/* Price Impact Calculator */}
      {showPriceImpact && (
        <Card>
          <CardHeader>
            <CardTitle>Price Impact Calculator</CardTitle>
            <CardDescription>
              Calculate estimated price impact for your swap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriceImpactCalculator pools={pools} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function PoolCard({ pool }: { pool: LiquidityPool }) {
  const volumeToTVLRatio = (pool.volume24h / pool.tvl) * 100;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{pool.dex}</h3>
            <Badge variant="outline" className="text-xs">
              {pool.token0}/{pool.token1}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {pool.address.slice(0, 10)}...{pool.address.slice(-8)}
          </p>
        </div>
        <Badge
          variant={pool.apy > 50 ? 'default' : 'secondary'}
          className={pool.apy > 50 ? 'bg-green-100 text-green-800 border-green-300' : ''}
        >
          {pool.apy.toFixed(2)}% APY
        </Badge>
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">TVL</p>
          <p className="font-semibold">${(pool.tvl / 1e6).toFixed(2)}M</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">24h Volume</p>
          <p className="font-semibold">${(pool.volume24h / 1e6).toFixed(2)}M</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Vol/TVL</p>
          <p className="font-semibold">{volumeToTVLRatio.toFixed(2)}%</p>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full mt-3">
        View on {pool.dex}
      </Button>
    </div>
  );
}

function PriceImpactCalculator({ pools }: { pools: LiquidityPool[] }) {
  const [amount, setAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(
    pools.length > 0 ? pools[0] : null
  );

  const calculatePriceImpact = (): number => {
    if (!amount || !selectedPool) return 0;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return 0;

    // Simplified price impact calculation
    // Real implementation would use pool reserves and bonding curve
    const ratio = amountNum / selectedPool.tvl;
    const impact = ratio * 100;

    return Math.min(impact, 100);
  };

  const priceImpact = calculatePriceImpact();
  const impactColor =
    priceImpact < 1 ? 'text-green-600' :
    priceImpact < 3 ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pool">Select Pool</Label>
          <select
            id="pool"
            className="w-full px-3 py-2 border rounded-md"
            value={selectedPool?.address || ''}
            onChange={(e) => {
              const pool = pools.find((p) => p.address === e.target.value);
              setSelectedPool(pool || null);
            }}
          >
            {pools.map((pool) => (
              <option key={pool.address} value={pool.address}>
                {pool.dex} - ${(pool.tvl / 1e6).toFixed(2)}M TVL
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Swap Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {amount && selectedPool && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Estimated Price Impact</span>
            <span className={`text-lg font-bold ${impactColor}`}>
              {priceImpact.toFixed(3)}%
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pool TVL</span>
              <span className="font-medium">${(selectedPool.tvl / 1e6).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Amount</span>
              <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">% of Pool</span>
              <span className="font-medium">
                {((parseFloat(amount) / selectedPool.tvl) * 100).toFixed(4)}%
              </span>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="text-xs text-muted-foreground">
            {priceImpact < 1 && '✓ Low impact - Good for trading'}
            {priceImpact >= 1 && priceImpact < 3 && '⚠️ Moderate impact - Consider smaller size'}
            {priceImpact >= 3 && '❌ High impact - Use smaller amounts or different pool'}
          </div>
        </div>
      )}
    </div>
  );
}

function TokenLiquiditySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
