/**
 * Membership Tier Component (Cycle 92)
 *
 * Display membership level based on token/NFT holdings
 * - Multiple tier levels (bronze, silver, gold, platinum)
 * - Token and NFT requirements per tier
 * - Current tier badge
 * - Benefits display
 * - Upgrade path visualization
 */

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, TrendingUp, CheckCircle, Lock } from "lucide-react";
import { Effect } from "effect";
import {
  calculateMembershipTier,
  type MembershipTier as Tier,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface MembershipTierProps {
  /** Available membership tiers */
  tiers: Tier[];
  /** Show upgrade path */
  showUpgradePath?: boolean;
  /** Show tier history */
  showHistory?: boolean;
  /** Callback when tier changes */
  onTierChange?: (tier: Tier | null) => void;
}

const tierColors: Record<string, string> = {
  bronze: "text-orange-700 bg-orange-100 border-orange-300",
  silver: "text-gray-700 bg-gray-100 border-gray-300",
  gold: "text-yellow-700 bg-yellow-100 border-yellow-300",
  platinum: "text-purple-700 bg-purple-100 border-purple-300",
  diamond: "text-blue-700 bg-blue-100 border-blue-300",
};

export function MembershipTier({
  tiers,
  showUpgradePath = true,
  showHistory = false,
  onTierChange,
}: MembershipTierProps) {
  const { address, isConnected } = useAccount();
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Mock balance check
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`,
    enabled: isConnected,
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setCurrentTier(null);
      setLoading(false);
      return;
    }

    if (balanceLoading) {
      setLoading(true);
      return;
    }

    const checkTier = async () => {
      setLoading(true);

      try {
        // Mock holdings data
        const holdings = {
          tokens: {
            "0x1234": balance?.value.toString() || "0",
          },
          nfts: {
            "0x5678": ["1", "2"],
          },
        };

        const tier = await Effect.runPromise(
          calculateMembershipTier(address, tiers, holdings)
        );

        setCurrentTier(tier);
        onTierChange?.(tier);

        // Calculate progress to next tier
        if (tier) {
          const currentIndex = tiers.findIndex((t) => t.id === tier.id);
          const progressPercent = ((currentIndex + 1) / tiers.length) * 100;
          setProgress(progressPercent);
        } else {
          setProgress(0);
        }
      } catch (err) {
        console.error("Error calculating tier:", err);
        setCurrentTier(null);
      } finally {
        setLoading(false);
      }
    };

    checkTier();
  }, [address, isConnected, balance, tiers, onTierChange]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-400" />
            <CardTitle>Membership Tier</CardTitle>
          </div>
          <CardDescription>
            Connect your wallet to see your membership level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const nextTier = currentTier
    ? tiers[tiers.findIndex((t) => t.id === currentTier.id) + 1]
    : tiers[0];

  return (
    <div className="space-y-4">
      {/* Current Tier Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <CardTitle>Your Membership</CardTitle>
            </div>
            {currentTier && (
              <Badge
                variant="outline"
                className={tierColors[currentTier.name.toLowerCase()]}
              >
                {currentTier.badge} {currentTier.name}
              </Badge>
            )}
          </div>
          {currentTier && (
            <CardDescription>
              You've reached {currentTier.name} tier
            </CardDescription>
          )}
        </CardHeader>

        {currentTier ? (
          <CardContent className="space-y-4">
            {/* Benefits */}
            <div>
              <h4 className="font-medium mb-2">Your Benefits</h4>
              <div className="space-y-2">
                {currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {showUpgradePath && nextTier && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tier Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Next tier: {nextTier.name}
                </p>
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                You don't have a membership tier yet
              </p>
              <Button variant="outline">View Requirements</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* All Tiers */}
      {showUpgradePath && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>All Tiers</CardTitle>
            </div>
            <CardDescription>View all membership levels and benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tiers.map((tier) => {
                const isCurrentTier = currentTier?.id === tier.id;
                const isLocked = !isCurrentTier && currentTier
                  ? tiers.findIndex((t) => t.id === tier.id) >
                    tiers.findIndex((t) => t.id === currentTier.id)
                  : !currentTier;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 border rounded-lg ${
                      isCurrentTier
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tier.badge}</span>
                        <div>
                          <p className="font-medium">{tier.name}</p>
                          {isCurrentTier && (
                            <Badge variant="secondary" className="mt-1">
                              Current Tier
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium">Requirements:</p>
                      {tier.requirements.tokens?.map((token, index) => (
                        <div key={index}>
                          • {token.symbol}: {(BigInt(token.minBalance) / BigInt(10 ** 18)).toString()}+
                        </div>
                      ))}
                      {tier.requirements.nfts?.map((nft, index) => (
                        <div key={index}>• NFT from {nft.collection}</div>
                      ))}
                    </div>

                    {!isLocked && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-muted-foreground">
                          {tier.benefits.length} benefit{tier.benefits.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier History */}
      {showHistory && currentTier && (
        <Card>
          <CardHeader>
            <CardTitle>Tier History</CardTitle>
            <CardDescription>Your membership progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span>Achieved {currentTier.name}</span>
                <span className="text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
