/**
 * StakingPool Component (Cycle 60)
 *
 * Stake tokens to earn rewards with flexible lock periods.
 *
 * Features:
 * - Token selection for staking
 * - Amount input with balance display
 * - Lock period selector (flexible, 30d, 90d, 180d, 365d)
 * - APY display based on lock period
 * - Stake confirmation modal
 * - Early unstake penalty warning
 * - Current stake display
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface Token {
  symbol: string;
  name: string;
  balance: number;
  address: string;
  icon?: string;
}

interface LockPeriod {
  value: string;
  label: string;
  days: number;
  apy: number;
  earlyUnstakePenalty: number;
}

interface StakingPoolProps {
  tokens?: Token[];
  lockPeriods?: LockPeriod[];
  userAddress?: string;
  currentStake?: {
    amount: number;
    token: string;
    lockPeriod: string;
    unlockDate: number;
    rewards: number;
  };
  onStake?: (token: string, amount: number, lockPeriod: string) => Promise<void>;
  onUnstake?: (amount: number, acceptPenalty: boolean) => Promise<void>;
}

const DEFAULT_LOCK_PERIODS: LockPeriod[] = [
  { value: "flexible", label: "Flexible", days: 0, apy: 5, earlyUnstakePenalty: 0 },
  { value: "30d", label: "30 Days", days: 30, apy: 8, earlyUnstakePenalty: 2 },
  { value: "90d", label: "90 Days", days: 90, apy: 12, earlyUnstakePenalty: 5 },
  { value: "180d", label: "180 Days", days: 180, apy: 18, earlyUnstakePenalty: 8 },
  { value: "365d", label: "365 Days", days: 365, apy: 25, earlyUnstakePenalty: 10 },
];

export function StakingPool({
  tokens = [],
  lockPeriods = DEFAULT_LOCK_PERIODS,
  userAddress,
  currentStake,
  onStake,
  onUnstake
}: StakingPoolProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState<LockPeriod>(lockPeriods[0]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUnstakeDialog, setShowUnstakeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPeriod = lockPeriods.find(p => p.value === lockPeriod.value) || lockPeriods[0];

  const projectedRewards = amount && selectedToken
    ? (parseFloat(amount) * selectedPeriod.apy / 100) * (selectedPeriod.days / 365)
    : 0;

  const isStaked = currentStake && currentStake.amount > 0;
  const isLocked = currentStake && currentStake.unlockDate > Date.now();
  const canUnstakeWithoutPenalty = currentStake && currentStake.unlockDate <= Date.now();

  const handleStake = async () => {
    if (!selectedToken || !amount) return;

    setIsLoading(true);
    try {
      await onStake?.(selectedToken.address, parseFloat(amount), lockPeriod.value);
      setAmount("");
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Staking failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (acceptPenalty: boolean) => {
    if (!currentStake) return;

    setIsLoading(true);
    try {
      await onUnstake?.(currentStake.amount, acceptPenalty);
      setShowUnstakeDialog(false);
    } catch (error) {
      console.error("Unstaking failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDuration = (days: number): string => {
    if (days === 0) return "No lock";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} year`;
  };

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Staking Pool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stake Display */}
          {isStaked && (
            <div className="bg-primary/10 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Stake</span>
                <Badge variant={isLocked ? "destructive" : "default"}>
                  {isLocked ? "Locked" : "Unlocked"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Staked Amount</p>
                  <p className="text-lg font-bold">
                    {currentStake.amount.toFixed(4)} {currentStake.token}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Earned Rewards</p>
                  <p className="text-lg font-bold text-green-600">
                    {currentStake.rewards.toFixed(4)} {currentStake.token}
                  </p>
                </div>
              </div>
              {isLocked && (
                <div className="text-xs text-muted-foreground">
                  Unlocks on: {formatDate(currentStake.unlockDate)}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnstakeDialog(true)}
                className="w-full"
              >
                {canUnstakeWithoutPenalty ? "Unstake" : "Early Unstake (with penalty)"}
              </Button>
            </div>
          )}

          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Select Token</Label>
            <Select
              value={selectedToken?.symbol || ""}
              onValueChange={(value) => {
                const token = tokens.find(t => t.symbol === value);
                setSelectedToken(token || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a token to stake" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedToken && (
            <>
              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount to Stake</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary">{selectedToken.symbol}</Badge>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Balance: {selectedToken.balance.toFixed(4)} {selectedToken.symbol}
                  </span>
                  <button
                    onClick={() => setAmount(selectedToken.balance.toString())}
                    className="text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Lock Period Selection */}
              <div className="space-y-3">
                <Label>Lock Period</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {lockPeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setLockPeriod(period)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        lockPeriod.value === period.value
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      <div className="text-sm font-medium">{period.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDuration(period.days)}
                      </div>
                      <div className="text-lg font-bold text-green-600 mt-1">
                        {period.apy}% APY
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Projected Rewards */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staking Amount:</span>
                    <span className="font-medium">{amount} {selectedToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lock Period:</span>
                    <span className="font-medium">{selectedPeriod.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">APY:</span>
                    <span className="font-medium text-green-600">{selectedPeriod.apy}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projected Rewards:</span>
                    <span className="text-lg font-bold text-green-600">
                      {projectedRewards.toFixed(4)} {selectedToken.symbol}
                    </span>
                  </div>
                  {selectedPeriod.earlyUnstakePenalty > 0 && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      Early unstaking penalty: {selectedPeriod.earlyUnstakePenalty}%
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>

        {selectedToken && amount && parseFloat(amount) > 0 && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!userAddress || parseFloat(amount) > selectedToken.balance}
            >
              Stake {selectedToken.symbol}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Stake Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Staking</DialogTitle>
            <DialogDescription>
              Review your staking details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Token:</span>
              <span className="font-medium">{selectedToken?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lock Period:</span>
              <span className="font-medium">{selectedPeriod.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">APY:</span>
              <span className="font-medium text-green-600">{selectedPeriod.apy}%</span>
            </div>
            {selectedPeriod.days > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg text-xs">
                Your tokens will be locked until{" "}
                {formatDate(Date.now() + selectedPeriod.days * 86400000)}.
                Early unstaking will incur a {selectedPeriod.earlyUnstakePenalty}% penalty.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStake} disabled={isLoading}>
              {isLoading ? "Staking..." : "Confirm Stake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unstake Dialog */}
      <Dialog open={showUnstakeDialog} onOpenChange={setShowUnstakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unstake Tokens</DialogTitle>
            <DialogDescription>
              {canUnstakeWithoutPenalty
                ? "Your tokens are unlocked and ready to withdraw."
                : "Warning: Early unstaking will incur a penalty."}
            </DialogDescription>
          </DialogHeader>
          {currentStake && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staked Amount:</span>
                <span className="font-medium">{currentStake.amount} {currentStake.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Earned Rewards:</span>
                <span className="font-medium text-green-600">
                  {currentStake.rewards} {currentStake.token}
                </span>
              </div>
              {!canUnstakeWithoutPenalty && (
                <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
                  <p className="font-medium">Early Unstake Penalty</p>
                  <p className="text-xs mt-1">
                    Unlocking before {formatDate(currentStake.unlockDate)} will result in a penalty.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnstakeDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={canUnstakeWithoutPenalty ? "default" : "destructive"}
              onClick={() => handleUnstake(!canUnstakeWithoutPenalty)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : canUnstakeWithoutPenalty ? "Unstake" : "Unstake with Penalty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
