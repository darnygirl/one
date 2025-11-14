/**
 * NFT Gate Component (Cycle 91)
 *
 * Gates content based on NFT ownership
 * - Requires specific collection or token ID
 * - Trait-based gating
 * - Visual gate indicator
 * - Wallet connection flow
 */

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Effect } from "effect";
import {
  checkNFTOwnership,
  checkNFTTraits,
  type NFTRequirement,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface NFTGateProps {
  /** NFT requirement */
  requirement: NFTRequirement;
  /** Content to show when access granted */
  children: React.ReactNode;
  /** Content to show when access denied */
  fallback?: React.ReactNode;
  /** Show visual gate indicator */
  showIndicator?: boolean;
  /** Callback when access changes */
  onAccessChange?: (hasAccess: boolean) => void;
}

export function NFTGate({
  requirement,
  children,
  fallback,
  showIndicator = true,
  onAccessChange,
}: NFTGateProps) {
  const { address, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AccessControlError | null>(null);
  const [ownedTokens, setOwnedTokens] = useState<string[]>([]);

  useEffect(() => {
    if (!isConnected || !address) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      setLoading(true);
      setError(null);

      try {
        // In production, fetch owned NFTs from the collection
        // For now, simulate
        const mockOwnedTokens = ["1", "42", "100"];
        setOwnedTokens(mockOwnedTokens);

        // Check ownership
        const ownershipResult = await Effect.runPromise(
          checkNFTOwnership(address, requirement, mockOwnedTokens)
        );

        if (!ownershipResult) {
          setHasAccess(false);
          onAccessChange?.(false);
          return;
        }

        // Check traits if required
        if (requirement.traits) {
          // In production, fetch NFT metadata
          const mockTraits = { background: "blue", rarity: "legendary" };
          const traitsResult = await Effect.runPromise(
            checkNFTTraits(mockTraits, requirement.traits)
          );

          setHasAccess(traitsResult);
          onAccessChange?.(traitsResult);
        } else {
          setHasAccess(true);
          onAccessChange?.(true);
        }
      } catch (err) {
        setError(err as AccessControlError);
        setHasAccess(false);
        onAccessChange?.(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [address, isConnected, requirement, onAccessChange]);

  if (!isConnected) {
    return (
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900 dark:text-purple-100">
              NFT Gate
            </CardTitle>
          </div>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            Connect your wallet to verify NFT ownership
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

  if (hasAccess) {
    return (
      <>
        {showIndicator && (
          <div className="mb-4 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  NFT Access Granted
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You own {ownedTokens.length} NFT{ownedTokens.length !== 1 ? "s" : ""} from{" "}
                  {requirement.collection}
                </p>
              </div>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-900 dark:text-purple-100">
            NFT Required
          </CardTitle>
        </div>
        <CardDescription className="text-purple-700 dark:text-purple-300">
          You need to own an NFT from this collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border border-purple-200 rounded-lg bg-white dark:bg-purple-950/40">
            <div className="flex items-start gap-3">
              <ImageIcon className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-purple-900 dark:text-purple-100">
                  {requirement.collection}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Chain: {requirement.chain}
                </p>

                {requirement.tokenId && (
                  <Badge variant="secondary" className="mt-2">
                    Token ID: {requirement.tokenId}
                  </Badge>
                )}

                {requirement.traits && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Required Traits:
                    </p>
                    {Object.entries(requirement.traits).map(([trait, value]) => (
                      <div
                        key={trait}
                        className="text-sm text-purple-700 dark:text-purple-300"
                      >
                        {trait}: {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <Alert className="border-purple-300">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                {error._tag === "NFTNotOwned" &&
                  `You don't own the required NFT from ${error.collection}`}
                {error._tag === "TraitMismatch" &&
                  "Your NFT doesn't have the required traits"}
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" className="w-full">
            View Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
