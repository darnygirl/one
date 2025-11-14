/**
 * PaymentConfirmation Component (Cycle 42)
 *
 * Payment confirmation screen with success animation
 * - Success animation and checkmark
 * - Transaction hash with block explorer link
 * - Receipt download (PDF/CSV)
 * - Order details summary
 * - Next steps and instructions
 * - Support contact information
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
import { Separator } from "@/components/ui/separator";
import { cn } from "../../utils";
import type { PaymentConfirmationProps } from "./types";

export function PaymentConfirmation({
  confirmation,
  onDownloadReceipt,
  onClose,
  showSupportInfo = true,
  supportEmail = "support@example.com",
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: PaymentConfirmationProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      // Mock receipt generation - replace with actual PDF generation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onDownloadReceipt?.();

      // Create mock receipt file
      const receiptData = `
Payment Receipt
===============
Transaction Hash: ${confirmation.transactionHash}
Amount: ${confirmation.amount} ${confirmation.currency}
Status: ${confirmation.status}
Confirmations: ${confirmation.confirmations}
Date: ${new Date(confirmation.timestamp).toLocaleString()}
      `.trim();

      const blob = new Blob([receiptData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${confirmation.paymentId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const getBlockExplorerUrl = () => {
    const explorers: Record<string, string> = {
      ETH: "https://etherscan.io/tx/",
      USDC: "https://etherscan.io/tx/",
      USDT: "https://etherscan.io/tx/",
      DAI: "https://etherscan.io/tx/",
      MATIC: "https://polygonscan.com/tx/",
      BTC: "https://blockstream.info/tx/",
    };
    const baseUrl = explorers[confirmation.currency] || "https://etherscan.io/tx/";
    return `${baseUrl}${confirmation.transactionHash}`;
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
        className
      )}
    >
      <CardHeader className="text-center">
        {/* Success Animation */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-5xl text-white">✓</span>
            </div>
          </div>
        </div>

        <CardTitle className="text-3xl text-green-600 dark:text-green-400">
          Payment Successful!
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Your payment has been confirmed on the blockchain
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Details */}
        <div className="bg-secondary rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount Paid</span>
            <span className="font-mono font-bold text-lg">
              {confirmation.amount} {confirmation.currency}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Confirmations</span>
            <span className="text-sm font-medium text-green-600">
              {confirmation.confirmations} blocks
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="text-sm font-medium">
              {new Date(confirmation.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Transaction Hash */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Hash</label>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-secondary px-3 py-2 rounded flex-1 overflow-hidden font-mono">
              {confirmation.transactionHash.slice(0, 20)}...
              {confirmation.transactionHash.slice(-16)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(confirmation.transactionHash)
              }
              title="Copy transaction hash"
            >
              📋
            </Button>
          </div>
          <a
            href={getBlockExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View on Block Explorer →
          </a>
        </div>

        <Separator />

        {/* Next Steps */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Next Steps</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Payment confirmed and recorded</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Receipt emailed to your address</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">→</span>
              <span>Access your purchase in your account dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">→</span>
              <span>Download receipt for your records</span>
            </div>
          </div>
        </div>

        {/* Support Info */}
        {showSupportInfo && (
          <>
            <Separator />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Need Help?</p>
              <p className="text-sm text-muted-foreground mb-2">
                If you have any questions about your payment, please contact our
                support team.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownloadReceipt}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "📄 Download Receipt"}
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}
