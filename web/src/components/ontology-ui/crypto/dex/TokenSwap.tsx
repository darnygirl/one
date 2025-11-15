/**
 * TokenSwap Component
 *
 * Swap tokens via Uniswap/Jupiter with:
 * - Token selection (from/to) with balances
 * - Amount input with max button
 * - Real-time price quotes
 * - Slippage tolerance settings
 * - Price impact warning
 * - Swap confirmation modal
 * - Multi-chain support (Ethereum, Polygon, Solana)
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
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { TokenSwapProps, Token } from "./types";
import { Effect } from "effect";
import * as DEXService from "@/lib/services/crypto/DEXService";
import { ArrowDown, Settings } from "lucide-react";

const MOCK_TOKENS: Token[] = [
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    balance: "2.5",
    usdValue: 5000,
    icon: "⟠",
    chainId: 1,
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    balance: "10000",
    usdValue: 1,
    icon: "💵",
    chainId: 1,
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    balance: "5000",
    usdValue: 1,
    icon: "🪙",
    chainId: 1,
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    balance: "0.15",
    usdValue: 43000,
    icon: "₿",
    chainId: 1,
  },
];

export function TokenSwap({
  walletAddress,
  chainId = 1,
  tokens = MOCK_TOKENS,
  defaultFrom,
  defaultTo,
  onSwap,
  onError,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: TokenSwapProps) {
  const [fromToken, setFromToken] = useState<Token | null>(defaultFrom || tokens[0] || null);
  const [toToken, setToToken] = useState<Token | null>(defaultTo || tokens[1] || null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [route, setRoute] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fromUsdValue = fromToken && fromAmount
    ? (parseFloat(fromAmount) * (fromToken.usdValue || 0)).toFixed(2)
    : "0.00";

  const toUsdValue = toToken && toAmount
    ? (parseFloat(toAmount) * (toToken.usdValue || 0)).toFixed(2)
    : "0.00";

  const handleMaxClick = () => {
    if (fromToken?.balance) {
      setFromAmount(fromToken.balance);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setToAmount("");
  };

  const fetchQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;

    setIsLoadingQuote(true);
    setError(null);

    try {
      const quotes = await Effect.runPromise(
        DEXService.getQuotes({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: fromAmount,
          chainId,
        })
      );

      if (quotes.length > 0) {
        const bestQuote = quotes[0];
        setToAmount(bestQuote.outputAmount);
        setPriceImpact(bestQuote.priceImpact);
        setRoute(bestQuote.route);
      }
    } catch (err: any) {
      setError("Failed to fetch quote");
      onError?.("Quote fetch failed");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !walletAddress) return;

    setIsSwapping(true);
    setError(null);

    try {
      const result = await Effect.runPromise(
        DEXService.executeSwap({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: fromAmount,
          slippage,
          deadline: 20,
          chainId,
          walletAddress,
        })
      );

      setTxHash(result.hash);
      setShowConfirmation(true);
      onSwap?.(result.hash);

      // Reset form
      setFromAmount("");
      setToAmount("");
    } catch (err: any) {
      const errorMsg =
        err._tag === "InsufficientLiquidity"
          ? `Insufficient liquidity for ${err.pair}`
          : err._tag === "ExcessiveSlippage"
          ? "Slippage exceeds tolerance"
          : err._tag === "PriceImpactTooHigh"
          ? `Price impact too high: ${err.impact}%`
          : "Swap failed";

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

  const canSwap =
    fromToken &&
    toToken &&
    fromAmount &&
    toAmount &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(fromAmount) <= parseFloat(fromToken.balance || "0");

  const isPriceImpactHigh = priceImpact > 3;
  const isPriceImpactWarning = priceImpact > 1;

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
                <span className="text-2xl">🔄</span>
                <span>Token Swap</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Swap tokens via Uniswap, Sushiswap, or Jupiter
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Chain {chainId}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
              >
                Max: {fromToken?.balance}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={fromToken?.address}
                onValueChange={(addr) =>
                  setFromToken(tokens.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-right text-lg font-semibold"
                step="0.000001"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              ≈ {formatCurrency(parseFloat(fromUsdValue))}
            </p>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            <Label className="text-xs text-muted-foreground">To</Label>
            <div className="flex items-center gap-3">
              <Select
                value={toToken?.address}
                onValueChange={(addr) =>
                  setToToken(tokens.find((t) => t.address === addr) || null)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingQuote ? (
                <Skeleton className="h-10 flex-1" />
              ) : (
                <Input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className="text-right text-lg font-semibold bg-background"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-right">
              ≈ {formatCurrency(parseFloat(toUsdValue))}
            </p>
          </div>

          {/* Price Impact Warning */}
          {isPriceImpactWarning && (
            <Alert variant={isPriceImpactHigh ? "destructive" : "default"}>
              <AlertDescription>
                Price impact: {priceImpact.toFixed(2)}%
                {isPriceImpactHigh && " - Consider reducing amount"}
              </AlertDescription>
            </Alert>
          )}

          {/* Route Info */}
          {route.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm">
              <span className="text-muted-foreground">Route</span>
              <span className="font-mono">
                {route.map((addr, i) => (
                  <span key={i}>
                    {tokens.find((t) => t.address === addr)?.symbol || addr.slice(0, 6)}
                    {i < route.length - 1 && " → "}
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Trade Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span className="font-medium">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price Impact</span>
              <span
                className={cn(
                  "font-medium",
                  isPriceImpactHigh && "text-destructive",
                  isPriceImpactWarning && !isPriceImpactHigh && "text-yellow-600"
                )}
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
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
            onClick={handleSwap}
            disabled={!canSwap || isSwapping || isLoadingQuote}
          >
            {isSwapping ? "Swapping..." : isLoadingQuote ? "Loading..." : "Swap Tokens"}
          </Button>
        </CardFooter>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Settings</DialogTitle>
            <DialogDescription>Adjust slippage tolerance and transaction settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Slippage Tolerance</Label>
              <div className="flex gap-2">
                {[0.1, 0.5, 1, 3].map((value) => (
                  <Button
                    key={value}
                    variant={slippage === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Custom"
                step="0.1"
                min="0"
                max="50"
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Successful!</DialogTitle>
            <DialogDescription>Your token swap has been executed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Swapped</span>
              <span className="text-sm font-medium">
                {fromAmount} {fromToken?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">For</span>
              <span className="text-sm font-medium">
                {toAmount} {toToken?.symbol}
              </span>
            </div>
            <Separator />
            {txHash && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
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
