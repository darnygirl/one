/**
 * BatchSend Component
 *
 * Send to multiple addresses with:
 * - CSV upload support
 * - Manual address entry (up to 100)
 * - Preview total amounts
 * - Batch transaction execution
 * - Progress tracking
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn, formatNumber } from "../../utils";
import type { BatchSendProps, PaymentRecipient } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

export function BatchSend({
  walletAddress,
  chainId = 1,
  maxRecipients = 100,
  onSend,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: BatchSendProps) {
  const [recipients, setRecipients] = useState<PaymentRecipient[]>([]);
  const [csvInput, setCsvInput] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMemo, setManualMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PaymentService.BatchSendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = recipients.reduce(
    (sum, r) => sum + parseFloat(r.amount || "0"),
    0
  );

  const handleParseCsv = () => {
    try {
      const lines = csvInput.trim().split("\n");
      const parsed: PaymentRecipient[] = [];

      for (const line of lines) {
        const [address, amount, memo] = line.split(",").map((s) => s.trim());
        if (address && amount) {
          parsed.push({
            address,
            amount,
            memo: memo || undefined,
          });
        }
      }

      if (parsed.length > maxRecipients) {
        setError(`Maximum ${maxRecipients} recipients allowed`);
        return;
      }

      setRecipients(parsed);
      setError(null);
    } catch (err) {
      setError("Failed to parse CSV. Format: address,amount,memo");
    }
  };

  const handleAddManual = () => {
    if (!manualAddress || !manualAmount) {
      setError("Address and amount are required");
      return;
    }

    if (recipients.length >= maxRecipients) {
      setError(`Maximum ${maxRecipients} recipients allowed`);
      return;
    }

    setRecipients([
      ...recipients,
      {
        address: manualAddress,
        amount: manualAmount,
        memo: manualMemo || undefined,
      },
    ]);

    setManualAddress("");
    setManualAmount("");
    setManualMemo("");
    setError(null);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleBatchSend = async () => {
    if (recipients.length === 0) {
      setError("Add at least one recipient");
      return;
    }

    setIsSending(true);
    setProgress(0);
    setError(null);

    try {
      const batchResult = await Effect.runPromise(
        PaymentService.batchSend(recipients, chainId)
      );

      setResult(batchResult);
      setProgress(100);
      onSend?.(batchResult.txHash);
    } catch (err: any) {
      const errorMsg = err._tag === "InsufficientBalance"
        ? "Insufficient balance for batch transfer"
        : err._tag === "InvalidAddress"
        ? "One or more addresses are invalid"
        : "Batch send failed";

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearAll = () => {
    setRecipients([]);
    setCsvInput("");
    setResult(null);
    setError(null);
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
              <span className="text-2xl">📤</span>
              <span>Batch Send</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Send to multiple addresses at once
            </CardDescription>
          </div>
          <Badge variant="outline">
            {recipients.length}/{maxRecipients}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!result ? (
          <>
            {/* CSV Upload */}
            <div className="space-y-2">
              <Label htmlFor="csv">Import from CSV</Label>
              <Textarea
                id="csv"
                placeholder="address,amount,memo&#10;0x123...,0.1,Payment 1&#10;0x456...,0.2,Payment 2"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleParseCsv}
                disabled={!csvInput}
              >
                Parse CSV
              </Button>
            </div>

            {/* Manual Entry */}
            <div className="space-y-3 border-t pt-4">
              <Label>Add Recipient Manually</Label>
              <div className="grid gap-2">
                <Input
                  placeholder="Recipient address"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    step="0.000001"
                  />
                  <Input
                    placeholder="Memo (optional)"
                    value={manualMemo}
                    onChange={(e) => setManualMemo(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddManual}
                  disabled={!manualAddress || !manualAmount}
                >
                  Add Recipient
                </Button>
              </div>
            </div>

            {/* Recipients List */}
            {recipients.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Recipients ({recipients.length})</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {recipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate">
                          {recipient.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {recipient.amount} ETH
                          {recipient.memo && ` • ${recipient.memo}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(index)}
                        className="ml-2 text-destructive hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {recipients.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border-2 border-primary/20">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold">
                  {formatNumber(totalAmount)} ETH
                </span>
              </div>
            )}

            {/* Progress */}
            {isSending && (
              <div className="space-y-2">
                <Label>Processing batch...</Label>
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">
                  {progress}% complete
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Batch transaction completed successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Transaction Hash
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(result.txHash)}
                  >
                    Copy
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Successful
                  </span>
                  <Badge variant="default">{result.successful}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <Badge variant={result.failed > 0 ? "destructive" : "outline"}>
                    {result.failed}
                  </Badge>
                </div>
              </div>

              {/* Payment Details */}
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {result.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-secondary rounded text-xs"
                  >
                    <span className="font-mono truncate flex-1">
                      {payment.recipient.slice(0, 10)}...
                      {payment.recipient.slice(-8)}
                    </span>
                    <span className="mx-2">{payment.amount} ETH</span>
                    <Badge
                      variant={
                        payment.status === "success" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!result ? (
          <Button
            className="w-full"
            onClick={handleBatchSend}
            disabled={recipients.length === 0 || isSending}
          >
            {isSending ? "Sending..." : `Send to ${recipients.length} Recipients`}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleClearAll}>
            Send Another Batch
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
