/**
 * LimitOrder Component
 *
 * Set limit orders with:
 * - Token pair selection
 * - Limit price input
 * - Amount and expiration
 * - Active orders list
 * - Cancel order functionality
 * - Order filled notifications
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
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { LimitOrderProps, Token, LimitOrderData } from "./types";
import { Effect } from "effect";
import * as DEXService from "@/lib/services/crypto/DEXService";
import { Clock, X, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MOCK_TOKENS: Token[] = [
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    balance: "2.5",
    usdValue: 2000,
    icon: "⟠",
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    balance: "10000",
    usdValue: 1,
    icon: "💵",
  },
];

const MOCK_ORDERS: LimitOrderData[] = [
  {
    id: "order_1",
    fromToken: MOCK_TOKENS[0],
    toToken: MOCK_TOKENS[1],
    targetPrice: "2100",
    amount: "1.0",
    expiresAt: Date.now() + 86400000,
    createdAt: Date.now() - 3600000,
    status: "open",
    filled: 0,
  },
  {
    id: "order_2",
    fromToken: MOCK_TOKENS[1],
    toToken: MOCK_TOKENS[0],
    targetPrice: "0.00048",
    amount: "5000",
    expiresAt: Date.now() + 172800000,
    createdAt: Date.now() - 7200000,
    status: "open",
    filled: 0.3,
  },
];

export function LimitOrder({
  walletAddress,
  chainId = 1,
  fromToken: defaultFrom,
  toToken: defaultTo,
  openOrders = MOCK_ORDERS,
  onOrderCreate,
  onOrderCancel,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: LimitOrderProps) {
  const [fromToken, setFromToken] = useState<Token | null>(defaultFrom || MOCK_TOKENS[0]);
  const [toToken, setToToken] = useState<Token | null>(defaultTo || MOCK_TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expirationDays, setExpirationDays] = useState("7");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMaxClick = () => {
    if (fromToken?.balance) {
      setAmount(fromToken.balance);
    }
  };

  const handleCreateOrder = async () => {
    if (!fromToken || !toToken || !amount || !targetPrice || !walletAddress) return;

    setIsCreating(true);
    setError(null);

    try {
      const expiresAt = Date.now() + parseInt(expirationDays) * 86400000;

      const result = await Effect.runPromise(
        DEXService.createLimitOrder({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount,
          targetPrice,
          expiresAt,
          chainId,
          walletAddress,
        })
      );

      onOrderCreate?.(result.orderId);

      // Reset form
      setAmount("");
      setTargetPrice("");
    } catch (err: any) {
      const errorMsg =
        err._tag === "InvalidRoute"
          ? err.reason
          : "Failed to create limit order";

      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await Effect.runPromise(DEXService.cancelLimitOrder(orderId));
      onOrderCancel?.(orderId);
    } catch (err) {
      setError("Failed to cancel order");
    }
  };

  const currentPrice = fromToken && toToken ? fromToken.usdValue! / toToken.usdValue! : 0;
  const estimatedOutput = amount && targetPrice ? (parseFloat(amount) * parseFloat(targetPrice)).toFixed(4) : "0.00";

  const canCreateOrder =
    fromToken &&
    toToken &&
    amount &&
    targetPrice &&
    parseFloat(amount) > 0 &&
    parseFloat(targetPrice) > 0 &&
    parseFloat(amount) <= parseFloat(fromToken.balance || "0");

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
              <span className="text-2xl">⏱️</span>
              <span>Limit Orders</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Set orders to execute at specific prices
            </CardDescription>
          </div>
          <Badge variant="outline">Chain {chainId}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Order Form */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Create Limit Order</h3>

          {/* Token Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={fromToken?.address}
                onValueChange={(addr) =>
                  setFromToken(MOCK_TOKENS.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.icon} {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select
                value={toToken?.address}
                onValueChange={(addr) =>
                  setToToken(MOCK_TOKENS.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.icon} {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-auto p-0 text-xs"
              >
                Max: {fromToken?.balance}
              </Button>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
            />
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label>Target Price (per {fromToken?.symbol})</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Current price: {formatNumber(currentPrice, 4)} {toToken?.symbol}
            </p>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Expires In</Label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="p-3 bg-secondary rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">You will receive</span>
              <span className="font-medium">
                {estimatedOutput} {toToken?.symbol}
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleCreateOrder}
            disabled={!canCreateOrder || isCreating}
          >
            {isCreating ? "Creating..." : "Create Limit Order"}
          </Button>
        </div>

        <Separator />

        {/* Active Orders */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm flex items-center justify-between">
            <span>Active Orders ({openOrders.length})</span>
          </h3>

          {openOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active limit orders
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {openOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{order.fromToken.icon}</span>
                      <span className="text-sm">→</span>
                      <span>{order.toToken.icon}</span>
                      <div>
                        <div className="font-medium text-sm">
                          {order.fromToken.symbol} → {order.toToken.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.amount} at {order.targetPrice}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.filled! > 0 && (
                        <Badge variant="secondary">
                          {(order.filled! * 100).toFixed(0)}% filled
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires {formatDistanceToNow(order.expiresAt, { addSuffix: true })}
                    </span>
                    <span>
                      Created {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
