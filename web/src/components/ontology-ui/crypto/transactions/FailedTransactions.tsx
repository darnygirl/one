/**
 * FailedTransactions Component
 *
 * List of failed transactions with error messages and retry functionality.
 * Provides suggested gas prices and support contact.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  type FailedTransaction,
} from "@/lib/services/crypto/TransactionService";

interface FailedTransactionsProps {
  transactions: FailedTransaction[];
  onRetry?: (hash: string, gasPrice?: string) => void;
  onContactSupport?: (hash: string) => void;
  className?: string;
}

export function FailedTransactions({
  transactions,
  onRetry,
  onContactSupport,
  className,
}: FailedTransactionsProps) {
  const [selectedTx, setSelectedTx] = useState<FailedTransaction | null>(null);
  const [retryGasPrice, setRetryGasPrice] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!selectedTx) return;

    setIsRetrying(true);
    try {
      await onRetry?.(selectedTx.hash, retryGasPrice || undefined);
      setSelectedTx(null);
      setRetryGasPrice("");
    } finally {
      setIsRetrying(false);
    }
  };

  const parseErrorMessage = (error: string): {
    title: string;
    description: string;
    solution: string;
  } => {
    // Parse common error messages
    if (error.includes("insufficient funds")) {
      return {
        title: "Insufficient Funds",
        description: "You don't have enough balance to complete this transaction.",
        solution: "Add funds to your wallet and try again.",
      };
    }

    if (error.includes("gas too low")) {
      return {
        title: "Gas Price Too Low",
        description: "The gas price was too low for miners to process the transaction.",
        solution: "Retry with a higher gas price.",
      };
    }

    if (error.includes("nonce too low")) {
      return {
        title: "Nonce Error",
        description: "This transaction has already been processed.",
        solution: "Check your transaction history for duplicates.",
      };
    }

    if (error.includes("execution reverted")) {
      return {
        title: "Contract Execution Failed",
        description: "The smart contract rejected this transaction.",
        solution: "Check contract requirements and try again.",
      };
    }

    return {
      title: "Transaction Failed",
      description: error,
      solution: "Review the error details and try again.",
    };
  };

  const TransactionItem = ({ tx }: { tx: FailedTransaction }) => {
    const explorerUrl = getTransactionExplorerUrl(tx.hash, tx.chainId);
    const errorInfo = parseErrorMessage(tx.errorMessage);
    const suggestedGas = tx.suggestedGasPrice
      ? (parseInt(tx.suggestedGasPrice, 16) / 1e9).toFixed(2)
      : null;

    return (
      <AccordionItem value={tx.hash}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex-1 min-w-0 text-left">
              <div className="font-mono text-sm mb-1">
                {formatTransactionHash(tx.hash)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {tx.type}
                </Badge>
                <span>•</span>
                <span>{tx.chainName}</span>
                <span>•</span>
                <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            <Badge variant="destructive">Failed</Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-4 pt-4">
            {/* Error Details */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-destructive">{errorInfo.title}</div>
              <div className="text-sm text-muted-foreground">
                {errorInfo.description}
              </div>
              {tx.errorCode && (
                <div className="text-xs font-mono text-muted-foreground">
                  Error Code: {tx.errorCode}
                </div>
              )}
            </div>

            {/* Solution */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="font-semibold text-sm mb-1">Suggested Solution</div>
              <div className="text-sm text-muted-foreground">{errorInfo.solution}</div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span className="font-mono text-xs">
                  {formatTransactionHash(tx.from, 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-xs">
                  {formatTransactionHash(tx.to, 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Value</span>
                <span>
                  {(parseFloat(tx.value) / 1e18).toFixed(6)} {tx.token?.symbol || "ETH"}
                </span>
              </div>
              {tx.gasPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Price Used</span>
                  <span className="font-mono">
                    {(parseInt(tx.gasPrice, 16) / 1e9).toFixed(2)} Gwei
                  </span>
                </div>
              )}
              {suggestedGas && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suggested Gas Price</span>
                  <span className="font-mono text-green-600">{suggestedGas} Gwei</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  View on Explorer
                </a>
              </Button>

              {tx.canRetry && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTx(tx);
                        setRetryGasPrice(suggestedGas || "");
                      }}
                    >
                      🔄 Retry Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retry Transaction</DialogTitle>
                      <DialogDescription>
                        Retry this transaction with adjusted parameters
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        <div className="font-medium mb-1">Original Error</div>
                        <div className="text-muted-foreground">{errorInfo.title}</div>
                      </div>

                      <div>
                        <Label htmlFor="retryGasPrice">
                          Gas Price (Gwei) {suggestedGas && "(Suggested)"}
                        </Label>
                        <Input
                          id="retryGasPrice"
                          type="number"
                          value={retryGasPrice}
                          onChange={(e) => setRetryGasPrice(e.target.value)}
                          placeholder="Enter gas price"
                        />
                      </div>

                      <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="w-full"
                      >
                        {isRetrying ? "Retrying..." : "Confirm Retry"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onContactSupport?.(tx.hash)}
              >
                Support
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Failed Transactions</CardTitle>
        <CardDescription>
          {transactions.length} failed transaction
          {transactions.length !== 1 ? "s" : ""} requiring attention
        </CardDescription>
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            ✓ No failed transactions
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {transactions.map((tx) => (
              <TransactionItem key={tx.hash} tx={tx} />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
