/**
 * StablecoinPay - Pay with stablecoins
 *
 * Features:
 * - USDC, USDT, DAI, BUSD support
 * - Multi-chain stablecoin detection
 * - Lowest fee route finder
 * - Instant settlement
 * - No slippage
 * - Stablecoin balance aggregation
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Shield,
  Zap,
  TrendingDown,
  Wallet,
  AlertCircle,
} from "lucide-react";

export interface StablecoinBalance {
  symbol: string;
  name: string;
  balance: number;
  chain: string;
  chainId: number;
  address: string;
  gasEstimate: number;
  estimatedTime: number;
}

export interface StablecoinPayProps {
  priceUSD: number;
  itemName: string;
  walletAddress?: string;
  onPaymentSelect?: (stablecoin: string, chain: string, amount: number) => void;
  showAggregatedBalance?: boolean;
}

const STABLECOINS = [
  { symbol: "USDC", name: "USD Coin", decimals: 6 },
  { symbol: "USDT", name: "Tether", decimals: 6 },
  { symbol: "DAI", name: "Dai", decimals: 18 },
  { symbol: "BUSD", name: "Binance USD", decimals: 18 },
];

const CHAINS = [
  { id: 1, name: "Ethereum", gasEstimate: 0.002, estimatedTime: 15 },
  { id: 137, name: "Polygon", gasEstimate: 0.00001, estimatedTime: 2 },
  { id: 42161, name: "Arbitrum", gasEstimate: 0.0001, estimatedTime: 1 },
  { id: 10, name: "Optimism", gasEstimate: 0.0001, estimatedTime: 1 },
  { id: 8453, name: "Base", gasEstimate: 0.00005, estimatedTime: 2 },
];

export function StablecoinPay({
  priceUSD,
  itemName,
  walletAddress,
  onPaymentSelect,
  showAggregatedBalance = true,
}: StablecoinPayProps) {
  const [balances, setBalances] = useState<StablecoinBalance[]>([]);
  const [selectedOption, setSelectedOption] = useState<StablecoinBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  // Mock function to fetch stablecoin balances across chains
  const fetchStablecoinBalances = async () => {
    setLoading(true);
    try {
      // In production, this would query wallet balances across multiple chains
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockBalances: StablecoinBalance[] = [];

      // Generate mock balances for each stablecoin on each chain
      STABLECOINS.forEach((stablecoin) => {
        CHAINS.forEach((chain) => {
          const hasBalance = Math.random() > 0.6;
          if (hasBalance) {
            const balance = Number((Math.random() * 1000).toFixed(2));
            mockBalances.push({
              symbol: stablecoin.symbol,
              name: stablecoin.name,
              balance,
              chain: chain.name,
              chainId: chain.id,
              address: `0x${Math.random().toString(16).substr(2, 40)}`,
              gasEstimate: chain.gasEstimate,
              estimatedTime: chain.estimatedTime,
            });
          }
        });
      });

      // Sort by lowest gas fee
      mockBalances.sort((a, b) => a.gasEstimate - b.gasEstimate);

      setBalances(mockBalances);

      // Calculate total balance
      const total = mockBalances.reduce((sum, b) => sum + b.balance, 0);
      setTotalBalance(total);

      // Auto-select best option (sufficient balance + lowest gas)
      const bestOption = mockBalances.find((b) => b.balance >= priceUSD);
      setSelectedOption(bestOption || null);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchStablecoinBalances();
    } else {
      setLoading(false);
    }
  }, [walletAddress, priceUSD]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pay with Stablecoins</CardTitle>
          <CardDescription>Connect wallet to view available balances</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Connect your wallet to continue</p>
        </CardContent>
      </Card>
    );
  }

  const hasSufficientBalance = totalBalance >= priceUSD;
  const groupedBalances = balances.reduce((acc, balance) => {
    if (!acc[balance.symbol]) acc[balance.symbol] = [];
    acc[balance.symbol].push(balance);
    return acc;
  }, {} as Record<string, StablecoinBalance[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with Stablecoins</CardTitle>
        <CardDescription>
          No slippage, instant settlement, lowest fees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total Price</p>
          <p className="text-3xl font-bold">${priceUSD.toFixed(2)}</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Shield className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-xs font-medium">No Slippage</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Zap className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-medium">Instant</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="text-xs font-medium">Low Fees</p>
          </div>
        </div>

        {/* Aggregated Balance */}
        {showAggregatedBalance && (
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium">Total Stablecoin Balance</p>
              <Badge variant={hasSufficientBalance ? "default" : "destructive"}>
                {hasSufficientBalance ? "Sufficient" : "Insufficient"}
              </Badge>
            </div>
            <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {balances.length} accounts on {CHAINS.length} chains
            </p>
          </div>
        )}

        {/* Available Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Select Payment Method</p>

          {Object.entries(groupedBalances).map(([symbol, symbolBalances]) => (
            <div key={symbol} className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">{symbol}</p>
              {symbolBalances.map((balance, index) => {
                const isSelected = selectedOption?.address === balance.address;
                const isSufficient = balance.balance >= priceUSD;
                const gasCostUSD = balance.gasEstimate * 2000; // ETH price estimate

                return (
                  <button
                    key={`${balance.symbol}-${balance.chainId}-${index}`}
                    onClick={() => setSelectedOption(balance)}
                    className={`w-full p-3 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    } ${!isSufficient && "opacity-50"}`}
                    disabled={!isSufficient}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {balance.chain}
                        </Badge>
                        {isSufficient && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium">
                          {balance.balance.toFixed(2)} {balance.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gas: ${gasCostUSD.toFixed(4)} • ~{balance.estimatedTime}s
                        </p>
                      </div>
                      {!isSufficient && (
                        <Badge variant="destructive" className="text-xs">
                          Need ${(priceUSD - balance.balance).toFixed(2)} more
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* No Balances Warning */}
        {balances.length === 0 && (
          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  No Stablecoins Found
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Add USDC, USDT, DAI, or BUSD to your wallet to use this payment method
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Option Details */}
        {selectedOption && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-mono">${priceUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Fee</span>
                <span className="font-mono text-destructive">
                  ${(selectedOption.gasEstimate * 2000).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <Badge variant="outline">{selectedOption.chain}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Settlement Time</span>
                <span>~{selectedOption.estimatedTime} seconds</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Cost</span>
                <span className="font-mono">
                  ${(priceUSD + selectedOption.gasEstimate * 2000).toFixed(2)}
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
          disabled={!selectedOption}
          onClick={() => {
            if (selectedOption) {
              onPaymentSelect?.(
                selectedOption.symbol,
                selectedOption.chain,
                priceUSD
              );
            }
          }}
        >
          {selectedOption ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Pay ${priceUSD.toFixed(2)} with {selectedOption.symbol} on{" "}
              {selectedOption.chain}
            </>
          ) : (
            "Select Payment Method"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
