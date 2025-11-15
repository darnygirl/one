/**
 * SendToken Component
 *
 * Send ERC-20/SPL tokens with:
 * - Token selection dropdown
 * - Amount input with max button
 * - ENS-supported recipient input
 * - Gas fee estimation
 * - Transaction confirmation
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { SendTokenProps, Token } from "./types";
import { Effect } from "effect";
import * as PaymentService from "@/lib/services/crypto/PaymentService";

const MOCK_TOKENS: Token[] = [
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    balance: "1000.50",
    usdValue: 1000.5,
    icon: "💵",
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    balance: "500.25",
    usdValue: 500.25,
    icon: "💲",
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    balance: "250.00",
    usdValue: 250.0,
    icon: "🪙",
  },
];

export function SendToken({
  walletAddress,
  chainId = 1,
  tokens = MOCK_TOKENS,
  onSend,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SendTokenProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(tokens[0] || null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoadingGas, setIsLoadingGas] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>("0.00");
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalUsdValue = selectedToken && amount
    ? (parseFloat(amount) * (selectedToken.usdValue || 0)).toFixed(2)
    : "0.00";

  const handleMaxClick = () => {
    if (selectedToken?.balance) {
      setAmount(selectedToken.balance);
    }
  };

  const handleEstimateGas = async () => {
    if (!recipientAddress || !selectedToken) return;

    setIsLoadingGas(true);
    setError(null);

    try {
      const estimate = await Effect.runPromise(
        PaymentService.estimateGas(recipientAddress, amount || "0", undefined, chainId)
      );
      setGasEstimate(estimate.average.usdCost.toFixed(2));
    } catch (err) {
      setError("Failed to estimate gas fees");
      onError?.("Gas estimation failed");
    } finally {
      setIsLoadingGas(false);
    }
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount || !selectedToken) return;

    setIsSending(true);
    setError(null);

    try {
      const tx = await Effect.runPromise(
        PaymentService.sendToken({
          tokenAddress: selectedToken.address,
          recipientAddress,
          amount,
          chainId,
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
    if (recipientAddress && amount && selectedToken) {
      handleEstimateGas();
    }
  }, [recipientAddress, amount, selectedToken]);

  const canSend =
    recipientAddress &&
    amount &&
    selectedToken &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(selectedToken.balance || "0");

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
                <span className="text-2xl">💸</span>
                <span>Send Token</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Send ERC-20 tokens to any address
              </CardDescription>
            </div>
            <Badge variant="outline">Chain {chainId}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select
              value={selectedToken?.address}
              onValueChange={(addr) =>
                setSelectedToken(tokens.find((t) => t.address === addr) || null)
              }
            >
              <SelectTrigger id="token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex items-center gap-2">
                      <span>{token.icon}</span>
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        {token.balance}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedToken && (
              <p className="text-xs text-muted-foreground">
                Balance: {selectedToken.balance} {selectedToken.symbol} (
                {formatCurrency(selectedToken.usdValue || 0)})
              </p>
            )}
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
              <Label htmlFor="amount">Amount</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
              >
                Max
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
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(parseFloat(totalUsdValue))}
            </p>
          </div>

          {/* Gas Estimate */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">Gas Fee</span>
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
            {isSending ? "Sending..." : "Send Token"}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Sent!</DialogTitle>
            <DialogDescription>
              Your token transfer has been submitted to the network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">
                {amount} {selectedToken?.symbol}
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
