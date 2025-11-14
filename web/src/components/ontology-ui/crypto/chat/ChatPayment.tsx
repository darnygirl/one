/**
 * ChatPayment Component
 *
 * Send crypto in chat messages with:
 * - Inline payment button in chat
 * - Token and amount selection
 * - Recipient detection from chat context
 * - Quick payment confirmation
 * - Payment receipt in chat bubble
 * - Transaction hash display
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatPaymentProps, Token } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, balance: "1000.50", usdValue: 1, icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, balance: "500.25", usdValue: 1, icon: "💲" },
  { address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ethereum", decimals: 18, balance: "2.5", usdValue: 2400, icon: "💎" },
];

export function ChatPayment({
  chatId,
  recipientId,
  recipientName = "User",
  recipientAddress = "0x1234567890123456789012345678901234567890",
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  defaultAmount,
  onSend,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatPaymentProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [amount, setAmount] = useState(defaultAmount || "");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalUsdValue = amount && selectedToken
    ? (parseFloat(amount) * (selectedToken.usdValue || 0)).toFixed(2)
    : "0.00";

  const handleSend = async () => {
    if (!amount || !recipientAddress) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        ChatPaymentService.sendChatPayment({
          recipientId: recipientId || "unknown",
          recipientAddress,
          amount,
          token: selectedToken.symbol,
          message: message || undefined,
          chatId,
        })
      );

      setTxHash(result.txHash);
      setShowConfirmation(true);
      onSend?.(result.txHash);

      // Reset form
      setAmount("");
      setMessage("");
    } catch (err: any) {
      const errorMsg = err._tag === "InsufficientBalance"
        ? `Insufficient balance. Need ${err.required} but have ${err.available}`
        : err._tag === "InvalidAmount"
        ? "Invalid amount"
        : "Payment failed";

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const canSend =
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(selectedToken?.balance || "0");

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
                <span>Send Payment</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Send crypto to {recipientName} in chat
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              In Chat
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recipient Info */}
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{recipientName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select
              value={selectedToken?.symbol}
              onValueChange={(symbol) =>
                setSelectedToken(tokens.find((t) => t.symbol === symbol) || tokens[0])
              }
            >
              <SelectTrigger id="token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
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
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(parseFloat(totalUsdValue))}
            </p>
          </div>

          {/* Message (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a note to your payment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleSend}
            disabled={!canSend || isSending}
          >
            {isSending ? "Sending..." : `Send ${amount || "0"} ${selectedToken?.symbol}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Sent! 🎉</DialogTitle>
            <DialogDescription>
              Your payment has been sent to {recipientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="p-4 bg-secondary rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {amount} {selectedToken?.symbol}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                ≈ {formatCurrency(parseFloat(totalUsdValue))}
              </div>
            </div>
            {message && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm italic">"{message}"</p>
              </div>
            )}
            {txHash && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted p-2 rounded">
                    {txHash.slice(0, 20)}...{txHash.slice(-18)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(txHash)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
