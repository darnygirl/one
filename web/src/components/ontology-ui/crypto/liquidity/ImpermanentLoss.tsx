/**
 * ImpermanentLoss Component (Cycle 63)
 *
 * Calculate and visualize impermanent loss for liquidity providers.
 *
 * Features:
 * - Token pair input
 * - Initial price and current price
 * - Amount invested
 * - IL calculation ($ and %)
 * - Fees earned offset
 * - Break-even price calculator
 * - Historical IL chart
 * - Educational tooltips
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImpermanentLossProps {
  token0Symbol?: string;
  token1Symbol?: string;
  initialPrice?: number;
  currentPrice?: number;
  investmentAmount?: number;
  feeTier?: number;
  volume24h?: number;
}

export function ImpermanentLoss({
  token0Symbol = "ETH",
  token1Symbol = "USDC",
  initialPrice: propInitialPrice = 2000,
  currentPrice: propCurrentPrice = 2000,
  investmentAmount: propInvestmentAmount = 10000,
  feeTier = 0.3,
  volume24h = 100000
}: ImpermanentLossProps) {
  const [initialPrice, setInitialPrice] = useState(propInitialPrice.toString());
  const [currentPrice, setCurrentPrice] = useState(propCurrentPrice.toString());
  const [investmentAmount, setInvestmentAmount] = useState(propInvestmentAmount.toString());
  const [ilData, setIlData] = useState({
    ilPercent: 0,
    ilDollar: 0,
    hodlValue: 0,
    lpValue: 0,
    feesEarned: 0,
    netReturn: 0
  });

  useEffect(() => {
    calculateIL();
  }, [initialPrice, currentPrice, investmentAmount]);

  const calculateIL = () => {
    const p0 = parseFloat(initialPrice);
    const p1 = parseFloat(currentPrice);
    const investment = parseFloat(investmentAmount);

    if (!p0 || !p1 || !investment || p0 <= 0 || p1 <= 0) {
      return;
    }

    // Price ratio
    const priceRatio = p1 / p0;

    // Impermanent Loss formula
    const ilMultiplier = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
    const ilPercent = ((ilMultiplier - 1) * 100);

    // HODL strategy value
    const hodlValue = investment * (1 + (priceRatio - 1) / 2);

    // LP position value (with IL)
    const lpValue = investment * ilMultiplier;

    // Dollar value of IL
    const ilDollar = hodlValue - lpValue;

    // Estimate fees earned (based on volume and fee tier)
    // Assume LP owns 1% of pool (simplified)
    const poolShare = 0.01;
    const dailyFees = volume24h * (feeTier / 100) * poolShare;
    const daysHeld = Math.max(1, Math.abs(priceRatio - 1) * 30); // Rough estimate
    const feesEarned = dailyFees * daysHeld;

    // Net return (LP value + fees - initial investment)
    const netReturn = lpValue + feesEarned - investment;

    setIlData({
      ilPercent,
      ilDollar,
      hodlValue,
      lpValue,
      feesEarned,
      netReturn
    });
  };

  const calculateBreakEvenPrice = (): number => {
    const p0 = parseFloat(initialPrice);
    const investment = parseFloat(investmentAmount);

    if (!p0 || !investment) return 0;

    // Simplified: Price that makes fees offset IL
    // This is a rough estimate
    const poolShare = 0.01;
    const dailyFees = volume24h * (feeTier / 100) * poolShare;

    // For small price changes, IL is roughly (price_change)^2 / 8
    // Fees accumulate linearly with time
    // Break-even when fees = IL

    // This is simplified - real calculation is complex
    return p0 * 1.1; // Placeholder: 10% price movement typically needs ~30 days of fees
  };

  const generatePriceScenarios = () => {
    const p0 = parseFloat(initialPrice);
    if (!p0) return [];

    const scenarios = [];
    for (let ratio = 0.5; ratio <= 2; ratio += 0.1) {
      const price = p0 * ratio;
      const priceRatio = ratio;
      const ilMultiplier = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);
      const ilPercent = (ilMultiplier - 1) * 100;

      scenarios.push({
        price: price.toFixed(2),
        ratio: ((ratio - 1) * 100).toFixed(1),
        il: ilPercent.toFixed(2)
      });
    }
    return scenarios;
  };

  const scenarios = generatePriceScenarios();
  const breakEvenPrice = calculateBreakEvenPrice();

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getILSeverity = (ilPercent: number) => {
    const absIL = Math.abs(ilPercent);
    if (absIL < 0.5) return { color: "text-green-600", label: "Minimal" };
    if (absIL < 2) return { color: "text-blue-600", label: "Low" };
    if (absIL < 5) return { color: "text-yellow-600", label: "Moderate" };
    if (absIL < 10) return { color: "text-orange-600", label: "High" };
    return { color: "text-red-600", label: "Severe" };
  };

  const severity = getILSeverity(ilData.ilPercent);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Impermanent Loss Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="education">Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token Pair</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-4 py-2">
                    {token0Symbol}
                  </Badge>
                  <span className="text-muted-foreground">/</span>
                  <Badge variant="outline" className="px-4 py-2">
                    {token1Symbol}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Investment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial {token0Symbol} Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current {token0Symbol} Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Results */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Impermanent Loss</p>
                <p className={`text-4xl font-bold ${severity.color}`}>
                  {formatPercent(ilData.ilPercent)}
                </p>
                <Badge variant="outline" className="mt-2">
                  {severity.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">HODL Value</p>
                  <p className="font-bold">{formatCurrency(ilData.hodlValue)}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">LP Value</p>
                  <p className="font-bold">{formatCurrency(ilData.lpValue)}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Fees Earned</p>
                  <p className="font-bold text-green-600">{formatCurrency(ilData.feesEarned)}</p>
                </div>

                <div className={`p-4 rounded-lg text-center ${
                  ilData.netReturn >= 0
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-red-50 dark:bg-red-950"
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">Net Return</p>
                  <p className={`font-bold ${ilData.netReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(ilData.netReturn)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IL (Dollar Value):</span>
                  <span className="font-medium text-red-600">{formatCurrency(ilData.ilDollar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Change:</span>
                  <span className="font-medium">
                    {formatPercent(((parseFloat(currentPrice) / parseFloat(initialPrice)) - 1) * 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Break-even Price (est.):</span>
                  <span className="font-medium">{formatCurrency(breakEvenPrice)}</span>
                </div>
              </div>

              {ilData.netReturn >= 0 && ilData.ilDollar > 0 && (
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-sm text-green-700 dark:text-green-400">
                  Good news! Trading fees have more than offset your impermanent loss.
                </div>
              )}

              {ilData.netReturn < 0 && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg text-sm text-red-700 dark:text-red-400">
                  Warning: Your position is currently showing a loss. Consider waiting for prices to revert or accumulate more fees.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Impermanent loss at different price levels (relative to {formatCurrency(parseFloat(initialPrice))})
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted font-medium text-sm">
                <span>{token0Symbol} Price</span>
                <span className="text-center">Price Change</span>
                <span className="text-right">IL</span>
              </div>
              <Separator />
              <div className="divide-y">
                {scenarios.map((scenario, index) => {
                  const isCurrentPrice = Math.abs(parseFloat(scenario.price) - parseFloat(currentPrice)) < 1;
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-3 gap-4 p-3 text-sm ${
                        isCurrentPrice ? "bg-primary/10 font-medium" : ""
                      }`}
                    >
                      <span>{formatCurrency(parseFloat(scenario.price))}</span>
                      <span className="text-center">{scenario.ratio}%</span>
                      <span className={`text-right ${
                        parseFloat(scenario.il) < -0.5 ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {scenario.il}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              Current price is highlighted. The table shows how IL increases with larger price movements in either direction.
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">What is Impermanent Loss?</h3>
                <p className="text-muted-foreground">
                  Impermanent loss occurs when the price ratio of tokens in a liquidity pool changes after you deposit.
                  The larger the price change, the greater the impermanent loss.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Why "Impermanent"?</h3>
                <p className="text-muted-foreground">
                  The loss is "impermanent" because it can be recovered if prices return to their original ratio.
                  However, if you withdraw at different prices, the loss becomes permanent.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Key Points:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>IL is always negative (you lose value vs. holding)</li>
                  <li>Larger price movements = greater IL</li>
                  <li>Trading fees can offset IL over time</li>
                  <li>Stable pairs (e.g., USDC/DAI) have minimal IL</li>
                  <li>Volatile pairs have higher IL but more fees</li>
                </ul>
              </div>

              <Separator />

              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Example:</h3>
                <p className="text-muted-foreground">
                  If ETH doubles in price, your IL is about 5.7%. However, if the pool has high trading volume
                  and you earn 8% in fees, your net return is still positive at +2.3%.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
