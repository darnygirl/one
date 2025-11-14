/**
 * ChatTip Component
 *
 * Tip users in chat with:
 * - Quick tip amounts ($1, $5, $10, $20)
 * - Custom tip amount
 * - Token selection
 * - Animated tip notification
 * - Tip leaderboard
 * - Accumulated tips display
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatTipProps, Token, TipLeaderboard } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, balance: "1000.50", usdValue: 1, icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, balance: "500.25", usdValue: 1, icon: "💲" },
];

const DEFAULT_QUICK_AMOUNTS = ["1", "5", "10", "20"];

export function ChatTip({
  chatId,
  recipientId,
  recipientName,
  recipientAddress,
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  quickAmounts = DEFAULT_QUICK_AMOUNTS,
  showLeaderboard = true,
  onTipSent,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatTipProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<TipLeaderboard[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amount = customAmount || selectedAmount || "";

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [chatId, showLeaderboard]);

  const loadLeaderboard = async () => {
    try {
      const result = await Effect.runPromise(
        ChatPaymentService.getTipLeaderboard(chatId)
      );
      setLeaderboard(result);
    } catch (err) {
      // Silent fail
    }
  };

  const handleQuickTip = (tipAmount: string) => {
    setSelectedAmount(tipAmount);
    setCustomAmount("");
  };

  const handleSendTip = async () => {
    if (!amount) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        ChatPaymentService.sendTip({
          recipientId,
          recipientAddress,
          amount,
          token: selectedToken.symbol,
          message: message || undefined,
          chatId,
        })
      );

      setTxHash(result.txHash);
      setLeaderboardPosition(result.leaderboardPosition || null);
      setShowConfirmation(true);
      onTipSent?.(result.txHash);

      // Reload leaderboard
      await loadLeaderboard();

      // Reset form
      setCustomAmount("");
      setSelectedAmount(null);
      setMessage("");
    } catch (err: any) {
      const errorMsg = err._tag === "InsufficientBalance"
        ? "Insufficient balance"
        : "Tip failed";
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

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

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
                <span className="text-2xl">💰</span>
                <span>Send Tip</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Tip {recipientName} for their contribution
              </CardDescription>
            </div>
            {showLeaderboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaderboardModal(true)}
              >
                🏆 Leaderboard
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recipient */}
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{recipientName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Currency</Label>
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
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Amounts */}
          <div className="space-y-2">
            <Label>Quick Tip</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((tipAmount) => (
                <Button
                  key={tipAmount}
                  variant={selectedAmount === tipAmount ? "default" : "outline"}
                  onClick={() => handleQuickTip(tipAmount)}
                  className="w-full"
                >
                  ${tipAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom">Custom Amount</Label>
            <Input
              id="custom"
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              step="0.01"
              min="0"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Input
              id="message"
              placeholder="Great work! 👏"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
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
            onClick={handleSendTip}
            disabled={!canSend || isSending}
          >
            {isSending ? "Sending..." : `Tip ${amount || "0"} ${selectedToken?.symbol}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tip Sent! 🎉</DialogTitle>
            <DialogDescription>
              Your tip has been sent to {recipientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <div className="text-3xl font-bold text-primary">
                {amount} {selectedToken?.symbol}
              </div>
              {message && (
                <p className="text-muted-foreground mt-2 italic">"{message}"</p>
              )}
            </div>

            {leaderboardPosition && (
              <Alert>
                <AlertDescription className="text-center">
                  🏆 You're #{leaderboardPosition} on the tip leaderboard!
                </AlertDescription>
              </Alert>
            )}

            {txHash && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-mono">{txHash.slice(0, 32)}...</p>
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

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboardModal} onOpenChange={setShowLeaderboardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tip Leaderboard 🏆</DialogTitle>
            <DialogDescription>
              Top tippers in this chat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {leaderboard.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">
                    {getRankEmoji(user.rank)}
                  </span>
                  <div>
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.totalTips} USDC tipped
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{user.rank}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLeaderboardModal(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
