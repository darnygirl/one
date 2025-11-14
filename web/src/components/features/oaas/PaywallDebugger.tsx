/**
 * Paywall Debugger Component (Cycles 87-88)
 *
 * Displays 402 payment headers, offer details, and observed metrics
 * Allows manual payment testing for development
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Loader2, DollarSign, Zap, TrendingUp } from "lucide-react";
import type { X402Headers, PaymentOffer, ObservedMetrics } from "@/lib/effect/oaasClient";

interface PaywallDebuggerProps {
  path: string;
  headers: X402Headers;
  offer: PaymentOffer;
  observed?: ObservedMetrics;
  onPaymentTest?: (proof: string) => Promise<void>;
}

export function PaywallDebugger({
  path,
  headers,
  offer,
  observed,
  onPaymentTest,
}: PaywallDebuggerProps) {
  const [testProof, setTestProof] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!onPaymentTest || !testProof.trim()) return;

    setTesting(true);
    setTestResult(null);

    try {
      await onPaymentTest(testProof);
      setTestResult({ success: true, message: "Payment verified successfully!" });
    } catch (error) {
      setTestResult({ success: false, message: String(error) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Value Proposition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Why Pay ${offer.price_usdc}?
          </CardTitle>
          <CardDescription>
            This is premium intelligence, not compute. Here's what you get:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expected ROI */}
          {offer.expected_gains && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard
                label="Accuracy Gain"
                value={`${(offer.expected_gains.accuracy_pct * 100).toFixed(0)}%`}
                color="text-blue-600"
              />
              <MetricCard
                label="Cost Savings"
                value={`$${offer.expected_gains.cost_savings_usd}`}
                color="text-green-600"
              />
              <MetricCard
                label="Time Saved"
                value={`${offer.expected_gains.time_saved_hours}h`}
                color="text-purple-600"
              />
              <MetricCard
                label="ROI"
                value={`${offer.expected_gains.roi_multiple}×`}
                color="text-orange-600"
              />
            </div>
          )}

          {/* What's Included */}
          {offer.whats_included && (
            <div>
              <Label className="text-sm font-semibold">What's Included:</Label>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {offer.whats_included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Proof */}
          {offer.proof_of_value && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>{offer.proof_of_value.agents_using} agents</strong> are already using this pack.
                Average observed savings: <strong>${offer.proof_of_value.avg_observed_savings}</strong>.
                Satisfaction: <strong>{offer.proof_of_value.satisfaction_score}★</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Free Trial */}
          {offer.free_trial_calls && (
            <Badge variant="secondary" className="text-sm">
              🎁 {offer.free_trial_calls} free calls available - Try before you buy!
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Observed vs Expected Metrics */}
      {observed && offer.expected_gains && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Observed Performance (Real Results)
            </CardTitle>
            <CardDescription>
              Compare what we promised vs. what agents actually experienced
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ComparisonMetric
                label="Accuracy Gain"
                expected={offer.expected_gains.accuracy_pct}
                observed={parseFloat(observed["x-oaas-observed-accuracy-delta"] || "0")}
                format="percent"
              />
              <ComparisonMetric
                label="Token Savings"
                expected={offer.expected_gains.token_efficiency_pct}
                observed={parseFloat(observed["x-oaas-observed-tokens-saved"] || "0")}
                format="percent"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 402 Headers (Developer Info) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono">x402 Payment Headers</CardTitle>
          <CardDescription>Technical details for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground min-w-[200px]">{key}:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Payment Test */}
      {onPaymentTest && (
        <Card>
          <CardHeader>
            <CardTitle>Test Payment</CardTitle>
            <CardDescription>
              Enter a signed payment proof to test authorization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Payment Proof (TX Hash or Signed Payload)</Label>
              <Input
                id="proof"
                placeholder="0x..."
                value={testProof}
                onChange={(e) => setTestProof(e.target.value)}
                disabled={testing}
              />
            </div>

            <Button onClick={handleTest} disabled={testing || !testProof.trim()}>
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Payment
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ComparisonMetric({
  label,
  expected,
  observed,
  format = "percent",
}: {
  label: string;
  expected: number;
  observed: number;
  format?: "percent" | "number";
}) {
  const formatValue = (val: number) =>
    format === "percent" ? `${(val * 100).toFixed(1)}%` : val.toFixed(2);

  const delta = observed - expected;
  const isGood = delta >= 0;

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground text-sm">Expected:</span>
        <span className="font-semibold">{formatValue(expected)}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground text-sm">Observed:</span>
        <span className={`font-bold ${isGood ? "text-green-600" : "text-red-600"}`}>
          {formatValue(observed)}
        </span>
        <Badge variant={isGood ? "default" : "destructive"} className="text-xs">
          {isGood ? "+" : ""}
          {formatValue(delta)}
        </Badge>
      </div>
    </div>
  );
}
