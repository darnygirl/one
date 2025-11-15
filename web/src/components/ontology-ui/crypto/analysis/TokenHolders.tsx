/**
 * TokenHolders - Top token holders display
 *
 * Features:
 * - Top 100 holders list
 * - Holder address with ENS
 * - Balance and percentage
 * - Whale alert badges
 * - Holder chart (pie/bar)
 */

import { useEffect, useState } from 'react';
import { Effect } from 'effect';
import {
  getTokenHolders,
  type TokenHolder,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================================
// Types
// ============================================================================

interface TokenHoldersProps {
  tokenAddress: string;
  limit?: number;
  showChart?: boolean;
  showWhaleAlert?: boolean;
  className?: string;
}

type ViewMode = 'list' | 'chart';
type ChartType = 'bar' | 'pie';

// ============================================================================
// Component
// ============================================================================

export function TokenHolders({
  tokenAddress,
  limit = 100,
  showChart = true,
  showWhaleAlert = true,
  className = '',
}: TokenHoldersProps) {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [filteredHolders, setFilteredHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    const loadHolders = async () => {
      setLoading(true);
      setError(null);

      const program = getTokenHolders(tokenAddress, limit);

      const result = await Effect.runPromise(
        Effect.catchAll(program, (error: EtherscanError) => {
          setError(error._tag);
          return Effect.succeed([]);
        })
      );

      setHolders(result);
      setFilteredHolders(result);
      setLoading(false);
    };

    loadHolders();
  }, [tokenAddress, limit]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredHolders(holders);
      return;
    }

    const filtered = holders.filter(
      (holder) =>
        holder.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holder.ensName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHolders(filtered);
  }, [searchQuery, holders]);

  if (loading) {
    return <TokenHoldersSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load holders: {error}</AlertDescription>
      </Alert>
    );
  }

  if (holders.length === 0) {
    return (
      <Alert>
        <AlertDescription>No holders found</AlertDescription>
      </Alert>
    );
  }

  const whaleCount = holders.filter((h) => h.isWhale).length;
  const top10Percentage = holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
  const top50Percentage = holders.slice(0, 50).reduce((sum, h) => sum + h.percentage, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Token Holders</CardTitle>
            <CardDescription>
              {holders.length} holders • Top 10: {top10Percentage.toFixed(2)}% • Top 50:{' '}
              {top50Percentage.toFixed(2)}%
            </CardDescription>
          </div>
          {showWhaleAlert && whaleCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              🐋 {whaleCount} Whales
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and View Toggle */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by address or ENS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {showChart && (
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                Chart
              </Button>
            </div>
          )}
        </div>

        {viewMode === 'list' ? (
          <HoldersList holders={filteredHolders} showWhaleAlert={showWhaleAlert} />
        ) : (
          <HoldersChart holders={filteredHolders.slice(0, 20)} type={chartType} />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function HoldersList({
  holders,
  showWhaleAlert,
}: {
  holders: TokenHolder[];
  showWhaleAlert: boolean;
}) {
  const [expandedCount, setExpandedCount] = useState(10);

  const displayedHolders = holders.slice(0, expandedCount);
  const hasMore = holders.length > expandedCount;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-1">#</div>
        <div className="col-span-6">Address</div>
        <div className="col-span-3 text-right">Balance</div>
        <div className="col-span-2 text-right">%</div>
      </div>

      {/* Holders */}
      {displayedHolders.map((holder, index) => (
        <HolderRow
          key={holder.address}
          holder={holder}
          rank={index + 1}
          showWhaleAlert={showWhaleAlert}
        />
      ))}

      {/* Load More */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setExpandedCount((prev) => prev + 20)}
        >
          Load More ({holders.length - expandedCount} remaining)
        </Button>
      )}
    </div>
  );
}

function HolderRow({
  holder,
  rank,
  showWhaleAlert,
}: {
  holder: TokenHolder;
  rank: number;
  showWhaleAlert: boolean;
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(holder.address);
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-muted/50 rounded px-2 transition-colors">
      <div className="col-span-1 text-sm font-medium text-muted-foreground">
        {rank}
      </div>

      <div className="col-span-6">
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="font-mono text-sm hover:text-primary transition-colors"
            title={holder.address}
          >
            {holder.ensName || `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}
          </button>
          {showWhaleAlert && holder.isWhale && (
            <Badge variant="destructive" className="text-xs">
              🐋 Whale
            </Badge>
          )}
        </div>
        {holder.ensName && (
          <p className="font-mono text-xs text-muted-foreground">
            {holder.address.slice(0, 10)}...{holder.address.slice(-8)}
          </p>
        )}
      </div>

      <div className="col-span-3 text-right">
        <p className="text-sm font-medium">
          {Number(holder.balance).toLocaleString()}
        </p>
      </div>

      <div className="col-span-2 text-right">
        <div className="space-y-1">
          <p className="text-sm font-medium">{holder.percentage.toFixed(2)}%</p>
          <Progress value={holder.percentage} className="h-1" />
        </div>
      </div>
    </div>
  );
}

function HoldersChart({ holders, type }: { holders: TokenHolder[]; type: ChartType }) {
  if (type === 'bar') {
    return (
      <div className="space-y-2">
        {holders.map((holder, index) => (
          <div key={holder.address} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-mono">
                #{index + 1}{' '}
                {holder.ensName || `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}
              </span>
              <span className="font-medium">{holder.percentage.toFixed(2)}%</span>
            </div>
            <Progress value={holder.percentage} className="h-3" />
          </div>
        ))}
      </div>
    );
  }

  // Pie chart representation (simplified)
  return (
    <div className="space-y-4">
      <PieChartVisualization holders={holders} />
      <div className="grid grid-cols-2 gap-2">
        {holders.slice(0, 10).map((holder, index) => (
          <div key={holder.address} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColorForIndex(index) }}
            />
            <span className="font-mono text-xs truncate">
              {holder.ensName || `${holder.address.slice(0, 6)}...`}
            </span>
            <span className="ml-auto font-medium">{holder.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChartVisualization({ holders }: { holders: TokenHolder[] }) {
  const total = holders.reduce((sum, h) => sum + h.percentage, 0);
  let currentAngle = 0;

  return (
    <div className="flex justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="40" />
        {holders.slice(0, 10).map((holder, index) => {
          const percentage = holder.percentage;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          currentAngle = endAngle;

          // Convert to radians
          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          // Calculate arc path
          const x1 = 100 + 80 * Math.cos(startRad);
          const y1 = 100 + 80 * Math.sin(startRad);
          const x2 = 100 + 80 * Math.cos(endRad);
          const y2 = 100 + 80 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={holder.address}
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={getColorForIndex(index)}
              opacity={0.8}
            />
          );
        })}
        <circle cx="100" cy="100" r="50" fill="white" />
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold"
        >
          Top {Math.min(holders.length, 10)}
        </text>
      </svg>
    </div>
  );
}

function getColorForIndex(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
  ];
  return colors[index % colors.length];
}

function TokenHoldersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </CardContent>
    </Card>
  );
}
