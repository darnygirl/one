/**
 * CollateralManager Component (Cycle 68)
 *
 * Manage collateral ratio with health factor monitoring.
 *
 * Features:
 * - Current collateral value display
 * - Borrowed amount tracking
 * - Health factor visualization (safe/warning/danger)
 * - Liquidation price warning with alerts
 * - Add/remove collateral actions
 * - Collateral composition chart
 * - Real-time health factor updates
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CollateralPosition, BorrowPosition } from "@/lib/services/crypto/LendingService";

interface CollateralManagerProps {
  collateral?: CollateralPosition[];
  borrowPositions?: BorrowPosition[];
  healthFactor?: number;
  userAddress?: string;
  onAddCollateral?: (asset: string, amount: string) => Promise<void>;
  onRemoveCollateral?: (asset: string, amount: string) => Promise<void>;
}

export function CollateralManager({
  collateral = [],
  borrowPositions = [],
  healthFactor = 0,
  userAddress,
  onAddCollateral,
  onRemoveCollateral
}: CollateralManagerProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectedHealthFactor, setProjectedHealthFactor] = useState<number | null>(null);

  const totalCollateralValue = collateral.reduce(
    (sum, c) => sum + parseFloat(c.value),
    0
  );

  const totalBorrowedValue = borrowPositions.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  const getRiskColor = (hf: number): string => {
    if (hf >= 2.0) return "text-green-600";
    if (hf >= 1.5) return "text-yellow-600";
    return "text-destructive";
  };

  const getRiskLevel = (hf: number): string => {
    if (hf >= 2.0) return "Safe";
    if (hf >= 1.5) return "Warning";
    return "Danger";
  };

  const getRiskVariant = (hf: number): "default" | "secondary" | "destructive" => {
    if (hf >= 2.0) return "default";
    if (hf >= 1.5) return "secondary";
    return "destructive";
  };

  // Calculate projected health factor when adding/removing collateral
  useEffect(() => {
    if (selectedAsset && amount && parseFloat(amount) > 0) {
      const amountValue = parseFloat(amount);
      const selectedCollateral = collateral.find(c => c.asset === selectedAsset);

      if (selectedCollateral) {
        // Simplified calculation
        const newCollateralValue = totalCollateralValue + amountValue;
        const weightedCollateral = newCollateralValue * selectedCollateral.collateralFactor;
        const projected = totalBorrowedValue > 0
          ? weightedCollateral / totalBorrowedValue
          : Number.MAX_SAFE_INTEGER;

        setProjectedHealthFactor(projected);
      }
    } else {
      setProjectedHealthFactor(null);
    }
  }, [selectedAsset, amount, collateral, totalCollateralValue, totalBorrowedValue]);

  const handleAddCollateral = async () => {
    if (!selectedAsset || !amount) return;

    setIsLoading(true);
    try {
      await onAddCollateral?.(selectedAsset, amount);
      setAmount("");
    } catch (error) {
      console.error("Failed to add collateral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollateral = async () => {
    if (!selectedAsset || !amount) return;

    setIsLoading(true);
    try {
      await onRemoveCollateral?.(selectedAsset, amount);
      setAmount("");
    } catch (error) {
      console.error("Failed to remove collateral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const liquidationPrice = totalBorrowedValue > 0
    ? (totalBorrowedValue / (totalCollateralValue * 0.86)).toFixed(2)
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Health Factor Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Health Factor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getRiskColor(healthFactor)}`}>
                {healthFactor.toFixed(2)}
              </div>
              <Badge
                variant={getRiskVariant(healthFactor)}
                className="mt-4"
              >
                {getRiskLevel(healthFactor)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Collateral</div>
              <div className="text-xl font-bold">${totalCollateralValue.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Borrowed</div>
              <div className="text-xl font-bold">${totalBorrowedValue.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Liquidation Price</div>
              <div className="text-xl font-bold">${liquidationPrice}</div>
            </div>
          </div>

          {/* Risk Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Liquidation (1.0)</span>
              <span>Safe (&gt;2.0)</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-destructive via-yellow-500 to-green-500 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-black"
                style={{
                  left: `${Math.min(100, Math.max(0, ((healthFactor - 1) / 2) * 100))}%`,
                }}
              />
            </div>
          </div>

          {healthFactor < 2.0 && (
            <Alert variant={healthFactor < 1.5 ? "destructive" : "default"}>
              <AlertDescription>
                {healthFactor < 1.5 ? (
                  <>
                    <strong>⚠️ High Risk:</strong> Your position is at risk of liquidation.
                    Add collateral or repay borrowed funds immediately.
                  </>
                ) : (
                  <>
                    <strong>⚠️ Moderate Risk:</strong> Your health factor is below 2.0.
                    Consider adding more collateral to reduce liquidation risk.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Collateral Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Collateral Composition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {collateral.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No collateral deposited
            </div>
          ) : (
            collateral.map((c, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                      {c.asset[0]}
                    </div>
                    <div>
                      <div className="font-medium">{c.asset}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.amount} {c.asset}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${parseFloat(c.value).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((parseFloat(c.value) / totalCollateralValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(parseFloat(c.value) / totalCollateralValue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Remove Collateral */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Collateral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Collateral</TabsTrigger>
              <TabsTrigger value="remove">Remove Collateral</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Input
                  placeholder="Asset (e.g., USDC, ETH)"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {projectedHealthFactor !== null && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Projected Health Factor:</span>
                    <span className={`text-xl font-bold ${getRiskColor(projectedHealthFactor)}`}>
                      {projectedHealthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleAddCollateral}
                disabled={!selectedAsset || !amount || parseFloat(amount) <= 0 || isLoading}
              >
                {isLoading ? "Adding..." : "Add Collateral"}
              </Button>
            </TabsContent>

            <TabsContent value="remove" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Input
                  placeholder="Asset (e.g., USDC, ETH)"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {projectedHealthFactor !== null && projectedHealthFactor < 1.5 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Removing this collateral will put your position at risk of liquidation.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveCollateral}
                disabled={
                  !selectedAsset ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  (projectedHealthFactor !== null && projectedHealthFactor < 1.5) ||
                  isLoading
                }
              >
                {isLoading ? "Removing..." : "Remove Collateral"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
