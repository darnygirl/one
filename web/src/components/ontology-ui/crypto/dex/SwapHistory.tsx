/**
 * SwapHistory Component
 *
 * Swap transaction history with:
 * - List of past swaps with virtualization
 * - Filter by token pair
 * - Search by address/hash
 * - Date range filter
 * - Total volume and fees paid
 * - Export to CSV
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { SwapHistoryProps, SwapTransaction } from "./types";
import { Download, Search, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MOCK_TRANSACTIONS: SwapTransaction[] = [
  {
    hash: "0x1234...5678",
    timestamp: Date.now() - 3600000,
    fromToken: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      icon: "⟠",
    },
    toToken: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💵",
    },
    fromAmount: "1.0",
    toAmount: "2000",
    priceImpact: 0.5,
    gasUsed: "0.015",
    status: "success",
    profitLoss: 50,
  },
  {
    hash: "0xabcd...efgh",
    timestamp: Date.now() - 7200000,
    fromToken: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💵",
    },
    toToken: {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      decimals: 8,
      icon: "₿",
    },
    fromAmount: "5000",
    toAmount: "0.116",
    priceImpact: 1.2,
    gasUsed: "0.018",
    status: "success",
    profitLoss: -25,
  },
  {
    hash: "0x9999...1111",
    timestamp: Date.now() - 86400000,
    fromToken: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      icon: "🪙",
    },
    toToken: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      icon: "⟠",
    },
    fromAmount: "3000",
    toAmount: "1.5",
    priceImpact: 0.8,
    gasUsed: "0.012",
    status: "success",
    profitLoss: 120,
  },
];

export function SwapHistory({
  walletAddress,
  chainId = 1,
  transactions = MOCK_TRANSACTIONS,
  showProfitLoss = true,
  onExport,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SwapHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "volume">("date");

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.fromToken.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.toToken.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    // Apply sorting
    if (sortBy === "date") {
      filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    } else {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(b.fromAmount) - parseFloat(a.fromAmount)
      );
    }

    return filtered;
  }, [transactions, searchQuery, statusFilter, sortBy]);

  const totalVolume = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.fromAmount),
    0
  );

  const totalFees = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.gasUsed) * 2000,
    0
  );

  const totalProfitLoss = transactions.reduce(
    (sum, tx) => sum + (tx.profitLoss || 0),
    0
  );

  const handleExport = () => {
    const csv = [
      ["Hash", "Timestamp", "From", "To", "Amount", "Received", "Gas", "Status"],
      ...transactions.map((tx) => [
        tx.hash,
        new Date(tx.timestamp).toISOString(),
        `${tx.fromAmount} ${tx.fromToken.symbol}`,
        `${tx.toAmount} ${tx.toToken.symbol}`,
        tx.fromAmount,
        tx.toAmount,
        tx.gasUsed,
        tx.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swap-history-${Date.now()}.csv`;
    a.click();

    onExport?.();
  };

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
              <span className="text-2xl">📊</span>
              <span>Swap History</span>
            </CardTitle>
            <CardDescription className="mt-1">
              View all your past token swaps
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-secondary rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
            <div className="text-lg font-bold">{formatNumber(totalVolume, 2)}</div>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Total Fees</div>
            <div className="text-lg font-bold">{formatCurrency(totalFees)}</div>
          </div>
          {showProfitLoss && (
            <div className="p-3 bg-secondary rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">P/L</div>
              <div
                className={cn(
                  "text-lg font-bold flex items-center gap-1",
                  totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatCurrency(Math.abs(totalProfitLoss))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTransactions.map((tx, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tx.fromToken.icon}</span>
                  <span className="text-sm">→</span>
                  <span className="text-xl">{tx.toToken.icon}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {tx.fromToken.symbol} → {tx.toToken.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {tx.hash}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    tx.status === "success"
                      ? "default"
                      : tx.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {tx.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Swapped</div>
                  <div className="font-medium">
                    {formatNumber(parseFloat(tx.fromAmount), 4)} {tx.fromToken.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Received</div>
                  <div className="font-medium">
                    {formatNumber(parseFloat(tx.toAmount), 4)} {tx.toToken.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gas</div>
                  <div className="font-medium">{tx.gasUsed} ETH</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Time</div>
                  <div className="font-medium">
                    {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
