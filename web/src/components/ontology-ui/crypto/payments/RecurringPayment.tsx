/**
 * RecurringPayment Component
 *
 * Set up recurring payments with:
 * - Frequency selector (daily/weekly/monthly)
 * - Start/end date
 * - Auto-execute or require approval
 * - Payment history
 * - Cancel/pause subscription
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { cn, formatDate, formatCurrency } from "../../utils";
import type { RecurringPaymentProps } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

export function RecurringPayment({
  walletAddress,
  chainId = 1,
  onSchedule,
  onCancel,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: RecurringPaymentProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [payment, setPayment] = useState<PaymentService.RecurringPayment | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!recipientAddress || !amount) {
      setError("Recipient and amount are required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const recurringPayment = await Effect.runPromise(
        PaymentService.createRecurringPayment(
          recipientAddress,
          amount,
          currency,
          frequency,
          new Date(startDate).getTime(),
          endDate ? new Date(endDate).getTime() : undefined,
          autoExecute
        )
      );

      setPayment(recurringPayment);
      onSchedule?.(recurringPayment.id);
    } catch (err: any) {
      const errorMsg = err._tag === "InvalidAddress"
        ? "Invalid recipient address"
        : err._tag === "InvalidAmount"
        ? "Invalid amount"
        : "Failed to create recurring payment";

      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteNow = async () => {
    if (!payment) return;

    try {
      await Effect.runPromise(PaymentService.executeRecurringPayment(payment));
      // Refresh payment data
      setPayment({
        ...payment,
        history: [
          ...payment.history,
          {
            date: Date.now(),
            amount: payment.amount,
            status: "success",
          },
        ],
      });
    } catch (err) {
      setError("Failed to execute payment");
    }
  };

  const handleCancel = async () => {
    if (!payment) return;

    try {
      const cancelled = await Effect.runPromise(
        PaymentService.cancelRecurringPayment(payment.id)
      );
      setPayment(cancelled);
      onCancel?.(payment.id);
    } catch (err) {
      setError("Failed to cancel payment");
    }
  };

  const handlePause = () => {
    if (!payment) return;
    setPayment({ ...payment, status: "paused" });
  };

  const handleResume = () => {
    if (!payment) return;
    setPayment({ ...payment, status: "active" });
  };

  const frequencyLabels = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };

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
              <span className="text-2xl">🔄</span>
              <span>Recurring Payment</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Schedule automatic recurring payments
            </CardDescription>
          </div>
          {payment && (
            <Badge
              variant={
                payment.status === "active"
                  ? "default"
                  : payment.status === "paused"
                  ? "secondary"
                  : "outline"
              }
            >
              {payment.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!payment ? (
          <>
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x... or name.eth"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.000001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Auto Execute */}
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="autoExecute">Auto-Execute Payments</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send payments without approval
                </p>
              </div>
              <Switch
                id="autoExecute"
                checked={autoExecute}
                onCheckedChange={setAutoExecute}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Payment Details */}
            <div className="space-y-3 p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm font-bold">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frequency</span>
                <Badge variant="outline">
                  {frequencyLabels[payment.frequency]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Next Payment
                </span>
                <span className="text-sm">{formatDate(payment.nextPayment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recipient</span>
                <span className="text-xs font-mono">
                  {payment.recipient.slice(0, 8)}...
                  {payment.recipient.slice(-6)}
                </span>
              </div>
            </div>

            {/* Payment History */}
            {payment.history.length > 0 && (
              <div className="space-y-2">
                <Label>Payment History</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {payment.history.map((hist, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
                    >
                      <span>{formatDate(hist.date)}</span>
                      <span>
                        {hist.amount} {payment.currency}
                      </span>
                      <Badge
                        variant={
                          hist.status === "success"
                            ? "default"
                            : hist.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {hist.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!payment ? (
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!recipientAddress || !amount || isCreating}
          >
            {isCreating ? "Creating..." : "Schedule Recurring Payment"}
          </Button>
        ) : payment.status === "cancelled" ? (
          <Button className="w-full" onClick={() => setPayment(null)}>
            Create New Payment
          </Button>
        ) : (
          <>
            {!autoExecute && payment.status === "active" && (
              <Button variant="outline" onClick={handleExecuteNow}>
                Pay Now
              </Button>
            )}
            <Button
              variant="outline"
              onClick={payment.status === "active" ? handlePause : handleResume}
            >
              {payment.status === "active" ? "Pause" : "Resume"}
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
