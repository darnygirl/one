/**
 * TransactionReceipt Component
 *
 * Printable transaction receipt with professional design.
 * Includes QR code, company logo, and PDF download.
 */

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "../../utils";
import {
  formatTransactionHash,
  getTransactionExplorerUrl,
  type Transaction,
} from "@/lib/services/crypto/TransactionService";

interface TransactionReceiptProps {
  transaction: Transaction;
  companyName?: string;
  companyLogo?: string;
  receiptNumber?: string;
  showQRCode?: boolean;
  className?: string;
}

export function TransactionReceipt({
  transaction,
  companyName = "Your Company",
  companyLogo,
  receiptNumber,
  showQRCode = true,
  className,
}: TransactionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generatedReceiptNumber =
    receiptNumber || `RCP-${transaction.hash.slice(2, 10).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // In a real implementation, use jsPDF
    // For now, trigger print dialog
    window.print();
  };

  const explorerUrl = getTransactionExplorerUrl(transaction.hash, transaction.chainId);

  // Generate QR code data URL (mock - replace with actual QR generation)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${transaction.hash}`;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Action Buttons (hidden in print) */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          🖨️ Print Receipt
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline">
          📥 Download PDF
        </Button>
      </div>

      {/* Receipt Card */}
      <Card ref={receiptRef} className="print:shadow-none print:border-0">
        <CardHeader className="text-center border-b">
          {/* Company Logo */}
          {companyLogo && (
            <div className="flex justify-center mb-4">
              <img src={companyLogo} alt={companyName} className="h-16" />
            </div>
          )}

          {/* Company Name */}
          <CardTitle className="text-2xl">{companyName}</CardTitle>
          <CardDescription>Transaction Receipt</CardDescription>

          {/* Receipt Number */}
          <div className="mt-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {generatedReceiptNumber}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Transaction Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Transaction Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="font-medium">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div className="font-medium">
                  {new Date(transaction.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{transaction.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <Badge variant="default">{transaction.status}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Transaction Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Hash</span>
                <span className="font-mono text-xs">
                  {formatTransactionHash(transaction.hash, 16)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span className="font-mono text-xs">
                  {formatTransactionHash(transaction.from, 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-xs">
                  {formatTransactionHash(transaction.to, 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">{transaction.chainName}</span>
              </div>
              {transaction.blockNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Number</span>
                  <span className="font-medium">{transaction.blockNumber}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Amount Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Amount Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-xl font-bold">
                  {(parseFloat(transaction.value) / 1e18).toFixed(6)}{" "}
                  {transaction.token?.symbol || "ETH"}
                </span>
              </div>
              {transaction.valueUsd && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Value (USD)</span>
                  <span className="font-medium">${transaction.valueUsd.toFixed(2)}</span>
                </div>
              )}
              {transaction.gasCost && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span className="font-medium">{transaction.gasCost} ETH</span>
                </div>
              )}
              {transaction.gasCostUsd && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Fee (USD)</span>
                  <span className="font-medium">${transaction.gasCostUsd.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          {showQRCode && (
            <>
              <Separator />
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm text-muted-foreground">Scan to verify</div>
                <img src={qrCodeUrl} alt="Transaction QR Code" className="w-32 h-32" />
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTransactionHash(transaction.hash)}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <Separator />
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <div>This receipt is generated automatically by the blockchain.</div>
            <div className="font-mono">
              Verify at:{" "}
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline print:text-black"
              >
                {explorerUrl.replace("https://", "")}
              </a>
            </div>
            <div className="mt-4">
              Generated on {new Date().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${receiptRef.current && `
            #${receiptRef.current.id},
            #${receiptRef.current.id} * {
              visibility: visible;
            }
            #${receiptRef.current.id} {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          `}
        }
      `}</style>
    </div>
  );
}
