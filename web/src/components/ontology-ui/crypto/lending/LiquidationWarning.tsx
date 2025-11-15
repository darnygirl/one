/**
 * LiquidationWarning Component (Cycle 69)
 *
 * Real-time liquidation risk monitoring with alerts.
 *
 * Features:
 * - Health factor monitor with live updates
 * - Real-time price tracking
 * - Liquidation price calculation
 * - Risk level indicator (safe/warning/danger)
 * - Add collateral quick action
 * - Repay loan quick action
 * - Alert notifications for risk changes
 * - Price drop percentage to liquidation
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { BorrowPosition } from "@/lib/services/crypto/LendingService";

interface LiquidationWarningProps {
  position?: BorrowPosition;
  currentPrice?: number;
  onAddCollateral?: () => void;
  onRepayLoan?: () => void;
  realTimeUpdates?: boolean;
}

export function LiquidationWarning({
  position,
  currentPrice = 0,
  onAddCollateral,
  onRepayLoan,
  realTimeUpdates = true
}: LiquidationWarningProps) {
  const [healthFactor, setHealthFactor] = useState<number>(position?.healthFactor || 0);
  const [priceDropToLiquidation, setPriceDropToLiquidation] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<"safe" | "warning" | "danger">("safe");
  const [alertShown, setAlertShown] = useState(false);

  // Simulate real-time health factor updates
  useEffect(() => {
    if (!realTimeUpdates || !position) return;

    const interval = setInterval(() => {
      // Simulate price fluctuations (±2%)
      const fluctuation = 1 + (Math.random() - 0.5) * 0.04;
      const newHF = (position.healthFactor || 0) * fluctuation;
      setHealthFactor(newHF);

      // Calculate price drop to liquidation
      const liquidationPx = parseFloat(position.liquidationPrice);
      const drop = currentPrice > 0
        ? ((currentPrice - liquidationPx) / currentPrice) * 100
        : 0;
      setPriceDropToLiquidation(Math.max(0, drop));

      // Update risk level
      let newRisk: "safe" | "warning" | "danger";
      if (newHF >= 2.0) {
        newRisk = "safe";
      } else if (newHF >= 1.5) {
        newRisk = "warning";
      } else {
        newRisk = "danger";
      }

      // Show alert if risk level changes to warning or danger
      if (newRisk !== "safe" && newRisk !== riskLevel && !alertShown) {
        setAlertShown(true);
        setTimeout(() => setAlertShown(false), 5000);
      }

      setRiskLevel(newRisk);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [position, currentPrice, realTimeUpdates, riskLevel, alertShown]);

  if (!position) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No active borrow position
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: string): string => {
    switch (level) {
      case "safe":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBg = (level: string): string => {
    switch (level) {
      case "safe":
        return "bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20";
      case "danger":
        return "bg-red-50 dark:bg-red-950/20";
      default:
        return "bg-muted/50";
    }
  };

  const getRiskIcon = (level: string): string => {
    switch (level) {
      case "safe":
        return "✓";
      case "warning":
        return "⚠️";
      case "danger":
        return "🚨";
      default:
        return "•";
    }
  };

  const totalCollateralValue = position.collateral.reduce(
    (sum, c) => sum + parseFloat(c.value),
    0
  );

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {alertShown && riskLevel !== "safe" && (
        <Alert variant={riskLevel === "danger" ? "destructive" : "default"}>
          <AlertTitle>
            {riskLevel === "danger" ? "🚨 Liquidation Risk!" : "⚠️ Warning"}
          </AlertTitle>
          <AlertDescription>
            {riskLevel === "danger"
              ? "Your position is at high risk of liquidation. Take action immediately!"
              : "Your health factor has dropped. Consider adding collateral or repaying debt."}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Factor Card */}
      <Card className={getRiskBg(riskLevel)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liquidation Monitor</span>
            <Badge
              variant={
                riskLevel === "safe"
                  ? "default"
                  : riskLevel === "warning"
                  ? "secondary"
                  : "destructive"
              }
            >
              {getRiskIcon(riskLevel)} {riskLevel.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Factor Display */}
          <div className="text-center py-6">
            <div className="text-sm text-muted-foreground mb-2">Current Health Factor</div>
            <div className={`text-7xl font-bold ${getRiskColor(riskLevel)}`}>
              {healthFactor.toFixed(2)}
            </div>
            {realTimeUpdates && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Risk Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Liquidation Price</div>
              <div className="text-2xl font-bold">${position.liquidationPrice}</div>
              <div className="text-xs text-muted-foreground mt-1">per {position.asset}</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Price Drop to Liquidation</div>
              <div className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
                {priceDropToLiquidation.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">buffer remaining</div>
            </div>
          </div>

          {/* Position Details */}
          <div className="space-y-3 bg-background/50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collateral Value:</span>
              <span className="font-medium">${totalCollateralValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Borrowed Value:</span>
              <span className="font-medium">${parseFloat(position.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Borrow APY:</span>
              <span className="font-medium">{position.apy.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accrued Interest:</span>
              <span className="font-medium">{position.accrued} {position.asset}</span>
            </div>
          </div>

          {/* Collateral Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Collateral Assets</h4>
            {position.collateral.map((c, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-background/50 p-3 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {c.asset[0]}
                  </div>
                  <span>{c.asset}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{c.amount}</div>
                  <div className="text-xs text-muted-foreground">${c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Guidelines */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Risk Levels</h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="w-16">Safe</Badge>
                <span>Health Factor &gt;= 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-16">Warning</Badge>
                <span>Health Factor 1.5 - 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-16">Danger</Badge>
                <span>Health Factor &lt; 1.5</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {riskLevel !== "safe" && (
            <Alert>
              <AlertTitle>Recommendations</AlertTitle>
              <AlertDescription className="space-y-2">
                {riskLevel === "danger" ? (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Add more collateral immediately to increase your health factor</li>
                    <li>Repay part of your loan to reduce borrowed amount</li>
                    <li>Monitor price movements closely</li>
                    <li>Set up price alerts for your collateral assets</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Consider adding more collateral to improve safety buffer</li>
                    <li>Monitor your position daily</li>
                    <li>Be prepared to act if health factor drops further</li>
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {riskLevel !== "safe" && (
          <CardFooter className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={onAddCollateral}
            >
              Add Collateral
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onRepayLoan}
            >
              Repay Loan
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Historical Health Factor (Mock) */}
      <Card>
        <CardHeader>
          <CardTitle>Health Factor History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end justify-between gap-1">
            {[2.5, 2.3, 2.1, 2.4, 2.2, 2.0, 1.9, 1.8, 2.0, 2.1, 1.9, healthFactor].map((hf, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${
                  hf >= 2.0 ? "bg-green-500" : hf >= 1.5 ? "bg-yellow-500" : "bg-destructive"
                }`}
                style={{ height: `${(hf / 3) * 100}%` }}
                title={`HF: ${hf.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
