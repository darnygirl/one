/**
 * LendToken Component (Cycle 66)
 *
 * Lend tokens to earn interest with real-time calculations.
 *
 * Features:
 * - Asset selection from wallet
 * - Amount input with max button
 * - Current supply APY display
 * - Projected earnings calculator
 * - Supply confirmation with preview
 * - Receipt tokens display (aTokens, cTokens)
 * - Transaction status tracking
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LendingMarket } from "@/lib/services/crypto/LendingService";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  icon?: string;
}

interface LendTokenProps {
  markets?: LendingMarket[];
  tokens?: Token[];
  userAddress?: string;
  onLend?: (market: LendingMarket, amount: string) => Promise<void>;
}

export function LendToken({
  markets = [],
  tokens = [],
  userAddress,
  onLend
}: LendTokenProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);
  const [projectedEarnings, setProjectedEarnings] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Update selected market when asset changes
  useEffect(() => {
    if (selectedAsset) {
      const market = markets.find((m) => m.asset === selectedAsset);
      setSelectedMarket(market || null);
    }
  }, [selectedAsset, markets]);

  // Calculate projected earnings
  useEffect(() => {
    if (selectedMarket && amount) {
      const principal = parseFloat(amount);
      const apy = selectedMarket.supplyAPY / 100;

      const daily = (principal * apy) / 365;
      const monthly = (principal * apy) / 12;
      const yearly = principal * apy;

      setProjectedEarnings({
        daily,
        monthly,
        yearly,
      });
    } else {
      setProjectedEarnings({ daily: 0, monthly: 0, yearly: 0 });
    }
  }, [selectedMarket, amount]);

  const selectedToken = tokens.find((t) => t.symbol === selectedAsset);

  const handleMaxClick = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance.toString());
    }
  };

  const handleLend = async () => {
    if (!selectedMarket || !amount) return;

    setIsLoading(true);
    try {
      await onLend?.(selectedMarket, amount);
      setAmount("");
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Failed to lend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const receiptToken = selectedMarket
    ? selectedMarket.protocol === "aave"
      ? `a${selectedAsset}`
      : `c${selectedAsset}`
    : "";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lend Tokens</span>
          {selectedMarket && (
            <Badge variant="outline" className="capitalize">
              {selectedMarket.protocol}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asset Selection */}
        <div className="space-y-2">
          <Label>Select Asset to Lend</Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an asset" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{token.symbol}</span>
                    <span className="text-xs text-muted-foreground ml-4">
                      Balance: {token.balance.toFixed(4)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMarket && (
          <>
            {/* Current APY */}
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Current Supply APY</div>
                  <div className="text-3xl font-bold text-green-600">
                    {selectedMarket.supplyAPY.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Protocol</div>
                  <div className="font-medium capitalize">{selectedMarket.protocol}</div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Amount to Lend</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="h-7"
                  >
                    MAX
                  </Button>
                  <Badge variant="secondary">{selectedAsset}</Badge>
                </div>
              </div>
              {selectedToken && (
                <p className="text-xs text-muted-foreground">
                  Available: {selectedToken.balance.toFixed(4)} {selectedAsset}
                </p>
              )}
            </div>

            <Separator />

            {/* Projected Earnings */}
            {parseFloat(amount) > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Projected Earnings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Daily</div>
                    <div className="text-lg font-bold text-green-600">
                      +{projectedEarnings.daily.toFixed(6)}
                    </div>
                    <div className="text-xs text-muted-foreground">{selectedAsset}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Monthly</div>
                    <div className="text-lg font-bold text-green-600">
                      +{projectedEarnings.monthly.toFixed(6)}
                    </div>
                    <div className="text-xs text-muted-foreground">{selectedAsset}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Yearly</div>
                    <div className="text-lg font-bold text-green-600">
                      +{projectedEarnings.yearly.toFixed(6)}
                    </div>
                    <div className="text-xs text-muted-foreground">{selectedAsset}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Tokens */}
            {parseFloat(amount) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You will receive:</span>
                  <span className="font-bold">{receiptToken}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receipt tokens automatically earn interest. They can be redeemed 1:1
                  for the underlying asset plus accrued interest at any time.
                </p>
              </div>
            )}

            {/* Transaction Details */}
            {parseFloat(amount) > 0 && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply:</span>
                  <span className="font-medium">
                    {(parseFloat(selectedMarket.totalSupply) / 1e6).toFixed(2)}M {selectedAsset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilization:</span>
                  <span className="font-medium">{selectedMarket.utilization}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Share:</span>
                  <span className="font-medium">
                    {((parseFloat(amount) / parseFloat(selectedMarket.totalSupply)) * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showConfirmation && (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
                <div className="text-green-600 font-medium">✓ Successfully Lent!</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Your tokens are now earning interest
                </div>
              </div>
            )}
          </>
        )}

        {!selectedMarket && selectedAsset && (
          <div className="text-center py-8 text-muted-foreground">
            No lending market available for {selectedAsset}
          </div>
        )}
      </CardContent>

      {selectedMarket && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleLend}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            size="lg"
          >
            {isLoading ? "Lending..." : `Lend ${amount || "0"} ${selectedAsset}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
