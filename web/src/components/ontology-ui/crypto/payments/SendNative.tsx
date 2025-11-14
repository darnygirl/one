/**
 * SendNative Component
 *
 * Send native cryptocurrency (ETH/SOL/MATIC) with:
 * - Simplified interface
 * - Max button with gas reservation
 * - USD value preview
 * - Quick amount buttons
 */

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { SendNativeProps } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

const QUICK_AMOUNTS_USD = [10, 50, 100, 500];

const NATIVE_SYMBOLS: Record<number, { symbol: string; price: number }> = {
  1: { symbol: "ETH", price: 2400 },
  137: { symbol: "MATIC", price: 0.85 },
  42161: { symbol: "ETH", price: 2400 },
  10: { symbol: "ETH", price: 2400 },
  8453: { symbol: "ETH", price: 2400 },
};

export function SendNative({
  walletAddress,
  chainId = 1,
  balance = "0",
  symbol,
  onSend,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SendNativeProps) {
  const nativeInfo = NATIVE_SYMBOLS[chainId] || NATIVE_SYMBOLS[1];
  const nativeSymbol = symbol || nativeInfo.symbol;
  const nativePrice = nativeInfo.price;

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoadingGas, setIsLoadingGas] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>("0.00");
  const [gasReserve, setGasReserve] = useState<string>("0.001");
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usdValue = amount
    ? (parseFloat(amount) * nativePrice).toFixed(2)
    : "0.00";

  const handleMaxClick = () => {
    const maxAmount = Math.max(
      0,
      parseFloat(balance) - parseFloat(gasReserve)
    );
    setAmount(maxAmount.toFixed(6));
  };

  const handleQuickAmount = (usdAmount: number) => {
    const nativeAmount = (usdAmount / nativePrice).toFixed(6);
    setAmount(nativeAmount);
  };

  const handleEstimateGas = async () => {
    if (!recipientAddress) return;

    setIsLoadingGas(true);
    setError(null);

    try {
      const estimate = await Effect.runPromise(
        PaymentService.estimateGas(recipientAddress, amount || "0", undefined, chainId)
      );
      setGasEstimate(estimate.average.usdCost.toFixed(2));
      setGasReserve((parseFloat(estimate.average.gasPrice) * 21000 / 1e9).toFixed(6));
    } catch (err) {
      setError("Failed to estimate gas fees");
      onError?.("Gas estimation failed");
    } finally {
      setIsLoadingGas(false);
    }
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount) return;

    setIsSending(true);
    setError(null);

    try {
      const tx = await Effect.runPromise(
        PaymentService.sendNative({
          recipientAddress,
          amount,
          chainId,
          reserveGas: true,
        })
      );

      setTxHash(tx.hash);
      setShowConfirmation(true);
      onSend?.(tx.hash);

      // Reset form
      setRecipientAddress("");
      setAmount("");
    } catch (err: any) {
      const errorMsg = err._tag === "InsufficientBalance"
        ? `Insufficient balance. Need ${err.required} but have ${err.available}`
        : err._tag === "InvalidAddress"
        ? "Invalid recipient address"
        : "Transaction failed";

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (recipientAddress && amount) {
      handleEstimateGas();
    }
  }, [recipientAddress, amount]);

  const canSend =
    recipientAddress &&
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(balance);

  return (
    <>
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
                <span className="text-2xl">⚡</span>
                <span>Send {nativeSymbol}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Send native currency instantly
              </CardDescription>
            </div>
            <Badge variant="outline">{nativeSymbol}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Available Balance
            </div>
            <div className="text-2xl font-bold">
              {formatNumber(parseFloat(balance))} {nativeSymbol}
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ {formatCurrency(parseFloat(balance) * nativePrice)}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick Amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS_USD.map((usd) => (
                <Button
                  key={usd}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(usd)}
                >
                  ${usd}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x... or name.eth"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ENS names are supported
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount ({nativeSymbol})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
              >
                Max (reserves gas)
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
            />
            <div className="text-sm font-medium">
              ≈ {formatCurrency(parseFloat(usdValue))}
            </div>
          </div>

          {/* Gas Estimate */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">
              Estimated Gas Fee
            </span>
            {isLoadingGas ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-medium">
                ≈ {formatCurrency(parseFloat(gasEstimate))}
              </span>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!canSend || isSending}
          >
            {isSending ? "Sending..." : `Send ${nativeSymbol}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Sent!</DialogTitle>
            <DialogDescription>
              Your {nativeSymbol} transfer has been submitted to the network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">
                {amount} {nativeSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">USD Value</span>
              <span className="text-sm font-medium">
                {formatCurrency(parseFloat(usdValue))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-mono">
                {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
              </span>
            </div>
            {txHash && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction Hash
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(txHash)}
                >
                  Copy
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
