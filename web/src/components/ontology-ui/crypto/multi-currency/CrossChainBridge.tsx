/**
 * CrossChainBridge - Bridge tokens between chains
 *
 * Features:
 * - Source/destination chain selector
 * - Token amount input
 * - Bridge fee estimation
 * - Multiple bridge providers (Hop, Across, Stargate)
 * - Best route recommendation
 * - Bridge transaction tracking
 * - Arrival time estimation
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Fuel,
  Shield,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Effect } from "effect";
import {
  getBridgeRoutes,
  getBestRoute,
  trackBridgeTransaction,
  formatBridgeTime,
  SUPPORTED_CHAINS,
  BRIDGE_PROVIDERS,
  type BridgeRoute,
  type BridgeTransaction,
} from "@/lib/services/crypto/BridgeService";

export interface CrossChainBridgeProps {
  defaultSourceChain?: number;
  defaultDestChain?: number;
  defaultToken?: string;
  defaultAmount?: string;
  onBridgeExecute?: (route: BridgeRoute) => void;
  showProviderComparison?: boolean;
}

export function CrossChainBridge({
  defaultSourceChain = 1,
  defaultDestChain = 137,
  defaultToken = "USDC",
  defaultAmount = "100",
  onBridgeExecute,
  showProviderComparison = true,
}: CrossChainBridgeProps) {
  const [sourceChain, setSourceChain] = useState(defaultSourceChain);
  const [destChain, setDestChain] = useState(defaultDestChain);
  const [token, setToken] = useState(defaultToken);
  const [amount, setAmount] = useState(defaultAmount);
  const [routes, setRoutes] = useState<BridgeRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<BridgeRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(null);

  const supportedTokens = ["USDC", "USDT", "DAI", "ETH", "WBTC"];

  // Load bridge routes
  const loadRoutes = async () => {
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      const bridgeRoutes = await Effect.runPromise(
        getBridgeRoutes(sourceChain, destChain, token, amount)
      );

      setRoutes(bridgeRoutes);

      // Auto-select best route (lowest cost)
      if (bridgeRoutes.length > 0) {
        const best = bridgeRoutes.reduce((best, current) =>
          Number(current.totalCost) < Number(best.totalCost) ? current : best
        );
        setSelectedRoute(best);
      }
    } catch (error) {
      console.error("Failed to load routes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Execute bridge transaction
  const executeBridge = async () => {
    if (!selectedRoute) return;

    setBridging(true);
    try {
      // In production, this would:
      // 1. Approve token spending
      // 2. Call bridge contract
      // 3. Track transaction

      // Mock transaction for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTx: BridgeTransaction = {
        id: `bridge_${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        sourceChain,
        destinationChain: destChain,
        status: 'pending',
        amount,
        token,
        timestamp: Date.now(),
        confirmations: 0,
        requiredConfirmations: 12,
        estimatedCompletion: Date.now() + selectedRoute.estimatedTime * 1000,
      };

      setTransaction(mockTx);
      onBridgeExecute?.(selectedRoute);
    } catch (error) {
      console.error("Bridge execution failed:", error);
    } finally {
      setBridging(false);
    }
  };

  // Track transaction status
  useEffect(() => {
    if (!transaction || transaction.status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const status = await Effect.runPromise(
          trackBridgeTransaction(transaction.hash)
        );
        setTransaction(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to track transaction:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transaction]);

  // Load routes when parameters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      loadRoutes();
    }, 500);

    return () => clearTimeout(debounce);
  }, [sourceChain, destChain, token, amount]);

  const sourceChainInfo = SUPPORTED_CHAINS.find((c) => c.id === sourceChain);
  const destChainInfo = SUPPORTED_CHAINS.find((c) => c.id === destChain);

  // Transaction tracking view
  if (transaction) {
    const progress = (transaction.confirmations / transaction.requiredConfirmations) * 100;
    const statusColors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      bridging: "bg-purple-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Bridge Transaction</CardTitle>
          <CardDescription>
            Transferring {amount} {token} from {sourceChainInfo?.name} to{" "}
            {destChainInfo?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="text-center">
            <Badge variant="outline" className="text-base px-4 py-2">
              {transaction.status === 'pending' && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {transaction.status === 'completed' && <CheckCircle2 className="h-4 w-4 mr-2" />}
              {transaction.status === 'failed' && <AlertCircle className="h-4 w-4 mr-2" />}
              {transaction.status.toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confirmations</span>
              <span className="font-medium">
                {transaction.confirmations} / {transaction.requiredConfirmations}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${statusColors[transaction.status]}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Hash</span>
              <span className="font-mono text-xs">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono">
                {transaction.amount} {transaction.token}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Completion</span>
              <span>
                {new Date(transaction.estimatedCompletion).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Explorer Links */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={`${sourceChainInfo?.explorerUrl}/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on {sourceChainInfo?.name}
              </a>
            </Button>
            {transaction.status === 'completed' && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a
                  href={`${destChainInfo?.explorerUrl}/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on {destChainInfo?.name}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setTransaction(null)}
          >
            Bridge Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Chain Bridge</CardTitle>
        <CardDescription>
          Transfer tokens between blockchains with the best rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Chain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <Select
            value={String(sourceChain)}
            onValueChange={(v) => setSourceChain(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={String(chain.id)}>
                  {chain.name} ({chain.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination Chain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <Select
            value={String(destChain)}
            onValueChange={(v) => setDestChain(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.filter((c) => c.id !== sourceChain).map((chain) => (
                <SelectItem key={chain.id} value={String(chain.id)}>
                  {chain.name} ({chain.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Token and Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Token</label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Available Routes */}
        {!loading && routes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Available Routes</p>
              <Badge variant="secondary">{routes.length} options</Badge>
            </div>

            {routes.map((route, index) => {
              const isSelected = selectedRoute?.provider === route.provider;
              const isBest = index === 0; // First one is best (lowest cost)

              return (
                <button
                  key={route.provider}
                  onClick={() => setSelectedRoute(route)}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{route.provider}</span>
                      {isBest && (
                        <Badge variant="default" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Best Rate
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Fuel className="h-3 w-3" />
                        <span className="text-xs">Fee</span>
                      </div>
                      <p className="font-mono text-xs">
                        {route.estimatedFee} {token}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Time</span>
                      </div>
                      <p className="font-medium text-xs">
                        {formatBridgeTime(route.estimatedTime)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs">Security</span>
                      </div>
                      <p className="font-medium text-xs">
                        {BRIDGE_PROVIDERS.find((p) => p.displayName === route.provider)
                          ?.securityScore || 90}
                        /100
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Routes Warning */}
        {!loading && routes.length === 0 && amount && Number(amount) > 0 && (
          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  No Routes Available
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This token/chain combination is not supported. Try a different token
                  or chain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Route Summary */}
        {selectedRoute && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You Send</span>
                <span className="font-mono">
                  {amount} {token} on {sourceChainInfo?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge Fee</span>
                <span className="font-mono text-destructive">
                  -{selectedRoute.estimatedFee} {token}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Estimate</span>
                <span className="font-mono text-destructive">
                  ~{selectedRoute.gasEstimate} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Time</span>
                <span>{formatBridgeTime(selectedRoute.estimatedTime)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>You Receive</span>
                <span className="font-mono text-lg">
                  ~{(Number(amount) - Number(selectedRoute.estimatedFee)).toFixed(4)}{" "}
                  {token} on {destChainInfo?.name}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={!selectedRoute || bridging}
          onClick={executeBridge}
        >
          {bridging ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Bridging...
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5 mr-2" />
              Bridge {amount} {token}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
