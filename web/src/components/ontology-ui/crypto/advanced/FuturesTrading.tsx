/**
 * Futures Trading Component
 *
 * Perpetual futures trading interface with:
 * - Long/Short selection
 * - Leverage slider (1x-20x)
 * - Position size calculator
 * - Liquidation price calculation
 * - Funding rate display
 * - Open position management
 * - Active positions with P&L
 * - TP/SL (Take Profit/Stop Loss) settings
 */

import { useState, useEffect } from "react";
import { Effect } from "effect";
import {
  calculateFuturesPosition,
  type FuturesCalculation,
} from "@/lib/services/crypto/AdvancedDeFiService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

interface FuturesPosition {
  id: string;
  direction: "long" | "short";
  entryPrice: number;
  positionSize: number;
  leverage: number;
  currentPrice: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercentage: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  openedAt: Date;
}

interface FuturesTradingProps {
  symbol?: string;
  currentPrice?: number;
  fundingRate?: number;
  onTrade?: (position: FuturesPosition) => void;
}

export function FuturesTrading({
  symbol = "BTC",
  currentPrice = 68500,
  fundingRate = 0.01,
  onTrade,
}: FuturesTradingProps) {
  // Trading parameters
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState([10]);
  const [positionSize, setPositionSize] = useState("1.0");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");

  // Calculated values
  const [calculation, setCalculation] = useState<FuturesCalculation | null>(
    null
  );
  const [calculating, setCalculating] = useState(false);

  // Active positions
  const [positions, setPositions] = useState<FuturesPosition[]>([
    {
      id: "fut-1",
      direction: "long",
      entryPrice: 67800,
      positionSize: 0.5,
      leverage: 10,
      currentPrice: 68500,
      liquidationPrice: 61020,
      pnl: 350,
      pnlPercentage: 5.16,
      takeProfitPrice: 70000,
      stopLossPrice: 66500,
      openedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ]);

  // Calculate position details
  useEffect(() => {
    const calculate = async () => {
      setCalculating(true);

      try {
        const size = parseFloat(positionSize);
        const lev = leverage[0];
        const tpPrice = takeProfitPrice ? parseFloat(takeProfitPrice) : undefined;
        const slPrice = stopLossPrice ? parseFloat(stopLossPrice) : undefined;

        const result = await Effect.runPromise(
          calculateFuturesPosition(
            currentPrice,
            size,
            lev,
            direction,
            tpPrice,
            slPrice,
            fundingRate
          )
        );

        setCalculation(result);
      } catch (error) {
        console.error("Failed to calculate futures position:", error);
      } finally {
        setCalculating(false);
      }
    };

    calculate();
  }, [
    direction,
    leverage,
    positionSize,
    takeProfitPrice,
    stopLossPrice,
    currentPrice,
    fundingRate,
  ]);

  const handleOpenPosition = () => {
    if (!calculation) return;

    const newPosition: FuturesPosition = {
      id: `fut-${Date.now()}`,
      direction,
      entryPrice: currentPrice,
      positionSize: parseFloat(positionSize),
      leverage: leverage[0],
      currentPrice,
      liquidationPrice: calculation.liquidationPrice,
      pnl: 0,
      pnlPercentage: 0,
      takeProfitPrice: takeProfitPrice
        ? parseFloat(takeProfitPrice)
        : undefined,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      openedAt: new Date(),
    };

    setPositions([...positions, newPosition]);
    onTrade?.(newPosition);
  };

  const handleClosePosition = (positionId: string) => {
    setPositions(positions.filter((p) => p.id !== positionId));
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalMargin = calculation
    ? calculation.marginRequired * positions.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Perpetual Futures - {symbol}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg">
                ${currentPrice.toLocaleString()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Funding: {(fundingRate * 100).toFixed(3)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Direction Selection */}
          <div>
            <Label>Direction</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={direction === "long" ? "default" : "outline"}
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => setDirection("long")}
              >
                Long
              </Button>
              <Button
                variant={direction === "short" ? "default" : "outline"}
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => setDirection("short")}
              >
                Short
              </Button>
            </div>
          </div>

          {/* Leverage Slider */}
          <div>
            <Label className="flex items-center justify-between">
              <span>Leverage</span>
              <span className="font-bold text-lg">{leverage[0]}x</span>
            </Label>
            <Slider
              value={leverage}
              onValueChange={setLeverage}
              min={1}
              max={20}
              step={1}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1x</span>
              <span>5x</span>
              <span>10x</span>
              <span>15x</span>
              <span>20x</span>
            </div>
          </div>

          {/* Position Size */}
          <div>
            <Label>Position Size ({symbol})</Label>
            <Input
              type="number"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              min="0.01"
              step="0.01"
              className="mt-2"
            />
          </div>

          {/* TP/SL Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Take Profit ($)</Label>
              <Input
                type="number"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                placeholder="Optional"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Stop Loss ($)</Label>
              <Input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                placeholder="Optional"
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Position Calculation */}
          {calculation && !calculating ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notional Value:</span>
                  <span className="font-semibold">
                    ${calculation.notionalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin Required:</span>
                  <span className="font-semibold">
                    ${calculation.marginRequired.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">
                    Liquidation Price:
                  </span>
                  <span className="font-bold text-red-600 text-base">
                    ${calculation.liquidationPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {calculation.potentialProfit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Potential Profit:
                    </span>
                    <span className="text-green-600 font-semibold">
                      +${calculation.potentialProfit.toLocaleString()}
                    </span>
                  </div>
                )}
                {calculation.potentialLoss > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Potential Loss:
                    </span>
                    <span className="text-red-600 font-semibold">
                      -${calculation.potentialLoss.toLocaleString()}
                    </span>
                  </div>
                )}
                {calculation.riskRewardRatio > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Risk/Reward Ratio:
                    </span>
                    <span className="font-semibold">
                      1:{calculation.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Daily Funding Cost:
                  </span>
                  <span>${calculation.dailyFundingCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Calculating...
            </div>
          )}

          {/* Open Position Button */}
          <Button
            onClick={handleOpenPosition}
            disabled={calculating || !calculation}
            className={
              direction === "long"
                ? "w-full bg-green-600 hover:bg-green-700"
                : "w-full bg-red-600 hover:bg-red-700"
            }
            size="lg"
          >
            {calculating
              ? "Calculating..."
              : `Open ${direction.toUpperCase()} ${leverage[0]}x - Margin: $${
                  calculation?.marginRequired.toFixed(2) || "0.00"
                }`}
          </Button>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Positions</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={totalPnL >= 0 ? "default" : "destructive"}
                className="text-sm"
              >
                Total P&L: ${totalPnL.toFixed(2)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Margin: ${totalMargin.toFixed(2)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No active positions
              </div>
            ) : (
              positions.map((position) => (
                <Card key={position.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              position.direction === "long"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              position.direction === "long"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }
                          >
                            {position.direction.toUpperCase()} {position.leverage}x
                          </Badge>
                          <span className="font-semibold">
                            {position.positionSize} {symbol}
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={
                              position.pnl >= 0
                                ? "text-green-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {position.pnl >= 0 ? "+" : ""}$
                            {position.pnl.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {position.pnl >= 0 ? "+" : ""}
                            {position.pnlPercentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Entry:</span>{" "}
                          <span className="font-semibold">
                            ${position.entryPrice.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>{" "}
                          <span className="font-semibold">
                            ${position.currentPrice.toLocaleString()}
                          </span>
                        </div>
                        {position.takeProfitPrice && (
                          <div>
                            <span className="text-muted-foreground">TP:</span>{" "}
                            <span className="text-green-600">
                              ${position.takeProfitPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {position.stopLossPrice && (
                          <div>
                            <span className="text-muted-foreground">SL:</span>{" "}
                            <span className="text-red-600">
                              ${position.stopLossPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Liquidation:
                          </span>{" "}
                          <span className="text-red-600 font-semibold">
                            ${position.liquidationPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleClosePosition(position.id)}
                      >
                        Close Position
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
