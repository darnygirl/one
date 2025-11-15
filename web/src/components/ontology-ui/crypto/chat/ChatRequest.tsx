/**
 * ChatRequest Component
 *
 * Request payment in chat with:
 * - Request amount and token
 * - Description/memo field
 * - QR code generation
 * - Expiration timer
 * - Payment status tracking
 * - Auto-complete when paid
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { ChatRequestProps, Token, PaymentRequestState } from "./types";
import { Effect } from "effect";
import * as ChatPaymentService from "@/lib/services/crypto/ChatPaymentService";

const MOCK_TOKENS: Token[] = [
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, icon: "💵" },
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, icon: "💲" },
  { address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ethereum", decimals: 18, icon: "💎" },
];

export function ChatRequest({
  chatId,
  tokens = MOCK_TOKENS,
  defaultToken = "USDC",
  defaultAmount,
  onRequestCreated,
  onPaymentReceived,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: ChatRequestProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(
    tokens.find(t => t.symbol === defaultToken) || tokens[0]
  );
  const [amount, setAmount] = useState(defaultAmount || "");
  const [description, setDescription] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("3600000"); // 1 hour
  const [isCreating, setIsCreating] = useState(false);
  const [request, setRequest] = useState<PaymentRequestState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Timer for expiration
  useEffect(() => {
    if (!request?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = request.expiresAt! - Date.now();
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        setRequest({ ...request, status: "expired" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request?.expiresAt]);

  const handleCreateRequest = async () => {
    if (!amount) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        ChatPaymentService.createPaymentRequest({
          amount,
          token: selectedToken.symbol,
          description: description || undefined,
          expiresIn: parseInt(expiresIn),
          chatId,
        })
      );

      setRequest(result);
      onRequestCreated?.(result.id);
      setTimeRemaining(result.expiresAt ? result.expiresAt - Date.now() : 0);
    } catch (err: any) {
      const errorMsg = err._tag === "InvalidAmount"
        ? "Invalid amount"
        : "Failed to create request";
      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setRequest(null);
    setAmount("");
    setDescription("");
    setError(null);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status: PaymentRequestState["status"]) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "expired": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  if (request) {
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
                <span className="text-2xl">📬</span>
                <span>Payment Request</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Request ID: {request.id.slice(0, 12)}...
              </CardDescription>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount Display */}
          <div className="p-4 bg-secondary rounded-lg text-center">
            <div className="text-3xl font-bold text-primary">
              {request.amount} {request.token}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <img
                src={request.qrCode}
                alt="Payment QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Timer */}
          {request.expiresAt && request.status === "pending" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-xl">⏱️</span>
              <div className="text-sm">
                <span className="font-medium">Expires in:</span>{" "}
                <span className="text-yellow-700 dark:text-yellow-300 font-mono">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {request.status === "paid" && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="text-green-800 dark:text-green-300">
                ✓ Payment received from {request.paidBy?.slice(0, 8)}...
                {request.paidBy?.slice(-6)}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Share Request</Label>
            <div className="flex gap-2">
              <Input
                value={`https://pay.example.com/r/${request.id}`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(`https://pay.example.com/r/${request.id}`)}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleReset} variant="outline" className="w-full">
            Create New Request
          </Button>
        </CardFooter>
      </Card>
    );
  }

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
              <span className="text-2xl">📬</span>
              <span>Request Payment</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Create a payment request with QR code
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="What is this payment for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Expiration */}
        <div className="space-y-2">
          <Label htmlFor="expires">Expires In</Label>
          <Select value={expiresIn} onValueChange={setExpiresIn}>
            <SelectTrigger id="expires">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1800000">30 minutes</SelectItem>
              <SelectItem value="3600000">1 hour</SelectItem>
              <SelectItem value="7200000">2 hours</SelectItem>
              <SelectItem value="86400000">24 hours</SelectItem>
            </SelectContent>
          </Select>
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
          onClick={handleCreateRequest}
          disabled={!amount || parseFloat(amount) <= 0 || isCreating}
        >
          {isCreating ? "Creating..." : "Create Request"}
        </Button>
      </CardFooter>
    </Card>
  );
}
