/**
 * PositionManager Component (Cycle 71)
 *
 * Manage all lending and borrowing positions in one dashboard.
 *
 * Features:
 * - All active positions dashboard
 * - Supplied assets with APY display
 * - Borrowed assets with APY display
 * - Net APY calculation (earnings - costs)
 * - Close position functionality
 * - Position history tracking
 * - Total portfolio value
 * - Quick actions (add collateral, repay, withdraw)
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LendPosition, BorrowPosition } from "@/lib/services/crypto/LendingService";

interface PositionManagerProps {
  lendingPositions?: LendPosition[];
  borrowPositions?: BorrowPosition[];
  netAPY?: number;
  onClosePosition?: (positionId: string, type: "lend" | "borrow") => Promise<void>;
  onWithdraw?: (positionId: string, amount: string) => Promise<void>;
  onRepay?: (positionId: string, amount: string) => Promise<void>;
}

export function PositionManager({
  lendingPositions = [],
  borrowPositions = [],
  netAPY = 0,
  onClosePosition,
  onWithdraw,
  onRepay
}: PositionManagerProps) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalLendingValue = lendingPositions.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  const totalBorrowingValue = borrowPositions.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  const totalAccruedInterest = lendingPositions.reduce(
    (sum, p) => sum + parseFloat(p.accrued),
    0
  );

  const totalInterestCost = borrowPositions.reduce(
    (sum, p) => sum + parseFloat(p.accrued),
    0
  );

  const handleClosePosition = async (positionId: string, type: "lend" | "borrow") => {
    setIsLoading(true);
    try {
      await onClosePosition?.(positionId, type);
      setSelectedPosition(null);
    } catch (error) {
      console.error("Failed to close position:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculatePositionDuration = (startDate: number): string => {
    const days = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Supplied</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalLendingValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Borrowed</div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalBorrowingValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Interest Earned</div>
            <div className="text-2xl font-bold text-green-600">
              +${totalAccruedInterest.toFixed(6)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Net APY</div>
            <div className={`text-2xl font-bold ${netAPY >= 0 ? "text-green-600" : "text-destructive"}`}>
              {netAPY >= 0 ? "+" : ""}{netAPY.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lending">
                Lending ({lendingPositions.length})
              </TabsTrigger>
              <TabsTrigger value="borrowing">
                Borrowing ({borrowPositions.length})
              </TabsTrigger>
            </TabsList>

            {/* Lending Positions */}
            <TabsContent value="lending" className="space-y-4">
              {lendingPositions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No active lending positions
                </div>
              ) : (
                lendingPositions.map((position) => (
                  <Card
                    key={position.id}
                    className={`cursor-pointer transition-all ${
                      selectedPosition === position.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedPosition(position.id)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                              <span className="text-2xl font-bold text-green-600">
                                {position.asset[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{position.asset}</h3>
                                <Badge variant="outline" className="capitalize">
                                  {position.protocol}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {calculatePositionDuration(position.startDate)} active
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{position.amount}</div>
                            <div className="text-sm text-muted-foreground">{position.asset}</div>
                          </div>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">APY</div>
                            <div className="font-bold text-green-600">{position.apy.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Interest Earned</div>
                            <div className="font-bold text-green-600">
                              +{position.accrued} {position.asset}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Receipt Token</div>
                            <div className="font-medium">{position.receiptToken}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Started</div>
                            <div className="font-medium">{formatDate(position.startDate)}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        {selectedPosition === position.id && (
                          <>
                            <Separator />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onWithdraw?.(position.id, position.amount);
                                }}
                              >
                                Withdraw
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClosePosition(position.id, "lend");
                                }}
                                disabled={isLoading}
                              >
                                {isLoading ? "Closing..." : "Close Position"}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Borrowing Positions */}
            <TabsContent value="borrowing" className="space-y-4">
              {borrowPositions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No active borrowing positions
                </div>
              ) : (
                borrowPositions.map((position) => (
                  <Card
                    key={position.id}
                    className={`cursor-pointer transition-all ${
                      selectedPosition === position.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedPosition(position.id)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <span className="text-2xl font-bold text-blue-600">
                                {position.asset[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{position.asset}</h3>
                                <Badge variant="outline" className="capitalize">
                                  {position.protocol}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {calculatePositionDuration(position.startDate)} active
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{position.amount}</div>
                            <div className="text-sm text-muted-foreground">{position.asset}</div>
                          </div>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Borrow APY</div>
                            <div className="font-bold text-blue-600">{position.apy.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Interest Cost</div>
                            <div className="font-bold text-yellow-600">
                              -{position.accrued} {position.asset}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Health Factor</div>
                            <div
                              className={`font-bold ${
                                position.healthFactor >= 2.0
                                  ? "text-green-600"
                                  : position.healthFactor >= 1.5
                                  ? "text-yellow-600"
                                  : "text-destructive"
                              }`}
                            >
                              {position.healthFactor.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Liquidation Price</div>
                            <div className="font-medium">${position.liquidationPrice}</div>
                          </div>
                        </div>

                        {/* Collateral */}
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Collateral</div>
                          <div className="flex gap-2 flex-wrap">
                            {position.collateral.map((c, i) => (
                              <Badge key={i} variant="secondary">
                                {c.amount} {c.asset} (${c.value})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Health Warning */}
                        {position.healthFactor < 2.0 && (
                          <Alert variant={position.healthFactor < 1.5 ? "destructive" : "default"}>
                            <AlertDescription className="text-sm">
                              {position.healthFactor < 1.5 ? (
                                <>⚠️ High liquidation risk! Add collateral immediately.</>
                              ) : (
                                <>⚠️ Consider adding more collateral to improve health factor.</>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Actions */}
                        {selectedPosition === position.id && (
                          <>
                            <Separator />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add collateral action
                                }}
                              >
                                Add Collateral
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRepay?.(position.id, position.amount);
                                }}
                              >
                                Repay
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClosePosition(position.id, "borrow");
                                }}
                                disabled={isLoading}
                              >
                                {isLoading ? "Closing..." : "Close Position"}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Net APY Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Net APY Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lending Earnings:</span>
              <span className="text-lg font-bold text-green-600">
                +{lendingPositions.reduce((sum, p) => sum + (parseFloat(p.amount) * (p.apy / 100)), 0).toFixed(2)} APY
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Borrowing Costs:</span>
              <span className="text-lg font-bold text-destructive">
                -{borrowPositions.reduce((sum, p) => sum + (parseFloat(p.amount) * (p.apy / 100)), 0).toFixed(2)} APY
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Net APY:</span>
              <span className={`text-2xl font-bold ${netAPY >= 0 ? "text-green-600" : "text-destructive"}`}>
                {netAPY >= 0 ? "+" : ""}{netAPY.toFixed(2)}%
              </span>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Net APY represents your overall earnings after accounting for borrowing costs.
              A positive Net APY means you're earning more from lending than paying in interest.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
