/**
 * TransactionStatus Component
 *
 * Real-time transaction status with progress bar and confirmation counter.
 * Shows estimated time remaining and WebSocket updates.
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
import { cn } from "../../utils";
import {
  formatTransactionHash,
  getTransactionExplorerUrl,
  getTransactionStatusColor,
  type Transaction,
} from "@/lib/services/crypto/TransactionService";

interface TransactionStatusProps {
  transaction: Transaction;
  targetConfirmations?: number;
  onComplete?: (transaction: Transaction) => void;
  enableRealtime?: boolean;
  className?: string;
}

export function TransactionStatus({
  transaction: initialTransaction,
  targetConfirmations = 12,
  onComplete,
  enableRealtime = true,
  className,
}: TransactionStatusProps) {
  const [transaction, setTransaction] = useState(initialTransaction);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate progress percentage
  const progress = Math.min(
    (transaction.confirmations / targetConfirmations) * 100,
    100
  );

  const isComplete = transaction.confirmations >= targetConfirmations;
  const isPending = transaction.status === "pending";
  const isFailed = transaction.status === "failed";

  // Estimate time remaining
  useEffect(() => {
    if (isComplete || isFailed) {
      setTimeRemaining(null);
      return;
    }

    const confirmationsLeft = targetConfirmations - transaction.confirmations;
    const avgBlockTime = 12; // seconds per block (Ethereum)
    const estimated = confirmationsLeft * avgBlockTime;
    setTimeRemaining(estimated);

    // Update countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction.confirmations, targetConfirmations, isComplete, isFailed]);

  // Real-time updates (mock implementation - replace with actual WebSocket)
  useEffect(() => {
    if (!enableRealtime || isComplete || isFailed) return;

    const interval = setInterval(() => {
      // Simulate confirmation updates
      setTransaction((prev) => {
        const newConfirmations = Math.min(prev.confirmations + 1, targetConfirmations);
        const updated = {
          ...prev,
          confirmations: newConfirmations,
          status:
            newConfirmations >= targetConfirmations
              ? ("confirmed" as const)
              : prev.status,
        };

        if (newConfirmations >= targetConfirmations) {
          onComplete?.(updated);
        }

        return updated;
      });
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [enableRealtime, isComplete, isFailed, targetConfirmations, onComplete]);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const explorerUrl = getTransactionExplorerUrl(transaction.hash, transaction.chainId);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription className="font-mono text-xs">
              {formatTransactionHash(transaction.hash)}
            </CardDescription>
          </div>
          <Badge className={getTransactionStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confirmations</span>
            <span className="font-medium">
              {transaction.confirmations} / {targetConfirmations}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Remaining */}
        {timeRemaining !== null && !isComplete && !isFailed && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Estimated Time Remaining
            </div>
            <div className="text-2xl font-bold">
              {formatTimeRemaining(timeRemaining)}
            </div>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-lg font-medium text-green-600 dark:text-green-400">
              ✓ Transaction Confirmed
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Your transaction has been confirmed on the blockchain
            </div>
          </div>
        )}

        {/* Failed Message */}
        {isFailed && (
          <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-lg font-medium text-destructive">
              ✗ Transaction Failed
            </div>
            {transaction.error && (
              <div className="text-sm text-muted-foreground mt-1">
                {transaction.error}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Block Number</span>
            <span className="font-mono">
              {transaction.blockNumber || "Pending..."}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Network</span>
            <Badge variant="secondary">{transaction.chainName}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{transaction.type}</span>
          </div>
        </div>

        {/* Real-time Indicator */}
        {enableRealtime && isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full" />
            <span>Updating in real-time</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
