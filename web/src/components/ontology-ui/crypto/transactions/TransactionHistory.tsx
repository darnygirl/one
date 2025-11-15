/**
 * TransactionHistory Component
 *
 * Full transaction history with virtualized list, filtering, and search.
 * Supports date range filtering, type filtering, and CSV export.
 */

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../utils";
import {
  formatTransactionHash,
  getTransactionStatusColor,
  getTransactionTypeIcon,
  type Transaction,
  type TransactionType,
  type TransactionStatus,
} from "@/lib/services/crypto/TransactionService";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onExport?: (format: "csv") => void;
  pageSize?: number;
  enableVirtualization?: boolean;
  className?: string;
}

export function TransactionHistory({
  transactions,
  onTransactionClick,
  onExport,
  pageSize = 50,
  enableVirtualization = true,
  className,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesHash = tx.hash.toLowerCase().includes(query);
        const matchesFrom = tx.from.toLowerCase().includes(query);
        const matchesTo = tx.to.toLowerCase().includes(query);
        if (!matchesHash && !matchesFrom && !matchesTo) return false;
      }

      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;

      // Date range filter
      if (dateRange.start) {
        const startDate = new Date(dateRange.start).getTime();
        if (tx.timestamp < startDate) return false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end).getTime();
        if (tx.timestamp > endDate) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter, dateRange]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  // Transaction row renderer
  const TransactionRow = ({ tx }: { tx: Transaction }) => (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors",
        className
      )}
      onClick={() => onTransactionClick?.(tx)}
    >
      {/* Type Icon */}
      <div className="text-2xl">{getTransactionTypeIcon(tx.type)}</div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {formatTransactionHash(tx.hash)}
          </span>
          <Badge variant="outline" className="capitalize">
            {tx.type}
          </Badge>
          <Badge className={getTransactionStatusColor(tx.status)}>
            {tx.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          <span className="mr-4">From: {formatTransactionHash(tx.from, 8)}</span>
          <span>To: {formatTransactionHash(tx.to, 8)}</span>
        </div>
      </div>

      {/* Value */}
      <div className="text-right">
        <div className="font-medium">
          {(parseFloat(tx.value) / 1e18).toFixed(6)} {tx.token?.symbol || "ETH"}
        </div>
        {tx.valueUsd && (
          <div className="text-sm text-muted-foreground">${tx.valueUsd.toFixed(2)}</div>
        )}
      </div>

      {/* Date */}
      <div className="text-sm text-muted-foreground text-right">
        {new Date(tx.timestamp).toLocaleDateString()}
        <br />
        {new Date(tx.timestamp).toLocaleTimeString()}
      </div>

      {/* Chain */}
      <Badge variant="secondary">{tx.chainName}</Badge>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button onClick={() => onExport?.("csv")} variant="outline">
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <Input
            placeholder="Search by hash or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as TransactionType | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TransactionStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Transaction List */}
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {paginatedTransactions.map((tx) => (
              <TransactionRow key={tx.hash} tx={tx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
