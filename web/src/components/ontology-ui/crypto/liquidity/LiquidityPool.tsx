/**
 * LiquidityPool Component (Cycle 58)
 *
 * Add/remove liquidity to/from pools with preview and confirmation.
 *
 * Features:
 * - Token pair selection (e.g., ETH/USDC)
 * - Amount inputs for both tokens
 * - LP token preview
 * - Pool share percentage calculation
 * - Add/remove liquidity buttons
 * - Transaction confirmation with slippage
 * - Real-time price impact
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  icon?: string;
  address: string;
}

interface Pool {
  token0: Token;
  token1: Token;
  reserve0: number;
  reserve1: number;
  totalSupply: number;
  feeTier: number; // 0.3%, 0.05%, 1%
}

interface LiquidityPoolProps {
  pools?: Pool[];
  userAddress?: string;
  onAddLiquidity?: (pool: Pool, amount0: number, amount1: number) => Promise<void>;
  onRemoveLiquidity?: (pool: Pool, lpAmount: number) => Promise<void>;
}

export function LiquidityPool({
  pools = [],
  userAddress,
  onAddLiquidity,
  onRemoveLiquidity
}: LiquidityPoolProps) {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [lpTokens, setLpTokens] = useState(0);
  const [poolShare, setPoolShare] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // 0.5% default

  // Calculate amount1 based on amount0 (maintain pool ratio)
  useEffect(() => {
    if (selectedPool && amount0) {
      const ratio = selectedPool.reserve1 / selectedPool.reserve0;
      const calculatedAmount1 = parseFloat(amount0) * ratio;
      setAmount1(calculatedAmount1.toFixed(6));

      // Calculate LP tokens to receive
      const liquidity = Math.sqrt(parseFloat(amount0) * calculatedAmount1);
      setLpTokens(liquidity);

      // Calculate pool share percentage
      const newTotalSupply = selectedPool.totalSupply + liquidity;
      const share = (liquidity / newTotalSupply) * 100;
      setPoolShare(share);

      // Calculate price impact
      const impact = (parseFloat(amount0) / selectedPool.reserve0) * 100;
      setPriceImpact(impact);
    }
  }, [amount0, selectedPool]);

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amount0 || !amount1) return;

    setIsLoading(true);
    try {
      await onAddLiquidity?.(selectedPool, parseFloat(amount0), parseFloat(amount1));
      setAmount0("");
      setAmount1("");
      setLpTokens(0);
      setPoolShare(0);
    } catch (error) {
      console.error("Failed to add liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool || !lpTokens) return;

    setIsLoading(true);
    try {
      await onRemoveLiquidity?.(selectedPool, lpTokens);
      setAmount0("");
      setAmount1("");
      setLpTokens(0);
      setPoolShare(0);
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Liquidity Pool</span>
          {selectedPool && (
            <Badge variant="outline">
              {selectedPool.feeTier}% Fee Tier
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Selection */}
        <div className="space-y-2">
          <Label>Select Pool</Label>
          <Select
            value={selectedPool ? `${selectedPool.token0.symbol}-${selectedPool.token1.symbol}` : ""}
            onValueChange={(value) => {
              const pool = pools.find(p =>
                `${p.token0.symbol}-${p.token1.symbol}` === value
              );
              setSelectedPool(pool || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a liquidity pool" />
            </SelectTrigger>
            <SelectContent>
              {pools.map((pool) => (
                <SelectItem
                  key={`${pool.token0.symbol}-${pool.token1.symbol}`}
                  value={`${pool.token0.symbol}-${pool.token1.symbol}`}
                >
                  {pool.token0.symbol}/{pool.token1.symbol} - {pool.feeTier}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPool && (
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>

            {/* Add Liquidity Tab */}
            <TabsContent value="add" className="space-y-4">
              {/* Token 0 Input */}
              <div className="space-y-2">
                <Label>{selectedPool.token0.symbol} Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount0}
                    onChange={(e) => setAmount0(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary">{selectedPool.token0.symbol}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: {selectedPool.token0.balance.toFixed(4)} {selectedPool.token0.symbol}
                </p>
              </div>

              <div className="flex justify-center">
                <span className="text-2xl">+</span>
              </div>

              {/* Token 1 Input */}
              <div className="space-y-2">
                <Label>{selectedPool.token1.symbol} Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary">{selectedPool.token1.symbol}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: {selectedPool.token1.balance.toFixed(4)} {selectedPool.token1.symbol}
                </p>
              </div>

              <Separator />

              {/* LP Token Preview */}
              {lpTokens > 0 && (
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LP Tokens to Receive:</span>
                    <span className="font-medium">{lpTokens.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pool Share:</span>
                    <span className="font-medium">{poolShare.toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Impact:</span>
                    <span className={`font-medium ${priceImpact > 1 ? 'text-destructive' : ''}`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slippage Tolerance:</span>
                    <span className="font-medium">{slippage}%</span>
                  </div>
                </div>
              )}

              {priceImpact > 1 && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  High price impact! Consider adding liquidity in smaller amounts.
                </div>
              )}
            </TabsContent>

            {/* Remove Liquidity Tab */}
            <TabsContent value="remove" className="space-y-4">
              <div className="space-y-2">
                <Label>LP Tokens to Remove</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={lpTokens}
                  onChange={(e) => setLpTokens(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Your LP Tokens: {selectedPool.totalSupply.toFixed(6)}
                </p>
              </div>

              <Separator />

              {/* Receive Preview */}
              {lpTokens > 0 && (
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You will receive:</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{selectedPool.token0.symbol}:</span>
                    <span className="font-medium">
                      {((lpTokens / selectedPool.totalSupply) * selectedPool.reserve0).toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{selectedPool.token1.symbol}:</span>
                    <span className="font-medium">
                      {((lpTokens / selectedPool.totalSupply) * selectedPool.reserve1).toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {selectedPool && (
        <CardFooter className="flex gap-2">
          <Tabs defaultValue="add" className="w-full">
            <TabsContent value="add">
              <Button
                className="w-full"
                onClick={handleAddLiquidity}
                disabled={!amount0 || !amount1 || isLoading}
              >
                {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
              </Button>
            </TabsContent>
            <TabsContent value="remove">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveLiquidity}
                disabled={!lpTokens || isLoading}
              >
                {isLoading ? "Removing Liquidity..." : "Remove Liquidity"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardFooter>
      )}
    </Card>
  );
}
