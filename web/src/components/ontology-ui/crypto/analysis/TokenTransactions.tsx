/**
 * TokenTransactions - Recent transactions display
 *
 * Features:
 * - Live transaction feed
 * - Buy/sell indicators
 * - Transaction amount and USD value
 * - Wallet addresses (truncated)
 * - Block explorer links
 * - Transaction type badges
 * - Virtualized list for performance
 */

import { useEffect, useState, useRef } from 'react';
import { Effect } from 'effect';
import {
  getTokenTransactions,
  type Transaction,
  type EtherscanError,
} from '@/lib/services/crypto/EtherscanService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// Types
// ============================================================================

interface TokenTransactionsProps {
  tokenAddress: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
  className?: string;
}

type FilterType = 'all' | 'buy' | 'sell' | 'transfer';

// ============================================================================
// Component
// ============================================================================

export function TokenTransactions({
  tokenAddress,
  limit = 50,
  autoRefresh = false,
  refreshInterval = 10000,
  showFilters = true,
  className = '',
}: TokenTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadTransactions = async () => {
    const program = getTokenTransactions(tokenAddress, limit);

    const result = await Effect.runPromise(
      Effect.catchAll(program, (error: EtherscanError) => {
        setError(error._tag);
        return Effect.succeed([]);
      })
    );

    setTransactions(result);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();

    if (autoRefresh) {
      intervalRef.current = setInterval(loadTransactions, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tokenAddress, limit, autoRefresh, refreshInterval]);

  useEffect(() => {
    let filtered = transactions;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filter, searchQuery]);

  if (loading) {
    return <TokenTransactionsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load transactions: {error}</AlertDescription>
      </Alert>
    );
  }

  if (transactions.length === 0) {
    return (
      <Alert>
        <AlertDescription>No transactions found</AlertDescription>
      </Alert>
    );
  }

  const stats = {
    total: transactions.length,
    buy: transactions.filter((tx) => tx.type === 'buy').length,
    sell: transactions.filter((tx) => tx.type === 'sell').length,
    transfer: transactions.filter((tx) => tx.type === 'transfer').length,
    totalVolume: transactions.reduce((sum, tx) => sum + tx.valueUSD, 0),
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transactions • ${stats.totalVolume.toLocaleString()}{' '}
              total volume
            </CardDescription>
          </div>
          {autoRefresh && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🔄 Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3">
          <StatBadge label="All" count={stats.total} active={filter === 'all'} />
          <StatBadge label="Buy" count={stats.buy} active={filter === 'buy'} color="green" />
          <StatBadge label="Sell" count={stats.sell} active={filter === 'sell'} color="red" />
          <StatBadge
            label="Transfer"
            count={stats.transfer}
            active={filter === 'transfer'}
            color="blue"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2">
            <Input
              placeholder="Search by hash or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
            >
              <option value="all">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        )}

        <Separator />

        {/* Transactions List */}
        <TransactionsList transactions={filteredTransactions} />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatBadge({
  label,
  count,
  active,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  color?: 'green' | 'red' | 'blue';
}) {
  const bgColor = active
    ? color === 'green'
      ? 'bg-green-100 border-green-300'
      : color === 'red'
      ? 'bg-red-100 border-red-300'
      : color === 'blue'
      ? 'bg-blue-100 border-blue-300'
      : 'bg-primary/10 border-primary/30'
    : 'bg-muted/50';

  return (
    <div className={`p-3 border rounded-lg ${bgColor} transition-colors`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{count}</p>
    </div>
  );
}

function TransactionsList({ transactions }: { transactions: Transaction[] }) {
  const [visibleCount, setVisibleCount] = useState(20);

  const displayedTransactions = transactions.slice(0, visibleCount);
  const hasMore = transactions.length > visibleCount;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-2">Type</div>
        <div className="col-span-3">From</div>
        <div className="col-span-3">To</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-right">Time</div>
      </div>

      {/* Transactions */}
      <div className="space-y-1">
        {displayedTransactions.map((tx) => (
          <TransactionRow key={tx.hash} transaction={tx} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setVisibleCount((prev) => prev + 20)}
        >
          Load More ({transactions.length - visibleCount} remaining)
        </Button>
      )}
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const typeColors = {
    buy: 'bg-green-100 text-green-800 border-green-300',
    sell: 'bg-red-100 text-red-800 border-red-300',
    transfer: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const typeIcons = {
    buy: '📈',
    sell: '📉',
    transfer: '↔️',
  };

  const timeAgo = formatTimeAgo(transaction.timestamp);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInExplorer = () => {
    window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank');
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 px-2 hover:bg-muted/50 rounded transition-colors text-sm">
      {/* Type */}
      <div className="col-span-2">
        <Badge variant="outline" className={`${typeColors[transaction.type]} text-xs`}>
          {typeIcons[transaction.type]} {transaction.type}
        </Badge>
      </div>

      {/* From */}
      <div className="col-span-3">
        <button
          onClick={() => copyToClipboard(transaction.from)}
          className="font-mono text-xs hover:text-primary transition-colors"
          title={transaction.from}
        >
          {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
        </button>
      </div>

      {/* To */}
      <div className="col-span-3">
        <button
          onClick={() => copyToClipboard(transaction.to)}
          className="font-mono text-xs hover:text-primary transition-colors"
          title={transaction.to}
        >
          {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
        </button>
      </div>

      {/* Amount */}
      <div className="col-span-2 text-right">
        <div>
          <p className="font-medium text-xs">{Number(transaction.value).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">${transaction.valueUSD.toLocaleString()}</p>
        </div>
      </div>

      {/* Time */}
      <div className="col-span-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs text-muted-foreground" title={new Date(transaction.timestamp).toLocaleString()}>
            {timeAgo}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={openInExplorer}
            title="View on Etherscan"
          >
            🔗
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function TokenTransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-10" />
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
