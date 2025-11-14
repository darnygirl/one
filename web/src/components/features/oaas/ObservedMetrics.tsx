/**
 * Observed Metrics Component (Cycles 87-88)
 *
 * Charts showing expected vs observed performance
 * Proves ROI with real data from agent usage
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, Zap } from "lucide-react";
import type { ObservedMetrics } from "@/lib/effect/oaasClient";

interface MetricsComparisonProps {
  expected: {
    accuracy_pct: number;
    token_efficiency_pct: number;
    cost_savings_usd: number;
    time_saved_hours: number;
  };
  observed: ObservedMetrics;
}

export function ObservedMetricsComparison({ expected, observed }: MetricsComparisonProps) {
  const observedAccuracy = parseFloat(observed["x-oaas-observed-accuracy-delta"] || "0");
  const observedTokens = parseFloat(observed["x-oaas-observed-tokens-saved"] || "0");
  const latencyMs = parseInt(observed["x-oaas-latency-ms"] || "0", 10);

  return (
    <div className="space-y-4">
      {/* Accuracy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Accuracy Performance
          </CardTitle>
          <CardDescription>Expected vs. observed accuracy improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonBar
            label="Accuracy Gain"
            expected={expected.accuracy_pct}
            observed={observedAccuracy}
            format="percent"
            color="blue"
          />
        </CardContent>
      </Card>

      {/* Token Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Token Efficiency
          </CardTitle>
          <CardDescription>Expected vs. observed token savings</CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonBar
            label="Tokens Saved"
            expected={expected.token_efficiency_pct}
            observed={observedTokens}
            format="percent"
            color="green"
          />
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatRow label="Response Latency" value={`${latencyMs}ms`} />
          <StatRow
            label="Cost Savings (Expected)"
            value={`$${expected.cost_savings_usd}`}
          />
          <StatRow
            label="Time Saved (Expected)"
            value={`${expected.time_saved_hours}h`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Comparison Bar Component

function ComparisonBar({
  label,
  expected,
  observed,
  format = "percent",
  color = "blue",
}: {
  label: string;
  expected: number;
  observed: number;
  format?: "percent" | "number";
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const formatValue = (val: number) =>
    format === "percent" ? `${(val * 100).toFixed(1)}%` : val.toFixed(2);

  const delta = observed - expected;
  const deltaPercent = expected > 0 ? (delta / expected) * 100 : 0;
  const isGood = delta >= 0;
  const isNeutral = Math.abs(deltaPercent) < 5; // Within 5% is neutral

  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      bgLight: "bg-blue-100",
      text: "text-blue-600",
    },
    green: {
      bg: "bg-green-500",
      bgLight: "bg-green-100",
      text: "text-green-600",
    },
    purple: {
      bg: "bg-purple-500",
      bgLight: "bg-purple-100",
      text: "text-purple-600",
    },
    orange: {
      bg: "bg-orange-500",
      bgLight: "bg-orange-100",
      text: "text-orange-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="space-y-3">
      {/* Expected Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Expected</span>
          <span className="text-sm font-semibold">{formatValue(expected)}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bgLight} transition-all`}
            style={{ width: `${Math.min(expected * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Observed Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Observed</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${colors.text}`}>{formatValue(observed)}</span>
            <DeltaBadge delta={delta} isGood={isGood} isNeutral={isNeutral} />
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all`}
            style={{ width: `${Math.min(observed * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Interpretation */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          {isGood && !isNeutral && (
            <span className="text-green-600 font-semibold">
              ✓ Exceeded expectations by {Math.abs(deltaPercent).toFixed(0)}%
            </span>
          )}
          {!isGood && !isNeutral && (
            <span className="text-orange-600 font-semibold">
              ⚠ Below expectations by {Math.abs(deltaPercent).toFixed(0)}%
            </span>
          )}
          {isNeutral && (
            <span className="text-muted-foreground font-semibold">
              ✓ Met expectations (within 5%)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// Delta Badge Component

function DeltaBadge({
  delta,
  isGood,
  isNeutral,
}: {
  delta: number;
  isGood: boolean;
  isNeutral: boolean;
}) {
  const Icon = isNeutral ? Minus : isGood ? TrendingUp : TrendingDown;
  const variant = isNeutral ? "secondary" : isGood ? "default" : "destructive";

  return (
    <Badge variant={variant} className="flex items-center gap-1 text-xs">
      <Icon className="h-3 w-3" />
      {delta >= 0 ? "+" : ""}
      {(delta * 100).toFixed(1)}%
    </Badge>
  );
}

// Stat Row Component

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
