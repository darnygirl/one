/**
 * TransactionDetail Component
 *
 * Transaction details modal with full information.
 * Shows block explorer link, gas details, confirmations, and more.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../utils";
import {
  getTransactionExplorerUrl,
  getTransactionStatusColor,
  getTransactionTypeIcon,
  formatGasUsed,
  type Transaction,
} from "@/lib/services/crypto/TransactionService";

interface TransactionDetailProps {
  transaction: Transaction;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function TransactionDetail({
  transaction,
  trigger,
  open,
  onOpenChange,
  className,
}: TransactionDetailProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const explorerUrl = getTransactionExplorerUrl(transaction.hash, transaction.chainId);

  const DetailRow = ({
    label,
    value,
    copyable,
  }: {
    label: string;
    value: string | React.ReactNode;
    copyable?: string;
  }) => (
    <div className="flex items-start justify-between py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(copyable, label)}
          >
            {copied === label ? "✓" : "📋"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn("max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getTransactionTypeIcon(transaction.type)}</span>
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Complete information for this blockchain transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={getTransactionStatusColor(transaction.status)} variant="default">
              {transaction.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {transaction.type}
            </Badge>
            <Badge variant="secondary">{transaction.chainName}</Badge>
          </div>

          <Separator />

          {/* Transaction Hash */}
          <DetailRow
            label="Transaction Hash"
            value={transaction.hash}
            copyable={transaction.hash}
          />

          {/* Block Number */}
          {transaction.blockNumber && (
            <DetailRow label="Block Number" value={transaction.blockNumber.toString()} />
          )}

          {/* Confirmations */}
          <DetailRow
            label="Confirmations"
            value={
              <Badge variant={transaction.confirmations >= 12 ? "default" : "secondary"}>
                {transaction.confirmations} / 12
              </Badge>
            }
          />

          <Separator />

          {/* From Address */}
          <DetailRow label="From" value={transaction.from} copyable={transaction.from} />

          {/* To Address */}
          <DetailRow label="To" value={transaction.to} copyable={transaction.to} />

          {/* Value */}
          <DetailRow
            label="Value"
            value={
              <div className="text-right">
                <div>
                  {(parseFloat(transaction.value) / 1e18).toFixed(6)}{" "}
                  {transaction.token?.symbol || "ETH"}
                </div>
                {transaction.valueUsd && (
                  <div className="text-xs text-muted-foreground">
                    ${transaction.valueUsd.toFixed(2)}
                  </div>
                )}
              </div>
            }
          />

          <Separator />

          {/* Gas Details */}
          {transaction.gasUsed && transaction.gasPrice && (
            <>
              <DetailRow label="Gas Used" value={transaction.gasUsed} />
              <DetailRow
                label="Gas Price"
                value={`${(parseInt(transaction.gasPrice, 16) / 1e9).toFixed(2)} Gwei`}
              />
              <DetailRow
                label="Transaction Fee"
                value={
                  <div className="text-right">
                    <div>
                      {formatGasUsed(transaction.gasUsed, transaction.gasPrice)} ETH
                    </div>
                    {transaction.gasCostUsd && (
                      <div className="text-xs text-muted-foreground">
                        ${transaction.gasCostUsd.toFixed(2)}
                      </div>
                    )}
                  </div>
                }
              />
            </>
          )}

          <Separator />

          {/* Timestamp */}
          <DetailRow
            label="Timestamp"
            value={
              <div className="text-right">
                <div>{new Date(transaction.timestamp).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(transaction.timestamp).toISOString()}
                </div>
              </div>
            }
          />

          {/* Nonce */}
          {transaction.nonce !== undefined && (
            <DetailRow label="Nonce" value={transaction.nonce.toString()} />
          )}

          {/* Input Data */}
          {transaction.data && transaction.data !== "0x" && (
            <DetailRow
              label="Input Data"
              value={`${transaction.data.slice(0, 10)}...`}
              copyable={transaction.data}
            />
          )}

          {/* Error (if failed) */}
          {transaction.error && (
            <>
              <Separator />
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="text-sm font-medium text-destructive mb-1">Error</div>
                <div className="text-sm text-muted-foreground">{transaction.error}</div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Explorer
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(transaction.hash, "Transaction Hash")}
            >
              {copied === "Transaction Hash" ? "Copied!" : "Copy Hash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
