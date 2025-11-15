/**
 * Token Gate Component (Cycle 90)
 *
 * Gates content based on token ownership
 * - Requires minimum token balance
 * - Supports multiple token options (OR logic)
 * - Shows connect wallet prompt
 * - Grace period support
 */

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, AlertCircle, CheckCircle } from "lucide-react";
import { Effect } from "effect";
import {
  checkTokenBalance,
  type TokenRequirement,
  type AccessControlError,
} from "@/lib/services/crypto/AccessControlService";

export interface TokenGateProps {
  /** Token requirements (OR logic if multiple) */
  requirements: TokenRequirement[];
  /** Content to show when access granted */
  children: React.ReactNode;
  /** Content to show when access denied */
  fallback?: React.ReactNode;
  /** Grace period after requirement not met (milliseconds) */
  gracePeriod?: number;
  /** Callback when access changes */
  onAccessChange?: (hasAccess: boolean) => void;
}

export function TokenGate({
  requirements,
  children,
  fallback,
  gracePeriod = 0,
  onAccessChange,
}: TokenGateProps) {
  const { address, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AccessControlError | null>(null);
  const [gracePeriodActive, setGracePeriodActive] = useState(false);

  // Check first token requirement as example
  const firstRequirement = requirements[0];
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`,
    token: firstRequirement?.address as `0x${string}`,
    enabled: isConnected && !!firstRequirement,
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    if (balanceLoading) {
      setLoading(true);
      return;
    }

    const checkAccess = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check each requirement (OR logic)
        let granted = false;

        for (const requirement of requirements) {
          const actualBalance = balance?.value.toString() || "0";

          const result = await Effect.runPromise(
            checkTokenBalance(address, requirement, actualBalance)
          );

          if (result) {
            granted = true;
            break;
          }
        }

        if (!granted && hasAccess && gracePeriod > 0) {
          // Start grace period
          setGracePeriodActive(true);
          setTimeout(() => {
            setGracePeriodActive(false);
            setHasAccess(false);
            onAccessChange?.(false);
          }, gracePeriod);
        } else {
          setHasAccess(granted);
          onAccessChange?.(granted);
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
  }, [address, isConnected, balance, requirements, gracePeriod, onAccessChange]);

  if (!isConnected) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Wallet Connection Required
            </CardTitle>
          </div>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Connect your wallet to access this content
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

  if (hasAccess || gracePeriodActive) {
    return (
      <>
        {gracePeriodActive && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              Grace period active. Your access will expire in {gracePeriod / 1000} seconds.
            </AlertDescription>
          </Alert>
        )}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Access Granted
            </Badge>
          </div>
          {children}
        </div>
      </>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-900 dark:text-red-100">
            Access Denied
          </CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-300">
          You need to hold one of the following tokens to access this content:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white dark:bg-red-950/40"
            >
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  {req.symbol}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Minimum: {(BigInt(req.minBalance) / BigInt(10 ** 18)).toString()} tokens
                </p>
              </div>
              <Badge variant="secondary" className="text-red-800 dark:text-red-200">
                {req.chain}
              </Badge>
            </div>
          ))}
        </div>

        {error && (
          <Alert className="mt-4 border-red-300">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error._tag === "InsufficientBalance" &&
                `Insufficient ${error.token} balance. Required: ${error.required}, Available: ${error.actual}`}
            </AlertDescription>
          </Alert>
        )}

        <Button variant="outline" className="w-full mt-4">
          Get Tokens
        </Button>
      </CardContent>
    </Card>
  );
}
