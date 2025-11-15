/**
 * ChatReceipt Component
 *
 * Show payment receipt in chat with:
 * - Transaction summary
 * - From/to addresses with ENS
 * - Amount and USD value
 * - Transaction hash with explorer link
 * - Timestamp
 * - Download PDF option
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatReceiptProps } from "./types";

export function ChatReceipt({
  txHash,
  type,
  from,
  fromEns,
  to,
  toEns,
  amount,
  token,
  usdValue,
  timestamp,
  confirmations = 12,
  gasUsed,
  gasCost,
  description,
  invoiceNumber,
  showDownload = true,
  onDownload,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatReceiptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string, ensName?: string) => {
    if (ensName) return ensName;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeIcon = (type: ChatReceiptProps["type"]) => {
    switch (type) {
      case "payment": return "💸";
      case "tip": return "💰";
      case "invoice": return "📄";
      case "split": return "💰";
      case "escrow": return "🔒";
      default: return "💳";
    }
  };

  const getTypeLabel = (type: ChatReceiptProps["type"]) => {
    switch (type) {
      case "payment": return "Payment";
      case "tip": return "Tip";
      case "invoice": return "Invoice Payment";
      case "split": return "Bill Split Payment";
      case "escrow": return "Escrow Payment";
      default: return "Transaction";
    }
  };

  const explorerUrl = `https://etherscan.io/tx/${txHash}`;

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
              <span className="text-2xl">{getTypeIcon(type)}</span>
              <span>{getTypeLabel(type)} Receipt</span>
            </CardTitle>
            {invoiceNumber && (
              <CardDescription className="mt-1 font-mono">
                {invoiceNumber}
              </CardDescription>
            )}
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            ✓ Confirmed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="p-4 bg-secondary rounded-lg text-center">
          <div className="text-3xl font-bold text-primary">
            {amount} {token}
          </div>
          {usdValue && (
            <div className="text-lg text-muted-foreground mt-1">
              ≈ {formatCurrency(parseFloat(usdValue))}
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-3">
          {/* From */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">From</span>
            <div className="text-right">
              <p className="text-sm font-medium">{formatAddress(from, fromEns)}</p>
              {fromEns && (
                <p className="text-xs text-muted-foreground font-mono">{from.slice(0, 10)}...</p>
              )}
            </div>
          </div>

          {/* To */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">To</span>
            <div className="text-right">
              <p className="text-sm font-medium">{formatAddress(to, toEns)}</p>
              {toEns && (
                <p className="text-xs text-muted-foreground font-mono">{to.slice(0, 10)}...</p>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="text-sm font-medium">{formatDate(timestamp)}</span>
          </div>

          {/* Confirmations */}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Confirmations</span>
            <Badge variant="outline">{confirmations}</Badge>
          </div>

          {/* Gas */}
          {gasUsed && gasCost && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gas Used</span>
                <span className="text-sm font-medium">{formatNumber(parseInt(gasUsed))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gas Cost</span>
                <span className="text-sm font-medium">{gasCost} ETH</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Transaction Hash */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Transaction Hash</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(txHash)}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <code className="text-xs font-mono break-all">
              {txHash}
            </code>
          </div>
        </div>

        {/* Explorer Link */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(explorerUrl, '_blank')}
        >
          View on Etherscan →
        </Button>

        {/* Download Section */}
        {showDownload && (
          <>
            <Separator />
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium">PDF Receipt</p>
                    <p className="text-xs text-muted-foreground">
                      Download for your records
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onDownload}
                >
                  Download
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground">
          This receipt is generated automatically and serves as proof of payment
        </div>
      </CardContent>
    </Card>
  );
}
