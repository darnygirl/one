/**
 * YieldFarming Component (Cycle 62)
 *
 * Discover and manage yield farming opportunities across DeFi protocols.
 *
 * Features:
 * - List of farming pools with filters
 * - Sort by APY, TVL, risk score
 * - Token pair and rewards token display
 * - Deposit/withdraw functionality
 * - Pending rewards display
 * - Harvest rewards button
 * - Multi-protocol support (Uniswap, Sushiswap, Curve)
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FarmingPool {
  id: string;
  protocol: string;
  token0: string;
  token1: string;
  rewardToken: string;
  apy: number;
  tvl: number;
  dailyRewards: number;
  riskScore: number;
  userDeposit?: number;
  pendingRewards?: number;
}

interface YieldFarmingProps {
  pools?: FarmingPool[];
  onDeposit?: (poolId: string, amount: number) => Promise<void>;
  onWithdraw?: (poolId: string, amount: number) => Promise<void>;
  onHarvest?: (poolId: string) => Promise<void>;
}

export function YieldFarming({
  pools = [],
  onDeposit,
  onWithdraw,
  onHarvest
}: YieldFarmingProps) {
  const [sortBy, setSortBy] = useState<"apy" | "tvl" | "risk">("apy");
  const [filterProtocol, setFilterProtocol] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] = useState<FarmingPool | null>(null);
  const [actionType, setActionType] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const protocols = Array.from(new Set(pools.map(p => p.protocol)));

  const sortedPools = [...pools]
    .filter(pool => {
      const matchesProtocol = filterProtocol === "all" || pool.protocol === filterProtocol;
      const matchesSearch = searchQuery === "" ||
        pool.token0.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.token1.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProtocol && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "tvl":
          return b.tvl - a.tvl;
        case "risk":
          return a.riskScore - b.riskScore;
        default:
          return 0;
      }
    });

  const handleAction = async () => {
    if (!selectedPool || !amount) return;

    setIsLoading(true);
    try {
      if (actionType === "deposit") {
        await onDeposit?.(selectedPool.id, parseFloat(amount));
      } else {
        await onWithdraw?.(selectedPool.id, parseFloat(amount));
      }
      setAmount("");
      setShowDialog(false);
    } catch (error) {
      console.error(`${actionType} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHarvest = async (poolId: string) => {
    setIsLoading(true);
    try {
      await onHarvest?.(poolId);
    } catch (error) {
      console.error("Harvest failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (pool: FarmingPool, action: "deposit" | "withdraw") => {
    setSelectedPool(pool);
    setActionType(action);
    setShowDialog(true);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getRiskBadge = (score: number) => {
    if (score < 3) return { variant: "default" as const, label: "Low Risk", color: "text-green-600" };
    if (score < 7) return { variant: "secondary" as const, label: "Medium Risk", color: "text-yellow-600" };
    return { variant: "destructive" as const, label: "High Risk", color: "text-red-600" };
  };

  return (
    <>
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Yield Farming Opportunities</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
              <Select value={filterProtocol} onValueChange={setFilterProtocol}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Protocols</SelectItem>
                  {protocols.map((protocol) => (
                    <SelectItem key={protocol} value={protocol}>
                      {protocol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apy">Sort by APY</SelectItem>
                  <SelectItem value="tvl">Sort by TVL</SelectItem>
                  <SelectItem value="risk">Sort by Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No farming pools found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPools.map((pool) => {
                const risk = getRiskBadge(pool.riskScore);
                const hasDeposit = pool.userDeposit && pool.userDeposit > 0;

                return (
                  <div
                    key={pool.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      hasDeposit ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Pool Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold">
                            {pool.token0}/{pool.token1}
                          </span>
                          <Badge variant="outline">{pool.protocol}</Badge>
                          <Badge variant={risk.variant}>{risk.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">APY</p>
                            <p className="font-bold text-green-600 text-lg">{pool.apy.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">TVL</p>
                            <p className="font-semibold">{formatCurrency(pool.tvl)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Daily Rewards</p>
                            <p className="font-semibold">{formatCurrency(pool.dailyRewards)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reward Token</p>
                            <p className="font-semibold">{pool.rewardToken}</p>
                          </div>
                        </div>
                      </div>

                      {/* User Position & Actions */}
                      <div className="flex flex-col justify-between min-w-48">
                        {hasDeposit ? (
                          <div className="space-y-2">
                            <div className="bg-muted/50 p-2 rounded text-sm">
                              <p className="text-muted-foreground text-xs">Your Deposit</p>
                              <p className="font-bold">{formatCurrency(pool.userDeposit!)}</p>
                            </div>
                            {pool.pendingRewards && pool.pendingRewards > 0 && (
                              <div className="bg-green-50 dark:bg-green-950 p-2 rounded text-sm">
                                <p className="text-muted-foreground text-xs">Pending Rewards</p>
                                <p className="font-bold text-green-600">
                                  {pool.pendingRewards.toFixed(4)} {pool.rewardToken}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No active position
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          {hasDeposit ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => openDialog(pool, "withdraw")}
                              >
                                Withdraw
                              </Button>
                              {pool.pendingRewards && pool.pendingRewards > 0 && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleHarvest(pool.id)}
                                  disabled={isLoading}
                                >
                                  Harvest
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => openDialog(pool, "deposit")}
                            >
                              Deposit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "deposit" ? "Deposit to Farm" : "Withdraw from Farm"}
            </DialogTitle>
            <DialogDescription>
              {selectedPool && `${selectedPool.token0}/${selectedPool.token1} on ${selectedPool.protocol}`}
            </DialogDescription>
          </DialogHeader>

          {selectedPool && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">APY:</span>
                  <span className="font-semibold text-green-600">{selectedPool.apy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward Token:</span>
                  <span className="font-semibold">{selectedPool.rewardToken}</span>
                </div>
                {actionType === "withdraw" && selectedPool.userDeposit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Deposit:</span>
                    <span className="font-semibold">{formatCurrency(selectedPool.userDeposit)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount (LP Tokens)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {actionType === "withdraw" && selectedPool.userDeposit && (
                  <button
                    onClick={() => setAmount(selectedPool.userDeposit!.toString())}
                    className="text-xs text-primary hover:underline"
                  >
                    Max: {selectedPool.userDeposit.toFixed(4)}
                  </button>
                )}
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="bg-primary/10 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Daily Rewards:</span>
                    <span className="font-semibold text-green-600">
                      {((parseFloat(amount) / selectedPool.tvl) * selectedPool.dailyRewards).toFixed(4)} {selectedPool.rewardToken}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={!amount || parseFloat(amount) <= 0 || isLoading}>
              {isLoading ? "Processing..." : actionType === "deposit" ? "Deposit" : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
