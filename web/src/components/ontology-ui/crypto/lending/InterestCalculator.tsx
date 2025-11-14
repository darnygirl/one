/**
 * InterestCalculator Component (Cycle 70)
 *
 * Calculate interest rates for lending and borrowing.
 *
 * Features:
 * - Supply/borrow amount input
 * - Time period selector (days, months, years)
 * - Interest calculation (simple + compound)
 * - APY vs APR comparison
 * - Total earnings/cost projection
 * - Historical rate chart
 * - Comparison across different protocols
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InterestCalculatorProps {
  defaultAPY?: number;
  defaultAmount?: string;
}

export function InterestCalculator({
  defaultAPY = 4.2,
  defaultAmount = "1000"
}: InterestCalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [apy, setAPY] = useState(defaultAPY.toString());
  const [period, setPeriod] = useState("365"); // days
  const [periodType, setPeriodType] = useState<"days" | "months" | "years">("days");
  const [simpleInterest, setSimpleInterest] = useState(0);
  const [compoundInterest, setCompoundInterest] = useState(0);
  const [totalSimple, setTotalSimple] = useState(0);
  const [totalCompound, setTotalCompound] = useState(0);

  // Calculate interest
  useEffect(() => {
    const principal = parseFloat(amount) || 0;
    const rate = parseFloat(apy) / 100 || 0;
    let days = parseFloat(period) || 0;

    // Convert period to days
    if (periodType === "months") {
      days = days * 30;
    } else if (periodType === "years") {
      days = days * 365;
    }

    const years = days / 365;

    // Simple Interest = Principal × Rate × Time
    const simple = principal * rate * years;
    const totalS = principal + simple;

    // Compound Interest (daily compounding)
    // A = P(1 + r/n)^(nt) where n = 365
    const n = 365;
    const compound = principal * Math.pow(1 + rate / n, n * years) - principal;
    const totalC = principal + compound;

    setSimpleInterest(simple);
    setCompoundInterest(compound);
    setTotalSimple(totalS);
    setTotalCompound(totalC);
  }, [amount, apy, period, periodType]);

  const apr = parseFloat(apy) || 0;
  const apyCalc = ((Math.pow(1 + apr / 100 / 365, 365) - 1) * 100).toFixed(2);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Mock historical rates
  const historicalRates = [
    { date: "Jan", supply: 3.2, borrow: 4.5 },
    { date: "Feb", supply: 3.5, borrow: 4.8 },
    { date: "Mar", supply: 3.8, borrow: 5.1 },
    { date: "Apr", supply: 4.0, borrow: 5.3 },
    { date: "May", supply: 4.2, borrow: 5.5 },
    { date: "Jun", supply: 3.9, borrow: 5.2 },
  ];

  const maxRate = Math.max(...historicalRates.map((r) => Math.max(r.supply, r.borrow)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interest Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="supply" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supply">Supply (Earn)</TabsTrigger>
              <TabsTrigger value="borrow">Borrow (Pay)</TabsTrigger>
            </TabsList>

            <TabsContent value="supply" className="space-y-4">
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supply APY (%)</Label>
                  <Input
                    type="number"
                    placeholder="4.2"
                    value={apy}
                    onChange={(e) => setAPY(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="365"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Simple Interest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Simple Interest</h3>
                    <Badge variant="outline">Linear</Badge>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest Earned:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(simpleInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="text-xl font-bold">{formatCurrency(totalSimple)}</span>
                    </div>
                  </div>
                </div>

                {/* Compound Interest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Compound Interest</h3>
                    <Badge variant="default">Daily</Badge>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest Earned:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(compoundInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="text-xl font-bold">{formatCurrency(totalCompound)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Compound earns more by:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(compoundInterest - simpleInterest)}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="borrow" className="space-y-4">
              {/* Same inputs but with different context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Borrow Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Borrow APY (%)</Label>
                  <Input
                    type="number"
                    placeholder="5.5"
                    value={apy}
                    onChange={(e) => setAPY(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="365"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Results for Borrowing */}
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Cost (Compound):</span>
                    <span className="font-bold text-yellow-700 dark:text-yellow-400">
                      {formatCurrency(compoundInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Repayment:</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalCompound)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Daily Cost</div>
                    <div className="font-bold">
                      {formatCurrency((compoundInterest / parseFloat(period)) || 0)}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Monthly Cost</div>
                    <div className="font-bold">
                      {formatCurrency((compoundInterest / (parseFloat(period) / 30)) || 0)}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Yearly Cost</div>
                    <div className="font-bold">
                      {formatCurrency((compoundInterest / (parseFloat(period) / 365)) || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* APY vs APR */}
      <Card>
        <CardHeader>
          <CardTitle>APY vs APR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">APR (Simple)</div>
              <div className="text-3xl font-bold">{apr.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Annual Percentage Rate (no compounding)
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">APY (Compound)</div>
              <div className="text-3xl font-bold">{apyCalc}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Annual Percentage Yield (daily compounding)
              </p>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              APY accounts for compound interest, which means your interest earns interest.
              This is why APY is higher than APR.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Historical Rates Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Interest Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Supply APY</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Borrow APY</span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-4">
              {historicalRates.map((rate, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-1 h-40">
                    <div
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(rate.supply / maxRate) * 100}%` }}
                      title={`Supply: ${rate.supply}%`}
                    />
                    <div
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${(rate.borrow / maxRate) * 100}%` }}
                      title={`Borrow: ${rate.borrow}%`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{rate.date}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
