/**
 * RefundProcessor Component (Cycle 45)
 *
 * Handle crypto payment refunds
 * - Refund request form with reason
 * - Support partial/full refunds
 * - Track refund status (pending, processing, completed, failed)
 * - Automatic refund execution to source address
 * - Refund notifications
 * - Display refund history
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "../../utils";
import type { RefundProcessorProps, RefundReason, RefundStatus, CryptoRefund } from "./types";

export function RefundProcessor({
  paymentId,
  maxAmount,
  currency,
  onRefund,
  onCancel,
  allowPartialRefund = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: RefundProcessorProps) {
  const [refundAmount, setRefundAmount] = useState(maxAmount);
  const [refundAddress, setRefundAddress] = useState("");
  const [reason, setReason] = useState<RefundReason>("customer_request");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<RefundStatus | null>(null);
  const [refund, setRefund] = useState<CryptoRefund | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxAmountNum = parseFloat(maxAmount);
  const refundAmountNum = parseFloat(refundAmount || "0");
  const isPartialRefund = refundAmountNum < maxAmountNum;

  const reasonOptions: { value: RefundReason; label: string }[] = [
    { value: "customer_request", label: "Customer Request" },
    { value: "duplicate", label: "Duplicate Payment" },
    { value: "fraudulent", label: "Fraudulent Transaction" },
    { value: "defective_product", label: "Defective Product" },
    { value: "not_as_described", label: "Not as Described" },
    { value: "other", label: "Other" },
  ];

  const statusConfig: Record<
    RefundStatus,
    { icon: string; color: string; label: string; progress: number }
  > = {
    pending: { icon: "⏳", color: "text-yellow-600", label: "Pending Review", progress: 25 },
    processing: {
      icon: "🔄",
      color: "text-blue-600",
      label: "Processing Refund",
      progress: 50,
    },
    completed: { icon: "✓", color: "text-green-600", label: "Refund Completed", progress: 100 },
    failed: { icon: "✗", color: "text-red-600", label: "Refund Failed", progress: 0 },
    cancelled: { icon: "✕", color: "text-gray-600", label: "Refund Cancelled", progress: 0 },
  };

  const handleSubmit = async () => {
    if (!refundAddress || refundAmountNum <= 0 || refundAmountNum > maxAmountNum) {
      return;
    }

    setIsProcessing(true);
    setStatus("pending");

    try {
      // Simulate refund processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("processing");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const completedRefund: CryptoRefund = {
        id: `ref_${Date.now()}`,
        paymentId,
        amount: refundAmount,
        currency,
        status: "completed",
        reason,
        notes: notes || undefined,
        refundAddress,
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        processedAt: Date.now(),
        createdAt: Date.now() - 3000,
      };

      setRefund(completedRefund);
      setStatus("completed");
      onRefund?.(completedRefund);
    } catch (error) {
      setStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (status && status !== "completed") {
      setStatus("cancelled");
    }
    onCancel?.();
  };

  const config = status ? statusConfig[status] : null;

  // Show refund form
  if (!status || status === "cancelled") {
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
        <CardHeader>
          <CardTitle>Request Refund</CardTitle>
          <CardDescription>
            Process a refund for payment {paymentId.slice(0, 12)}...
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Info */}
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Payment</span>
              <span className="font-mono font-medium">
                {maxAmount} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment ID</span>
              <code className="text-xs">
                {paymentId.slice(0, 12)}...{paymentId.slice(-8)}
              </code>
            </div>
          </div>

          <Separator />

          {/* Refund Amount */}
          <div className="space-y-2">
            <Label htmlFor="refundAmount">
              Refund Amount
              {isPartialRefund && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Partial Refund)
                </span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="refundAmount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={maxAmount}
                min="0"
                step="0.000001"
                disabled={!allowPartialRefund}
                className="flex-1"
              />
              <span className="text-sm font-medium">{currency}</span>
            </div>
            {allowPartialRefund && (
              <p className="text-xs text-muted-foreground">
                Maximum refund: {maxAmount} {currency}
              </p>
            )}
          </div>

          {/* Refund Address */}
          <div className="space-y-2">
            <Label htmlFor="refundAddress">Refund Address *</Label>
            <Input
              id="refundAddress"
              value={refundAddress}
              onChange={(e) => setRefundAddress(e.target.value)}
              placeholder={currency === "BTC" ? "bc1q..." : "0x..."}
            />
            <p className="text-xs text-muted-foreground">
              Funds will be sent to this {currency} address
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Refund Reason</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as RefundReason)}
            >
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <textarea
              id="notes"
              className="w-full min-h-20 px-3 py-2 text-sm rounded-md border border-input bg-background"
              placeholder="Provide additional details about the refund reason..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Refunds cannot be reversed once processed. Please verify the refund
              address carefully.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              !refundAddress ||
              refundAmountNum <= 0 ||
              refundAmountNum > maxAmountNum ||
              isProcessing
            }
          >
            {isProcessing ? "Processing..." : "Process Refund"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show refund status
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
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{config?.icon}</span>
              <span>Refund Status</span>
            </CardTitle>
            <CardDescription className={cn("font-medium mt-1", config?.color)}>
              {config?.label}
            </CardDescription>
          </div>
          <Badge variant={status === "completed" ? "default" : "outline"}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        {config && config.progress < 100 && (
          <div className="space-y-3">
            <Progress value={config.progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {config.label}...
            </p>
          </div>
        )}

        {/* Refund Details */}
        {refund && (
          <>
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Refund Amount</span>
                <span className="font-mono font-bold text-lg">
                  {refund.amount} {refund.currency}
                </span>
              </div>

              {refund.transactionHash && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction Hash</span>
                  <code className="text-xs">
                    {refund.transactionHash.slice(0, 12)}...
                    {refund.transactionHash.slice(-8)}
                  </code>
                </div>
              )}

              {refund.processedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Processed At</span>
                  <span className="text-sm font-medium">
                    {new Date(refund.processedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Refund Details</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="capitalize">{refund.reason.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Address:</span>
                  <code className="text-xs">
                    {refund.refundAddress.slice(0, 12)}...
                    {refund.refundAddress.slice(-8)}
                  </code>
                </div>
                {refund.notes && (
                  <div className="pt-2">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="text-muted-foreground mt-1">{refund.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Success Message */}
        {status === "completed" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Refund has been successfully processed and sent to the specified address.
              Funds should arrive within 15-30 minutes depending on network congestion.
            </p>
          </div>
        )}

        {/* Error Message */}
        {status === "failed" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              ✗ Refund processing failed. Please contact support for assistance.
            </p>
          </div>
        )}
      </CardContent>

      {status === "completed" && (
        <CardFooter>
          <Button className="w-full" onClick={handleCancel}>
            Close
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
