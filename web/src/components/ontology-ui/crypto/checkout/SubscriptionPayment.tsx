/**
 * SubscriptionPayment Component (Cycle 46)
 *
 * Manage recurring subscription payments with crypto
 * - Display subscription plans with features
 * - Select payment currency and network
 * - Set up auto-renewal
 * - View billing history
 * - Cancel or pause subscription
 * - Renewal reminders and notifications
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "../../utils";
import type {
  SubscriptionPaymentProps,
  CryptoCurrency,
  SubscriptionBillingHistory,
} from "./types";

export function SubscriptionPayment({
  plans,
  currentSubscription,
  onSubscribe,
  onCancel,
  onPause,
  showBillingHistory = true,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: SubscriptionPaymentProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(
    currentSubscription?.planId || plans[0]?.id
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>("USDC");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");
  const [billingHistory, setBillingHistory] = useState<SubscriptionBillingHistory[]>([
    // Mock billing history
    {
      id: "bill_1",
      subscriptionId: "sub_123",
      amount: "29.99",
      currency: "USDC",
      transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      status: "success",
      billingDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      paidAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const statusConfig = {
    active: { color: "bg-green-100 text-green-800", label: "Active" },
    paused: { color: "bg-yellow-100 text-yellow-800", label: "Paused" },
    cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    expired: { color: "bg-red-100 text-red-800", label: "Expired" },
    past_due: { color: "bg-red-100 text-red-800", label: "Past Due" },
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSubscribe?.({
        id: `sub_${Date.now()}`,
        planId: selectedPlan.id,
        plan: selectedPlan,
        status: "active",
        currentPeriodStart: Date.now(),
        currentPeriodEnd:
          Date.now() +
          (selectedPlan.interval === "monthly"
            ? 30
            : selectedPlan.interval === "yearly"
            ? 365
            : selectedPlan.interval === "weekly"
            ? 7
            : 1) *
            24 *
            60 *
            60 *
            1000,
        nextBillingDate:
          Date.now() +
          (selectedPlan.interval === "monthly"
            ? 30
            : selectedPlan.interval === "yearly"
            ? 365
            : selectedPlan.interval === "weekly"
            ? 7
            : 1) *
            24 *
            60 *
            60 *
            1000,
        paymentMethod: {
          type: "crypto",
          currency: selectedCurrency,
          network: selectedNetwork,
        },
        cancelAtPeriodEnd: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    if (currentSubscription) {
      onCancel?.(currentSubscription.id);
    }
  };

  const handlePauseSubscription = () => {
    if (currentSubscription) {
      onPause?.(currentSubscription.id);
    }
  };

  const getDaysUntilNextBilling = () => {
    if (!currentSubscription?.nextBillingDate) return 0;
    return Math.ceil(
      (currentSubscription.nextBillingDate - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        size === "sm" && "max-w-2xl",
        size === "md" && "max-w-3xl",
        size === "lg" && "max-w-4xl",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Manage your recurring subscription payments
            </CardDescription>
          </div>
          {currentSubscription && (
            <Badge className={statusConfig[currentSubscription.status].color}>
              {statusConfig[currentSubscription.status].label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {currentSubscription.plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.plan.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${currentSubscription.plan.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  per {currentSubscription.plan.interval}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {currentSubscription.paymentMethod.currency} (
                  {currentSubscription.paymentMethod.network})
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing</p>
                <p className="font-medium">
                  {currentSubscription.nextBillingDate
                    ? new Date(currentSubscription.nextBillingDate).toLocaleDateString()
                    : "N/A"}
                </p>
                {currentSubscription.nextBillingDate && (
                  <p className="text-xs text-muted-foreground">
                    in {getDaysUntilNextBilling()} days
                  </p>
                )}
              </div>
            </div>

            {currentSubscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Subscription will be cancelled at the end of the current billing
                  period.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Plan Selection (for new subscriptions) */}
        {!currentSubscription && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      selectedPlanId === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <h4 className="font-semibold text-lg mb-1">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {plan.description}
                    </p>
                    <div className="mb-3">
                      <span className="text-2xl font-bold">${plan.amount}</span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Currency</label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => setSelectedCurrency(value as CryptoCurrency)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                    <SelectItem value="USDT">USDT (Stablecoin)</SelectItem>
                    <SelectItem value="DAI">DAI (Stablecoin)</SelectItem>
                    <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon (Lower fees)</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum (Lower fees)</SelectItem>
                    <SelectItem value="optimism">Optimism (Lower fees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Subscription Details</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  ✓ Automatic renewal every {selectedPlan.interval}
                </li>
                <li>
                  ✓ First payment of ${selectedPlan.amount} will be charged immediately
                </li>
                <li>✓ Cancel anytime before next billing cycle</li>
                <li>✓ Network fees apply to each transaction</li>
              </ul>
            </div>
          </>
        )}

        {/* Billing History */}
        {showBillingHistory && billingHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Billing History</h3>
              <div className="space-y-2">
                {billingHistory.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium font-mono">
                        {bill.amount} {bill.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bill.billingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bill.status === "success"
                            ? "default"
                            : bill.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {bill.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${bill.transactionHash}`,
                            "_blank"
                          )
                        }
                      >
                        View →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {currentSubscription ? (
          <>
            {currentSubscription.status === "active" && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePauseSubscription}
                >
                  Pause Subscription
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </Button>
              </>
            )}
            {currentSubscription.status === "paused" && (
              <Button className="flex-1" onClick={handleSubscribe}>
                Resume Subscription
              </Button>
            )}
          </>
        ) : (
          <Button
            className="flex-1"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Subscribe - $${selectedPlan.amount}/${selectedPlan.interval}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
