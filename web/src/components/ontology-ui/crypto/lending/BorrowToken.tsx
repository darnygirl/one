/**
 * BorrowToken Component (Cycle 67)
 *
 * Borrow tokens against collateral with health factor preview.
 *
 * Features:
 * - Asset to borrow selection
 * - Borrow amount input with validation
 * - Borrow APY display
 * - Collateral requirement calculation
 * - Health factor preview (live updates)
 * - Borrow confirmation with warnings
 * - Liquidation price calculation
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LendingMarket, CollateralPosition } from "@/lib/services/crypto/LendingService";

interface BorrowTokenProps {
  markets?: LendingMarket[];
  collateral?: CollateralPosition[];
  userAddress?: string;
  onBorrow?: (market: LendingMarket, amount: string) => Promise<void>;
}

export function BorrowToken({
  markets = [],
  collateral = [],
  userAddress,
  onBorrow
}: BorrowTokenProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);
  const [healthFactor, setHealthFactor] = useState<number | null>(null);
  const [liquidationPrice, setLiquidationPrice] = useState<string>("");
  const [maxBorrow, setMaxBorrow] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update selected market when asset changes
  useEffect(() => {
    if (selectedAsset) {
      const market = markets.find((m) => m.asset === selectedAsset);
      setSelectedMarket(market || null);
    }
  }, [selectedAsset, markets]);

  // Calculate max borrow and health factor
  useEffect(() => {
    if (selectedMarket && collateral.length > 0) {
      // Calculate total collateral value
      const totalCollateralValue = collateral.reduce(
        (sum, c) => sum + parseFloat(c.value),
        0
      );

      // Max borrow = Total Collateral × Collateral Factor
      const max = totalCollateralValue * selectedMarket.collateralFactor;
      setMaxBorrow(max);

      // Calculate health factor if amount is entered
      if (amount && parseFloat(amount) > 0) {
        const borrowValue = parseFloat(amount);

        // Health Factor = (Collateral × Liquidation Threshold) / Borrowed
        const weightedCollateral = collateral.reduce(
          (sum, c) => sum + parseFloat(c.value) * c.collateralFactor,
          0
        );
        const hf = weightedCollateral / borrowValue;
        setHealthFactor(hf);

        // Liquidation Price = Borrowed / (Collateral × Liquidation Threshold)
        const liquidationPx = borrowValue / (totalCollateralValue * selectedMarket.liquidationThreshold);
        setLiquidationPrice(liquidationPx.toFixed(2));
      } else {
        setHealthFactor(null);
        setLiquidationPrice("");
      }
    }
  }, [selectedMarket, collateral, amount]);

  const handleMaxClick = () => {
    setAmount((maxBorrow * 0.8).toFixed(6)); // 80% of max for safety
  };

  const handleBorrow = async () => {
    if (!selectedMarket || !amount) return;

    setIsLoading(true);
    try {
      await onBorrow?.(selectedMarket, amount);
      setAmount("");
    } catch (error) {
      console.error("Failed to borrow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCollateralValue = collateral.reduce(
    (sum, c) => sum + parseFloat(c.value),
    0
  );

  const getRiskColor = (hf: number | null): string => {
    if (!hf) return "text-muted-foreground";
    if (hf >= 2.0) return "text-green-600";
    if (hf >= 1.5) return "text-yellow-600";
    return "text-destructive";
  };

  const getRiskLevel = (hf: number | null): string => {
    if (!hf) return "Unknown";
    if (hf >= 2.0) return "Safe";
    if (hf >= 1.5) return "Warning";
    return "Danger";
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Borrow Tokens</span>
          {selectedMarket && (
            <Badge variant="outline" className="capitalize">
              {selectedMarket.protocol}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collateral Overview */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Collateral Value</div>
              <div className="text-2xl font-bold">
                ${totalCollateralValue.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Collateral Assets</div>
              <div className="font-medium">{collateral.length}</div>
            </div>
          </div>
        </div>

        {collateral.length === 0 && (
          <Alert>
            <AlertDescription>
              You need to supply collateral before you can borrow. Please add collateral first.
            </AlertDescription>
          </Alert>
        )}

        {collateral.length > 0 && (
          <>
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label>Select Asset to Borrow</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.asset} value={market.asset}>
                      <div className="flex items-center justify-between w-full">
                        <span>{market.asset}</span>
                        <span className="text-xs text-muted-foreground ml-4">
                          {market.borrowAPY.toFixed(2)}% APY
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMarket && (
              <>
                {/* Current Borrow APY */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Borrow APY</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {selectedMarket.borrowAPY.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Max Borrow</div>
                      <div className="font-medium">{maxBorrow.toFixed(2)} {selectedAsset}</div>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label>Amount to Borrow</Label>
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
                        80% MAX
                      </Button>
                      <Badge variant="secondary">{selectedAsset}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Safe maximum: {(maxBorrow * 0.8).toFixed(4)} {selectedAsset}
                  </p>
                </div>

                <Separator />

                {/* Health Factor Preview */}
                {healthFactor !== null && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Borrow Position Preview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground">Health Factor</div>
                        <div className={`text-2xl font-bold ${getRiskColor(healthFactor)}`}>
                          {healthFactor.toFixed(2)}
                        </div>
                        <Badge
                          variant={healthFactor >= 2.0 ? "default" : healthFactor >= 1.5 ? "secondary" : "destructive"}
                          className="mt-2"
                        >
                          {getRiskLevel(healthFactor)}
                        </Badge>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground">Liquidation Price</div>
                        <div className="text-2xl font-bold">${liquidationPrice}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          per {selectedAsset}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Warnings */}
                {healthFactor !== null && healthFactor < 2.0 && (
                  <Alert variant={healthFactor < 1.5 ? "destructive" : "default"}>
                    <AlertDescription>
                      {healthFactor < 1.5 ? (
                        <>
                          <strong>High Risk:</strong> Your position will be at risk of liquidation.
                          Consider reducing your borrow amount or adding more collateral.
                        </>
                      ) : (
                        <>
                          <strong>Moderate Risk:</strong> Your health factor is below 2.0.
                          Monitor your position closely and consider adding more collateral if prices drop.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Collateral Requirements */}
                {parseFloat(amount) > 0 && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collateral Required:</span>
                      <span className="font-medium">
                        ${(parseFloat(amount) / selectedMarket.collateralFactor).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Collateral:</span>
                      <span className="font-medium">${totalCollateralValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collateral Factor:</span>
                      <span className="font-medium">{(selectedMarket.collateralFactor * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidation Threshold:</span>
                      <span className="font-medium">{(selectedMarket.liquidationThreshold * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                {/* Yearly Interest */}
                {parseFloat(amount) > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Yearly Interest Cost:</span>
                      <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                        {(parseFloat(amount) * (selectedMarket.borrowAPY / 100)).toFixed(6)} {selectedAsset}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>

      {selectedMarket && collateral.length > 0 && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleBorrow}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > maxBorrow ||
              (healthFactor !== null && healthFactor < 1.5) ||
              isLoading
            }
            size="lg"
          >
            {isLoading ? "Borrowing..." : `Borrow ${amount || "0"} ${selectedAsset}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
