/**
 * Options Trading Component
 *
 * Complete options trading interface with:
 * - Call/Put selection
 * - Strike price selector
 * - Expiration date picker
 * - Premium calculation using Black-Scholes
 * - Greeks display (delta, gamma, theta, vega, rho)
 * - Buy/sell options
 * - Active positions list
 * - P&L chart
 */

import { useState, useEffect } from "react";
import { Effect } from "effect";
import {
  calculateOptionsGreeks,
  calculateOptionsPricing,
  type OptionsGreeks,
  type OptionsPricing,
} from "@/lib/services/crypto/AdvancedDeFiService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OptionPosition {
  id: string;
  type: "call" | "put";
  strikePrice: number;
  expirationDate: Date;
  premium: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

interface OptionsTradingProps {
  symbol?: string;
  currentPrice?: number;
  onTrade?: (position: OptionPosition) => void;
}

export function OptionsTrading({
  symbol = "ETH",
  currentPrice = 3500,
  onTrade,
}: OptionsTradingProps) {
  // Trading parameters
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [strikePrice, setStrikePrice] = useState(currentPrice.toString());
  const [daysToExpiry, setDaysToExpiry] = useState("30");
  const [quantity, setQuantity] = useState("1");
  const [volatility, setVolatility] = useState("0.60"); // 60% IV

  // Calculated values
  const [greeks, setGreeks] = useState<OptionsGreeks | null>(null);
  const [pricing, setPricing] = useState<OptionsPricing | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Active positions
  const [positions, setPositions] = useState<OptionPosition[]>([
    {
      id: "pos-1",
      type: "call",
      strikePrice: 3600,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      premium: 145.32,
      quantity: 2,
      entryPrice: 145.32,
      currentPrice: 168.45,
      pnl: 46.26,
    },
    {
      id: "pos-2",
      type: "put",
      strikePrice: 3400,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      premium: 89.15,
      quantity: 1,
      entryPrice: 89.15,
      currentPrice: 72.30,
      pnl: -16.85,
    },
  ]);

  const riskFreeRate = 0.05; // 5% risk-free rate

  // Calculate Greeks and pricing
  useEffect(() => {
    const calculate = async () => {
      setCalculating(true);

      try {
        const timeToExpiry = parseFloat(daysToExpiry) / 365;
        const spot = currentPrice;
        const strike = parseFloat(strikePrice);
        const vol = parseFloat(volatility);

        const [greeksResult, pricingResult] = await Promise.all([
          Effect.runPromise(
            calculateOptionsGreeks(
              spot,
              strike,
              timeToExpiry,
              vol,
              riskFreeRate,
              optionType
            )
          ),
          Effect.runPromise(
            calculateOptionsPricing(
              spot,
              strike,
              timeToExpiry,
              vol,
              riskFreeRate,
              optionType
            )
          ),
        ]);

        setGreeks(greeksResult);
        setPricing(pricingResult);
      } catch (error) {
        console.error("Failed to calculate options:", error);
      } finally {
        setCalculating(false);
      }
    };

    calculate();
  }, [
    optionType,
    strikePrice,
    daysToExpiry,
    volatility,
    currentPrice,
    riskFreeRate,
  ]);

  const handleBuy = () => {
    if (!pricing) return;

    const newPosition: OptionPosition = {
      id: `pos-${Date.now()}`,
      type: optionType,
      strikePrice: parseFloat(strikePrice),
      expirationDate: new Date(
        Date.now() + parseFloat(daysToExpiry) * 24 * 60 * 60 * 1000
      ),
      premium: pricing.premium,
      quantity: parseFloat(quantity),
      entryPrice: pricing.premium,
      currentPrice: pricing.premium,
      pnl: 0,
    };

    setPositions([...positions, newPosition]);
    onTrade?.(newPosition);
  };

  const handleClosePosition = (positionId: string) => {
    setPositions(positions.filter((p) => p.id !== positionId));
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="space-y-4">
      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Options Trading - {symbol}</span>
            <Badge variant="outline" className="text-lg">
              ${currentPrice.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Option Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Option Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={optionType === "call" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOptionType("call")}
                >
                  Call
                </Button>
                <Button
                  variant={optionType === "put" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOptionType("put")}
                >
                  Put
                </Button>
              </div>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                step="0.01"
                className="mt-2"
              />
            </div>
          </div>

          {/* Strike Price & Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Strike Price</Label>
              <Input
                type="number"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
                min="1"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Days to Expiration</Label>
              <Select value={daysToExpiry} onValueChange={setDaysToExpiry}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Volatility */}
          <div>
            <Label>Implied Volatility (%)</Label>
            <Input
              type="number"
              value={parseFloat(volatility) * 100}
              onChange={(e) =>
                setVolatility((parseFloat(e.target.value) / 100).toString())
              }
              min="0"
              max="500"
              step="5"
              className="mt-2"
            />
          </div>

          <Separator />

          {/* Premium & Pricing */}
          {pricing && !calculating ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Premium:</span>
                <span className="font-bold text-lg">
                  ${pricing.premium.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Intrinsic Value:</span>
                <span>${pricing.intrinsicValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Value:</span>
                <span>${pricing.timeValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Break-Even Price:</span>
                <span>${pricing.breakEvenPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Loss:</span>
                <span className="text-red-600">
                  ${pricing.maxLoss.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Profit:</span>
                <span className="text-green-600">
                  {pricing.maxProfit === Infinity
                    ? "Unlimited"
                    : `$${pricing.maxProfit.toLocaleString()}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Calculating...
            </div>
          )}

          <Separator />

          {/* Greeks Display */}
          {greeks && !calculating ? (
            <div>
              <h4 className="font-semibold mb-3">Greeks</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delta (Δ):</span>
                  <span className="font-mono">{greeks.delta.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gamma (Γ):</span>
                  <span className="font-mono">{greeks.gamma.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Theta (Θ) /day:
                  </span>
                  <span className="font-mono">{greeks.theta.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vega (ν) /1%:</span>
                  <span className="font-mono">{greeks.vega.toFixed(4)}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Rho (ρ) /1%:</span>
                  <span className="font-mono">{greeks.rho.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Buy Button */}
          <Button
            onClick={handleBuy}
            disabled={calculating || !pricing}
            className="w-full"
            size="lg"
          >
            {calculating
              ? "Calculating..."
              : `Buy ${optionType.toUpperCase()} Option - $${
                  pricing
                    ? (pricing.premium * parseFloat(quantity)).toFixed(2)
                    : "0.00"
                }`}
          </Button>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Positions</span>
            <Badge
              variant={totalPnL >= 0 ? "default" : "destructive"}
              className="text-sm"
            >
              Total P&L: ${totalPnL.toFixed(2)}
            </Badge>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              position.type === "call" ? "default" : "secondary"
                            }
                          >
                            {position.type.toUpperCase()}
                          </Badge>
                          <span className="font-semibold">
                            ${position.strikePrice}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            x{position.quantity}
                          </span>
                        </div>
                        <Badge
                          variant={position.pnl >= 0 ? "default" : "destructive"}
                        >
                          {position.pnl >= 0 ? "+" : ""}$
                          {position.pnl.toFixed(2)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          Entry: ${position.entryPrice.toFixed(2)}
                        </div>
                        <div>
                          Current: ${position.currentPrice.toFixed(2)}
                        </div>
                        <div className="col-span-2">
                          Expires:{" "}
                          {position.expirationDate.toLocaleDateString()}
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
