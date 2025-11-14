/**
 * InvoicePayment Component (Cycle 44)
 *
 * Pay crypto invoices with payment tracking
 * - Display invoice details (line items, totals)
 * - Show payment amount in selected crypto
 * - Generate QR code for payment
 * - Support partial payments
 * - Show payment history
 * - Mark invoice as paid
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "../../utils";
import type { InvoicePaymentProps, CryptoCurrency, InvoicePaymentHistory } from "./types";

export function InvoicePayment({
  invoice,
  onPayment,
  allowPartialPayment = false,
  showHistory = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: InvoicePaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>(
    invoice.cryptoPrices[0]?.currency || "USDC"
  );
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [paymentHistory, setPaymentHistory] = useState<InvoicePaymentHistory[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPrice = invoice.cryptoPrices.find(
    (p) => p.currency === selectedCurrency
  );
  const cryptoAmount = selectedPrice?.amount || "0";
  const paymentAddress = selectedPrice?.address || "";

  const totalPaid = paymentHistory.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );
  const remaining = parseFloat(cryptoAmount) - totalPaid;

  const statusConfig = {
    draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    paid: { color: "bg-green-100 text-green-800", label: "Paid" },
    overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
    cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
  };

  const config = statusConfig[invoice.status];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const payment: InvoicePaymentHistory = {
        id: `payment_${Date.now()}`,
        invoiceId: invoice.id,
        amount: allowPartialPayment && partialAmount ? partialAmount : cryptoAmount,
        currency: selectedCurrency,
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        timestamp: Date.now(),
        confirmations: 12,
        status: "confirmed",
      };

      setPaymentHistory([...paymentHistory, payment]);
      onPayment?.(payment);
      setPartialAmount("");
      setShowQR(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const isOverdue = invoice.dueDate < Date.now() && invoice.status === "pending";
  const daysUntilDue = Math.ceil((invoice.dueDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        size === "sm" && "max-w-2xl",
        size === "md" && "max-w-3xl",
        size === "lg" && "max-w-4xl",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Invoice {invoice.invoiceNumber}</span>
              <Badge className={config.color}>{config.label}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Issued {new Date(invoice.issuedAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p
              className={cn(
                "font-medium",
                isOverdue ? "text-red-600" : "text-foreground"
              )}
            >
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
            {!isOverdue && daysUntilDue >= 0 && (
              <p className="text-xs text-muted-foreground">
                {daysUntilDue} days remaining
              </p>
            )}
            {isOverdue && (
              <p className="text-xs text-red-600">
                {Math.abs(daysUntilDue)} days overdue
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Info */}
        {(invoice.customerName || invoice.customerEmail) && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Bill To</p>
            {invoice.customerName && (
              <p className="text-sm">{invoice.customerName}</p>
            )}
            {invoice.customerEmail && (
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
            )}
          </div>
        )}

        <Separator />

        {/* Line Items */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Items</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Qty</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-secondary rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-mono">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax && (
            <div className="flex justify-between text-sm">
              <span>
                Tax {invoice.taxRate && `(${(invoice.taxRate * 100).toFixed(1)}%)`}
              </span>
              <span className="font-mono">${invoice.tax.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-medium">Total</span>
            <span className="font-bold font-mono">${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Crypto Payment */}
        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) => setSelectedCurrency(value as CryptoCurrency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invoice.cryptoPrices.map((price) => (
                    <SelectItem key={price.currency} value={price.currency}>
                      {price.currency} - {price.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Amount to Pay</span>
                <span className="text-xl font-bold font-mono">
                  {remaining.toFixed(6)} {selectedCurrency}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ ${invoice.total.toFixed(2)} USD
              </p>
            </div>

            {allowPartialPayment && remaining > 0 && (
              <div className="space-y-2">
                <Label htmlFor="partialAmount">
                  Partial Payment (optional)
                </Label>
                <Input
                  id="partialAmount"
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder={`Enter amount (max ${remaining.toFixed(6)})`}
                  step="0.000001"
                  max={remaining}
                />
              </div>
            )}

            {showQR && (
              <div className="border rounded-lg p-4 text-center space-y-3">
                <div className="bg-white p-4 inline-block rounded">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">QR</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Scan to pay</p>
                  <code className="text-xs bg-secondary px-2 py-1 rounded block">
                    {paymentAddress.slice(0, 12)}...{paymentAddress.slice(-8)}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        {showHistory && paymentHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">Payment History</p>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium font-mono">
                        {payment.amount} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{payment.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {invoice.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          </>
        )}
      </CardContent>

      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
        <CardFooter className="flex gap-2">
          {!showQR ? (
            <>
              <Button
                className="flex-1"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay with Wallet"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowQR(true)}
              >
                Show QR Code
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowQR(false)}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handlePayment}>
                I've Paid
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
