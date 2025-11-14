/**
 * PendingTransactions Component
 *
 * Live feed of pending transactions with speed up and cancel actions.
 * Auto-refreshes and shows estimated confirmation time.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "../../utils";
import {
  formatTransactionHash,
  getTransactionExplorerUrl,
  type PendingTransaction,
} from "@/lib/services/crypto/TransactionService";

interface PendingTransactionsProps {
  transactions: PendingTransaction[];
  onSpeedUp?: (hash: string, newGasPrice: string) => void;
  onCancel?: (hash: string) => void;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function PendingTransactions({
  transactions,
  onSpeedUp,
  onCancel,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 10000,
  className,
}: PendingTransactionsProps) {
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);
  const [speedUpGasPrice, setSpeedUpGasPrice] = useState("");
  const [isSpeedingUp, setIsSpeedingUp] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleSpeedUp = async () => {
    if (!selectedTx || !speedUpGasPrice) return;

    setIsSpeedingUp(true);
    try {
      await onSpeedUp?.(selectedTx.hash, speedUpGasPrice);
      setSelectedTx(null);
      setSpeedUpGasPrice("");
    } finally {
      setIsSpeedingUp(false);
    }
  };

  const handleCancel = async (tx: PendingTransaction) => {
    if (!confirm("Are you sure you want to cancel this transaction?")) return;

    setIsCancelling(true);
    try {
      await onCancel?.(tx.hash);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatEstimatedTime = (seconds: number): string => {
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `~${minutes}m`;
  };

  const TransactionItem = ({ tx }: { tx: PendingTransaction }) => {
    const explorerUrl = getTransactionExplorerUrl(tx.hash, tx.chainId);
    const currentGasPrice = tx.gasPrice
      ? (parseInt(tx.gasPrice, 16) / 1e9).toFixed(2)
      : "0";

    return (
      <div className="border rounded-lg p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm mb-1">
              {formatTransactionHash(tx.hash)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {tx.type}
              </Badge>
              <span>•</span>
              <span>{tx.chainName}</span>
            </div>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            Pending
          </Badge>
        </div>

        {/* Value */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-medium">
            {(parseFloat(tx.value) / 1e18).toFixed(6)} {tx.token?.symbol || "ETH"}
          </span>
        </div>

        {/* Gas Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gas Price</span>
          <span className="font-mono text-sm">{currentGasPrice} Gwei</span>
        </div>

        {/* Confirmations Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confirmations</span>
            <span>{tx.confirmations} / 12</span>
          </div>
          <Progress value={(tx.confirmations / 12) * 100} className="h-1" />
        </div>

        {/* Estimated Time */}
        {tx.estimatedConfirmTime && (
          <div className="text-center text-sm text-muted-foreground">
            Estimated time: {formatEstimatedTime(tx.estimatedConfirmTime)}
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              View
            </a>
          </Button>

          {tx.canSpeedUp && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTx(tx);
                    setSpeedUpGasPrice(
                      (parseFloat(currentGasPrice) * 1.2).toFixed(2)
                    );
                  }}
                >
                  ⚡ Speed Up
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Speed Up Transaction</DialogTitle>
                  <DialogDescription>
                    Increase gas price to prioritize this transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gasPrice">New Gas Price (Gwei)</Label>
                    <Input
                      id="gasPrice"
                      type="number"
                      value={speedUpGasPrice}
                      onChange={(e) => setSpeedUpGasPrice(e.target.value)}
                      placeholder="Enter new gas price"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Current: {currentGasPrice} Gwei
                    </div>
                  </div>
                  <Button
                    onClick={handleSpeedUp}
                    disabled={isSpeedingUp || !speedUpGasPrice}
                    className="w-full"
                  >
                    {isSpeedingUp ? "Speeding Up..." : "Confirm Speed Up"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {tx.canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancel(tx)}
              disabled={isCancelling}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Replacement Info */}
        {tx.replacementTx && (
          <div className="text-xs text-muted-foreground text-center">
            Replaced by: {formatTransactionHash(tx.replacementTx, 8)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Pending Transactions
              {autoRefresh && (
                <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full" />
              )}
            </CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}{" "}
              waiting for confirmation
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No pending transactions
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <TransactionItem key={tx.hash} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
