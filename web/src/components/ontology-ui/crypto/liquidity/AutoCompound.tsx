/**
 * AutoCompound Component (Cycle 64)
 *
 * Configure and manage automatic reward compounding for staking positions.
 *
 * Features:
 * - Enable/disable auto-compound toggle
 * - Frequency selector (daily/weekly)
 * - Minimum harvest amount threshold
 * - Gas cost consideration
 * - Projected APY with compounding
 * - Compound history log
 * - Cost-benefit analysis
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AutoCompoundConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "optimal";
  minHarvestAmount: number;
  maxGasCost: number;
}

interface Position {
  id: string;
  token: string;
  amount: number;
  apy: number;
  pendingRewards: number;
  autoCompoundEnabled: boolean;
  lastCompounded?: number;
}

interface CompoundHistory {
  timestamp: number;
  amount: number;
  gasCost: number;
  newTotal: number;
  txHash: string;
}

interface AutoCompoundProps {
  positions?: Position[];
  config?: AutoCompoundConfig;
  history?: CompoundHistory[];
  estimatedGasCost?: number;
  onUpdateConfig?: (config: AutoCompoundConfig) => Promise<void>;
  onTogglePosition?: (positionId: string, enabled: boolean) => Promise<void>;
  onManualCompound?: (positionId: string) => Promise<void>;
}

const DEFAULT_CONFIG: AutoCompoundConfig = {
  enabled: false,
  frequency: "optimal",
  minHarvestAmount: 10,
  maxGasCost: 5
};

export function AutoCompound({
  positions = [],
  config = DEFAULT_CONFIG,
  history = [],
  estimatedGasCost = 3,
  onUpdateConfig,
  onTogglePosition,
  onManualCompound
}: AutoCompoundProps) {
  const [localConfig, setLocalConfig] = useState<AutoCompoundConfig>(config);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">("30d");

  const calculateCompoundAPY = (baseApy: number, frequency: string): number => {
    const n = frequency === "daily" ? 365 : frequency === "weekly" ? 52 : 365;
    const r = baseApy / 100;
    return (Math.pow(1 + r / n, n) - 1) * 100;
  };

  const calculateOptimalFrequency = (rewards: number, gasCost: number): string => {
    // Compound when rewards are at least 3x gas cost
    if (rewards < gasCost * 3) return "Wait";
    if (rewards > gasCost * 10) return "Compound now";
    return "Soon";
  };

  const handleUpdateConfig = async () => {
    setIsLoading(true);
    try {
      await onUpdateConfig?.(localConfig);
    } catch (error) {
      console.error("Failed to update config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePosition = async (positionId: string, enabled: boolean) => {
    try {
      await onTogglePosition?.(positionId, enabled);
    } catch (error) {
      console.error("Failed to toggle position:", error);
    }
  };

  const handleManualCompound = async (positionId: string) => {
    setIsLoading(true);
    try {
      await onManualCompound?.(positionId);
    } catch (error) {
      console.error("Failed to compound:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistoryByPeriod = (history: CompoundHistory[]): CompoundHistory[] => {
    const now = Date.now();
    const periodMap = {
      "7d": 604800000,
      "30d": 2592000000,
      "all": Infinity
    };

    const cutoff = now - periodMap[selectedPeriod];
    return history.filter(item => item.timestamp >= cutoff);
  };

  const filteredHistory = filterHistoryByPeriod(history);
  const totalCompounded = filteredHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalGasCost = filteredHistory.reduce((sum, item) => sum + item.gasCost, 0);
  const netGain = totalCompounded - totalGasCost;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Auto-Compound Settings</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="master-toggle" className="text-sm">
              Master Switch
            </Label>
            <Switch
              id="master-toggle"
              checked={localConfig.enabled}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, enabled: checked })}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            {/* Configuration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Compound Frequency</Label>
                <Select
                  value={localConfig.frequency}
                  onValueChange={(value: any) => setLocalConfig({ ...localConfig, frequency: value })}
                  disabled={!localConfig.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (Max APY)</SelectItem>
                    <SelectItem value="weekly">Weekly (Balanced)</SelectItem>
                    <SelectItem value="optimal">Optimal (Auto-detect)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {localConfig.frequency === "optimal"
                    ? "Automatically compounds when rewards exceed gas costs by 3x"
                    : `Compounds rewards ${localConfig.frequency}`
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Minimum Harvest Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={localConfig.minHarvestAmount}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      minHarvestAmount: parseFloat(e.target.value) || 0
                    })}
                    disabled={!localConfig.enabled}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only compound when rewards exceed this amount
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Gas Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={localConfig.maxGasCost}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      maxGasCost: parseFloat(e.target.value) || 0
                    })}
                    disabled={!localConfig.enabled}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Skip compounding if gas exceeds this amount
                </p>
              </div>
            </div>

            <Separator />

            {/* Cost-Benefit Analysis */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <p className="font-medium text-sm">Cost-Benefit Analysis</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Gas Cost:</p>
                  <p className="font-semibold">{formatCurrency(estimatedGasCost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min. Reward Needed:</p>
                  <p className="font-semibold">{formatCurrency(estimatedGasCost * 3)}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Tip: Set minimum harvest to at least 3x gas cost for profitable compounding
              </div>
            </div>

            {/* APY Boost Preview */}
            {positions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg space-y-2">
                <p className="font-medium text-sm">Projected APY Boost</p>
                <div className="space-y-2">
                  {positions.slice(0, 3).map((pos) => {
                    const compoundApy = calculateCompoundAPY(pos.apy, localConfig.frequency);
                    const boost = compoundApy - pos.apy;
                    return (
                      <div key={pos.id} className="flex justify-between text-sm">
                        <span>{pos.token}:</span>
                        <span className="font-semibold">
                          {pos.apy.toFixed(2)}% → {compoundApy.toFixed(2)}%
                          <Badge variant="secondary" className="ml-2 text-xs">
                            +{boost.toFixed(2)}%
                          </Badge>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {localConfig.enabled && (
              <div className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-blue-700 dark:text-blue-400">
                Auto-compound is active. Rewards will be automatically reinvested based on your settings.
              </div>
            )}
          </TabsContent>

          <TabsContent value="positions" className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active positions</p>
                <p className="text-sm mt-2">Start staking to enable auto-compound</p>
              </div>
            ) : (
              positions.map((position) => {
                const optimalAction = calculateOptimalFrequency(position.pendingRewards, estimatedGasCost);
                const canCompound = position.pendingRewards >= localConfig.minHarvestAmount;

                return (
                  <div key={position.id} className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{position.token}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(position.amount)} staked
                        </p>
                      </div>
                      <Badge variant="outline">{position.apy.toFixed(2)}% APY</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pending Rewards:</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(position.pendingRewards)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Optimal Action:</p>
                        <p className="font-semibold">{optimalAction}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={position.autoCompoundEnabled}
                          onCheckedChange={(checked) => handleTogglePosition(position.id, checked)}
                          disabled={!localConfig.enabled}
                        />
                        <Label className="text-sm">
                          Auto-compound {position.autoCompoundEnabled ? "enabled" : "disabled"}
                        </Label>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManualCompound(position.id)}
                        disabled={!canCompound || isLoading}
                      >
                        Compound Now
                      </Button>
                    </div>

                    {position.lastCompounded && (
                      <div className="text-xs text-muted-foreground">
                        Last compounded: {formatDate(position.lastCompounded)}
                      </div>
                    )}

                    {!canCompound && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        Rewards below minimum threshold ({formatCurrency(localConfig.minHarvestAmount)})
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Period Selector */}
            <div className="flex gap-2 justify-end">
              {(["7d", "30d", "all"] as const).map((period) => (
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Compounded</p>
                <p className="font-bold text-green-600">{formatCurrency(totalCompounded)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Gas Costs</p>
                <p className="font-bold text-red-600">{formatCurrency(totalGasCost)}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                netGain >= 0 ? "bg-blue-50 dark:bg-blue-950" : "bg-orange-50 dark:bg-orange-950"
              }`}>
                <p className="text-xs text-muted-foreground mb-1">Net Gain</p>
                <p className={`font-bold ${netGain >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  {formatCurrency(netGain)}
                </p>
              </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No compound history for this period</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Compounded</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Gas: {formatCurrency(item.gasCost)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-muted-foreground">New Total</p>
                      <p className="text-sm font-semibold">{formatCurrency(item.newTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpdateConfig}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
