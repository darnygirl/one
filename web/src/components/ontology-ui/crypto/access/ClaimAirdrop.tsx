/**
 * Claim Airdrop Component (Cycle 94)
 *
 * Claim token airdrops with merkle proof verification
 * - Eligibility check
 * - Claimable amount display
 * - Claim button with gas estimate
 * - Claim history
 * - Multiple campaigns support
 */

import { useState, useEffect } from "react";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Effect } from "effect";
import {
  checkAirdropEligibility,
  type AirdropCampaign,
  type AirdropClaim,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface ClaimAirdropProps {
  /** Airdrop campaigns */
  campaigns: AirdropCampaign[];
  /** Show claim history */
  showHistory?: boolean;
  /** Callback when claim is successful */
  onClaimSuccess?: (campaignId: string, amount: string) => void;
}

export function ClaimAirdrop({
  campaigns,
  showHistory = true,
  onClaimSuccess,
}: ClaimAirdropProps) {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<
    Record<string, { eligible: boolean; claim?: AirdropClaim; error?: AccessControlError }>
  >({});
  const [claimHistory, setClaimHistory] = useState<
    Array<{ campaignId: string; amount: string; timestamp: number; txHash: string }>
  >([]);
  const [gasEstimate, setGasEstimate] = useState<string>("0.001 ETH");

  useEffect(() => {
    if (!isConnected || !address) {
      setEligibility({});
      return;
    }

    const checkEligibility = async () => {
      setLoading(true);

      const results: typeof eligibility = {};

      for (const campaign of campaigns) {
        try {
          // Mock proof for demo
          const mockProof = ["0x123", "0x456", "0x789"];

          const claim = await Effect.runPromise(
            checkAirdropEligibility(address, campaign, mockProof)
          );

          results[campaign.id] = {
            eligible: true,
            claim,
          };
        } catch (err) {
          results[campaign.id] = {
            eligible: false,
            error: err as AccessControlError,
          };
        }
      }

      setEligibility(results);
      setLoading(false);
    };

    checkEligibility();
  }, [address, isConnected, campaigns]);

  const handleClaim = async (campaignId: string) => {
    const claim = eligibility[campaignId]?.claim;
    if (!claim) return;

    setLoading(true);

    try {
      // In production, execute contract write
      // For now, simulate claim
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txHash = "0x" + Math.random().toString(16).slice(2, 66);
      const newClaim = {
        campaignId,
        amount: claim.amount,
        timestamp: Date.now(),
        txHash,
      };

      setClaimHistory([newClaim, ...claimHistory]);
      onClaimSuccess?.(campaignId, claim.amount);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string): string => {
    return (BigInt(amount) / BigInt(10 ** 18)).toString();
  };

  const getTimeStatus = (campaign: AirdropCampaign): {
    label: string;
    variant: "default" | "secondary" | "destructive";
  } => {
    const now = Date.now();
    if (now < campaign.startTime) {
      return { label: "Upcoming", variant: "secondary" };
    }
    if (now > campaign.endTime) {
      return { label: "Ended", variant: "destructive" };
    }
    return { label: "Active", variant: "default" };
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            <CardTitle>Claim Airdrop</CardTitle>
          </div>
          <CardDescription>
            Connect your wallet to check airdrop eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && Object.keys(eligibility).length === 0) {
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

  return (
    <div className="space-y-4">
      {/* Active Campaigns */}
      <div className="space-y-3">
        {campaigns.map((campaign) => {
          const status = eligibility[campaign.id];
          const timeStatus = getTimeStatus(campaign);
          const alreadyClaimed = campaign.claimed[address!];

          return (
            <Card
              key={campaign.id}
              className={
                status?.eligible && !alreadyClaimed
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">
                        {campaign.token} Airdrop
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Campaign #{campaign.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={timeStatus.variant}>{timeStatus.label}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Campaign Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">
                      {formatAmount(campaign.totalAmount)} {campaign.token}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {new Date(campaign.endTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Eligibility Status */}
                {status?.eligible && !alreadyClaimed && (
                  <Alert className="border-green-300 bg-green-100 dark:bg-green-950/40">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 dark:text-green-100">
                      You're eligible to claim {formatAmount(status.claim!.amount)}{" "}
                      {campaign.token}
                    </AlertDescription>
                  </Alert>
                )}

                {alreadyClaimed && (
                  <Alert className="border-blue-300 bg-blue-100 dark:bg-blue-950/40">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 dark:text-blue-100">
                      You've already claimed this airdrop
                    </AlertDescription>
                  </Alert>
                )}

                {!status?.eligible && status?.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {status.error._tag === "AlreadyClaimed" &&
                        "You've already claimed this airdrop"}
                      {status.error._tag === "NotEligible" &&
                        `Not eligible: ${status.error.reason}`}
                      {status.error._tag === "InvalidProof" &&
                        "Invalid merkle proof"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Gas Estimate */}
                {status?.eligible && !alreadyClaimed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Gas:</span>
                    <span className="font-medium">{gasEstimate}</span>
                  </div>
                )}
              </CardContent>

              {status?.eligible && !alreadyClaimed && (
                <CardFooter>
                  <Button
                    onClick={() => handleClaim(campaign.id)}
                    disabled={loading || timeStatus.label !== "Active"}
                    className="w-full"
                  >
                    {loading ? "Claiming..." : "Claim Airdrop"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground">No active airdrop campaigns</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Claim History */}
      {showHistory && claimHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Claim History</CardTitle>
            </div>
            <CardDescription>Your past airdrop claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {claimHistory.map((claim, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {formatAmount(claim.amount)} tokens
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(claim.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://etherscan.io/tx/${claim.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
