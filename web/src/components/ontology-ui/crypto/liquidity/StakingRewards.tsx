/**
 * StakingRewards Component (Cycle 61)
 *
 * View and manage staking rewards with detailed analytics.
 *
 * Features:
 * - Total staked amount display
 * - Rewards earned (pending + claimed)
 * - APY and daily rate calculation
 * - Claim rewards button
 * - Auto-compound toggle
 * - Rewards history chart
 * - Next reward payout countdown
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StakePosition {
  token: string;
  amount: number;
  apy: number;
  startDate: number;
  lockPeriod: string;
  autoCompound: boolean;
}

interface RewardHistory {
  timestamp: number;
  amount: number;
  type: "claimed" | "compounded";
  txHash: string;
}

interface StakingRewardsProps {
  positions?: StakePosition[];
  pendingRewards?: number;
  claimedRewards?: number;
  rewardHistory?: RewardHistory[];
  rewardToken?: string;
  nextPayoutTime?: number;
  onClaimRewards?: () => Promise<void>;
  onToggleAutoCompound?: (positionIndex: number, enabled: boolean) => Promise<void>;
}

export function StakingRewards({
  positions = [],
  pendingRewards = 0,
  claimedRewards = 0,
  rewardHistory = [],
  rewardToken = "ETH",
  nextPayoutTime = Date.now() + 3600000,
  onClaimRewards,
  onToggleAutoCompound
}: StakingRewardsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d" | "all">("7d");

  const totalStaked = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalRewards = pendingRewards + claimedRewards;
  const avgApy = positions.length > 0
    ? positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length
    : 0;
  const dailyRate = avgApy / 365;

  const handleClaimRewards = async () => {
    setIsLoading(true);
    try {
      await onClaimRewards?.();
    } catch (error) {
      console.error("Failed to claim rewards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoCompound = async (index: number, enabled: boolean) => {
    try {
      await onToggleAutoCompound?.(index, enabled);
    } catch (error) {
      console.error("Failed to toggle auto-compound:", error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getTimeUntilPayout = (): string => {
    const diff = nextPayoutTime - Date.now();
    if (diff < 0) return "Soon";

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filterHistoryByPeriod = (history: RewardHistory[]): RewardHistory[] => {
    const now = Date.now();
    const periodMap = {
      "24h": 86400000,
      "7d": 604800000,
      "30d": 2592000000,
      "all": Infinity
    };

    const cutoff = now - periodMap[selectedPeriod];
    return history.filter(item => item.timestamp >= cutoff);
  };

  const filteredHistory = filterHistoryByPeriod(rewardHistory);
  const periodRewards = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Staking Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Staked */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
            <p className="text-2xl font-bold">{formatCurrency(totalStaked)} {rewardToken}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg APY: {formatPercent(avgApy)}
            </p>
          </div>

          {/* Pending Rewards */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Pending Rewards</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(pendingRewards)} {rewardToken}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Next payout: {getTimeUntilPayout()}
            </p>
          </div>

          {/* Claimed Rewards */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Claimed Rewards</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(claimedRewards)} {rewardToken}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Daily rate: {formatPercent(dailyRate)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Staking Positions */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active staking positions</p>
                <p className="text-sm mt-2">Start staking to earn rewards</p>
              </div>
            ) : (
              positions.map((position, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{position.token} Staking</p>
                      <p className="text-sm text-muted-foreground">
                        {position.lockPeriod} lock period
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {formatPercent(position.apy)} APY
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Staked Amount</p>
                      <p className="font-medium">{formatCurrency(position.amount)} {position.token}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Daily Rewards</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency((position.amount * position.apy / 100) / 365)} {position.token}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={position.autoCompound}
                        onCheckedChange={(checked) => handleToggleAutoCompound(index, checked)}
                      />
                      <Label className="text-sm">Auto-compound rewards</Label>
                    </div>
                    {position.autoCompound && (
                      <Badge variant="secondary" className="text-xs">
                        +{((Math.pow(1 + position.apy / 100 / 365, 365) - 1) * 100 - position.apy).toFixed(1)}% boost
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Started: {new Date(position.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {/* Period Selector */}
            <div className="flex gap-2 justify-end">
              {(["24h", "7d", "30d", "all"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedPeriod === period
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total rewards ({selectedPeriod}):
                </span>
                <span className="font-bold text-green-600">
                  {formatCurrency(periodRewards)} {rewardToken}
                </span>
              </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rewards history for this period</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === "claimed" ? "bg-green-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium">
                          {item.type === "claimed" ? "Claimed" : "Auto-compounded"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{formatCurrency(item.amount)} {rewardToken}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.txHash.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Rewards Projection */}
        {totalStaked > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Projected Earnings</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Daily</p>
                <p className="font-semibold">
                  {formatCurrency((totalStaked * avgApy / 100) / 365)} {rewardToken}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly</p>
                <p className="font-semibold">
                  {formatCurrency((totalStaked * avgApy / 100) / 12)} {rewardToken}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Yearly</p>
                <p className="font-semibold">
                  {formatCurrency(totalStaked * avgApy / 100)} {rewardToken}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {pendingRewards > 0 && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleClaimRewards}
            disabled={isLoading}
          >
            {isLoading ? "Claiming..." : `Claim ${formatCurrency(pendingRewards)} ${rewardToken}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
